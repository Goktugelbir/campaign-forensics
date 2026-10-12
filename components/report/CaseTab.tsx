"use client";

import { useCallback, useState } from "react";
import { ArrowUpRight, Maximize2 } from "lucide-react";
import { hostOf, isImagePath } from "@/lib/assets";
import type { CaseBundle } from "@/lib/types";
import { Lightbox } from "../Lightbox";
import { InvestigationContract } from "./InvestigationContract";
import { InvestigationLog } from "./InvestigationLog";

export function CaseTab({ bundle }: { bundle: CaseBundle }) {
  const c = bundle.case;
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const closeZoom = useCallback(() => setZoom(null), []);
  const images = c.assets.filter((a) => isImagePath(a.url));
  const links = c.assets.filter((a) => !isImagePath(a.url));

  return (
    <div className="space-y-16">
    <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-10">
        <section>
          <p className="label-amber">Summary</p>
          <p className="mt-4 font-serif text-2xl leading-snug text-fg md:text-[28px]">{c.summary || "Summary pending."}</p>
        </section>

        {c.claim && (
          <section className="card border-l-2 border-l-amber p-6">
            <p className="label">What the brand claimed</p>
            <p className="mt-3 text-lg text-fg">{c.claim}</p>
          </section>
        )}

        {images.length > 0 && (
          <section>
            <p className="label-amber">Campaign assets</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {images.map((a) => (
                <figure key={a.url} className="card overflow-hidden">
                  <button
                    type="button"
                    className="group relative block w-full"
                    onClick={() => setZoom({ src: a.url, alt: a.label })}
                    aria-label={`Enlarge: ${a.label}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.url} alt={a.label} className="aspect-video w-full object-cover" />
                    <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-fg opacity-0 transition-opacity group-hover:opacity-100">
                      <Maximize2 className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </button>
                  <figcaption className="border-t border-ink-line px-4 py-3 text-xs">{a.label}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-8">
        <InvestigationContract bundle={bundle} />

        <section className="card p-6">
          <p className="label-amber">Key questions</p>
          <ol className="mt-4 space-y-4">
            {c.key_questions.map((q, i) => (
              <li key={q} className="flex gap-3">
                <span className="font-mono text-xs text-amber">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm leading-relaxed text-fg">{q}</span>
              </li>
            ))}
          </ol>
          {c.key_questions.length === 0 && <p className="mt-3 text-sm">Questions are set when the investigation starts.</p>}
        </section>

        <section className="card p-6">
          <p className="label-amber">Compared against</p>
          <ul className="mt-4 space-y-2.5">
            {c.comparison_targets.map((t) => (
              <li key={t} className="text-sm text-fg">
                — {t}
              </li>
            ))}
          </ul>
          {c.comparison_targets.length === 0 && <p className="mt-3 text-sm">No comparison targets.</p>}
        </section>

        {links.length > 0 && (
          <section className="card p-6">
            <p className="label-amber">Links</p>
            <ul className="mt-4 space-y-2.5">
              {links.map((a) => (
                <li key={a.url}>
                  <a href={a.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 text-sm text-fg hover:text-amber">
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    {a.label} <span className="text-fg-muted">· {hostOf(a.url)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      {zoom && <Lightbox src={zoom.src} alt={zoom.alt} onClose={closeZoom} />}
    </div>

    <InvestigationLog bundle={bundle} />
    </div>
  );
}
