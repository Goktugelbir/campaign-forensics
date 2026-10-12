// The four steps of a report. Shared by the report tabs, the "next step" footer of each
// tab and the landing page, so the same names and questions appear everywhere.
// Plain module (no "use client") so server components can call reportHref.

export type ReportTab = "case" | "evidence" | "diagnosis" | "relaunch";
export const REPORT_TABS: ReportTab[] = ["case", "evidence", "diagnosis", "relaunch"];

export interface ReportStep {
  tab: ReportTab;
  n: string;
  label: string;
  /** The question this step answers — shown under the tab name. */
  question: string;
  summary: string;
}

export const REPORT_STEPS: ReportStep[] = [
  {
    tab: "case",
    n: "01",
    label: "Case",
    question: "What happened?",
    summary: "What launched, what the brand claimed, and the questions the investigation set out to answer.",
  },
  {
    tab: "evidence",
    n: "02",
    label: "Evidence",
    question: "What did people say?",
    summary: "Public reactions from news, social, video and forums. Every item links to its source; no usernames.",
  },
  {
    tab: "diagnosis",
    n: "03",
    label: "Diagnosis",
    question: "Why did it backfire?",
    summary: "Six explanations tested against the evidence: the main cause, and what was ruled out.",
  },
  {
    tab: "relaunch",
    n: "04",
    label: "Relaunch",
    question: "How do we fix it?",
    summary: "The prescription, a creative brief, and the produced concept and video.",
  },
];

export function parseTab(value: string | null | undefined): ReportTab {
  return REPORT_TABS.includes(value as ReportTab) ? (value as ReportTab) : "case";
}

export function reportHref(slug: string, tab: ReportTab = "case", evidenceId?: string): string {
  const q = tab === "case" ? "" : `?tab=${tab}`;
  return `/cases/${slug}${q}${evidenceId ? `#${evidenceId}` : ""}`;
}
