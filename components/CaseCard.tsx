import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDateLabel } from "@/lib/format";
import type { CaseSummary } from "@/lib/caseSummary";
import { MockBadge, StatusBadge, TypeBadge } from "./Badges";

/** One case file in a grid: brand, campaign, the main cause and an explicit "Open report" cue. */
export function CaseCard({ c, headingLevel: H = "h2" }: { c: CaseSummary; headingLevel?: "h2" | "h3" }) {
  return (
    <Link href={`/cases/${c.slug}`} className="card group flex h-full flex-col p-6 transition-colors hover:border-amber/60">
      <div className="flex flex-wrap items-center gap-1.5">
        <TypeBadge type={c.type} />
        <StatusBadge status={c.status} />
        {c.isMock && <MockBadge />}
      </div>
      <H className="heading-serif mt-5 text-3xl">{c.brand}</H>
      <p className="mt-1 text-sm text-fg">{c.campaign}</p>
      {c.mainCause && <p className="mt-5 text-sm leading-relaxed">{c.mainCause}</p>}
      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <span className="font-mono text-[11px] uppercase tracking-label text-fg-muted">
          Launched {formatDateLabel(c.launchDate)} · {c.evidenceCount} evidence
        </span>
        <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm text-amber">
          Open report <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
