"use client";

import Link from "next/link";
import { Download, FileText, Link2, Printer } from "lucide-react";
import { caseCode, CAMPAIGN_TYPE_LABEL, formatDateLabel, formatDateLong } from "@/lib/format";
import type { CaseBundle } from "@/lib/types";
import { MockBadge, StatusBadge } from "../Badges";
import { useToast } from "../Toast";

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2) + "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function ReportHeader({ bundle, showActions = true }: { bundle: CaseBundle; showActions?: boolean }) {
  const toast = useToast();
  const c = bundle.case;
  const collected = bundle.evidence?.collected_at;

  return (
    <header>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="label">
          Case {caseCode(c.slug, c.case_code)} · {CAMPAIGN_TYPE_LABEL[c.campaign_type]} · Launched {formatDateLabel(c.launch_date)}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {bundle.isMock && <MockBadge />}
          <StatusBadge status={c.status} />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="heading-serif text-4xl md:text-6xl">
            {c.brand} — {c.campaign}
          </h1>
          <p className="mt-4 text-sm">
            {collected ? `Evidence collected ${formatDateLong(collected)}` : "Evidence collection in progress"} · Independent
            analysis of public signals. Not affiliated with {c.brand}.
          </p>
        </div>

        {showActions && (
          <div className="no-print flex shrink-0 flex-wrap gap-2 lg:flex-nowrap">
            <Link href={`/cases/${c.slug}/deliver`} className="btn-primary btn-sm">
              <FileText className="h-3.5 w-3.5" aria-hidden /> Client brief
            </Link>
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() =>
                downloadJson(`${c.slug}-report.json`, {
                  case: bundle.case,
                  evidence: bundle.evidence,
                  diagnosis: bundle.diagnosis,
                  creative: bundle.creative,
                })
              }
            >
              <Download className="h-3.5 w-3.5" aria-hidden /> Download JSON
            </button>
            <Link href={`/cases/${c.slug}/print`} className="btn-ghost btn-sm">
              <Printer className="h-3.5 w-3.5" aria-hidden /> Print
            </Link>
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={async () => {
                const ok = await copyText(window.location.href);
                toast(ok ? "Link copied" : "Couldn't copy — use the address bar");
              }}
            >
              <Link2 className="h-3.5 w-3.5" aria-hidden /> Copy link
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
