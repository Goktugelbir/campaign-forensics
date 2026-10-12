import { clampConfidence } from "@/lib/format";
import type { Hypothesis } from "@/lib/types";
import { HypothesisStatusBadge } from "./Badges";
import { EvidenceIdList } from "./report/ReportNav";

const BAR: Record<Hypothesis["status"], string> = {
  confirmed: "bg-amber",
  uncertain: "bg-status-uncertain",
  rejected: "bg-fg-muted",
};

export function ConfidenceBar({ value, status }: { value: number; status: Hypothesis["status"] }) {
  const v = clampConfidence(value);
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-1 flex-1 overflow-hidden rounded-full bg-ink-strong"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v}
        aria-label="Confidence"
      >
        <div className={`h-full rounded-full ${BAR[status]}`} style={{ width: `${v}%` }} />
      </div>
      <span className="w-8 text-right font-mono text-xs tabular-nums text-fg">{v}</span>
    </div>
  );
}

export function HypothesisCard({ h, slug, hideReasoning }: { h: Hypothesis; slug?: string; hideReasoning?: boolean }) {
  const rejected = h.status === "rejected";
  return (
    <article
      data-status={h.status}
      className={`card flex flex-col gap-4 p-5 transition-colors hover:border-ink-strong ${rejected ? "opacity-60" : ""}`}
    >
      <header className="flex items-start justify-between gap-3">
        <h3 className={`font-mono text-[11px] uppercase tracking-label text-fg-body ${rejected ? "line-through" : ""}`}>
          {h.id} · {h.name}
        </h3>
        <HypothesisStatusBadge status={h.status} />
      </header>
      <ConfidenceBar value={h.confidence} status={h.status} />
      {!hideReasoning && <p className="text-sm leading-relaxed">{h.reasoning}</p>}
      <div className="mt-auto">
        <EvidenceIdList ids={h.evidence_ids} slug={slug} />
      </div>
    </article>
  );
}
