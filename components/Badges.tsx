import { CAMPAIGN_TYPE_LABEL, STATUS_LABEL } from "@/lib/format";
import type { CampaignType, CaseStatus, HypothesisStatus } from "@/lib/types";

const base = "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-label whitespace-nowrap";

/** Fictional demo data. Never rendered for a real case. */
export function MockBadge() {
  return (
    <span className={`${base} border-amber/60 bg-amber/10 text-amber`} title="Fictional sample data — not a real brand or real evidence">
      Mock data
    </span>
  );
}

const STATUS_STYLE: Record<CaseStatus, string> = {
  draft: "border-ink-strong text-fg-muted",
  collecting: "border-sky-500/40 text-sky-300",
  diagnosing: "border-violet-400/40 text-violet-300",
  producing: "border-amber/50 text-amber",
  done: "border-status-confirmed/50 text-status-confirmed",
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span className={`${base} ${STATUS_STYLE[status]}`}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function TypeBadge({ type }: { type: CampaignType }) {
  return <span className={`${base} border-ink-strong text-fg-body`}>{CAMPAIGN_TYPE_LABEL[type]}</span>;
}

const HYPOTHESIS_STYLE: Record<HypothesisStatus, string> = {
  confirmed: "border-status-confirmed/50 text-status-confirmed",
  uncertain: "border-ink-strong text-status-uncertain",
  rejected: "border-status-rejected/50 text-status-rejected",
};

export function HypothesisStatusBadge({ status }: { status: HypothesisStatus }) {
  return <span className={`${base} ${HYPOTHESIS_STYLE[status]}`}>{status}</span>;
}

export function GenericCheckBadge({ passed }: { passed: boolean }) {
  return (
    <span className={`${base} ${passed ? "border-status-confirmed/50 text-status-confirmed" : "border-status-rejected/50 text-status-rejected"}`}>
      Generic test · {passed ? "Passed" : "Failed"}
    </span>
  );
}
