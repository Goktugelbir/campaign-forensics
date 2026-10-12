import type { Evidence } from "./types";

/**
 * Backlash = share of the collected evidence tagged negative, 0–100.
 * It describes our sample, not the whole internet, and is labelled that way wherever it appears.
 * Thresholds: from 30% the reaction is clearly skewed negative, from 50% negative is the majority.
 */
export const BACKLASH_THRESHOLDS = { warning: 30, critical: 50 } as const;

export const BACKLASH_LEVEL_LABEL = { normal: "Low", warning: "Elevated", critical: "High" } as const;

/** Rounded percentage of negative items, or null when there is no evidence yet. */
export function negativeShare(evidence: Evidence[] | null | undefined): number | null {
  if (!evidence?.length) return null;
  const negative = evidence.filter((e) => e.sentiment === "negative").length;
  return Math.round((negative / evidence.length) * 100);
}
