// FAQ (Sayfa Haritası, Grup D): 4 categories, 16 questions, plus a glossary.
// The landing page shows the first four entries flagged `featured`.

export interface FaqItem {
  q: string;
  a: string;
  featured?: boolean;
}

export const FAQ: { category: string; items: FaqItem[] }[] = [
  {
    category: "Product",
    items: [
      {
        q: "What does Campaign Forensics do?",
        a: "It collects public reactions to a campaign, tests six possible explanations against that evidence, tells you what most likely went wrong, and produces a revised concept and short video based on the diagnosis.",
        featured: true,
      },
      {
        q: "Why not just ask ChatGPT?",
        a: "A single model answers from what it already knows and guesses. We collect live evidence, rule alternative explanations out in the open, and link every claim to a source you can open.",
        featured: true,
      },
      {
        q: "How is this different from Motion or VidMob?",
        a: "Those tools measure which ad wins using your ad-account data. We answer the strategic \"why\" without any account access — useful before a pitch, after a launch, or for a competitor's campaign.",
      },
      {
        q: "Which campaigns does it work for?",
        a: "Ad films, rebrands and product launches. There has to be enough public reaction to analyze — usually a few days after launch is enough.",
      },
    ],
  },
  {
    category: "Method & reliability",
    items: [
      {
        q: "How reliable is a diagnosis?",
        a: "Every conclusion links to its sources, every hypothesis shows a confidence score, and the main cause has to pass a generic-diagnosis test — if it would fit any other brand's campaign, it is rewritten until it doesn't.",
        featured: true,
      },
      {
        q: "How do you know the campaign actually failed?",
        a: "We don't — performance data belongs to the brand. The diagnosis is an interpretation of the public reaction. It gets sharper when account data is added.",
      },
      {
        q: "How much evidence do you collect?",
        a: "Typically 30–80 quality items from at least three different source types: news, video and social comments, forums and competitor material.",
      },
      {
        q: "Do you only look at negative comments?",
        a: "No. Supportive and neutral evidence is collected and shown in the report too; weak hypotheses are rejected, not hidden.",
      },
    ],
  },
  {
    category: "Data & privacy",
    items: [
      {
        q: "Do you need access to our ad accounts?",
        a: "No. We work from public signals only — nothing to connect, nothing to share.",
        featured: true,
      },
      {
        q: "Do you process personal data?",
        a: "Comment text is kept anonymous; usernames, profile links and photos are never stored or shown. See Responsible Data Use for details.",
      },
      {
        q: "How do I get my comment removed from a report?",
        a: "Use the Data requests page with the evidence ID (for example ev_014). We respond within 30 days at the latest.",
      },
      {
        q: "Do you work with the brands you analyze?",
        a: "No. Reports are independent; we are not affiliated with, endorsed or sponsored by any brand we analyze.",
      },
    ],
  },
  {
    category: "Pricing & delivery",
    items: [
      { q: "How fast is a report delivered?", a: "Usually in under 48 hours." },
      { q: "How much does it cost?", a: "$49 per report, or $299 per month for agencies. Enterprise plans are priced on request. Beta — prices may change." },
      {
        q: "Can I use the generated creative?",
        a: "As a concept, yes. Checking rights before any commercial use is your responsibility — generated visuals are not official brand designs.",
      },
      { q: "Can I white-label the report for my client?", a: "On the Agency plan — it is on our roadmap." },
    ],
  },
];

export const GLOSSARY: { term: string; definition: string }[] = [
  { term: "Evidence ID", definition: "A stable reference such as ev_014 that links a claim to one piece of public evidence." },
  { term: "Hypothesis", definition: "One of six candidate explanations — positioning, audience, differentiation, message, creative, competition." },
  { term: "Confidence", definition: "A 0–100 score for how strongly the evidence supports a hypothesis." },
  { term: "Confirmed / Rejected / Uncertain", definition: "Whether the evidence supports a hypothesis, rules it out, or is not enough to decide." },
  { term: "Main cause", definition: "The single, specific explanation the evidence supports best." },
  { term: "Surprising finding", definition: "What the evidence reveals that the obvious story misses." },
  { term: "Generic check", definition: "A test that rejects any diagnosis that would fit another brand's campaign unchanged." },
  { term: "Prescription", definition: "The concrete changes that follow from the diagnosis, each tied to evidence." },
  { term: "Creative brief", definition: "Concept, message, audience, tone, scenes and CTA for the relaunch." },
  { term: "Before / After", definition: "A side-by-side of what the launched campaign did and what the relaunch changes." },
];

export const FEATURED_FAQ: FaqItem[] = FAQ.flatMap((c) => c.items).filter((i) => i.featured);
