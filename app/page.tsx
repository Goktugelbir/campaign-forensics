import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCaseBundle, listCases } from "@/lib/data";
import { toCaseSummary } from "@/lib/caseSummary";
import { FEATURED_CASE_SLUG } from "@/lib/site";
import { countByStatus } from "@/lib/format";
import type { CaseBundle } from "@/lib/types";
import { SectionHeading } from "@/components/SectionHeading";
import { MockBadge } from "@/components/Badges";
import { CaseCard } from "@/components/CaseCard";
import { WaitlistForm } from "@/components/WaitlistForm";
import { REPORT_STEPS, reportHref } from "@/components/report/steps";

export default function LandingPage() {
  const featured = getCaseBundle(FEATURED_CASE_SLUG);
  const slug = featured?.case.slug ?? FEATURED_CASE_SLUG;
  const cases = listCases().map(toCaseSummary);

  return (
    <>
      <Hero featured={featured} slug={slug} />

      {/* How it works = the four steps of every report, each linking to that step of the sample */}
      <section className="container-page py-24 md:py-28">
        <SectionHeading
          label="How it works"
          title="Every report reads in four steps."
          intro="The same four steps you see as tabs in a report. Click one to jump straight to it in the sample."
          aside={
            <Link href="/how-it-works" className="inline-flex items-center gap-1.5 text-sm text-amber hover:underline">
              Read the methodology <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          }
        />
        <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {REPORT_STEPS.map((s) => (
            <li key={s.tab}>
              <Link href={reportHref(slug, s.tab)} className="card group flex h-full flex-col p-6 transition-colors hover:border-amber/60">
                <span className="font-mono text-sm text-amber">{s.n}</span>
                <h3 className="heading-serif mt-5 text-3xl">{s.label}</h3>
                <p className="mt-3 text-sm leading-relaxed">{s.summary}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm text-fg-body transition-colors group-hover:text-amber">
                  See it in the sample <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Sample reports */}
      {cases.length > 0 && (
        <section className="border-y border-ink-line bg-ink-surface/40">
          <div className="container-page py-24 md:py-28">
            <SectionHeading
              label="Sample reports"
              title="Real campaigns, real evidence."
              aside={
                <Link href="/cases" className="inline-flex items-center gap-1.5 text-sm text-amber hover:underline">
                  All reports <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              }
            />
            <ul className="mt-12 grid gap-4 md:grid-cols-2">
              {cases.map((c) => (
                <li key={c.slug}>
                  <CaseCard c={c} headingLevel="h3" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Next step: start a case or join the waitlist */}
      <section id="waitlist" className="container-page scroll-mt-24 pt-24 md:pt-28">
        <div className="card grid gap-10 p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="label-amber">Your campaign</p>
            <h2 className="heading-serif mt-4 text-4xl md:text-5xl">Get your own diagnosis.</h2>
            <p className="mt-4 text-sm leading-relaxed">
              Tell us which campaign to investigate. No ad account access needed — we only use public signals.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/new" className="btn-primary">
                Start a case <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/pricing" className="text-sm text-fg-body hover:text-fg">
                See pricing
              </Link>
              <Link href="/faq" className="text-sm text-fg-body hover:text-fg">
                Read the FAQ
              </Link>
            </div>
          </div>
          <div>
            <p className="label">Not ready yet?</p>
            <p className="mt-4 text-sm">Join the waitlist and we&apos;ll let you know when we open up.</p>
            <div className="mt-6">
              <WaitlistForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Hero({ featured, slug }: { featured: CaseBundle | null; slug: string }) {
  const d = featured?.diagnosis;
  const counts = d ? countByStatus(d.hypotheses) : null;

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-40 right-0 h-[36rem] w-[36rem] rounded-full bg-amber/10 blur-[140px]" />
      <div className="container-page relative grid items-center gap-14 py-20 md:py-28 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="label">Campaign Forensics · Beta</p>
          <h1 className="heading-serif mt-6 text-6xl md:text-7xl lg:text-[84px]">
            See why your launch backfired. <em className="text-amber">With evidence.</em>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed md:text-lg">
            We collect the public reaction to your campaign, test six explanations against it and show what actually went
            wrong — then produce the fixed campaign. Every claim links to its source.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href={`/cases/${slug}`} className="btn-primary">
              See a sample report <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/new" className="btn-ghost">
              Start a case
            </Link>
          </div>
          <p className="mt-10 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-label text-fg-muted">
            <span>No ad account access</span>
            <span aria-hidden>·</span>
            <span>Every claim sourced</span>
            <span aria-hidden>·</span>
            <span>Diagnosis to creative</span>
          </p>
        </div>

        {featured && d && counts && (
          <Link
            href={reportHref(slug, "diagnosis")}
            className="card group block space-y-5 bg-ink-surface/95 p-6 shadow-[0_40px_120px_-40px_rgba(245,166,35,0.25)] transition-colors hover:border-amber/60"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="label">Sample diagnosis</p>
              {featured.isMock && <MockBadge />}
            </div>
            <p className="heading-serif text-3xl">
              {featured.case.brand} — {featured.case.campaign}
            </p>
            <div className="rounded-xl border border-amber/50 bg-amber/[0.06] p-5">
              <p className="label-amber">Main cause</p>
              <p className="mt-3 font-serif text-xl leading-snug text-fg">{d.diagnosis.main_cause}</p>
            </div>
            <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-label text-fg-body">
              <span>{featured.evidence?.evidence.length ?? 0} evidence</span>
              <span>
                <span className="text-status-confirmed">●</span> {counts.confirmed} confirmed
              </span>
              <span>
                <span className="text-fg-muted">●</span> {counts.uncertain} uncertain
              </span>
              <span>
                <span className="text-status-rejected">●</span> {counts.rejected} rejected
              </span>
            </p>
            <span className="inline-flex items-center gap-1 text-sm text-amber">
              Open the report <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
