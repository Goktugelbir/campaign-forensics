"use client";

import { Clapperboard } from "lucide-react";
import { isImagePath, isVideoPath } from "@/lib/assets";
import type { CaseBundle, CreativeAsset, CreativeBrief } from "@/lib/types";
import { CompareSlider } from "../CompareSlider";
import { EmptyState } from "../EmptyState";
import { InProgress } from "./InProgress";
import { EvidenceIdList } from "./ReportNav";

const BRIEF_FIELDS: { key: Exclude<keyof CreativeBrief, "scenes">; label: string }[] = [
  { key: "concept", label: "Concept" },
  { key: "message", label: "Message" },
  { key: "audience", label: "Audience" },
  { key: "tone", label: "Tone" },
  { key: "visual_direction", label: "Visual direction" },
  { key: "cta", label: "CTA" },
];

/** The "before" visual: the case image labelled as the new/launched one, else the last case image. */
export function pickBeforeImage(bundle: CaseBundle): { src: string; label: string } | null {
  const imgs = bundle.case.assets.filter((a) => isImagePath(a.url));
  const launched = imgs.find((a) => /new|launch/i.test(a.label)) ?? imgs[imgs.length - 1];
  return launched ? { src: launched.url, label: launched.label } : null;
}

export function RelaunchTab({ bundle }: { bundle: CaseBundle }) {
  const d = bundle.diagnosis;
  if (!d) return <InProgress step="Relaunch" />;

  const brand = bundle.case.brand;
  const assets = bundle.creative?.assets ?? [];
  const images = assets.filter((a) => a.kind === "image" && a.path);
  const videos = assets.filter((a) => a.kind === "video");
  const before = pickBeforeImage(bundle);
  const after = images[0];

  return (
    <div className="space-y-14">
      <section aria-labelledby="prescription">
        <p className="label-amber">Prescription</p>
        <h2 id="prescription" className="heading-serif mt-3 text-3xl md:text-4xl">
          What to change, and why.
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-2">
          {d.prescription.map((p, i) => (
            <li key={p.change} className="card flex flex-col gap-3 p-6">
              <span className="font-mono text-sm text-amber">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-lg leading-snug text-fg">{p.change}</p>
              <p className="text-sm leading-relaxed">{p.why}</p>
              <div className="mt-auto pt-2">
                <EvidenceIdList ids={p.evidence_ids} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="brief" className="card p-6 md:p-8">
        <h2 id="brief" className="label-amber">
          Creative brief
        </h2>
        <dl className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
          {BRIEF_FIELDS.map((f) => (
            <div key={f.key}>
              <dt className="label">{f.label}</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-fg">{d.creative_brief[f.key]}</dd>
            </div>
          ))}
          <div className="md:col-span-2">
            <dt className="label">Scenes</dt>
            <dd>
              <ol className="mt-3 grid gap-3 md:grid-cols-2">
                {d.creative_brief.scenes.map((s, i) => (
                  <li key={s} className="flex gap-3 rounded-lg border border-ink-line p-4">
                    <span className="font-mono text-xs text-amber">S{i + 1}</span>
                    <span className="text-sm leading-relaxed text-fg">{s}</span>
                  </li>
                ))}
              </ol>
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="produced">
        <p className="label-amber">Produced creative</p>
        <h2 id="produced" className="heading-serif mt-3 text-3xl md:text-4xl">
          The relaunch.
        </h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {/* creative.json order is the presentation order (concept, video, supporting frames). */}
          {assets
            .filter((a) => a.kind === "video" || a.path)
            .map((a) =>
              a.kind === "video" ? (
                <VideoAsset key={a.label + a.path} asset={a} brand={brand} />
              ) : (
                <ImageAsset key={a.path} asset={a} brand={brand} />
              ),
            )}
          {images.length === 0 && videos.length === 0 && (
            <EmptyState compact icon={Clapperboard} title="Creative in production" description="The concept and relaunch video appear here when step 3 finishes." />
          )}
        </div>
      </section>

      {before && after && (
        <section aria-labelledby="compare">
          <p className="label-amber">Side by side</p>
          <h2 id="compare" className="heading-serif mt-3 text-3xl md:text-4xl">
            Launched vs. revised.
          </h2>
          <div className="mt-6 max-w-4xl">
            <CompareSlider before={before} after={{ src: after.path, label: after.label }} />
          </div>
        </section>
      )}

      <section aria-labelledby="before-after">
        <p className="label-amber">Before / After</p>
        <h2 id="before-after" className="heading-serif mt-3 text-3xl md:text-4xl">
          What changes.
        </h2>
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-line">
                <th scope="col" className="label px-5 py-3 font-normal">Dimension</th>
                <th scope="col" className="label px-5 py-3 font-normal">Before</th>
                <th scope="col" className="label-amber px-5 py-3 font-normal">After</th>
              </tr>
            </thead>
            <tbody>
              {d.before_after.map((r) => (
                <tr key={r.dimension} className="border-b border-ink-line last:border-0">
                  <th scope="row" className="px-5 py-4 align-top font-medium text-fg">{r.dimension}</th>
                  <td className="px-5 py-4 align-top">{r.before}</td>
                  <td className="px-5 py-4 align-top text-fg">{r.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ConceptNote({ brand }: { brand: string }) {
  return <p className="text-xs text-fg-muted">Concept based on diagnosis — not an official {brand} design.</p>;
}

function ImageAsset({ asset, brand }: { asset: CreativeAsset; brand: string }) {
  return (
    <figure className="card overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset.path} alt={asset.label} className="aspect-video w-full object-cover" />
      <figcaption className="space-y-1 border-t border-ink-line px-5 py-4">
        <p className="text-sm text-fg">{asset.label}</p>
        <ConceptNote brand={brand} />
        <p className="font-mono text-[10px] uppercase tracking-label text-fg-muted">
          {asset.tool}
          {asset.model ? ` · ${asset.model}` : ""}
        </p>
      </figcaption>
    </figure>
  );
}

function VideoAsset({ asset, brand }: { asset: CreativeAsset; brand: string }) {
  const playable = asset.path && isVideoPath(asset.path);
  return (
    <figure className="card overflow-hidden">
      {playable ? (
        <video src={asset.path} controls playsInline preload="metadata" className="aspect-video w-full bg-black" />
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-ink-raised text-center">
          <Clapperboard className="h-6 w-6 text-amber" aria-hidden />
          <p className="font-serif text-2xl text-fg">Relaunch video in production</p>
          <p className="text-xs">Rendered from the approved concept, one clip per scene.</p>
        </div>
      )}
      <figcaption className="space-y-1 border-t border-ink-line px-5 py-4">
        <p className="text-sm text-fg">{asset.label}</p>
        <ConceptNote brand={brand} />
      </figcaption>
    </figure>
  );
}
