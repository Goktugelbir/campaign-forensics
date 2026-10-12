"use client";

import { useState } from "react";

interface Props {
  before: { src: string; label: string };
  after: { src: string; label: string };
}

/** Before/after wipe. Keyboard accessible through the native range input. */
export function CompareSlider({ before, after }: Props) {
  const [pos, setPos] = useState(50);
  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-video select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={after.src} alt={after.label} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={before.src} alt={before.label} className="h-full w-full object-cover" draggable={false} />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 bg-amber" style={{ left: `${pos}%` }} />
        <span className="label absolute left-3 top-3 rounded bg-black/70 px-2 py-1 text-white">Before</span>
        <span className="label absolute right-3 top-3 rounded bg-black/70 px-2 py-1 text-[#f5a623]">After</span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Compare before and after"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <div className="flex justify-between border-t border-ink-line px-4 py-3 text-xs">
        <span>{before.label}</span>
        <span className="text-fg">{after.label}</span>
      </div>
    </div>
  );
}
