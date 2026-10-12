"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, FolderOpen, SearchX } from "lucide-react";
import { CAMPAIGN_TYPE_LABEL, formatDateLabel, STATUS_LABEL, STATUS_ORDER } from "@/lib/format";
import type { CampaignType, CaseStatus } from "@/lib/types";
import { MockBadge, StatusBadge, TypeBadge } from "./Badges";
import { EmptyState } from "./EmptyState";

export interface CaseSummary {
  slug: string;
  code: string;
  brand: string;
  campaign: string;
  type: CampaignType;
  status: CaseStatus;
  launchDate: string;
  evidenceCount: number;
  mainCause: string | null;
  isMock: boolean;
}

export function CaseList({ cases }: { cases: CaseSummary[] }) {
  const [type, setType] = useState<CampaignType | "all">("all");
  const [status, setStatus] = useState<CaseStatus | "all">("all");

  const types = useMemo(() => [...new Set(cases.map((c) => c.type))], [cases]);
  const statuses = useMemo(() => STATUS_ORDER.filter((s) => cases.some((c) => c.status === s)), [cases]);
  const visible = cases.filter((c) => (type === "all" || c.type === type) && (status === "all" || c.status === status));

  if (cases.length === 0) {
    return <EmptyState icon={FolderOpen} title="No cases yet" description="Open your first investigation." action={{ label: "Start a case", href: "/new" }} />;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <select aria-label="Filter by type" className="input w-auto" value={type} onChange={(e) => setType(e.target.value as CampaignType | "all")}>
          <option value="all">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {CAMPAIGN_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
        <select aria-label="Filter by status" className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value as CaseStatus | "all")}>
          <option value="all">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <span className="font-mono text-[11px] uppercase tracking-label text-fg-muted">
          {visible.length} of {cases.length}
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            compact
            icon={SearchX}
            title="No cases match these filters"
            action={{ label: "Clear filters", onClick: () => {
                  setType("all");
                  setStatus("all");
                },
              }}
          />
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <li key={c.slug}>
              <Link href={`/cases/${c.slug}`} className="card group flex h-full flex-col p-6 transition-colors hover:border-ink-strong">
                <div className="flex items-center justify-between gap-2">
                  <span className="label">{c.code}</span>
                  <ArrowUpRight className="h-4 w-4 text-fg-muted transition-colors group-hover:text-amber" aria-hidden />
                </div>
                <h2 className="heading-serif mt-4 text-3xl">{c.brand}</h2>
                <p className="mt-1 text-sm text-fg">{c.campaign}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <TypeBadge type={c.type} />
                  <StatusBadge status={c.status} />
                  {c.isMock && <MockBadge />}
                </div>
                {c.mainCause && <p className="mt-5 text-sm leading-relaxed">{c.mainCause}</p>}
                <p className="mt-auto pt-5 font-mono text-[11px] uppercase tracking-label text-fg-muted">
                  Launched {formatDateLabel(c.launchDate)} · {c.evidenceCount} evidence
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
