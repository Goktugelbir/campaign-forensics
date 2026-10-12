import type {
  CampaignType,
  CaseStatus,
  EvidenceSource,
  Hypothesis,
  HypothesisStatus,
} from "./types";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Parses "YYYY-MM-DD" or a full ISO datetime without timezone drift. */
function parts(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y, m, d };
}

/** "2026-08-14" → "14 AUG 2026" (mono labels). Returns "—" for null/invalid. */
export function formatDateLabel(iso: string | null | undefined): string {
  if (!iso) return "—";
  const p = parts(iso);
  if (!p) return "—";
  return `${p.d} ${MONTHS[p.m - 1]} ${p.y}`;
}

/** "2026-08-14" → "14 August 2026" (body copy). */
export function formatDateLong(iso: string | null | undefined): string {
  if (!iso) return "—";
  const p = parts(iso);
  if (!p) return "—";
  return `${p.d} ${MONTHS_LONG[p.m - 1]} ${p.y}`;
}

/** Truncates on a word boundary and appends "…". Never returns more than `max` chars. */
export function truncate(text: string, max: number): { text: string; truncated: boolean } {
  if (text.length <= max) return { text, truncated: false };
  const slice = text.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return { text: cut.trimEnd() + "…", truncated: true };
}

/** Stable display code for a case ("CF-0412"), derived from the slug when not set. */
export function caseCode(slug: string, explicit?: string): string {
  if (explicit) return explicit;
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `CF-${String(h % 10000).padStart(4, "0")}`;
}

export const CAMPAIGN_TYPE_LABEL: Record<CampaignType, string> = {
  ad: "Ad",
  rebrand: "Rebrand",
  launch: "Launch",
  other: "Other",
};

export const STATUS_LABEL: Record<CaseStatus, string> = {
  draft: "Draft",
  collecting: "Collecting",
  diagnosing: "Diagnosing",
  producing: "Producing",
  done: "Done",
};

export const STATUS_ORDER: CaseStatus[] = ["draft", "collecting", "diagnosing", "producing", "done"];

export const SOURCE_LABEL: Record<EvidenceSource, string> = {
  news: "News",
  instagram: "Instagram",
  youtube: "YouTube",
  reddit: "Reddit",
  x: "X",
  threads: "Threads",
  web: "Web",
  competitor: "Competitor",
};

const HYPOTHESIS_RANK: Record<HypothesisStatus, number> = { confirmed: 0, uncertain: 1, rejected: 2 };

/** Confirmed first, then uncertain, then rejected; higher confidence first within a group. */
export function sortHypotheses(list: Hypothesis[]): Hypothesis[] {
  return [...list].sort(
    (a, b) => HYPOTHESIS_RANK[a.status] - HYPOTHESIS_RANK[b.status] || b.confidence - a.confidence,
  );
}

export function countByStatus(list: Hypothesis[]): Record<HypothesisStatus, number> {
  const out: Record<HypothesisStatus, number> = { confirmed: 0, uncertain: 0, rejected: 0 };
  for (const h of list) out[h.status] += 1;
  return out;
}

/** Clamp a confidence score into 0–100 so a bad JSON value can't break the bar. */
export function clampConfidence(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** First sentence of a paragraph, for case cards. */
export function firstSentence(text: string): string {
  const m = /^(.+?[.!?])(\s|$)/.exec(text.trim());
  return m ? m[1] : text.trim();
}

export function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return String(n);
}
