import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { validateCase } from "@/lib/validateCase";
import { parseRunTable } from "@/lib/investigationLog";
import { getCaseBundle, listCaseSlugs } from "@/lib/data";
import { HypothesisCard } from "@/components/HypothesisCard";
import { EvidenceCard } from "@/components/EvidenceCard";
import { investigationContract } from "@/components/report/InvestigationContract";
import { InvestigationLog } from "@/components/report/InvestigationLog";
import { PreflightPanel } from "@/components/report/PreflightPanel";
import type { ForensicsFile } from "@/lib/types";
import { ev } from "./fixtures";

const REAL = ["lays-rebrand", "instagram-wordmark-2026"];

describe("validate:case", () => {
  it.each(listCaseSlugs())("%s has no errors and its preflight passes", async (slug) => {
    const r = await validateCase(slug);
    expect(r.findings.filter((f) => f.level === "error")).toEqual([]);
    expect(r.preflight?.status).toBe("passed");
  });

  it.each(REAL)("%s: every produced asset answers a prescription and has lineage", async (slug) => {
    const r = await validateCase(slug, { skipMedia: true });
    const checks = r.preflight!.checks;
    expect(checks.filter((c) => c.id === "trace").every((c) => c.status === "pass")).toBe(true);
    expect(checks.filter((c) => c.id === "lineage").every((c) => c.status === "pass")).toBe(true);
  });

  describe("forensics rules", () => {
    let root: string;
    const slug = "lays-rebrand";
    const file = () => path.join(root, "data", "cases", slug, "forensics.json");
    const mutate = (fn: (f: ForensicsFile) => void) => {
      const f = JSON.parse(fs.readFileSync(file(), "utf8")) as ForensicsFile;
      fn(f);
      fs.writeFileSync(file(), JSON.stringify(f));
    };
    const errors = async () => (await validateCase(slug, { root, skipMedia: true })).findings.filter((f) => f.level === "error").map((f) => f.message);

    beforeEach(() => {
      root = fs.mkdtempSync(path.join(os.tmpdir(), "cf-validate-"));
      fs.cpSync(path.join(process.cwd(), "data", "cases", slug), path.join(root, "data", "cases", slug), { recursive: true });
      fs.cpSync(path.join(process.cwd(), "public", "cases", slug), path.join(root, "public", "cases", slug), { recursive: true });
      fs.cpSync(path.join(process.cwd(), "prompts", slug), path.join(root, "prompts", slug), { recursive: true });
    });
    afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

    it("the untouched copy is clean", async () => {
      expect(await errors()).toEqual([]);
    });

    it("rejects a hypothesis rejected for lack of evidence", async () => {
      mutate((f) => {
        f.hypotheses.find((h) => h.id === "H6")!.counter_evidence_ids = [];
      });
      expect(await errors()).toContain("H6 is rejected without counter-evidence");
    });

    it("flags evidence classified twice, unknown ids and unclassified diagnosis evidence", async () => {
      mutate((f) => {
        const h4 = f.hypotheses.find((h) => h.id === "H4")!;
        h4.counter_evidence_ids.push("ev_015");
        h4.support_evidence_ids.push("ev_999");
        h4.context_evidence_ids = [];
      });
      const e = await errors();
      expect(e).toContain("H4: ev_015 is classified twice");
      expect(e).toContain("H4 support cites unknown evidence ev_999");
      expect(e).toContain("H4: ev_001 from diagnosis.json is not classified");
    });

    it("requires a reason for uncertain hypotheses and the main cause to keep its evidence", async () => {
      mutate((f) => {
        delete f.hypotheses.find((h) => h.id === "H1")!.uncertainty;
        f.claims[0].support_evidence_ids = ["ev_015"];
      });
      const e = await errors();
      expect(e).toContain("H1 is uncertain without saying why (uncertainty)");
      expect(e.some((m) => m.startsWith("main_cause support is missing diagnosis evidence"))).toBe(true);
    });

    it("blocks performance claims and approval of a failed preflight", async () => {
      const d = path.join(root, "data", "cases", slug, "diagnosis.json");
      fs.writeFileSync(d, fs.readFileSync(d, "utf8").replace("The crunch says it all", "The winner variant"));
      fs.rmSync(path.join(root, "public", "cases", slug, "pack-v1.png"));
      fs.writeFileSync(
        path.join(root, "data", "cases", slug, "approval.json"),
        JSON.stringify({ schema_version: "1.0", case_slug: slug, reviewer: "Test", decision: "approved", reviewed_at: "2026-10-12" }),
      );
      const e = await errors();
      expect(e.some((m) => m.includes('performance term "winner"'))).toBe(true);
      expect(e.some((m) => m.includes("pack-v1.png: File present"))).toBe(true);
      expect(e).toContain("approved although preflight failed");
    });
  });
});

describe("investigation log", () => {
  it("parses the run table, including runs that returned nothing", () => {
    const rows = parseRunTable(
      "| File | Actor | Run | Input (limits) |\n|---|---|---|---|\n| `reddit.json` | `a/reddit` | `r1`, `r2` | 6 threads |\n| — | `a/youtube` | `r3` | 1 video → **0 results** |",
    );
    expect(rows).toEqual([
      { file: "reddit.json", actor: "a/reddit", runs: ["r1", "r2"], input: "6 threads", empty: false },
      { file: "—", actor: "a/youtube", runs: ["r3"], input: "1 video → 0 results", empty: true },
    ]);
  });

  it.each(REAL)("%s: is rebuilt from raw/ and marks the files used in the report", (slug) => {
    const b = getCaseBundle(slug)!;
    expect(b.log!.collection.length).toBeGreaterThanOrEqual(4);
    expect(b.log!.production.some((p) => p.used)).toBe(true);
    render(<InvestigationLog bundle={b} />);
    expect(screen.getByRole("heading", { name: "How this investigation ran." })).toBeInTheDocument();
    expect(screen.getAllByText("In report").length).toBeGreaterThan(0);
  });
});

describe("evidence ledger on hypothesis cards", () => {
  const b = getCaseBundle("lays-rebrand")!;
  const h = (id: string) => b.diagnosis!.hypotheses.find((x) => x.id === id)!;
  const l = (id: string) => b.forensics!.hypotheses.find((x) => x.id === id)!;

  it("shows support, counter-evidence, missing data and 'not calibrated'", () => {
    render(<HypothesisCard h={h("H4")} ledger={l("H4")} slug="lays-rebrand" />);
    expect(screen.getByText("Supports")).toBeInTheDocument();
    expect(screen.getByText("Against")).toBeInTheDocument();
    expect(screen.getByText("Missing data")).toBeInTheDocument();
    expect(screen.getByText(/not calibrated/i)).toBeInTheDocument();
  });

  it("explains a rejection and an uncertainty", () => {
    const { unmount } = render(<HypothesisCard h={h("H6")} ledger={l("H6")} />);
    expect(screen.getByText("Why rejected")).toBeInTheDocument();
    unmount();
    render(<HypothesisCard h={h("H2")} ledger={l("H2")} />);
    expect(screen.getByText("Not enough evidence")).toBeInTheDocument();
  });
});

describe("translations", () => {
  it("shows only the English translation of non-English evidence", () => {
    render(<EvidenceCard evidence={ev({ id: "ev_001", lang: "tr", text: "Orijinal metin", text_en: "Original text" })} />);
    expect(screen.getByText(/Original text/)).toBeInTheDocument();
    expect(screen.getByText("Translated from Turkish")).toBeInTheDocument();
    expect(screen.queryByText(/Orijinal/)).toBeNull();
  });
});

describe("investigation contract and quality gate", () => {
  it("states the limits of a public-only case", () => {
    const rows = Object.fromEntries(investigationContract(getCaseBundle("lays-rebrand")!).map((r) => [r.label, r.value]));
    expect(rows["Ad account"]).toBe("Not connected");
    expect(rows["Causal status"]).toBe("Descriptive, not causal");
    expect(rows.Sample).toMatch(/^65 items · 6 source types · 55 English, 10 Turkish$/);
  });

  it("never shows a human approval that was not recorded", () => {
    const b = getCaseBundle("lays-rebrand")!;
    render(<PreflightPanel bundle={{ ...b, approval: null }} />);
    expect(screen.getByText(/Human review · pending/)).toBeInTheDocument();
    expect(screen.getByText(/Ready for an account test · pending/)).toBeInTheDocument();
  });
});

describe("no Turkish anywhere on the site", () => {
  // Personal names (the team) are names, not words; everything else must be English.
  const TURKISH = /[çğıöşüÇĞİÖŞÜ]|Türkiye|Lay.?slik|Teyze|Pazarlama|Fırından|Baharatlı/;
  const shown: { where: string; text: string }[] = [];
  const walk = (v: unknown, where: string) => {
    if (typeof v === "string") shown.push({ where, text: v });
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where}[${i}]`));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (k !== "prompt_used") walk(x, `${where}.${k}`);
  };
  for (const slug of listCaseSlugs()) {
    const b = getCaseBundle(slug)!;
    walk({ case: b.case, diagnosis: b.diagnosis, creative: b.creative, forensics: b.forensics, log: b.log }, slug);
    for (const e of b.evidence?.evidence ?? []) walk({ text: e.text_en ?? e.text, tags: e.tags }, `${slug}/${e.id}`);
  }
  const content = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? content(path.join(dir, d.name)) : [path.join(dir, d.name)]));
  for (const f of content(path.join(process.cwd(), "content"))) shown.push({ where: f, text: fs.readFileSync(f, "utf8") });

  it("in case data, evidence as displayed, FAQ and legal pages", () => {
    expect(shown.filter((s) => TURKISH.test(s.text)).map((s) => s.where)).toEqual([]);
  });
});
