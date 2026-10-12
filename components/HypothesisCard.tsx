import { clampConfidence } from "@/lib/format";
import type { Hypothesis, HypothesisForensics } from "@/lib/types";
import { HypothesisStatusBadge } from "./Badges";
import { LevelIndicator } from "./LevelIndicator";
import { EvidenceIdList } from "./report/ReportNav";

const TONE: Record<Hypothesis["status"], string> = {
  confirmed: "bg-amber",
  uncertain: "bg-status-uncertain",
  rejected: "bg-fg-muted",
};

const UNCERTAINTY_LABEL: Record<NonNullable<HypothesisForensics["uncertainty"]>, string> = {
  insufficient_evidence: "Not enough evidence",
  conflicting_evidence: "Evidence points both ways",
};

export function ConfidenceBar({ value, status }: { value: number; status: Hypothesis["status"] }) {
  const v = clampConfidence(value);
  return (
    <div>
      <div className="flex items-center gap-3">
        {/* Relevancy style: how strongly the evidence supports this hypothesis. */}
        <LevelIndicator
          className="flex-1"
          style="relevancy"
          value={v}
          label="Confidence"
          valueText={`${v} out of 100, analyst judgement, not calibrated`}
          tone={TONE[status]}
        />
        <span className="w-8 text-right font-mono text-xs tabular-nums text-fg">{v}</span>
      </div>
      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-label text-fg-muted" title="An analyst's judgement of the evidence, not a statistical probability.">
        Confidence · not calibrated
      </p>
    </div>
  );
}

export function HypothesisCard({
  h,
  slug,
  hideReasoning,
  ledger,
}: {
  h: Hypothesis;
  slug?: string;
  hideReasoning?: boolean;
  /** Support / counter / missing data from forensics.json, when present. */
  ledger?: HypothesisForensics;
}) {
  const rejected = h.status === "rejected";
  return (
    <article
      data-status={h.status}
      className={`card flex flex-col gap-4 p-5 transition-colors hover:border-ink-strong ${rejected ? "opacity-70" : ""}`}
    >
      <header className="flex items-start justify-between gap-3">
        <h3 className={`font-mono text-[11px] uppercase tracking-label text-fg-body ${rejected ? "line-through" : ""}`}>
          {h.id} · {h.name}
        </h3>
        <HypothesisStatusBadge status={h.status} />
      </header>
      <ConfidenceBar value={h.confidence} status={h.status} />
      {ledger?.uncertainty && h.status === "uncertain" && (
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-ink-strong px-2.5 py-1 font-mono text-[10px] uppercase tracking-label text-fg-body">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-status-uncertain" />
          {UNCERTAINTY_LABEL[ledger.uncertainty]}
        </p>
      )}
      {!hideReasoning && <p className="text-sm leading-relaxed">{h.reasoning}</p>}

      {ledger ? (
        <Ledger ledger={ledger} slug={slug} rejected={rejected} />
      ) : (
        <div className="mt-auto">
          <EvidenceIdList ids={h.evidence_ids} slug={slug} />
        </div>
      )}
    </article>
  );
}

function Ledger({ ledger: l, slug, rejected }: { ledger: HypothesisForensics; slug?: string; rejected: boolean }) {
  return (
    <div className="mt-auto space-y-3 border-t border-ink-line pt-4">
      {rejected && l.rejection_reason && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-label text-status-rejected">Why rejected</p>
          <p className="mt-1 text-xs leading-relaxed text-fg-body">{l.rejection_reason}</p>
        </div>
      )}
      <LedgerRow label="Supports" tone="text-status-confirmed" ids={l.support_evidence_ids} slug={slug} empty="None found" />
      <LedgerRow label="Against" tone="text-status-rejected" ids={l.counter_evidence_ids} slug={slug} empty="None found" />
      {l.context_evidence_ids.length > 0 && <LedgerRow label="Context" tone="text-fg-muted" ids={l.context_evidence_ids} slug={slug} />}
      {l.missing_data.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-label text-fg-muted">Missing data</p>
          <ul className="mt-1 space-y-1">
            {l.missing_data.map((m) => (
              <li key={m} className="text-xs leading-relaxed text-fg-body">
                — {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function LedgerRow({ label, tone, ids, slug, empty }: { label: string; tone: string; ids: string[]; slug?: string; empty?: string }) {
  return (
    <div className="grid grid-cols-[5.75rem_1fr] items-start gap-2">
      <p className={`pt-0.5 font-mono text-[10px] uppercase tracking-label ${tone}`}>
        {label} <span className="text-fg-muted">{ids.length}</span>
      </p>
      {ids.length ? <EvidenceIdList ids={ids} slug={slug} /> : <p className="text-xs text-fg-muted">{empty}</p>}
    </div>
  );
}
