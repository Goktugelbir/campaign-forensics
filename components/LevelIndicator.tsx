// A level indicator in the spirit of AppKit's NSLevelIndicator (SwiftUI: Gauge).
// Pick the style that matches the meaning:
//   "discreteCapacity" / "continuousCapacity" — a bounded level (e.g. share of negative evidence)
//   "relevancy"                               — match strength (e.g. how well evidence supports a hypothesis)
// warningValue / criticalValue colour the fill like NSLevelIndicator: when critical > warning,
// higher is worse; when critical < warning, lower is worse.

export type LevelStyle = "discreteCapacity" | "continuousCapacity" | "relevancy";
export type LevelState = "normal" | "warning" | "critical";

interface Props {
  value: number;
  min?: number;
  max?: number;
  style: LevelStyle;
  /** Accessible name, e.g. "Backlash". */
  label: string;
  /** Spoken value, e.g. "42% of evidence is negative". Defaults to the number. */
  valueText?: string;
  warningValue?: number;
  criticalValue?: number;
  /** Segments for discreteCapacity, bars for relevancy. */
  segments?: number;
  /** Fill colour when no threshold applies (Tailwind bg-* class). */
  tone?: string;
  className?: string;
}

const STATE_FILL: Record<LevelState, string> = {
  normal: "bg-status-confirmed",
  warning: "bg-amber",
  critical: "bg-status-rejected",
};

export function levelState(value: number, warningValue?: number, criticalValue?: number): LevelState {
  if (warningValue === undefined && criticalValue === undefined) return "normal";
  const higherIsWorse = (criticalValue ?? Infinity) >= (warningValue ?? -Infinity);
  const past = (t: number | undefined) => t !== undefined && (higherIsWorse ? value >= t : value <= t);
  if (past(criticalValue)) return "critical";
  if (past(warningValue)) return "warning";
  return "normal";
}

export function LevelIndicator({
  value,
  min = 0,
  max = 100,
  style,
  label,
  valueText,
  warningValue,
  criticalValue,
  segments,
  tone,
  className = "",
}: Props) {
  const v = Math.max(min, Math.min(max, value));
  const fraction = max === min ? 0 : (v - min) / (max - min);
  const hasThresholds = warningValue !== undefined || criticalValue !== undefined;
  const state = levelState(v, warningValue, criticalValue);
  const fill = hasThresholds ? STATE_FILL[state] : (tone ?? "bg-amber");

  const meter = {
    role: "meter",
    "aria-label": label,
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-valuenow": Math.round(v),
    "aria-valuetext": valueText,
    "data-state": hasThresholds ? state : undefined,
  } as const;

  if (style === "continuousCapacity") {
    return (
      <div {...meter} className={`h-2 overflow-hidden rounded-full bg-ink-strong ${className}`}>
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${fraction * 100}%` }} />
      </div>
    );
  }

  if (style === "discreteCapacity") {
    const n = segments ?? 10;
    // Like AppKit, a partially reached segment counts as filled.
    const filled = Math.ceil(fraction * n - 1e-9);
    return (
      <div {...meter} className={`flex gap-[3px] ${className}`}>
        {Array.from({ length: n }, (_, i) => (
          <span key={i} className={`h-2.5 flex-1 rounded-[2px] ${i < filled ? fill : "bg-ink-strong"}`} />
        ))}
      </div>
    );
  }

  // relevancy: thin vertical ticks, filled left to right.
  const n = segments ?? 40;
  const filled = Math.round(fraction * n);
  return (
    <div {...meter} className={`flex h-3 items-stretch gap-[2px] ${className}`}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={`flex-1 rounded-[1px] ${i < filled ? fill : "bg-ink-strong"}`} />
      ))}
    </div>
  );
}
