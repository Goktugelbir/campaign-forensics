import {
  collectTags,
  countBySentiment,
  countBySource,
  EMPTY_FILTERS,
  filterEvidence,
  isFiltered,
  privacyIssues,
} from "@/lib/evidence";
import { ev } from "./fixtures";

const list = [
  ev({ id: "ev_001", source: "news", sentiment: "neutral", tags: ["launch"], text: "Company unveils logo" }),
  ev({ id: "ev_002", source: "reddit", sentiment: "negative", tags: ["readability", "app-icon"], text: "Reads Norhwind" }),
  ev({ id: "ev_003", source: "reddit", sentiment: "positive", tags: ["readability"], text: "Looks sharp" }),
  ev({ id: "ev_004", source: "youtube", tags: [], text: "No sentiment" }),
];

describe("filterEvidence", () => {
  it("returns everything with empty filters", () => {
    expect(filterEvidence(list, EMPTY_FILTERS)).toHaveLength(4);
    expect(isFiltered(EMPTY_FILTERS)).toBe(false);
  });
  it("combines source, sentiment and tag filters", () => {
    const r = filterEvidence(list, { ...EMPTY_FILTERS, source: "reddit", tag: "readability", sentiment: "negative" });
    expect(r.map((e) => e.id)).toEqual(["ev_002"]);
  });
  it("searches text, id and tags case-insensitively", () => {
    expect(filterEvidence(list, { ...EMPTY_FILTERS, query: "NORHWIND" }).map((e) => e.id)).toEqual(["ev_002"]);
    expect(filterEvidence(list, { ...EMPTY_FILTERS, query: "ev_004" }).map((e) => e.id)).toEqual(["ev_004"]);
    expect(filterEvidence(list, { ...EMPTY_FILTERS, query: "app-icon" }).map((e) => e.id)).toEqual(["ev_002"]);
    expect(filterEvidence(list, { ...EMPTY_FILTERS, query: "   " })).toHaveLength(4);
  });
  it("treats whitespace-only query as not filtered", () => {
    expect(isFiltered({ ...EMPTY_FILTERS, query: "  " })).toBe(false);
    expect(isFiltered({ ...EMPTY_FILTERS, tag: "x" })).toBe(true);
  });
});

describe("aggregations", () => {
  it("collectTags sorts by count then name", () => {
    expect(collectTags(list)).toEqual([
      { tag: "readability", count: 2 },
      { tag: "app-icon", count: 1 },
      { tag: "launch", count: 1 },
    ]);
  });
  it("countBySource sorts by count desc", () => {
    expect(countBySource(list)[0]).toEqual({ source: "reddit", count: 2 });
    expect(countBySource(list).reduce((s, r) => s + r.count, 0)).toBe(4);
  });
  it("countBySentiment tracks unlabeled items", () => {
    expect(countBySentiment(list)).toEqual({ negative: 1, neutral: 1, positive: 1, unlabeled: 1 });
  });
});

describe("privacyIssues", () => {
  it("flags @handles in text", () => {
    expect(privacyIssues(ev({ id: "ev_1", text: "agree with @john_doe here" }))).toContain("text contains an @handle");
  });
  it("does not flag e-mail-like or plain text", () => {
    expect(privacyIssues(ev({ id: "ev_1", text: "meet at 5pm, great logo" }))).toEqual([]);
  });
  it("flags profile URLs but not post URLs", () => {
    expect(privacyIssues(ev({ id: "ev_1", url: "https://www.instagram.com/someone/" }))).toContain("url looks like a profile link");
    expect(privacyIssues(ev({ id: "ev_1", url: "https://x.com/@someone" }))).toContain("url looks like a profile link");
    expect(privacyIssues(ev({ id: "ev_1", url: "https://www.instagram.com/p/ABC123/" }))).toEqual([]);
    expect(privacyIssues(ev({ id: "ev_1", url: "https://x.com/someone/status/1" }))).toEqual([]);
  });
});
