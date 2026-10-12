import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getCaseBundle, isMockSlug, listCases, listCaseSlugs, CASES_DIR } from "@/lib/data";
import { EVIDENCE_ID, privacyIssues } from "@/lib/evidence";
import type { HypothesisName } from "@/lib/types";

describe("data loading", () => {
  it("finds demo-mock and loads all four files", () => {
    expect(listCaseSlugs()).toContain("demo-mock");
    const b = getCaseBundle("demo-mock")!;
    expect(b.case.slug).toBe("demo-mock");
    expect(b.evidence).not.toBeNull();
    expect(b.diagnosis).not.toBeNull();
    expect(b.creative).not.toBeNull();
    expect(b.isMock).toBe(true);
  });

  it("returns null for unknown or unsafe slugs (no path traversal)", () => {
    expect(getCaseBundle("does-not-exist")).toBeNull();
    expect(getCaseBundle("../package")).toBeNull();
    expect(getCaseBundle("..")).toBeNull();
    expect(getCaseBundle("Demo-Mock")).toBeNull();
  });

  it("can hide mock cases (Phase 5 switch)", () => {
    expect(listCases({ includeMock: false }).some((b) => b.isMock)).toBe(false);
    expect(listCases({ includeMock: true }).some((b) => b.case.slug === "demo-mock")).toBe(true);
    expect(isMockSlug("demo-mock")).toBe(true);
    expect(isMockSlug("instagram-wordmark-2026")).toBe(false);
  });

  describe("with a temporary cases directory", () => {
    let dir: string;
    beforeEach(() => {
      dir = fs.mkdtempSync(path.join(os.tmpdir(), "cf-cases-"));
    });
    afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

    const write = (slug: string, file: string, body: string) => {
      fs.mkdirSync(path.join(dir, slug), { recursive: true });
      fs.writeFileSync(path.join(dir, slug, file), body);
    };

    it("treats missing step files as null (tab shows 'in progress')", () => {
      write("half-done", "case.json", JSON.stringify({ slug: "half-done", launch_date: "2026-01-01" }));
      const b = getCaseBundle("half-done", dir)!;
      expect(b.evidence).toBeNull();
      expect(b.diagnosis).toBeNull();
      expect(b.creative).toBeNull();
    });

    it("ignores folders without case.json", () => {
      fs.mkdirSync(path.join(dir, "empty-folder"));
      write("raw-only", "evidence.json", "{}");
      expect(listCaseSlugs(dir)).toEqual([]);
    });

    it("throws a readable error on corrupt JSON (handled by error.tsx)", () => {
      write("broken", "case.json", "{ not json");
      expect(() => getCaseBundle("broken", dir)).toThrow(/Invalid JSON in .*broken/);
    });

    it("sorts cases by launch date, newest first", () => {
      write("old-case", "case.json", JSON.stringify({ slug: "old-case", launch_date: "2025-01-01" }));
      write("new-case", "case.json", JSON.stringify({ slug: "new-case", launch_date: "2026-08-14" }));
      expect(listCases({ dir, includeMock: true }).map((b) => b.case.slug)).toEqual(["new-case", "old-case"]);
    });
  });
});

/**
 * Contract checks for every case on disk (CAMPAIGN_FORENSICS.md §5–§7.8). New real
 * cases are validated automatically as soon as their folder exists.
 */
const NAMES: HypothesisName[] = ["Positioning", "Target Audience", "Differentiation", "Message", "Creative Execution", "Competition"];

describe.each(listCaseSlugs(CASES_DIR))("case %s satisfies the data contract", (slug) => {
  const b = getCaseBundle(slug)!;
  const evidence = b.evidence?.evidence ?? [];
  const ids = new Set(evidence.map((e) => e.id));

  it("case.json is well formed", () => {
    expect(b.case.slug).toBe(slug);
    expect(["ad", "rebrand", "launch", "other"]).toContain(b.case.campaign_type);
    expect(["draft", "collecting", "diagnosing", "producing", "done"]).toContain(b.case.status);
    expect(b.case.launch_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("every file belongs to this case", () => {
    if (b.evidence) expect(b.evidence.case_slug).toBe(slug);
    if (b.diagnosis) expect(b.diagnosis.case_slug).toBe(slug);
    if (b.creative) expect(b.creative.case_slug).toBe(slug);
  });

  it("evidence ids are unique and well formed, every item has a URL", () => {
    expect(ids.size).toBe(evidence.length);
    for (const e of evidence) {
      expect(e.id).toMatch(EVIDENCE_ID);
      expect(() => new URL(e.url)).not.toThrow();
    }
  });

  it("evidence contains no usernames or profile links", () => {
    const issues = evidence.flatMap((e) => privacyIssues(e).map((i) => `${e.id}: ${i}`));
    expect(issues).toEqual([]);
  });

  it("sources_summary matches the evidence", () => {
    if (!b.evidence) return;
    const counted: Record<string, number> = {};
    for (const e of evidence) counted[e.source] = (counted[e.source] ?? 0) + 1;
    const summary = Object.fromEntries(b.evidence.sources_summary.map((s) => [s.source, s.count]));
    expect(summary).toEqual(counted);
  });

  it("has balanced evidence from at least 3 source types", () => {
    if (!b.evidence) return;
    expect(new Set(evidence.map((e) => e.source)).size).toBeGreaterThanOrEqual(3);
    expect(evidence.some((e) => e.sentiment !== "negative")).toBe(true);
  });

  it("diagnosis has exactly the six hypotheses, each with ≥2 known evidence ids", () => {
    if (!b.diagnosis) return;
    const hs = b.diagnosis.hypotheses;
    expect(hs).toHaveLength(6);
    expect(new Set(hs.map((h) => h.name))).toEqual(new Set(NAMES));
    for (const h of hs) {
      expect(h.confidence).toBeGreaterThanOrEqual(0);
      expect(h.confidence).toBeLessThanOrEqual(100);
      expect(h.evidence_ids.length).toBeGreaterThanOrEqual(2);
      for (const id of h.evidence_ids) expect(ids.has(id), `${h.id} cites unknown ${id}`).toBe(true);
    }
  });

  it("every cited evidence id exists", () => {
    if (!b.diagnosis) return;
    const d = b.diagnosis;
    const cited = [
      ...d.diagnosis.evidence_ids,
      ...(d.diagnosis.surprising_evidence_ids ?? []),
      ...d.prescription.flatMap((p) => p.evidence_ids),
    ];
    expect(cited.filter((id) => !ids.has(id))).toEqual([]);
  });

  it("passes the generic check and has the required report parts", () => {
    if (!b.diagnosis) return;
    const d = b.diagnosis;
    expect(d.generic_check.passed).toBe(true);
    expect(d.diagnosis.main_cause.length).toBeGreaterThan(20);
    expect(d.diagnosis.surprising_finding.length).toBeGreaterThan(20);
    expect(d.prescription.length).toBeGreaterThanOrEqual(3);
    expect(d.prescription.length).toBeLessThanOrEqual(5);
    expect(d.before_after.length).toBeGreaterThanOrEqual(4);
    expect(d.before_after.length).toBeLessThanOrEqual(6);
    expect(d.creative_brief.scenes.length).toBeGreaterThanOrEqual(3);
    expect(d.creative_brief.scenes.length).toBeLessThanOrEqual(4);
  });

  it("local creative and asset files exist in public/", () => {
    const local = [
      ...(b.creative?.assets ?? []).map((a) => a.path),
      ...b.case.assets.map((a) => a.url),
    ].filter((p) => p.startsWith("/"));
    const missing = local.filter((p) => !fs.existsSync(path.join(process.cwd(), "public", p)));
    expect(missing).toEqual([]);
  });

  it("creative.json never contains API keys", () => {
    const raw = JSON.stringify(b.creative ?? {});
    expect(raw).not.toMatch(/FAL_KEY|key_[a-z0-9]{16,}|sk-[A-Za-z0-9]{20,}/i);
  });
});

describe("demo-mock follows the mock-data rules (§7.8)", () => {
  const b = getCaseBundle("demo-mock")!;
  const evidence = b.evidence!.evidence;

  it("is about a fictional brand", () => {
    expect(b.case.brand).toBe("Northwind Coffee");
  });
  it("has ~40 evidence items across ≥4 source types with mixed sentiment", () => {
    expect(evidence.length).toBeGreaterThanOrEqual(35);
    expect(evidence.length).toBeLessThanOrEqual(45);
    expect(new Set(evidence.map((e) => e.source)).size).toBeGreaterThanOrEqual(4);
    expect(new Set(evidence.map((e) => e.sentiment))).toEqual(new Set(["negative", "neutral", "positive"]));
  });
  it("uses obviously fake URLs", () => {
    for (const e of evidence) expect(new URL(e.url).hostname).toBe("example.com");
  });
  it("has 2 confirmed, 1 uncertain and 3 rejected hypotheses", () => {
    const s = b.diagnosis!.hypotheses.map((h) => h.status);
    expect(s.filter((x) => x === "confirmed")).toHaveLength(2);
    expect(s.filter((x) => x === "uncertain")).toHaveLength(1);
    expect(s.filter((x) => x === "rejected")).toHaveLength(3);
  });
  it("has one image and one video placeholder", () => {
    const kinds = b.creative!.assets.map((a) => a.kind).sort();
    expect(kinds).toEqual(["image", "video"]);
  });
  it("includes at least one evidence text long enough to exercise 'Show more'", () => {
    expect(evidence.some((e) => e.text.length > 500)).toBe(true);
  });
});
