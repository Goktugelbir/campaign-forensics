import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Brain, Clapperboard, Eye, X, Check } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { FEATURED_CASE_SLUG } from "@/lib/site";

export const metadata: Metadata = { title: "How it works" };

const SOURCES = [
  ["News & press", "Coverage in Turkish and English, design and trade press."],
  ["Video comments", "YouTube comments under the brand film and reaction videos."],
  ["Social comments", "Instagram, X and Threads replies to the launch posts."],
  ["Forums", "Reddit and community threads where the debate happens."],
  ["Competitors", "Rival campaigns and earlier versions, for context."],
];

const HYPOTHESES = [
  ["H1", "Positioning", "Does the campaign tell the market the right story about where the brand stands?"],
  ["H2", "Target Audience", "Did it speak to the right people — and who is actually reacting?"],
  ["H3", "Differentiation", "Does it stand apart from competitors and from the brand's own previous version?"],
  ["H4", "Message", "Was the core message understood, or was it read the wrong way?"],
  ["H5", "Creative Execution", "Is the problem the design, the visual or the craft itself?"],
  ["H6", "Competition", "Did a competitor or the wider context change how it landed?"],
];

export default function HowItWorksPage() {
  return (
    <div className="container-page py-14 md:py-20">
      <SectionHeading
        as="h1"
        label="Methodology"
        title="How a diagnosis is made."
        intro="Three steps, run in order and saved as files: evidence, diagnosis, relaunch. Every claim in the report can be traced back to a public source."
      />

      {/* Tools diagram */}
      <section aria-labelledby="pipeline" className="mt-16">
        <h2 id="pipeline" className="sr-only">Pipeline</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Eye, n: "01", tool: "Apify", role: "The eyes", step: "Evidence", out: "evidence.json" },
            { icon: Brain, n: "02", tool: "Manus", role: "The brain", step: "Diagnosis", out: "diagnosis.json" },
            { icon: Clapperboard, n: "03", tool: "fal.ai", role: "The studio", step: "Relaunch", out: "creative.json + media" },
          ].map((s, i) => (
            <li key={s.n} className="card relative p-7">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-amber">{s.n}</span>
                <s.icon className="h-5 w-5 text-fg-body" aria-hidden />
              </div>
              <h3 className="heading-serif mt-6 text-3xl">{s.step}</h3>
              <p className="mt-2 text-sm">
                <span className="text-fg">{s.tool}</span> — {s.role}
              </p>
              <p className="mt-4 font-mono text-[11px] text-fg-muted">→ {s.out}</p>
              {i < 2 && <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-amber md:block" aria-hidden />}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-24 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="label-amber">Step 01 · Evidence</p>
          <h2 className="heading-serif mt-4 text-4xl">Collect, anonymise, tag.</h2>
          <p className="mt-5 text-[15px] leading-relaxed">
            We collect 30–80 quality items from at least three source types. Usernames, profile links and photos are removed;
            duplicates, spam and empty comments are dropped. Each item is tagged with a sentiment and one to three topics —
            and supportive and neutral evidence is kept alongside the negative.
          </p>
        </div>
        <ul className="card divide-y divide-ink-line">
          {SOURCES.map(([k, v]) => (
            <li key={k} className="flex flex-col gap-1 p-5 sm:flex-row sm:gap-6">
              <span className="w-40 shrink-0 text-sm text-fg">{k}</span>
              <span className="text-sm">{v}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-24">
        <SectionHeading
          label="Step 02 · Diagnosis"
          title="Six hypotheses, tested in the open."
          intro="Each hypothesis is judged against the evidence and marked confirmed, uncertain or rejected, with a 0–100 confidence score and at least two evidence IDs. A hypothesis without evidence is uncertain — never confirmed by default."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {HYPOTHESES.map(([id, name, q]) => (
            <div key={id} className="card p-6">
              <p className="font-mono text-[11px] uppercase tracking-label text-fg-body">
                {id} · {name}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-fg">{q}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["Confirmed", "text-status-confirmed", "The evidence clearly supports it. Usually 60–100."],
            ["Uncertain", "text-status-uncertain", "Some signal, not enough to decide. Usually 30–60."],
            ["Rejected", "text-status-rejected", "The evidence rules it out. Shown, not hidden. Usually 0–30."],
          ].map(([k, cls, v]) => (
            <div key={k} className="card p-6">
              <p className={`font-mono text-[11px] uppercase tracking-label ${cls}`}>● {k}</p>
              <p className="mt-3 text-sm">{v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24 grid gap-4 lg:grid-cols-2">
        <div className="card p-8">
          <p className="label-amber">The generic-diagnosis test</p>
          <h2 className="heading-serif mt-4 text-3xl">Would it fit any other brand?</h2>
          <p className="mt-4 text-sm leading-relaxed">
            Before a diagnosis is accepted, we ask whether it would fit another brand&apos;s campaign unchanged. If yes, it is
            made more specific and tested again.
          </p>
        </div>
        <div className="space-y-4">
          <div className="card border-status-rejected/40 p-6">
            <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-label text-status-rejected">
              <X className="h-3.5 w-3.5" aria-hidden /> Not accepted
            </p>
            <p className="mt-3 font-serif text-xl text-fg">&ldquo;People don&apos;t like change.&rdquo;</p>
          </div>
          <div className="card border-status-confirmed/40 p-6">
            <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-label text-status-confirmed">
              <Check className="h-3.5 w-3.5" aria-hidden /> Accepted
            </p>
            <p className="mt-3 font-serif text-xl text-fg">
              &ldquo;At small sizes the joined letters make &lsquo;r&rsquo; and &lsquo;a&rsquo; read as &lsquo;z&rsquo;; most
              complaints focus on this legibility problem.&rdquo;
            </p>
          </div>
        </div>
      </section>

      <section className="mt-24 grid gap-10 lg:grid-cols-2">
        <div>
          <p className="label-amber">Step 03 · Relaunch</p>
          <h2 className="heading-serif mt-4 text-4xl">From diagnosis to a produced concept.</h2>
          <p className="mt-5 text-[15px] leading-relaxed">
            The main cause becomes a prescription of three to five changes, each tied to evidence, and a creative brief. From the
            brief we generate one concept image first, then a 10–20 second relaunch video that starts from the approved image.
            Generated work is a concept, never an official brand design.
          </p>
        </div>
        <div className="card p-8">
          <p className="label">Limits</p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed">
            <li>— No performance or ad-account data is used; the diagnosis interprets public signals.</li>
            <li>— A campaign needs enough public reaction to analyze.</li>
            <li>— Political, religious and other sensitive topics are out of scope.</li>
            <li>
              — How we handle data: <Link href="/legal/data-sources" className="link-amber">Responsible Data Use</Link>.
            </li>
          </ul>
        </div>
      </section>

      <div className="mt-20 flex flex-wrap gap-3">
        <Link href={`/cases/${FEATURED_CASE_SLUG}`} className="btn-primary">
          See a sample report <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link href="/new" className="btn-ghost">
          Start a case
        </Link>
      </div>
    </div>
  );
}
