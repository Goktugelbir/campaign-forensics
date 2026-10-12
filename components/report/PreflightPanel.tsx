import { CircleAlert, CircleCheck, CircleX, UserCheck, UserX } from "lucide-react";
import { formatDateLong } from "@/lib/format";
import type { CaseBundle, PreflightCheck } from "@/lib/types";

const ICON: Record<PreflightCheck["status"], { icon: typeof CircleCheck; cls: string; label: string }> = {
  pass: { icon: CircleCheck, cls: "text-status-confirmed", label: "Passed" },
  warn: { icon: CircleAlert, cls: "text-amber", label: "Warning" },
  fail: { icon: CircleX, cls: "text-status-rejected", label: "Failed" },
};

/**
 * Quality gate before anything is used: the automated preflight (npm run validate:case) and a
 * separate human sign-off (approval.json, written by a person). Nothing here is assumed —
 * a missing file shows as pending.
 */
export function PreflightPanel({ bundle }: { bundle: CaseBundle }) {
  const p = bundle.preflight;
  const a = bundle.approval;
  const assets = [...new Set((p?.checks ?? []).filter((c) => c.asset).map((c) => c.asset!))];
  const caseChecks = (p?.checks ?? []).filter((c) => !c.asset);
  const approved = a?.decision === "approved" && p?.status === "passed";

  const steps = [
    { label: "Preflight", state: p ? (p.status === "passed" ? "done" : "failed") : "pending" },
    { label: "Human review", state: a ? (a.decision === "approved" ? "done" : "failed") : "pending" },
    { label: "Ready for an account test", state: approved ? "done" : "pending" },
  ] as const;

  return (
    <section aria-labelledby="quality-gate">
      <p className="label-amber">Quality gate</p>
      <h2 id="quality-gate" className="heading-serif mt-3 text-3xl md:text-4xl">
        Checked before it is used.
      </h2>

      <ol className="mt-6 flex flex-wrap items-center gap-2">
        {steps.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-label ${
                s.state === "done"
                  ? "border-status-confirmed/50 text-status-confirmed"
                  : s.state === "failed"
                    ? "border-status-rejected/50 text-status-rejected"
                    : "border-ink-strong text-fg-muted"
              }`}
            >
              {s.label} · {s.state === "done" ? "passed" : s.state === "failed" ? "not passed" : "pending"}
            </span>
            {i < steps.length - 1 && <span aria-hidden className="text-fg-muted">→</span>}
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="card p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="label">Automated preflight</p>
            {p && <p className="font-mono text-[10px] uppercase tracking-label text-fg-muted">Checked {formatDateLong(p.checked_at)}</p>}
          </div>
          {p ? (
            <div className="mt-4 space-y-5">
              {assets.map((asset) => (
                <div key={asset}>
                  <p className="font-mono text-xs text-fg">{asset.split("/").pop()}</p>
                  <ul className="mt-2 space-y-1.5">
                    {p.checks
                      .filter((c) => c.asset === asset)
                      .map((c) => (
                        <CheckRow key={c.id} c={c} />
                      ))}
                  </ul>
                </div>
              ))}
              {caseChecks.length > 0 && (
                <ul className="space-y-1.5 border-t border-ink-line pt-4">
                  {caseChecks.map((c) => (
                    <CheckRow key={c.id} c={c} />
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm">
              Not run yet. <code className="font-mono text-xs text-fg">npm run validate:case</code> checks every asset and writes the result here.
            </p>
          )}
        </div>

        <div className="card p-6">
          <p className="label">Human review</p>
          {a ? (
            <div className="mt-4 flex gap-3">
              {a.decision === "approved" ? (
                <UserCheck className="h-5 w-5 shrink-0 text-status-confirmed" aria-hidden />
              ) : (
                <UserX className="h-5 w-5 shrink-0 text-status-rejected" aria-hidden />
              )}
              <div>
                <p className="text-sm text-fg">
                  {a.decision === "approved" ? "Approved" : "Changes requested"} by {a.reviewer}
                </p>
                <p className="mt-1 text-xs text-fg-muted">{formatDateLong(a.reviewed_at)}</p>
                {a.notes && <p className="mt-3 text-sm leading-relaxed">{a.notes}</p>}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-relaxed">
              Not recorded yet. A person checks message fidelity, brand and IP safety, and the AI label, then signs off in{" "}
              <code className="font-mono text-xs text-fg">approval.json</code>. Until then the creative is a concept, not ready to run.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function CheckRow({ c }: { c: PreflightCheck }) {
  const { icon: Icon, cls, label } = ICON[c.status];
  return (
    <li className="grid grid-cols-[1rem_8.5rem_1fr] items-start gap-2 text-xs">
      <Icon className={`mt-0.5 h-3.5 w-3.5 ${cls}`} aria-label={label} />
      <span className="text-fg">{c.label}</span>
      <span className="leading-relaxed">{c.detail}</span>
    </li>
  );
}
