import { BACKLASH_LEVEL_LABEL, BACKLASH_THRESHOLDS } from "@/lib/scoring";
import { LevelIndicator, levelState } from "./LevelIndicator";

/** The campaign's reaction score: share of negative evidence as a discrete capacity level with thresholds. */
export function BacklashMeter({ share, compact = false }: { share: number; compact?: boolean }) {
  const state = levelState(share, BACKLASH_THRESHOLDS.warning, BACKLASH_THRESHOLDS.critical);
  const level = BACKLASH_LEVEL_LABEL[state];
  const color = state === "critical" ? "text-status-rejected" : state === "warning" ? "text-amber" : "text-status-confirmed";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="label">Backlash</span>
        <span className="font-mono text-[11px] uppercase tracking-label">
          <span className={color}>{level}</span>
          <span className="ml-2 tabular-nums text-fg">{share}%</span>
        </span>
      </div>
      <LevelIndicator
        className="mt-2"
        style="discreteCapacity"
        segments={compact ? 10 : 20}
        value={share}
        label="Backlash"
        valueText={`${share}% of collected evidence is negative — ${level.toLowerCase()}`}
        warningValue={BACKLASH_THRESHOLDS.warning}
        criticalValue={BACKLASH_THRESHOLDS.critical}
      />
      {!compact && (
        <p className="mt-3 text-xs leading-relaxed text-fg-muted">
          Share of the collected evidence that is negative. Elevated from {BACKLASH_THRESHOLDS.warning}%, high from{" "}
          {BACKLASH_THRESHOLDS.critical}%. Describes this sample, not all reactions.
        </p>
      )}
    </div>
  );
}
