"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Heart, MessageSquare, Eye } from "lucide-react";
import { compactNumber, formatDateLabel, SOURCE_LABEL, truncate } from "@/lib/format";
import type { Evidence } from "@/lib/types";
import { SourceIcon } from "./SourceIcon";

export const EVIDENCE_TEXT_LIMIT = 500;

const TRANSLATED_FROM: Partial<Record<Evidence["lang"], string>> = { tr: "Translated from Turkish", other: "Translated" };

const SENTIMENT_DOT: Record<NonNullable<Evidence["sentiment"]>, string> = {
  negative: "bg-status-rejected",
  neutral: "bg-status-uncertain",
  positive: "bg-status-confirmed",
};

interface Props {
  evidence: Evidence;
  caseSlug?: string;
  highlighted?: boolean;
  /** Landing preview: no metrics, no report link. */
  compact?: boolean;
}

/**
 * One piece of evidence. Never renders usernames, avatars or profile links —
 * the only link goes to the post / article itself.
 */
export function EvidenceCard({ evidence: e, caseSlug, highlighted, compact }: Props) {
  const [expanded, setExpanded] = useState(false);
  // Non-English items are shown in English only; the original stays in evidence.json for the record.
  const body = e.text_en ?? e.text;
  const { text, truncated } = truncate(body, EVIDENCE_TEXT_LIMIT);
  const shown = expanded ? body : text;
  const m = e.metrics ?? {};

  return (
    <article
      id={e.id}
      data-evidence-id={e.id}
      aria-label={`Evidence ${e.id}`}
      className={`card scroll-mt-48 p-5 transition-colors hover:border-ink-strong ${highlighted ? "animate-flash" : ""}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] uppercase tracking-label text-fg-muted">
          <span className="text-amber">{e.id}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1.5 text-fg-body">
            <SourceIcon source={e.source} />
            {SOURCE_LABEL[e.source] ?? e.source}
          </span>
          <span aria-hidden>·</span>
          <time dateTime={e.date ?? undefined}>{formatDateLabel(e.date)}</time>
          {e.text_en && (
            <>
              <span aria-hidden>·</span>
              <span title="Translated with AI; the original is kept in the case file">{TRANSLATED_FROM[e.lang] ?? "Translated"}</span>
            </>
          )}
        </div>
        <a
          href={e.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-label text-fg-body hover:text-amber"
        >
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /> Open source
        </a>
      </header>

      <blockquote className="mt-3 text-[15px] leading-relaxed text-fg">“{shown}”</blockquote>
      {truncated && (
        <button
          type="button"
          onClick={() => setExpanded((x) => !x)}
          className="mt-1.5 text-xs text-amber hover:underline"
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {e.sentiment && (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-label text-fg-muted">
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${SENTIMENT_DOT[e.sentiment]}`} />
              {e.sentiment}
            </span>
          )}
          {(e.tags ?? []).map((t) => (
            <span key={t} className="font-mono text-[11px] text-fg-body">
              #{t}
            </span>
          ))}
        </div>
        {!compact && (
          <div className="flex items-center gap-3 font-mono text-[11px] text-fg-muted">
            {m.likes != null && m.likes > 0 && (
              <span className="inline-flex items-center gap-1" title="Likes">
                <Heart className="h-3 w-3" aria-hidden />
                {compactNumber(m.likes)}
              </span>
            )}
            {m.replies != null && m.replies > 0 && (
              <span className="inline-flex items-center gap-1" title="Replies">
                <MessageSquare className="h-3 w-3" aria-hidden />
                {compactNumber(m.replies)}
              </span>
            )}
            {m.views != null && m.views > 0 && (
              <span className="inline-flex items-center gap-1" title="Views">
                <Eye className="h-3 w-3" aria-hidden />
                {compactNumber(m.views)}
              </span>
            )}
          </div>
        )}
      </footer>

      {!compact && (
        <div className="mt-3 border-t border-ink-line pt-3">
          <Link
            href={`/legal/data-request?evidence=${encodeURIComponent(e.id)}${caseSlug ? `&case=${encodeURIComponent(caseSlug)}` : ""}`}
            className="text-[11px] text-fg-muted hover:text-fg-body"
          >
            Report this evidence
          </Link>
        </div>
      )}
    </article>
  );
}
