// Site-wide settings and navigation. Every href here must resolve to a route —
// tests/nav.test.ts enforces it so the header/footer never ship a broken link.

export const SITE = {
  name: "Campaign Forensics",
  tagline: "See why your launch backfired. With evidence.",
  footerTagline: "Find out why your launch backfired. With evidence.",
  // Placeholder inbox on the reserved .example domain — replace with a real address if you use the contact forms.
  contactEmail: "contact@campaignforensics.example",
  builtWith: "Built with Manus, Apify and fal.ai",
  brandDisclaimer:
    "Brand names are trademarks of their owners. We are not affiliated with any brand we analyze.",
  legalUpdated: "2026-10-12",
};

/**
 * Landing hero background. `null` = the built-in animated amber light beam (no file needed).
 * To use your own footage, drop files into public/hero/ and point to them, e.g.
 *   { video: "/hero/hero.mp4", poster: "/hero/hero.jpg" }   // muted, looping; poster shows while loading
 *   { image: "/hero/hero.jpg" }                               // still photo
 * Pick dark, slow, on-theme footage; a dark overlay keeps the headline readable either way.
 */
export const HERO_MEDIA: { video?: string; poster?: string; image?: string } | null = null;

/** Slug of the case the landing page and "See a sample report" point to. */
export const FEATURED_CASE_SLUG = "lays-rebrand";

/**
 * Phase 5 switch: once a real case is live, set to false so demo-mock disappears
 * from /cases (it stays reachable by URL for rehearsals).
 */
export const SHOW_MOCK_CASES = false;

/** Slugs whose data is fictional. Every screen showing them carries a MOCK DATA badge. */
export const MOCK_SLUGS = new Set(["demo-mock"]);

export interface NavLink {
  label: string;
  href: string;
}

export const HEADER_LINKS: NavLink[] = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Sample reports", href: "/cases" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
];

export const HEADER_CTA: NavLink = { label: "Start a case", href: "/new" };

/** Footer link columns (the case-files column is built from the data). */
export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Sample reports", href: "/cases" },
      { label: "Pricing", href: "/pricing" },
      { label: "Start a case", href: "/new" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
];

/** Every footer link outside the legal column. */
export const FOOTER_LINKS: NavLink[] = FOOTER_COLUMNS.flatMap((c) => c.links);

/** Footer, legal column. */
export const LEGAL_LINKS: NavLink[] = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "KVKK Notice (TR)", href: "/legal/kvkk" },
  { label: "Cookie Policy", href: "/legal/cookies" },
  { label: "Terms of Use", href: "/legal/terms" },
  { label: "Responsible Data Use", href: "/legal/data-sources" },
  { label: "Disclaimer", href: "/legal/disclaimer" },
  { label: "Data requests", href: "/legal/data-request" },
];

/** Shown on the About page. */
export const TEAM: { name: string; role: string; linkedin?: string }[] = [
  { name: "Mehmet Göktuğ Elbir", role: "Product & strategy" },
  { name: "Mehmet Burak Albayrak", role: "Engineering & data" },
  { name: "Fatih Kadim", role: "Creative & brand" },
];
