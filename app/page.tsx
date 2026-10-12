import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCaseBundle, listCases } from "@/lib/data";
import { toCaseSummary } from "@/lib/caseSummary";
import { FEATURED_CASE_SLUG } from "@/lib/site";
import { SectionHeading } from "@/components/SectionHeading";
import { HeroBackground } from "@/components/HeroBackground";
import { CaseCard } from "@/components/CaseCard";
import { WaitlistForm } from "@/components/WaitlistForm";
import { StepsMarquee } from "@/components/StepsMarquee";

export default function LandingPage() {
  const featured = getCaseBundle(FEATURED_CASE_SLUG);
  const slug = featured?.case.slug ?? FEATURED_CASE_SLUG;
  const cases = listCases().map(toCaseSummary);

  return (
    <>
      <Hero slug={slug} />

      {/* How it works = the four steps of every report, each linking to that step of the sample */}
      <section id="steps" className="scroll-mt-16 py-24 md:py-28">
        <div className="container-page">
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
        </div>
        <StepsMarquee slug={slug} />
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

function Hero({ slug }: { slug: string }) {
  return (
    // -mt-16 pulls the hero (and its background) up behind the transparent header.
    <section className="relative -mt-16 flex min-h-[88vh] items-center overflow-hidden pt-16">
      <HeroBackground />
      <div className="container-page relative py-24 md:py-32">
        <p className="label">Campaign Forensics</p>
        <h1 className="heading-serif mt-6 max-w-5xl text-6xl md:text-8xl lg:text-[112px]">
          See why your launch backfired. <em className="text-amber">With evidence.</em>
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-relaxed md:text-xl">
          We collect the public reaction to your campaign, test six explanations against it and show what actually went
          wrong — then produce the fixed campaign. Every claim links to its source.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href={`/cases/${slug}`} className="btn-primary px-6 py-3 text-base">
            See a sample report <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link href="/new" className="btn-ghost px-6 py-3 text-base">
            Start a case
          </Link>
        </div>
        <p className="mt-12 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-label text-fg-muted">
          <span>No ad account access</span>
          <span aria-hidden>·</span>
          <span>Every claim sourced</span>
          <span aria-hidden>·</span>
          <span>Diagnosis to creative</span>
        </p>
      </div>
    </section>
  );
}
