// FAQ (page map, group D): 4 categories, 16 questions, plus a glossary.
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
        a: "It investigates a campaign the way an analyst would, only faster. First it collects the public reaction — news coverage, social and video comments, forum threads and competitor material. Then it tests six possible explanations (positioning, audience, differentiation, message, creative execution, competition) against that evidence and names the one the evidence supports best. Finally it turns the diagnosis into a prescription and a creative brief, and produces a revised concept image and a short relaunch video. Every step is in the report, and every claim links to its source.",
        featured: true,
      },
      {
        q: "Why not just ask ChatGPT?",
        a: "A chat model answers from what it already knows, so it tends to give a plausible but generic explanation (\"people don't like change\"). We start from evidence collected for this specific campaign, test six competing explanations against it and show which ones were rejected and why. Every conclusion carries evidence IDs you can click through to the original post or article, and the main cause has to pass a test that rejects anything generic. You get something you can check and defend in a meeting, not just an opinion.",
        featured: true,
      },
      {
        q: "How is this different from Motion or VidMob?",
        a: "Creative-analytics tools like Motion or VidMob connect to your ad accounts and tell you which ad performed better on metrics such as CTR or hook rate. We answer a different question: why the market reacted the way it did. Because we only use public signals, we need no account access — so it works before a pitch, right after a launch, and even for a competitor's campaign you have no data for. The two approaches complement each other.",
      },
      {
        q: "Which campaigns does it work for?",
        a: "Ad films, rebrands, packaging changes and product launches — anything people react to in public. The one requirement is enough public reaction to analyze: a few days after launch is usually enough for a national campaign, while small or niche launches may not generate enough evidence. If we can't find enough, the report says so instead of stretching thin data.",
      },
    ],
  },
  {
    category: "Method & reliability",
    items: [
      {
        q: "How reliable is a diagnosis?",
        a: "It is as reliable as the evidence behind it — and you can see that evidence. Every conclusion links to its sources, every hypothesis shows a 0–100 confidence score, and hypotheses the evidence doesn't support are marked rejected rather than quietly dropped. The main cause must also pass a generic-diagnosis test: if it would fit another brand's campaign unchanged, it is rewritten until it is specific to this one. A diagnosis is the best-supported explanation, not a certainty, and every report says so.",
        featured: true,
      },
      {
        q: "How do you know the campaign actually failed?",
        a: "We don't, and we don't claim to. Sales and media performance data belong to the brand and are not public. What we measure is the public reaction — the Backlash score, for example, shows what share of the collected evidence is negative. A campaign can perform commercially and still draw a negative reaction, or the other way round. If you share your own performance data with us, the diagnosis gets sharper.",
      },
      {
        q: "How much evidence do you collect?",
        a: "Typically 30–80 quality items from at least three different source types — news, video and social comments, forums such as Reddit, and competitor material. We favour quality over volume: duplicates, spam and comments too short to mean anything are removed, and each remaining item is tagged with a sentiment and topic. Our sample cases use 65 and 70 items from six source types each, and the Evidence tab shows the exact mix for every report.",
      },
      {
        q: "Do you only look at negative comments?",
        a: "No. Looking only at complaints would make every campaign look like a failure. We deliberately collect supportive and neutral reactions as well — in the Lay's case one in five items is positive, mostly about the design. The Evidence tab shows the full sentiment split, and the diagnosis has to account for the positive reactions too.",
      },
    ],
  },
  {
    category: "Data & privacy",
    items: [
      {
        q: "Do you need access to our ad accounts?",
        a: "No. We work from public signals only — there is nothing to connect, no logins to share and no data leaving your company. That is also why we can analyse campaigns that aren't yours, such as a competitor's launch or a prospect's last campaign before a pitch. You can add your own performance data later if you want to, but it is never required.",
        featured: true,
      },
      {
        q: "Do you process personal data?",
        a: "As little as possible. Only the text of public comments is kept — no usernames, profile links, profile photos or anything else that points to a person — and evidence cards link to the post, not the author. We don't build profiles or combine data about individuals across sources. The Responsible Data Use page and our GDPR notice explain the details, the legal basis and your rights.",
      },
      {
        q: "How do I get my comment removed from a report?",
        a: "Go to the Data requests page, choose \"Remove evidence\" and include the report link or the evidence ID shown on the card (for example ev_014). You don't need to give a reason. We remove the item from the report and from our stored data and confirm by e-mail — within one month at the latest, usually much sooner. Every evidence card also has a \"Report this evidence\" link that takes you straight there.",
      },
      {
        q: "Do you work with the brands you analyze?",
        a: "No. Reports are independent analyses of public signals; we are not affiliated with, endorsed or sponsored by any brand we analyze, and brands do not pay to appear or to be left out. Brand names are used only to identify the campaign, and any creative we generate is clearly labelled as a concept, not an official design.",
      },
    ],
  },
  {
    category: "Pricing & delivery",
    items: [
      { q: "How fast is a report delivered?", a: "Usually in under 48 hours from the moment we have the campaign details. Collecting and cleaning the evidence takes most of that time; the diagnosis and creative follow once the evidence is in. For a time-critical launch, tell us your deadline through the Contact page and we'll say up front whether we can meet it." },
      { q: "How much does it cost?", a: "A single report is $49. The Agency plan is $299 per month with unlimited cases — worth it if you diagnose campaigns regularly for pitches or clients. Enterprise plans, for brand teams that need ongoing monitoring or custom sources, are priced on request. Prices may change." },
      {
        q: "Can I use the generated creative?",
        a: "Yes, as a concept — for a pitch, an internal presentation or a creative brief. The images and video are generated by AI from the diagnosis and are not official brand designs. Before any commercial use, check trademark and usage rights yourself or with your legal team; that responsibility stays with you.",
      },
      { q: "Can I white-label the report for my client?", a: "Not yet. White-label reports — your logo and colours, no Campaign Forensics branding — are on our roadmap for the Agency plan. Until then you can download the full report as JSON or print it to PDF and present the findings in your own deck." },
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
