import type { Evidence, EvidenceSource, Sentiment } from "./types";

export interface EvidenceFilters {
  source: EvidenceSource | "all";
  sentiment: Sentiment | "all";
  tag: string | "all";
  query: string;
}

export const EMPTY_FILTERS: EvidenceFilters = { source: "all", sentiment: "all", tag: "all", query: "" };

export function isFiltered(f: EvidenceFilters): boolean {
  return f.source !== "all" || f.sentiment !== "all" || f.tag !== "all" || f.query.trim() !== "";
}

/** Case-insensitive search over text (and its translation), id and tags; all active filters must match. */
export function filterEvidence(list: Evidence[], f: EvidenceFilters): Evidence[] {
  const q = f.query.trim().toLowerCase();
  return list.filter((e) => {
    if (f.source !== "all" && e.source !== f.source) return false;
    if (f.sentiment !== "all" && e.sentiment !== f.sentiment) return false;
    if (f.tag !== "all" && !(e.tags ?? []).includes(f.tag)) return false;
    if (q) {
      const hay = `${e.id} ${e.text} ${e.text_en ?? ""} ${(e.tags ?? []).join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Tags sorted by frequency (desc), then alphabetically. */
export function collectTags(list: Evidence[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of list) for (const t of e.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Counts per source computed from the evidence itself (sorted desc). */
export function countBySource(list: Evidence[]): { source: EvidenceSource; count: number }[] {
  const counts = new Map<EvidenceSource, number>();
  for (const e of list) counts.set(e.source, (counts.get(e.source) ?? 0) + 1);
  return [...counts.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count || a.source.localeCompare(b.source));
}

export function countBySentiment(list: Evidence[]): Record<Sentiment | "unlabeled", number> {
  const out = { negative: 0, neutral: 0, positive: 0, unlabeled: 0 };
  for (const e of list) out[e.sentiment ?? "unlabeled"] += 1;
  return out;
}

/** Sources present in the list, in a stable display order. */
export function presentSources(list: Evidence[]): EvidenceSource[] {
  return countBySource(list).map((s) => s.source);
}

const HANDLE = /(^|[\s(])@[A-Za-z0-9_.]{2,}/;
const PROFILE_URL = /(instagram\.com|x\.com|twitter\.com|threads\.net|tiktok\.com)\/@?[A-Za-z0-9_.]+\/?$/i;

/**
 * Privacy guard (CAMPAIGN_FORENSICS.md §0.4): evidence text must not carry @handles
 * and the link must point at a post/article, not a profile.
 */
export function privacyIssues(e: Evidence): string[] {
  const issues: string[] = [];
  if (HANDLE.test(e.text)) issues.push("text contains an @handle");
  if (PROFILE_URL.test(e.url)) issues.push("url looks like a profile link");
  return issues;
}

export const EVIDENCE_ID = /^ev_\d{3,}$/;
