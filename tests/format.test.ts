import {
  caseCode,
  clampConfidence,
  compactNumber,
  countByStatus,
  firstSentence,
  formatDateLabel,
  formatDateLong,
  sortHypotheses,
  truncate,
} from "@/lib/format";
import type { Hypothesis } from "@/lib/types";

describe("formatDateLabel / formatDateLong", () => {
  it("formats ISO dates without timezone drift", () => {
    expect(formatDateLabel("2026-08-14")).toBe("14 AUG 2026");
    expect(formatDateLabel("2026-08-16T23:59:00-05:00")).toBe("16 AUG 2026");
    expect(formatDateLong("2026-01-01")).toBe("1 January 2026");
    expect(formatDateLong("2026-08-14")).toBe("14 August 2026");
  });
  it("returns an em dash for null, empty or invalid values", () => {
    expect(formatDateLabel(null)).toBe("—");
    expect(formatDateLabel("")).toBe("—");
    expect(formatDateLabel("14/08/2026")).toBe("—");
    expect(formatDateLong("2026-13-01")).toBe("—");
  });
});

describe("truncate", () => {
  it("leaves short text alone", () => {
    expect(truncate("short", 10)).toEqual({ text: "short", truncated: false });
  });
  it("cuts on a word boundary and never exceeds max", () => {
    const long = "word ".repeat(200).trim();
    const r = truncate(long, 500);
    expect(r.truncated).toBe(true);
    expect(r.text.length).toBeLessThanOrEqual(500);
    expect(r.text.endsWith("…")).toBe(true);
    expect(r.text).not.toMatch(/wor…$/);
  });
  it("hard-cuts when there is no usable space", () => {
    const r = truncate("x".repeat(600), 500);
    expect(r.text).toHaveLength(500);
  });
});

describe("caseCode", () => {
  it("prefers an explicit code", () => expect(caseCode("anything", "CF-0412")).toBe("CF-0412"));
  it("derives a stable 4-digit code from the slug", () => {
    const a = caseCode("instagram-wordmark-2026");
    expect(a).toMatch(/^CF-\d{4}$/);
    expect(caseCode("instagram-wordmark-2026")).toBe(a);
    expect(caseCode("lays-rebrand")).not.toBe(a);
  });
});

const h = (id: string, status: Hypothesis["status"], confidence: number): Hypothesis => ({
  id,
  name: "Message",
  status,
  confidence,
  evidence_ids: [],
  reasoning: "",
});

describe("sortHypotheses / countByStatus", () => {
  const list = [h("H1", "rejected", 20), h("H2", "uncertain", 44), h("H3", "rejected", 16), h("H4", "confirmed", 71), h("H5", "confirmed", 86)];
  it("orders confirmed → uncertain → rejected, by confidence within a group", () => {
    expect(sortHypotheses(list).map((x) => x.id)).toEqual(["H5", "H4", "H2", "H1", "H3"]);
  });
  it("does not mutate the input", () => {
    sortHypotheses(list);
    expect(list[0].id).toBe("H1");
  });
  it("counts by status", () => {
    expect(countByStatus(list)).toEqual({ confirmed: 2, uncertain: 1, rejected: 2 });
  });
});

describe("small helpers", () => {
  it("clampConfidence keeps scores in 0–100", () => {
    expect(clampConfidence(140)).toBe(100);
    expect(clampConfidence(-3)).toBe(0);
    expect(clampConfidence(NaN)).toBe(0);
    expect(clampConfidence(71.6)).toBe(72);
  });
  it("firstSentence", () => {
    expect(firstSentence("One. Two.")).toBe("One.");
    expect(firstSentence("No full stop")).toBe("No full stop");
    expect(firstSentence("Reads 'Norhwind' — a word. Next.")).toBe("Reads 'Norhwind' — a word.");
  });
  it("compactNumber", () => {
    expect(compactNumber(950)).toBe("950");
    expect(compactNumber(4812)).toBe("4.8K");
    expect(compactNumber(15400)).toBe("15K");
    expect(compactNumber(1_400_000)).toBe("1.4M");
    expect(compactNumber(2000)).toBe("2K");
  });
});
