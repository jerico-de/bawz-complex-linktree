require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const basicAuth    = require('express-basic-auth');
const path         = require('path');
const { db }       = require('./firebase');
const DEFAULT_DATA = require('./defaultData');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors({origin: [
    'https://bawz-complex.vercel.app',
    'https://bawz-complex-linktree-admin.onrender.com',
    'http://localhost:3000',]}));
app.use(express.json());

// ─── Serve the main site's public files ─────────────────────────
app.use(express.static(path.join(__dirname, '../public')));

// ─── Basic auth for /admin routes ───────────────────────────────
const adminAuth = basicAuth({
  users: { [process.env.ADMIN_USER || 'admin']: process.env.ADMIN_PASS || 'changeme123' },
  challenge: true,
  realm: 'Bawz Admin',
});

app.use('/admin', adminAuth, express.static(path.join(__dirname, '../public/admin')));

// ════════════════════════════════════════════════════════════════
//  FIRESTORE HELPERS
// ════════════════════════════════════════════════════════════════

const CONFIG_DOC = db.collection('config').doc('site');

/** Return site config, seeding defaults if doc doesn't exist yet */
async function getConfig() {
  const snap = await CONFIG_DOC.get();
  if (!snap.exists) {
    await CONFIG_DOC.set(DEFAULT_DATA);
    return DEFAULT_DATA;
  }
  return snap.data();
}

/** Deep-merge patch into the stored config */
async function patchConfig(patch) {
  await CONFIG_DOC.set(patch, { merge: true });
  return getConfig();
}

// ════════════════════════════════════════════════════════════════
//  PUBLIC API — used by the live site (index.html)
// ════════════════════════════════════════════════════════════════

/** GET /api/config  — full site config (public, no auth) */
app.get('/api/config', async (req, res) => {
  try {
    const config = await getConfig();
    res.json({ ok: true, data: config });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
//  ADMIN API — all routes require Basic Auth
// ════════════════════════════════════════════════════════════════

const api = express.Router();
api.use(adminAuth);

// ── Tagline ──────────────────────────────────────────────────────

/** PATCH /api/admin/tagline  — update tagline text */
api.patch('/tagline', async (req, res) => {
  try {
    const { tagline } = req.body;
    if (typeof tagline !== 'string') return res.status(400).json({ ok: false, error: 'tagline must be a string' });
    const config = await patchConfig({ tagline });
    res.json({ ok: true, data: config.tagline });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── Socials ──────────────────────────────────────────────────────

/** PUT /api/admin/socials  — replace entire socials array (preserves order) */
api.put('/socials', async (req, res) => {
  try {
    const { socials } = req.body;
    if (!Array.isArray(socials)) return res.status(400).json({ ok: false, error: 'socials must be an array' });
    const config = await patchConfig({ socials });
    res.json({ ok: true, data: config.socials });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── Sections ─────────────────────────────────────────────────────

/** GET /api/admin/sections  — list all sections */
api.get('/sections', async (req, res) => {
  try {
    const config = await getConfig();
    res.json({ ok: true, data: config.sections });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** PUT /api/admin/sections  — replace entire sections array (for reordering) */
api.put('/sections', async (req, res) => {
  try {
    const { sections } = req.body;
    if (!Array.isArray(sections)) return res.status(400).json({ ok: false, error: 'sections must be an array' });
    // Re-stamp order fields
    const stamped = sections.map((s, i) => ({ ...s, order: i }));
    const config  = await patchConfig({ sections: stamped });
    res.json({ ok: true, data: config.sections });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** PATCH /api/admin/sections/:sectionId  — edit one section's label */
api.patch('/sections/:sectionId', async (req, res) => {
  try {
    const config   = await getConfig();
    const sections = config.sections.map(s =>
      s.id === req.params.sectionId ? { ...s, ...req.body, id: s.id } : s
    );
    const updated = await patchConfig({ sections });
    res.json({ ok: true, data: updated.sections.find(s => s.id === req.params.sectionId) });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── Cards ─────────────────────────────────────────────────────────

/** GET /api/admin/sections/:sectionId/cards */
api.get('/sections/:sectionId/cards', async (req, res) => {
  try {
    const config  = await getConfig();
    const section = config.sections.find(s => s.id === req.params.sectionId);
    if (!section) return res.status(404).json({ ok: false, error: 'Section not found' });
    res.json({ ok: true, data: section.cards });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** PUT /api/admin/sections/:sectionId/cards  — replace all cards (for reordering) */
api.put('/sections/:sectionId/cards', async (req, res) => {
  try {
    const { cards } = req.body;
    if (!Array.isArray(cards)) return res.status(400).json({ ok: false, error: 'cards must be an array' });
    const config   = await getConfig();
    const sections = config.sections.map(s => {
      if (s.id !== req.params.sectionId) return s;
      return { ...s, cards: cards.map((c, i) => ({ ...c, order: i })) };
    });
    const updated = await patchConfig({ sections });
    const section = updated.sections.find(s => s.id === req.params.sectionId);
    res.json({ ok: true, data: section.cards });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** PATCH /api/admin/sections/:sectionId/cards/:cardId  — edit one card */
api.patch('/sections/:sectionId/cards/:cardId', async (req, res) => {
  try {
    const config   = await getConfig();
    const sections = config.sections.map(s => {
      if (s.id !== req.params.sectionId) return s;
      const cards = s.cards.map(c =>
        c.id === req.params.cardId ? { ...c, ...req.body, id: c.id } : c
      );
      return { ...s, cards };
    });
    const updated = await patchConfig({ sections });
    const section = updated.sections.find(s => s.id === req.params.sectionId);
    const card    = section?.cards.find(c => c.id === req.params.cardId);
    if (!card) return res.status(404).json({ ok: false, error: 'Card not found' });
    res.json({ ok: true, data: card });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── Crazy Mode ────────────────────────────────────────────────────

/** GET /api/admin/crazymode */
api.get('/crazymode', async (req, res) => {
  try {
    const config = await getConfig();
    res.json({ ok: true, data: config.crazyMode });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** PATCH /api/admin/crazymode */
api.patch('/crazymode', async (req, res) => {
  try {
    const config  = await getConfig();
    const crazyMode = { ...config.crazyMode, ...req.body };
    const updated = await patchConfig({ crazyMode });
    res.json({ ok: true, data: updated.crazyMode });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── Seed / Reset ──────────────────────────────────────────────────

/** POST /api/admin/seed  — reset everything to defaults */
api.post('/seed', async (req, res) => {
  try {
    await CONFIG_DOC.set(DEFAULT_DATA);
    res.json({ ok: true, message: 'Database seeded with default data' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use('/api/admin', api);

// ─── 404 fallback ────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ ok: false, error: 'Not found' }));

// ─── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎵 Bawz Complex Admin Server`);
  console.log(`   Site:  https://bawz-complex.vercel.app/`);
  console.log(`   Admin: https://bawz-complex-linktree-admin.onrender.com//admin`);
  console.log(`   API:   https://bawz-complex-linktree-admin.onrender.com//api/config\n`);
});