import { formatDateLabel, formatDateLong } from "@/lib/format";
import type { CaseBundle } from "@/lib/types";

const LANG: Record<string, string> = { en: "English", tr: "Turkish", other: "other" };

/** What this investigation can and cannot say — derived from the case files, nothing stored separately. */
export function investigationContract(bundle: CaseBundle) {
  const evidence = bundle.evidence?.evidence ?? [];
  const dated = evidence.map((e) => e.date).filter((d): d is string => !!d).sort();
  const langs: Record<string, number> = {};
  for (const e of evidence) langs[e.lang] = (langs[e.lang] ?? 0) + 1;
  const sources = new Set(evidence.map((e) => e.source)).size;

  return [
    { label: "Data", value: "Public sources only" },
    { label: "Ad account", value: "Not connected" },
    {
      label: "Evidence window",
      value: dated.length
        ? `${formatDateLabel(dated[0])} – ${formatDateLabel(dated[dated.length - 1])}${dated.length < evidence.length ? ` · ${evidence.length - dated.length} undated` : ""}`
        : "—",
    },
    { label: "Collected", value: bundle.evidence?.collected_at ? formatDateLong(bundle.evidence.collected_at) : "In progress" },
    {
      label: "Sample",
      value: evidence.length
        ? `${evidence.length} items · ${sources} source types · ${Object.entries(langs)
            .sort((a, b) => b[1] - a[1])
            .map(([l, n]) => `${n} ${LANG[l] ?? l}`)
            .join(", ")}`
        : "—",
    },
    { label: "Causal status", value: "Descriptive, not causal" },
    { label: "Confidence", value: "Analyst judgement, not calibrated" },
  ];
}

export function InvestigationContract({ bundle }: { bundle: CaseBundle }) {
  const rows = investigationContract(bundle);
  return (
    <section className="card p-6" aria-labelledby="contract">
      <p id="contract" className="label-amber">
        Investigation contract
      </p>
      <dl className="mt-4 divide-y divide-ink-line">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[7.5rem_1fr] gap-3 py-2.5 first:pt-0 last:pb-0">
            <dt className="font-mono text-[10px] uppercase tracking-label text-fg-muted">{r.label}</dt>
            <dd className="text-sm text-fg">{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-fg-muted">
        What people said in public, not what they bought. No reach, conversion or sales figures are used or implied.
      </p>
    </section>
  );
}
