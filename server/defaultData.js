const DEFAULT_CONFIG = {
  tagline: "Welcome to Bawz Complex!\nThe home where communities grow and cultures connect.",

  socials: [
    { id: "instagram", label: "Instagram", href: "https://www.instagram.com/bawzcomplex",                           icon: "instagram", order: 0 },
    { id: "facebook",  label: "Facebook",  href: "https://www.facebook.com/profile.php?id=61570212812752",          icon: "facebook",  order: 1 },
    { id: "tiktok",    label: "TikTok",    href: "https://www.tiktok.com/@bawzcomplex",                             icon: "tiktok",    order: 2 },
    { id: "email",     label: "Email",     href: "mailto:bawzcomplex.ph@gmail.com",                                 icon: "email",     order: 3 },
  ],

  sections: [
    {
      id: "updates",
      label: "UPDATES",
      type: "promo",
      order: 0,
      cards: [
        {
          id: "class-cards",
          label: "Class Cards",
          cta: "PURCHASE",
          href: "https://docs.google.com/forms/d/e/1FAIpQLSfleQ3CEFmvyauaWlXSZhNPNJAFSbujzF8G40liNkyJmi8wfA/viewform",
          image: "assets/class-cards.png",
          alt: "Bawz Complex Class Cards",
          order: 0,
        },
        {
          id: "bawz-camp",
          label: "Bawz Complex Summer Dance Camp Year 2",
          cta: "JOIN NOW",
          href: "https://forms.gle/jMaNf6L4WeNKYz4D9",
          image: "assets/Bawz Camp.png",
          alt: "Bawz Complex Summer Dance Camp",
          order: 1,
        },
      ],
    },
    {
      id: "resources",
      label: "Resources",
      type: "link",
      order: 1,
      cards: [
        { id: "class-reg",    icon: "📝", label: "Class Registration",      href: "https://forms.gle/NMMtZSWss7JogcaY9",                                                                                        order: 0 },
        { id: "kids-reg",     icon: "🧒", label: "Kids Class Registration",  href: "https://docs.google.com/forms/d/e/1FAIpQLSfTkjnH7qZ_TS2_sBHE0GyRWbl9Vgt8Rjv_jQaA8ABO3ogANw/viewform",                       order: 1 },
        { id: "studio-rent",  icon: "🏢", label: "Studio Rentals",           href: "https://docs.google.com/forms/d/e/1FAIpQLSes31QD4bEIcqZwlbRUY2tKZGXE5eqt1Vf_boRgjuVjL48UhA/viewform",                       order: 2 },
        { id: "class-videos", icon: "🎬", label: "Official Class Videos",    href: "https://drive.google.com/drive/folders/1rwBkUG9H2HJUm_726YfBaN4xgspyZgQA",                                                   order: 3 },
      ],
    },
    {
      id: "info",
      label: "Info",
      type: "info",
      order: 2,
      cards: [
        { id: "house-rules", icon: "📋", label: "House Rules", image: "assets/HOUSE RULES.png", order: 0 },
        { id: "rates",       icon: "💸", label: "Rates",       image: "assets/Studio.PNG",       order: 1 },
      ],
    },
    {
      id: "visit",
      label: "Visit Us",
      type: "location",
      order: 3,
      cards: [
        {
          id: "location",
          icon: "📍",
          label: "Find Our Studio",
          address: "21G Col. Bonny Serrano Ave., 1103 Quezon City, Philippines",
          href: "https://maps.google.com/?q=21G+Col.+Bonny+Serrano+Ave+Quezon+City+Philippines",
          order: 0,
        },
      ],
    },
  ],

  crazyMode: {
    message: "GOODLUCK JRSEA!",
    imageAsset: "assets/jrsea.jpg",
    clickThreshold: 5,
    hoverThresholdSeconds: 5,
  },
};

module.exports = DEFAULT_CONFIG;