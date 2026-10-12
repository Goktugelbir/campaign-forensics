"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";

export function Accordion({ items, defaultOpen = 0 }: { items: { q: string; a: string }[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const base = useId();
  return (
    <div className="divide-y divide-ink-line border-y border-ink-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        const btn = `${base}-q${i}`;
        const panel = `${base}-a${i}`;
        return (
          <div key={item.q}>
            <h3>
              <button
                id={btn}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left text-base text-fg transition-colors hover:text-amber md:text-lg"
              >
                {item.q}
                {isOpen ? <Minus className="h-4 w-4 shrink-0 text-amber" aria-hidden /> : <Plus className="h-4 w-4 shrink-0" aria-hidden />}
              </button>
            </h3>
            <div id={panel} role="region" aria-labelledby={btn} hidden={!isOpen} className="pb-6 pr-10 text-[15px] leading-relaxed">
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
