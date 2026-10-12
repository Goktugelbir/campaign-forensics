"use client";

import { useMemo, useState } from "react";
import { FolderOpen, SearchX } from "lucide-react";
import { CAMPAIGN_TYPE_LABEL, STATUS_LABEL, STATUS_ORDER } from "@/lib/format";
import type { CampaignType, CaseStatus } from "@/lib/types";
import type { CaseSummary } from "@/lib/caseSummary";
import { CaseCard } from "./CaseCard";
import { EmptyState } from "./EmptyState";
import { Select } from "./Select";

export type { CaseSummary };

/** Filters only earn their place once the list is long enough to need them. */
export const FILTER_THRESHOLD = 4;

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
      {cases.length >= FILTER_THRESHOLD && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Select
            aria-label="Filter by type"
            className="w-auto min-w-[10rem]"
            value={type}
            onChange={(v) => setType(v as CampaignType | "all")}
            options={[{ value: "all", label: "All types" }, ...types.map((t) => ({ value: t, label: CAMPAIGN_TYPE_LABEL[t] }))]}
          />
          <Select
            aria-label="Filter by status"
            className="w-auto min-w-[10rem]"
            value={status}
            onChange={(v) => setStatus(v as CaseStatus | "all")}
            options={[{ value: "all", label: "All statuses" }, ...statuses.map((s) => ({ value: s, label: STATUS_LABEL[s] }))]}
          />
          <span className="font-mono text-[11px] uppercase tracking-label text-fg-muted">
            {visible.length} of {cases.length}
          </span>
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState
          compact
          icon={SearchX}
          title="No cases match these filters"
          action={{
            label: "Clear filters",
            onClick: () => {
              setType("all");
              setStatus("all");
            },
          }}
        />
      ) : (
        <ul className={`grid gap-4 md:grid-cols-2 ${visible.length >= 3 ? "lg:grid-cols-3" : ""}`}>
          {visible.map((c) => (
            <li key={c.slug}>
              <CaseCard c={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
