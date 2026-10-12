"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { SOURCE_LABEL } from "@/lib/format";
import {
  collectTags,
  EMPTY_FILTERS,
  filterEvidence,
  isFiltered,
  presentSources,
  type EvidenceFilters,
} from "@/lib/evidence";
import type { CaseBundle, Sentiment } from "@/lib/types";
import { EvidenceCard } from "../EvidenceCard";
import { EmptyState } from "../EmptyState";
import { InProgress } from "./InProgress";
import { SentimentDistribution, SourceDistribution } from "./EvidenceCharts";
import type { FocusRequest } from "./ReportView";
import { Select } from "../Select";

const HIGHLIGHT_MS = 2000;

export function EvidenceTab({ bundle, focus }: { bundle: CaseBundle; focus: FocusRequest | null }) {
  const all = useMemo(() => bundle.evidence?.evidence ?? [], [bundle.evidence]);
  const [filters, setFilters] = useState<EvidenceFilters>(EMPTY_FILTERS);
  const [highlight, setHighlight] = useState<string | null>(null);

  const tags = useMemo(() => collectTags(all), [all]);
  const sources = useMemo(() => presentSources(all), [all]);
  const visible = useMemo(() => filterEvidence(all, filters), [all, filters]);

  // Jump to a card: clear filters that would hide it, scroll, flash for 2s.
  useEffect(() => {
    if (!focus) return;
    if (!all.some((e) => e.id === focus.id)) return;
    setFilters((f) => (filterEvidence(all, f).some((e) => e.id === focus.id) ? f : EMPTY_FILTERS));
    setHighlight(null);
    let timer: ReturnType<typeof setTimeout> | undefined;
    let raf2 = 0;
    // Two frames: the first lets a filter reset re-render the list, the second scrolls.
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        document.getElementById(focus.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlight(focus.id);
        timer = setTimeout(() => setHighlight(null), HIGHLIGHT_MS);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (timer) clearTimeout(timer);
    };
  }, [focus, all]);

  if (!bundle.evidence) return <InProgress step="Evidence" />;

  const set = <K extends keyof EvidenceFilters>(k: K, v: EvidenceFilters[K]) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <SourceDistribution evidence={all} />
        <SentimentDistribution evidence={all} />
      </div>

      <div className="no-print mt-8 flex flex-wrap items-center gap-3" role="search">
        <label className="relative min-w-[14rem] flex-1">
          <span className="sr-only">Search evidence</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" aria-hidden />
          <input
            type="search"
            className="input pl-9"
            placeholder="Search text, id or tag…"
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
          />
        </label>
        <Select
          aria-label="Filter by source"
          className="w-auto min-w-[10rem]"
          value={filters.source}
          onChange={(v) => set("source", v as EvidenceFilters["source"])}
          options={[{ value: "all", label: "All sources" }, ...sources.map((s) => ({ value: s, label: SOURCE_LABEL[s] }))]}
        />
        <Select
          aria-label="Filter by sentiment"
          className="w-auto min-w-[10rem]"
          value={filters.sentiment}
          onChange={(v) => set("sentiment", v as Sentiment | "all")}
          options={[
            { value: "all", label: "All sentiment" },
            { value: "negative", label: "Negative" },
            { value: "neutral", label: "Neutral" },
            { value: "positive", label: "Positive" },
          ]}
        />
        <Select
          aria-label="Filter by tag"
          className="w-auto min-w-[12rem]"
          value={filters.tag}
          onChange={(v) => set("tag", v)}
          options={[{ value: "all", label: "All tags" }, ...tags.map((t) => ({ value: t.tag, label: `#${t.tag} (${t.count})` }))]}
        />
        {isFiltered(filters) && (
          <button type="button" className="text-xs text-amber hover:underline" onClick={() => setFilters(EMPTY_FILTERS)}>
            Clear filters
          </button>
        )}
      </div>

      <p className="mt-4 font-mono text-[11px] uppercase tracking-label text-fg-muted" aria-live="polite">
        Showing {visible.length} of {all.length}
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {visible.map((e) => (
          <EvidenceCard key={e.id} evidence={e} caseSlug={bundle.case.slug} highlighted={highlight === e.id} />
        ))}
      </div>
      {visible.length === 0 && (
        <EmptyState
          compact
          icon={SearchX}
          title="No evidence matches these filters"
          action={{ label: "Clear filters", onClick: () => setFilters(EMPTY_FILTERS) }}
        />
      )}

      <p className="mt-8 text-xs">
        <Link href="/legal/data-sources" className="text-fg-body underline underline-offset-4 hover:text-fg">
          How we handle public data →
        </Link>
      </p>
    </div>
  );
}
