export interface Plan {
  name: string;
  price: string;
  unit?: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  popular?: boolean;
  roadmap?: string[];
}

export const PLANS: Plan[] = [
  {
    name: "Single report",
    price: "$49",
    unit: "/ report",
    description: "One campaign, fully investigated.",
    features: ["Full four-part report", "30–80 sourced evidence items", "1 revised creative concept", "Delivered in under 48 hours"],
    cta: { label: "Start a case", href: "/new" },
  },
  {
    name: "Agency",
    price: "$299",
    unit: "/ month",
    description: "For teams running investigations every week.",
    features: ["Unlimited cases", "Concept + relaunch video per case", "Priority support"],
    roadmap: ["White-label reports"],
    cta: { label: "Join the waitlist", href: "/#waitlist" },
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Let's talk",
    description: "Custom sources, your own data, and integrations.",
    features: ["Custom source lists", "Combine with your ad-account data", "Integrations and SSO"],
    cta: { label: "Contact us", href: "/contact" },
  },
];

export const PRICING_FAQ: { q: string; a: string }[] = [
  { q: "What if there isn't enough public reaction?", a: "We tell you before charging. If a campaign has too little public evidence for a sourced diagnosis, the report isn't produced." },
  { q: "Can I get an invoice?", a: "Yes — invoices are issued for every report and monthly plan once paid plans open." },
  { q: "How long does a case take?", a: "Typically under 48 hours from the moment the case is opened." },
  { q: "Can I cancel the Agency plan?", a: "Yes, any time. The plan runs until the end of the paid month." },
];
