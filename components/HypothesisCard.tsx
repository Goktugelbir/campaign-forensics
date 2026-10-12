import { clampConfidence } from "@/lib/format";
import type { Hypothesis } from "@/lib/types";
import { HypothesisStatusBadge } from "./Badges";
import { LevelIndicator } from "./LevelIndicator";
import { EvidenceIdList } from "./report/ReportNav";

const TONE: Record<Hypothesis["status"], string> = {
  confirmed: "bg-amber",
  uncertain: "bg-status-uncertain",
  rejected: "bg-fg-muted",
};

export function ConfidenceBar({ value, status }: { value: number; status: Hypothesis["status"] }) {
  const v = clampConfidence(value);
  return (
    <div className="flex items-center gap-3">
      {/* Relevancy style: how strongly the evidence supports this hypothesis. */}
      <LevelIndicator
        className="flex-1"
        style="relevancy"
        value={v}
        label="Confidence"
        valueText={`${v} out of 100`}
        tone={TONE[status]}
      />
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
