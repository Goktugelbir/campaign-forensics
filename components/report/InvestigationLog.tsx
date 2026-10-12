import type { CaseBundle } from "@/lib/types";

/** "HH:MM UTC" from an ISO time. */
function clock(iso: string): string {
  return iso ? `${iso.slice(11, 16)} UTC` : "—";
}

function shortModel(model: string): string {
  return model.replace(/^fal-ai\//, "");
}

/**
 * How the engine actually ran, rebuilt from data/cases/<slug>/raw: Apify actors with their run
 * IDs and limits, the diagnosis, and every fal.ai generation with its time and duration.
 */
export function InvestigationLog({ bundle }: { bundle: CaseBundle }) {
  const log = bundle.log;
  if (!log) return null;
  const d = bundle.diagnosis;
  const genSeconds = log.production.reduce((s, p) => s + p.seconds, 0);
  const ledgerLinks = bundle.forensics?.hypotheses.reduce(
    (n, h) => n + h.support_evidence_ids.length + h.counter_evidence_ids.length + h.context_evidence_ids.length,
    0,
  );

  return (
    <section aria-labelledby="run-log">
      <p className="label-amber">Investigation log</p>
      <h2 id="run-log" className="heading-serif mt-3 text-3xl">
        How this investigation ran.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed">
        The investigation ran in three steps, each leaving files behind. This log is rebuilt from those files — actor runs,
        request logs and timestamps — not written after the fact.
        {log.spend && <> Data collection cost about {log.spend.replace(/^~/, "")}.</>}
      </p>

      <ol className="mt-6 space-y-4">
        <li className="card p-5">
          <Step n="01" title="Evidence" tool="Apify via MCP" />
          <ul className="mt-4 divide-y divide-ink-line">
            {log.collection.map((c) => (
              <li key={c.actor + c.runs.join()} className="grid gap-1 py-2.5 text-sm sm:grid-cols-[14rem_1fr]">
                <span className={`font-mono text-xs ${c.empty ? "text-fg-muted line-through" : "text-fg"}`}>{c.actor}</span>
                <span className="text-xs leading-relaxed">
                  {c.input}
                  <span className="block font-mono text-[10px] uppercase tracking-label text-fg-muted">
                    {c.runs.length === 1 ? "Run" : "Runs"} {c.runs.join(" · ")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-fg-muted">
            Normalised to {bundle.evidence?.evidence.length ?? 0} evidence items; usernames and profile data removed before saving.
          </p>
        </li>

        {d && (
          <li className="card p-5">
            <Step n="02" title="Diagnosis" tool="Manus" />
            <p className="mt-3 text-sm leading-relaxed">
              Six hypotheses tested against the evidence ·{" "}
              {d.hypotheses.filter((h) => h.status === "confirmed").length} confirmed,{" "}
              {d.hypotheses.filter((h) => h.status === "uncertain").length} uncertain,{" "}
              {d.hypotheses.filter((h) => h.status === "rejected").length} rejected · generic check{" "}
              {d.generic_check.passed ? "passed" : "not passed"}
              {ledgerLinks ? ` · ${ledgerLinks} evidence links in the ledger` : ""}.
            </p>
          </li>
        )}

        {log.production.length > 0 && (
          <li className="card p-5">
            <Step n="03" title="Relaunch" tool="fal.ai" />
            <p className="mt-3 text-sm">
              {log.production.length} generations between {clock(log.production[0].created_at)} and{" "}
              {clock(log.production[log.production.length - 1].created_at)} · {Math.round(genSeconds / 60)} min of model time.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-xs">
                <thead>
                  <tr className="border-b border-ink-line">
                    <th scope="col" className="label py-2 pr-4 font-normal">Time</th>
                    <th scope="col" className="label py-2 pr-4 font-normal">Model</th>
                    <th scope="col" className="label py-2 pr-4 font-normal">Output</th>
                    <th scope="col" className="label py-2 text-right font-normal">Seconds</th>
                  </tr>
                </thead>
                <tbody>
                  {log.production.map((p) => (
                    <tr key={p.name} className="border-b border-ink-line last:border-0">
                      <td className="py-2 pr-4 font-mono text-fg-muted">{clock(p.created_at)}</td>
                      <td className="py-2 pr-4 font-mono">{shortModel(p.model)}</td>
                      <td className="py-2 pr-4">
                        <span className="text-fg">{p.output.split("/").pop()}</span>
                        {p.used && (
                          <span className="ml-2 rounded-full border border-amber/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-label text-amber">
                            In report
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-right font-mono tabular-nums">{p.seconds}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-fg-muted">Clips, voice-over and music are cut into the final video with ffmpeg.</p>
          </li>
        )}
      </ol>
    </section>
  );
}

function Step({ n, title, tool }: { n: string; title: string; tool: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <p className="flex items-baseline gap-3">
        <span className="font-mono text-sm text-amber">{n}</span>
        <span className="heading-serif text-2xl">{title}</span>
      </p>
      <span className="font-mono text-[10px] uppercase tracking-label text-fg-muted">{tool}</span>
    </div>
  );
}
