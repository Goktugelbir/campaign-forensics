"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CaseBundle } from "@/lib/types";
import { ReportHeader } from "./ReportHeader";
import { ReportNavContext, parseTab, reportHref, type ReportTab } from "./ReportNav";
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

const TAB_LABEL: Record<ReportTab, string> = {
  case: "Case",
  evidence: "Evidence",
  diagnosis: "Diagnosis",
  relaunch: "Relaunch",
};

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
    (next: ReportTab) => {
      router.push(reportHref(slug, next), { scroll: false });
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
        <ReportHeader bundle={bundle} />

        <div role="tablist" aria-label="Report sections" className="no-print mt-10 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-ink-line">
          {(Object.keys(TAB_LABEL) as ReportTab[]).map((t) => {
            const active = t === tab;
            return (
              <a
                key={t}
                role="tab"
                id={`tab-${t}`}
                aria-selected={active}
                aria-controls={`panel-${t}`}
                href={reportHref(slug, t)}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  goToTab(t);
                }}
                className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-colors ${
                  active ? "border-amber text-fg" : "border-transparent text-fg-body hover:text-fg"
                }`}
              >
                {TAB_LABEL[t]}
                {t === "evidence" && (
                  <span className="ml-1.5 font-mono text-[11px] text-fg-muted">[{evidenceCount}]</span>
                )}
              </a>
            );
          })}
        </div>

        <section role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} key={tab} className="mt-10 animate-fadein">
          {tab === "case" && <CaseTab bundle={bundle} />}
          {tab === "evidence" && <EvidenceTab bundle={bundle} focus={focus} />}
          {tab === "diagnosis" && <DiagnosisTab bundle={bundle} />}
          {tab === "relaunch" && <RelaunchTab bundle={bundle} />}
        </section>

        <ReportFooterNote brand={bundle.case.brand} />
      </div>
    </ReportNavContext.Provider>
  );
}
