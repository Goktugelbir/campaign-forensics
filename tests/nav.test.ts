import fs from "node:fs";
import path from "node:path";
import { FEATURED_CASE_SLUG, FOOTER_LINKS, HEADER_CTA, HEADER_LINKS, LEGAL_LINKS } from "@/lib/site";
import { PLANS } from "@/content/pricing";
import { FAQ, FEATURED_FAQ } from "@/content/faq";
import { routeExists } from "./routes";

describe("navigation never points to a missing page", () => {
  const links = [
    ...HEADER_LINKS,
    HEADER_CTA,
    ...FOOTER_LINKS,
    ...LEGAL_LINKS,
    ...PLANS.map((p) => ({ label: p.cta.label, href: p.cta.href })),
  ];
  it.each(links.map((l) => [l.label, l.href]))("%s → %s", (_label, href) => {
    expect(routeExists(href)).toBe(true);
  });

  it("header has the four links + CTA from the spec", () => {
    expect(HEADER_LINKS.map((l) => l.label)).toEqual(["How it works", "Sample reports", "Pricing", "FAQ"]);
    expect(HEADER_CTA.href).toBe("/new");
  });

  it("footer has the seven legal pages", () => {
    expect(LEGAL_LINKS).toHaveLength(7);
  });

  it("the featured case exists", () => {
    expect(routeExists(`/cases/${FEATURED_CASE_SLUG}`)).toBe(true);
  });

  it("routeExists rejects unknown pages", () => {
    expect(routeExists("/nope")).toBe(false);
    expect(routeExists("/legal/nope")).toBe(false);
    expect(routeExists("/cases/nope")).toBe(false);
  });
});

describe("hard-coded hrefs inside pages and components resolve", () => {
  const files = ["app", "components"].flatMap((d) => walk(path.join(process.cwd(), d)));
  const hrefs = new Set<string>();
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    for (const m of src.matchAll(/href=["{`]+(\/[^"`}$]*)["`}]/g)) hrefs.add(m[1]);
  }
  it("found some links to check", () => expect(hrefs.size).toBeGreaterThan(5));
  it.each([...hrefs])("%s", (href) => expect(routeExists(href)).toBe(true));
});

describe("FAQ content", () => {
  it("has 4 categories × 4 questions and exactly 4 featured on the landing page", () => {
    expect(FAQ).toHaveLength(4);
    for (const c of FAQ) expect(c.items).toHaveLength(4);
    expect(FEATURED_FAQ.map((f) => f.q)).toEqual([
      "What does Campaign Forensics do?",
      "Why not just ask ChatGPT?",
      "How reliable is a diagnosis?",
      "Do you need access to our ad accounts?",
    ]);
  });
});

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : /\.tsx?$/.test(d.name) ? [p] : [];
  });
}
