"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CaseBundle } from "@/lib/types";
import { ReportHeader } from "./ReportHeader";
import { ReportNavContext } from "./ReportNav";
import { REPORT_STEPS, parseTab, reportHref, type ReportTab } from "./steps";
import { CaseTab } from "./CaseTab";
import { EvidenceTab } from "./EvidenceTab";
import { DiagnosisTab } from "./DiagnosisTab";
import { RelaunchTab } from "./RelaunchTab";
import { ReportFooterNote } from "./ReportFooterNote";

export interface FocusRequest {
  id: string;
  /** Incremented on every request so clicking the same id twice flashes again. */
  nonce: number;
}

const EVIDENCE_HASH = /^#(ev_[A-Za-z0-9_-]+)$/;

export function ReportView({ bundle }: { bundle: CaseBundle }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tab = parseTab(params.get("tab"));
  const slug = bundle.case.slug;
  const [focus, setFocus] = useState<FocusRequest | null>(null);

  const knownEvidence = useMemo(() => new Set((bundle.evidence?.evidence ?? []).map((e) => e.id)), [bundle.evidence]);

  const goToTab = useCallback(
    (next: ReportTab, scrollTop = false) => {
      router.push(reportHref(slug, next), { scroll: false });
      if (scrollTop) window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, slug],
  );

  const goToEvidence = useCallback(
    (id: string) => {
      router.push(reportHref(slug, "evidence", id), { scroll: false });
      setFocus((f) => ({ id, nonce: (f?.nonce ?? 0) + 1 }));
    },
    [router, slug],
  );

  // Deep links (shared URL with #ev_014) and manual hash edits.
  useEffect(() => {
    const fromHash = () => {
      const m = EVIDENCE_HASH.exec(window.location.hash);
      if (m) setFocus((f) => ({ id: m[1], nonce: (f?.nonce ?? 0) + 1 }));
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [pathname]);

  const nav = useMemo(() => ({ slug, knownEvidence, goToTab, goToEvidence }), [slug, knownEvidence, goToTab, goToEvidence]);
  const evidenceCount = bundle.evidence?.evidence.length ?? 0;

  return (
    <ReportNavContext.Provider value={nav}>
      <div className="container-page py-10 md:py-14">
        <Link href="/cases" className="no-print mb-8 inline-flex items-center gap-1.5 text-sm text-fg-body transition-colors hover:text-fg">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> All reports
        </Link>

        <ReportHeader bundle={bundle} />

        {/* The four steps as tabs. Sticky so the reader always sees where they are. */}
        <div className="no-print sticky top-16 z-30 -mx-4 mt-10 border-b border-ink-line bg-ink/90 px-4 backdrop-blur md:-mx-0 md:px-0">
          <div role="tablist" aria-label="Report steps" className="grid grid-cols-4">
            {REPORT_STEPS.map((s) => {
              const active = s.tab === tab;
              return (
                <a
                  key={s.tab}
                  role="tab"
                  id={`tab-${s.tab}`}
                  aria-selected={active}
                  aria-controls={`panel-${s.tab}`}
                  href={reportHref(slug, s.tab)}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    goToTab(s.tab);
                  }}
                  className={`-mb-px border-b-2 px-2 py-3 transition-colors md:px-4 md:py-4 ${
                    active ? "border-amber" : "border-transparent hover:border-ink-strong"
                  }`}
                >
                  <span className="flex items-baseline gap-2">
                    <span className={`hidden font-mono text-[11px] sm:inline ${active ? "text-amber" : "text-fg-muted"}`}>{s.n}</span>
                    <span className={`text-sm md:text-base ${active ? "text-fg" : "text-fg-body"}`}>{s.label}</span>
                    {s.tab === "evidence" && <span className="hidden font-mono text-[11px] text-fg-muted sm:inline">{evidenceCount}</span>}
                  </span>
                  <span className="mt-1 hidden text-xs text-fg-muted md:block">{s.question}</span>
                </a>
              );
            })}
          </div>
        </div>

        <section role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} key={tab} className="mt-10 animate-fadein">
          {tab === "case" && <CaseTab bundle={bundle} />}
          {tab === "evidence" && <EvidenceTab bundle={bundle} focus={focus} />}
          {tab === "diagnosis" && <DiagnosisTab bundle={bundle} />}
          {tab === "relaunch" && <RelaunchTab bundle={bundle} />}
        </section>

        <StepPager slug={slug} tab={tab} onGo={(t) => goToTab(t, true)} />

        <ReportFooterNote brand={bundle.case.brand} />
      </div>
    </ReportNavContext.Provider>
  );
}

/** Previous / next step at the bottom of every tab, so nobody has to scroll back up to the tabs. */
function StepPager({ slug, tab, onGo }: { slug: string; tab: ReportTab; onGo: (t: ReportTab) => void }) {
  const i = REPORT_STEPS.findIndex((s) => s.tab === tab);
  const prev = REPORT_STEPS[i - 1];
  const next = REPORT_STEPS[i + 1];
  const go = (t: ReportTab) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onGo(t);
  };

  return (
    <nav aria-label="Previous and next step" className="no-print mt-16 grid gap-4 md:grid-cols-2">
      {prev ? (
        <a href={reportHref(slug, prev.tab)} onClick={go(prev.tab)} className="card group p-5 transition-colors hover:border-ink-strong">
          <span className="label inline-flex items-center gap-1.5">
            <ArrowLeft className="h-3 w-3" aria-hidden /> Previous
          </span>
          <span className="mt-2 block text-fg">
            {prev.n} {prev.label} <span className="text-fg-body">— {prev.question}</span>
          </span>
        </a>
      ) : (
        <span className="hidden md:block" />
      )}
      {next ? (
        <a
          href={reportHref(slug, next.tab)}
          onClick={go(next.tab)}
          className="card group border-amber/50 p-5 text-right transition-colors hover:border-amber"
        >
          <span className="label-amber inline-flex items-center gap-1.5">
            Next step <ArrowRight className="h-3 w-3" aria-hidden />
          </span>
          <span className="mt-2 block text-fg">
            {next.n} {next.label} <span className="text-fg-body">— {next.question}</span>
          </span>
        </a>
      ) : (
        <Link href="/new" className="card group border-amber/50 p-5 text-right transition-colors hover:border-amber">
          <span className="label-amber inline-flex items-center gap-1.5">
            End of report <ArrowRight className="h-3 w-3" aria-hidden />
          </span>
          <span className="mt-2 block text-fg">
            Investigate your own campaign <span className="text-fg-body">— Start a case</span>
          </span>
        </Link>
      )}
    </nav>
  );
}
