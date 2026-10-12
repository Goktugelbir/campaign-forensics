import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCaseBundle, listCaseSlugs } from "@/lib/data";
import { caseCode, CAMPAIGN_TYPE_LABEL, firstSentence, formatDateLong, sortHypotheses } from "@/lib/format";
import { isVideoPath } from "@/lib/assets";
import type { CaseBundle } from "@/lib/types";
import { HypothesisStatusBadge, MockBadge } from "@/components/Badges";
import { EvidenceCard } from "@/components/EvidenceCard";
import { PrintButton } from "@/components/PrintButton";
import { EvidenceIdList } from "@/components/report/ReportNav";
import { ReportFooterNote } from "@/components/report/ReportFooterNote";
import { investigationContract } from "@/components/report/InvestigationContract";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return listCaseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const b = getCaseBundle(slug);
  return { title: b ? `Client brief — ${b.case.brand}` : "Case not found", robots: { index: false } };
}

/**
 * The one-page version an agency hands to its client: six questions, answered only with what is
 * already in the case files (case, evidence, diagnosis, forensics, creative, preflight).
 */
export default async function DeliverPage({ params }: Props) {
  const { slug } = await params;
  const b = getCaseBundle(slug);
  if (!b) notFound();
  const c = b.case;
  const d = b.diagnosis;

  return (
    <div className="print-surface container-page max-w-4xl py-10 md:py-14">
      <div className="no-print mb-10 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/cases/${slug}`} className="inline-flex items-center gap-1.5 text-sm text-fg-body hover:text-fg">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Full report
        </Link>
        <PrintButton />
      </div>

      <header>
        <div className="flex flex-wrap items-center gap-3">
          <p className="label-amber print-accent">
            Client brief · Case {caseCode(c.slug, c.case_code)} · {CAMPAIGN_TYPE_LABEL[c.campaign_type]}
          </p>
          {b.isMock && <MockBadge />}
        </div>
        <h1 className="heading-serif mt-4 text-4xl md:text-5xl">
          {c.brand} — {c.campaign}
        </h1>
        <p className="mt-3 text-sm">
          {b.evidence?.collected_at ? `Evidence collected ${formatDateLong(b.evidence.collected_at)} · ` : ""}
          Independent analysis of public signals. Not affiliated with {c.brand}.
        </p>
      </header>

      {!d ? (
        <p className="mt-12 text-sm">The diagnosis is still in progress — the brief is available once it is done.</p>
      ) : (
        <>
          <Q n="1" title="What happened?">
            <p className="text-[15px] leading-relaxed text-fg">{c.summary}</p>
            {c.claim && (
              <p className="mt-4 border-l-2 border-amber pl-4 text-sm leading-relaxed">
                <span className="label">What the brand claimed</span>
                <span className="mt-1 block text-fg">{c.claim}</span>
              </p>
            )}
          </Q>

          <Q n="2" title="What is the evidence?">
            <p className="font-serif text-2xl leading-snug text-fg md:text-3xl">{d.diagnosis.main_cause}</p>
            <div className="mt-6 grid gap-3">
              {headlineEvidence(b).map((e) => (
                <EvidenceCard key={e.id} evidence={e} compact />
              ))}
            </div>
            <p className="mt-3 text-xs text-fg-muted">
              {b.evidence?.evidence.length ?? 0} items in total — every one is in the full report with a link to its source.
            </p>
          </Q>

          <Q n="3" title="Which explanations were tested?">
            <ul className="divide-y divide-ink-line">
              {sortHypotheses(d.hypotheses).map((h) => {
                const l = b.forensics?.hypotheses.find((x) => x.id === h.id);
                const why = h.status === "rejected" && l?.rejection_reason ? l.rejection_reason : h.reasoning;
                return (
                  <li key={h.id} className="print-avoid grid gap-2 py-4 sm:grid-cols-[11rem_1fr]">
                    <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-start">
                      <span className="font-mono text-[11px] uppercase tracking-label text-fg-body">
                        {h.id} · {h.name}
                      </span>
                      <HypothesisStatusBadge status={h.status} />
                    </div>
                    <p className="text-sm leading-relaxed">{firstSentence(why)}</p>
                  </li>
                );
              })}
            </ul>
          </Q>

          <Q n="4" title="What should change?">
            <ol className="space-y-4">
              {d.prescription.map((p, i) => (
                <li key={p.change} className="print-avoid flex gap-4">
                  <span className="print-accent font-mono text-sm text-amber">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-fg">{p.change}</p>
                    <p className="mt-1 text-sm leading-relaxed">{p.why}</p>
                    <div className="no-print mt-2">
                      <EvidenceIdList ids={p.evidence_ids} slug={slug} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Q>

          <Q n="5" title="What was produced?">
            <div className="grid gap-4 sm:grid-cols-2">
              {(b.creative?.assets ?? [])
                .filter((a) => a.path)
                .map((a) => (
                  <figure key={a.path} className="card print-avoid overflow-hidden">
                    {a.kind === "video" && isVideoPath(a.path) ? (
                      <video src={a.path} controls playsInline preload="metadata" className="no-print aspect-video w-full bg-black" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.path} alt={a.label} className="aspect-video w-full object-cover" />
                    )}
                    <figcaption className="space-y-1 border-t border-ink-line px-4 py-3">
                      <p className="text-sm text-fg">{a.label}</p>
                      {(a.prescription_indexes ?? []).length > 0 && (
                        <p className="text-xs">
                          Answers {a.prescription_indexes!.map((i) => String(i + 1).padStart(2, "0")).join(", ")} above.
                        </p>
                      )}
                      <p className="text-xs text-fg-muted">AI-generated concept based on the diagnosis — not an official {c.brand} design.</p>
                    </figcaption>
                  </figure>
                ))}
            </div>
            <p className="mt-4 text-sm">
              <span className="text-fg">Quality gate:</span>{" "}
              {b.preflight ? `automated preflight ${b.preflight.status} (${formatDateLong(b.preflight.checked_at)})` : "automated preflight not run yet"}
              {" · "}
              {b.approval
                ? `${b.approval.decision === "approved" ? "approved" : "changes requested"} by ${b.approval.reviewer}`
                : "human review not recorded yet — treat the creative as a concept until it is."}
            </p>
          </Q>

          <Q n="6" title="What is not measured yet?">
            <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {investigationContract(b).map((r) => (
                <div key={r.label} className="flex gap-3 text-sm">
                  <dt className="w-28 shrink-0 font-mono text-[10px] uppercase leading-5 tracking-label text-fg-muted">{r.label}</dt>
                  <dd className="text-fg">{r.value}</dd>
                </div>
              ))}
            </dl>
            {notMeasured(b).length > 0 && (
              <ul className="mt-5 space-y-1.5">
                {notMeasured(b).map((m) => (
                  <li key={m} className="text-sm leading-relaxed">
                    — {m}
                  </li>
                ))}
              </ul>
            )}
          </Q>
        </>
      )}

      <ReportFooterNote brand={c.brand} />
    </div>
  );
}

function Q({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="flex items-baseline gap-3 border-b border-ink-line pb-3">
        <span className="print-accent font-mono text-sm text-amber">{n.padStart(2, "0")}</span>
        <span className="heading-serif text-2xl md:text-3xl">{title}</span>
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Up to three items behind the main cause, in the order the diagnosis cites them. */
function headlineEvidence(b: CaseBundle) {
  const ids = b.forensics?.claims.find((c) => c.id === "main_cause")?.support_evidence_ids ?? b.diagnosis?.diagnosis.evidence_ids ?? [];
  const all = b.evidence?.evidence ?? [];
  return ids
    .map((id) => all.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => !!e)
    .slice(0, 3);
}

/** Limits worth stating: why the main cause is not certain, and the data gaps behind confirmed findings. */
function notMeasured(b: CaseBundle): string[] {
  const f = b.forensics;
  if (!f || !b.diagnosis) return [];
  const confirmed = new Set(b.diagnosis.hypotheses.filter((h) => h.status === "confirmed").map((h) => h.id));
  const reasons = f.claims.find((c) => c.id === "main_cause")?.uncertainty_reasons ?? [];
  const gaps = f.hypotheses.filter((h) => confirmed.has(h.id)).flatMap((h) => h.missing_data);
  return [...new Set([...reasons, ...gaps])];
}
