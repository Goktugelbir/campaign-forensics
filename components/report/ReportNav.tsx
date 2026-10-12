"use client";

import Link from "next/link";
import { createContext, useContext } from "react";

import { reportHref, type ReportTab } from "./steps";

export { REPORT_TABS, parseTab, reportHref, type ReportTab } from "./steps";

interface ReportNavValue {
  slug: string;
  knownEvidence: Set<string>;
  goToTab: (tab: ReportTab) => void;
  goToEvidence: (id: string) => void;
}

export const ReportNavContext = createContext<ReportNavValue | null>(null);

export function useReportNav() {
  return useContext(ReportNavContext);
}

/**
 * Monospace evidence id. Inside a report it switches to the Evidence tab, scrolls to
 * the card and flashes it; elsewhere (landing preview) it is a plain deep link.
 */
export function EvidenceIdLink({ id, slug }: { id: string; slug?: string }) {
  const nav = useReportNav();
  const cls =
    "inline-flex items-center rounded-md border border-amber/40 bg-amber/5 px-1.5 py-0.5 font-mono text-[11px] text-amber transition-colors hover:border-amber hover:bg-amber/15";

  if (nav) {
    const missing = !nav.knownEvidence.has(id);
    return (
      <a
        href={reportHref(nav.slug, "evidence", id)}
        className={missing ? `${cls} opacity-50` : cls}
        title={missing ? `${id} is not in evidence.json` : `Show ${id} in Evidence`}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          nav.goToEvidence(id);
        }}
      >
        {id}
      </a>
    );
  }
  if (slug) {
    return (
      <Link href={reportHref(slug, "evidence", id)} className={cls}>
        {id}
      </Link>
    );
  }
  return <span className={cls}>{id}</span>;
}

export function EvidenceIdList({ ids, slug }: { ids: string[]; slug?: string }) {
  if (!ids.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <EvidenceIdLink key={id} id={id} slug={slug} />
      ))}
    </div>
  );
}
