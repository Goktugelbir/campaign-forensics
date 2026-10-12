import { SOURCE_LABEL } from "@/lib/format";
import type { Evidence, EvidenceSource } from "@/lib/types";
import { countBySentiment, countBySource } from "@/lib/evidence";
import { negativeShare } from "@/lib/scoring";
import { BacklashMeter } from "../BacklashMeter";
import { SourceIcon } from "../SourceIcon";

/** Single-series horizontal bars: one neutral hue, value labelled on every bar. */
export function SourceDistribution({ evidence }: { evidence: Evidence[] }) {
  const rows = countBySource(evidence);
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <figure className="card p-5">
      <figcaption className="label">Sources · {rows.length} types</figcaption>
      <ul className="mt-4 space-y-2.5">
        {rows.map((r) => (
          <li key={r.source} className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3" title={`${SOURCE_LABEL[r.source as EvidenceSource]}: ${r.count}`}>
            <span className="inline-flex items-center gap-1.5 text-xs text-fg-body">
              <SourceIcon source={r.source} />
              {SOURCE_LABEL[r.source] ?? r.source}
            </span>
            <span className="h-2 rounded-r-[4px] bg-fg-muted" style={{ width: `${(r.count / max) * 100}%` }} />
            <span className="text-right font-mono text-xs tabular-nums text-fg">{r.count}</span>
          </li>
        ))}
      </ul>
      <LanguageSplit evidence={evidence} />
    </figure>
  );
}

const SENTIMENTS = [
  { key: "negative", label: "Negative", color: "bg-status-rejected" },
  { key: "neutral", label: "Neutral", color: "bg-status-uncertain" },
  { key: "positive", label: "Positive", color: "bg-status-confirmed" },
] as const;

/** Part-to-whole: one stacked bar with a 2px gap between segments plus a labelled legend. */
export function SentimentDistribution({ evidence }: { evidence: Evidence[] }) {
  const counts = countBySentiment(evidence);
  const total = Math.max(1, evidence.length);
  return (
    <figure className="card p-5">
      <figcaption className="label">Sentiment · {evidence.length} items</figcaption>
      <div className="mt-5 flex h-2.5 gap-[2px] overflow-hidden rounded-[4px]" aria-hidden>
        {SENTIMENTS.filter((s) => counts[s.key] > 0).map((s) => (
          <span key={s.key} className={s.color} style={{ width: `${(counts[s.key] / total) * 100}%` }} title={`${s.label}: ${counts[s.key]}`} />
        ))}
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-3">
        {SENTIMENTS.map((s) => (
          <div key={s.key}>
            <dt className="inline-flex items-center gap-1.5 text-xs text-fg-body">
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${s.color}`} />
              {s.label}
            </dt>
            <dd className="mt-1 font-mono text-lg tabular-nums text-fg">
              {counts[s.key]}
              <span className="ml-1.5 text-xs text-fg-muted">{Math.round((counts[s.key] / total) * 100)}%</span>
            </dd>
          </div>
        ))}
      </dl>
      {evidence.length > 0 && (
        <div className="mt-6 border-t border-ink-line pt-5">
          <BacklashMeter share={negativeShare(evidence)!} />
        </div>
      )}
    </figure>
  );
}

const LANG_NAME: Record<Evidence["lang"], string> = { en: "English", tr: "Turkish", other: "Other" };

/** Items and negative share per language — shows whether reaction differs by market. */
function LanguageSplit({ evidence }: { evidence: Evidence[] }) {
  const groups = (Object.keys(LANG_NAME) as Evidence["lang"][])
    .map((lang) => {
      const items = evidence.filter((e) => e.lang === lang);
      return { lang, n: items.length, neg: negativeShare(items) ?? 0 };
    })
    .filter((g) => g.n > 0);
  if (groups.length < 2) return null;
  return (
    <div className="mt-5 border-t border-ink-line pt-4">
      <p className="label">By language</p>
      <ul className="mt-3 space-y-1.5">
        {groups.map((g) => (
          <li key={g.lang} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3 text-xs">
            <span className="text-fg-body">{LANG_NAME[g.lang]}</span>
            <span className="font-mono tabular-nums text-fg">{g.n} items</span>
            <span className="font-mono tabular-nums text-fg-muted">{g.neg}% negative</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
