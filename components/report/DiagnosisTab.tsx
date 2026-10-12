"use client";

import { countByStatus, sortHypotheses } from "@/lib/format";
import type { CaseBundle } from "@/lib/types";
import { GenericCheckBadge } from "../Badges";
import { HypothesisCard } from "../HypothesisCard";
import { InProgress } from "./InProgress";
import { EvidenceIdList } from "./ReportNav";

export function DiagnosisTab({ bundle }: { bundle: CaseBundle }) {
  const d = bundle.diagnosis;
  if (!d) return <InProgress step="Diagnosis" />;

  const counts = countByStatus(d.hypotheses);
  const sorted = sortHypotheses(d.hypotheses);
  const f = bundle.forensics;
  const ledger = (id: string) => f?.hypotheses.find((h) => h.id === id);
  const claim = f?.claims.find((c) => c.id === "main_cause");

  return (
    <div className="space-y-14">
      {/* Exhibit A */}
      <section
        aria-labelledby="exhibit-a"
        className="relative overflow-hidden rounded-card border border-amber/40 bg-gradient-to-br from-amber/[0.07] via-ink-surface to-ink-surface p-6 md:p-10"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p id="exhibit-a" className="label-amber">
            Exhibit A — Main cause
          </p>
          <span title={d.generic_check.note}>
            <GenericCheckBadge passed={d.generic_check.passed} />
          </span>
        </div>
        <p className="heading-serif mt-6 max-w-4xl text-3xl md:text-[44px]">{d.diagnosis.main_cause}</p>
        <p className="mt-6 max-w-3xl text-[15px] leading-relaxed">{d.diagnosis.explanation}</p>
        {claim ? (
          <div className="mt-8 grid gap-6 border-t border-amber/20 pt-6 md:grid-cols-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-label text-status-confirmed">
                Supported by <span className="text-fg-muted">{claim.support_evidence_ids.length}</span>
              </p>
              <div className="mt-2">
                <EvidenceIdList ids={claim.support_evidence_ids} />
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-label text-status-rejected">
                Weighs against <span className="text-fg-muted">{claim.counter_evidence_ids.length}</span>
              </p>
              <div className="mt-2">
                {claim.counter_evidence_ids.length ? <EvidenceIdList ids={claim.counter_evidence_ids} /> : <p className="text-xs text-fg-muted">None found</p>}
              </div>
            </div>
            {claim.uncertainty_reasons.length > 0 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-label text-fg-muted">Why it is not certain</p>
                <ul className="mt-2 space-y-1.5">
                  {claim.uncertainty_reasons.map((r) => (
                    <li key={r} className="text-xs leading-relaxed text-fg-body">
                      — {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6">
            <EvidenceIdList ids={d.diagnosis.evidence_ids} />
          </div>
        )}
      </section>

      {/* Tested hypotheses */}
      <section aria-labelledby="hypotheses">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="hypotheses" className="heading-serif text-3xl md:text-4xl">
            Tested hypotheses
          </h2>
          <p className="flex flex-wrap gap-4 font-mono text-[11px] uppercase tracking-label text-fg-body">
            <span><span className="text-status-confirmed">●</span> {counts.confirmed} confirmed</span>
            <span><span className="text-status-uncertain">●</span> {counts.uncertain} uncertain</span>
            <span><span className="text-status-rejected">●</span> {counts.rejected} rejected</span>
          </p>
        </div>
        {f && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-fg-muted">
            Each card lists the evidence for and against it, and what we could not check. A hypothesis is only rejected when the
            evidence points the other way — never just because nothing was found. Confidence is an analyst&apos;s judgement, not a
            calibrated probability.
          </p>
        )}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((h) => (
            <HypothesisCard key={h.id} h={h} ledger={ledger(h.id)} />
          ))}
        </div>
      </section>

      {/* Exhibit B + secondary causes */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card border-amber/50 p-6 md:p-8">
          <div className="flex items-center gap-3">
            <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-full border border-amber font-mono text-sm text-amber">
              !
            </span>
            <p className="label-amber">Exhibit B — Surprising finding</p>
          </div>
          <p className="mt-5 font-serif text-2xl leading-snug text-fg">{d.diagnosis.surprising_finding}</p>
          {d.diagnosis.surprising_evidence_ids && (
            <div className="mt-5">
              <EvidenceIdList ids={d.diagnosis.surprising_evidence_ids} />
            </div>
          )}
        </div>

        <div className="card p-6 md:p-8">
          <p className="label">Other contributing causes</p>
          <ol className="mt-5 divide-y divide-ink-line">
            {d.diagnosis.secondary_causes.map((c, i) => (
              <li key={c} className="flex gap-4 py-4 first:pt-0">
                <span className="font-mono text-sm text-amber">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm leading-relaxed text-fg">{c}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
