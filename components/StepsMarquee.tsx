import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { REPORT_STEPS, reportHref } from "./report/steps";

// The set is repeated so the strip never shows a gap on wide screens; the track moves by one
// set (1/COPIES of its width) and loops. Only the first copy is exposed to assistive tech.
const COPIES = 3;

/**
 * The four report steps as a strip that slides right-to-left. Pauses on hover and on keyboard
 * focus; with reduced motion it is a plain, static grid.
 */
export function StepsMarquee({ slug }: { slug: string }) {
  return (
    <div className="marquee mt-12 overflow-hidden motion-reduce:container-page">
      <div className="marquee-track flex w-max motion-reduce:w-full">
        {Array.from({ length: COPIES }, (_, copy) => (
          <ol
            key={copy}
            aria-hidden={copy > 0 || undefined}
            className={`flex shrink-0 ${
              copy > 0 ? "motion-reduce:hidden" : "motion-reduce:grid motion-reduce:w-full motion-reduce:gap-4 motion-reduce:md:grid-cols-2 motion-reduce:lg:grid-cols-4"
            }`}
          >
            {REPORT_STEPS.map((s) => (
              <li key={s.tab} className="mr-4 w-[280px] shrink-0 sm:w-[320px] motion-reduce:mr-0 motion-reduce:w-auto">
                <Link
                  href={reportHref(slug, s.tab)}
                  tabIndex={copy > 0 ? -1 : undefined}
                  className="card group flex h-full flex-col p-6 transition-colors hover:border-amber/60"
                >
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
        ))}
      </div>
    </div>
  );
}
