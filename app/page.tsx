import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCaseBundle } from "@/lib/data";
import { FEATURED_CASE_SLUG } from "@/lib/site";
import { caseCode, CAMPAIGN_TYPE_LABEL, formatDateLabel, sortHypotheses } from "@/lib/format";
import type { CaseBundle, Hypothesis } from "@/lib/types";
import { FEATURED_FAQ } from "@/content/faq";
import { SectionHeading } from "@/components/SectionHeading";
import { HypothesisCard } from "@/components/HypothesisCard";
import { HypothesisStatusBadge, MockBadge } from "@/components/Badges";
import { EvidenceCard } from "@/components/EvidenceCard";
import { EvidenceIdList } from "@/components/report/ReportNav";
import { PricingCards } from "@/components/PricingCards";
import { Accordion } from "@/components/Accordion";
import { WaitlistForm } from "@/components/WaitlistForm";

const RECENT = ["Instagram — wordmark refresh", "Lay's — global rebrand", "McDonald's NL — AI holiday ad"];

const STEPS = [
  {
    n: "01",
    title: "Evidence",
    body: "We collect public reactions from news, video and social comments, forums and competitor campaigns. Personal data is stripped; every item keeps its source link.",
  },
  {
    n: "02",
    title: "Diagnosis",
    body: "Six hypotheses — positioning, audience, differentiation, message, creative, competition — are tested against the evidence. Weak ones are rejected in the open.",
  },
  {
    n: "03",
    title: "Relaunch",
    body: "The strongest explanation becomes a prescription and a creative brief, and we produce the revised concept and a short relaunch video.",
  },
];

const WHY = [
  { title: "No ad account access", body: "We work from public signals only. Useful before a pitch, after a launch, or for a competitor's campaign." },
  { title: "Every claim is sourced", body: "Each conclusion links to the evidence behind it. Hypotheses that don't hold up are shown as rejected, not hidden." },
  { title: "Diagnosis to creative, one flow", body: "The fix isn't a slide of recommendations. It's a brief and a produced concept, traceable back to the evidence." },
];

/** One confirmed, one uncertain, one rejected — the three states a reader needs to see. */
function previewHypotheses(list: Hypothesis[]): Hypothesis[] {
  const sorted = sortHypotheses(list);
  const pick = (s: Hypothesis["status"], last = false) => {
    const group = sorted.filter((h) => h.status === s);
    return last ? group[group.length - 1] : group[0];
  };
  return [pick("confirmed"), pick("uncertain"), pick("rejected", true)].filter((h): h is Hypothesis => !!h);
}

export default function LandingPage() {
  const featured = getCaseBundle(FEATURED_CASE_SLUG);
  return (
    <>
      <Hero featured={featured} />

      {/* Recently investigated — plain text, no brand logos */}
      <section aria-label="Recently investigated" className="border-y border-ink-line">
        <div className="container-page flex flex-col gap-4 py-6 md:flex-row md:items-center md:gap-10">
          <p className="label shrink-0">Recently investigated</p>
          <ul className="flex flex-wrap gap-x-10 gap-y-2">
            {RECENT.map((r) => (
              <li key={r} className="font-serif text-lg text-fg-body">
                {r}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The problem */}
      <section className="container-page py-24 md:py-32">
        <SectionHeading
          label="The problem"
          title={
            <>
              Campaigns don&apos;t fail silently. <em className="text-fg-body">The evidence is just scattered.</em>
            </>
          }
          intro="It sits in comment sections, forum threads, press coverage and your competitors' messaging. Teams rarely have time to collect it, so the post-mortem becomes a meeting of opinions — and the next campaign repeats the mistake."
        />
        <div className="mt-14 grid gap-px overflow-hidden border-t border-ink-line md:grid-cols-3">
          {[
            ["Comments", "Thousands of reactions, no structure."],
            ["Coverage", "Press and creators frame the story first."],
            ["Competitors", "The context your message lands in."],
          ].map(([k, v]) => (
            <div key={k} className="pt-6 md:pr-8">
              <p className="label">{k}</p>
              <p className="mt-3 text-fg">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container-page pb-24 md:pb-32">
        <SectionHeading
          label="How it works"
          title="From scattered reactions to a fixed campaign."
          aside={
            <Link href="/how-it-works" className="inline-flex items-center gap-1.5 text-sm text-amber hover:underline">
              Read the methodology <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          }
        />
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="card p-7">
              <span className="font-mono text-sm text-amber">{s.n}</span>
              <h3 className="heading-serif mt-6 text-3xl">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {featured?.diagnosis && <SamplePreview featured={featured} />}

      {/* Why */}
      <section className="container-page py-24 md:py-32">
        <SectionHeading label="Why Campaign Forensics" title="Not another dashboard." />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {WHY.map((w) => (
            <div key={w.title} className="card p-7">
              <h3 className="text-lg text-fg">{w.title}</h3>
              <p className="mt-3 text-sm leading-relaxed">{w.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="card p-7">
            <p className="label-amber">For agencies</p>
            <p className="mt-4 font-serif text-2xl leading-snug text-fg">
              Walk into a new-business pitch knowing why the prospect&apos;s last campaign underperformed.
            </p>
          </div>
          <div className="card p-7">
            <p className="label-amber">For brand teams</p>
            <p className="mt-4 font-serif text-2xl leading-snug text-fg">
              Within 48 hours of a launch or rebrand, see what the market is actually reacting to.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container-page pb-24 md:pb-32">
        <SectionHeading label="Pricing" title="Simple pricing." />
        <div className="mt-12">
          <PricingCards />
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page pb-24 md:pb-32">
        <SectionHeading
          label="FAQ"
          title="Questions, answered."
          aside={
            <Link href="/faq" className="inline-flex items-center gap-1.5 text-sm text-amber hover:underline">
              All questions <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          }
        />
        <div className="mt-10">
          <Accordion items={FEATURED_FAQ} />
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="container-page scroll-mt-24">
        <div className="card grid gap-10 p-8 md:grid-cols-2 md:p-12">
          <div>
            <h2 className="heading-serif text-4xl md:text-5xl">Get early access.</h2>
            <p className="mt-4 text-sm">We&apos;re onboarding a small number of agencies and brand teams.</p>
          </div>
          <WaitlistForm />
        </div>
      </section>
    </>
  );
}

function Hero({ featured }: { featured: CaseBundle | null }) {
  const d = featured?.diagnosis;
  const sorted = d ? sortHypotheses(d.hypotheses) : [];
  const confirmed = sorted.find((h) => h.status === "confirmed");
  const rejected = [...sorted].reverse().find((h) => h.status === "rejected");
  // The first piece of evidence cited by the main cause.
  const evidence = d?.diagnosis.evidence_ids
    .map((id) => featured?.evidence?.evidence.find((e) => e.id === id))
    .find((e) => !!e);
  const slug = featured?.case.slug ?? FEATURED_CASE_SLUG;

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
            Campaign Forensics collects the public reaction to your campaign, tests six explanations against the evidence, and
            tells you what actually went wrong — then produces the fixed campaign. Every claim links to its source.
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

        {featured && d && (
          <div className="card rotate-0 space-y-4 bg-ink-surface/95 p-5 shadow-[0_40px_120px_-40px_rgba(245,166,35,0.25)] lg:-rotate-1">
            <div className="flex items-center justify-between gap-3">
              <p className="label">
                Case {caseCode(featured.case.slug, featured.case.case_code)} · {featured.case.brand} {featured.case.campaign}
              </p>
              {featured.isMock && <MockBadge />}
            </div>
            <div className="rounded-xl border border-amber/50 bg-amber/[0.06] p-5">
              <p className="label-amber">Exhibit A — Main cause</p>
              <p className="mt-3 font-serif text-2xl leading-snug text-fg">{d.diagnosis.main_cause}</p>
              <div className="mt-4">
                <EvidenceIdList ids={d.diagnosis.evidence_ids} slug={slug} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[confirmed, rejected].filter((h): h is Hypothesis => !!h).map((h) => (
                <div key={h.id} className={`rounded-xl border border-ink-line p-3.5 ${h.status === "rejected" ? "opacity-60" : ""}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`whitespace-nowrap font-mono text-[10px] uppercase tracking-label text-fg-body ${h.status === "rejected" ? "line-through" : ""}`}>
                      {h.id} · {h.name}
                    </span>
                    <HypothesisStatusBadge status={h.status} />
                  </div>
                  <div className="mt-3 h-1 rounded-full bg-ink-strong">
                    <div className={`h-full rounded-full ${h.status === "confirmed" ? "bg-amber" : "bg-fg-muted"}`} style={{ width: `${h.confidence}%` }} />
                  </div>
                </div>
              ))}
            </div>
            {evidence && <EvidenceCard evidence={evidence} compact />}
          </div>
        )}
      </div>
    </section>
  );
}

function SamplePreview({ featured }: { featured: CaseBundle }) {
  const c = featured.case;
  const hyps = previewHypotheses(featured.diagnosis!.hypotheses);
  return (
    <section className="border-y border-ink-line bg-ink-surface/40">
      <div className="container-page py-24 md:py-32">
        <SectionHeading label="Sample report" title="What a diagnosis looks like." />
        <div className="card mt-12 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="label">
              Case {caseCode(c.slug, c.case_code)} · {CAMPAIGN_TYPE_LABEL[c.campaign_type]} · Launched {formatDateLabel(c.launch_date)}
            </p>
            {featured.isMock && <MockBadge />}
          </div>
          <h3 className="heading-serif mt-3 text-3xl md:text-4xl">
            {c.brand} — {c.campaign}
          </h3>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {hyps.map((h) => (
              <HypothesisCard key={h.id} h={h} slug={c.slug} />
            ))}
          </div>
          <Link href={`/cases/${c.slug}?tab=diagnosis`} className="mt-8 inline-flex items-center gap-1.5 text-sm text-amber hover:underline">
            Open the full {c.brand} report <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
