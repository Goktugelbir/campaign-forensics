import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS } from "@/content/pricing";

export function PricingCards() {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <div key={p.name} className={`card relative flex flex-col p-7 ${p.popular ? "border-amber/60" : ""}`}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-medium text-fg">{p.name}</h3>
              {p.popular && (
                <span className="rounded-md bg-amber px-2 py-0.5 font-mono text-[10px] uppercase tracking-label text-on-amber">Most popular</span>
              )}
            </div>
            <p className="mt-5 flex items-baseline gap-1.5">
              <span className="heading-serif text-5xl">{p.price}</span>
              {p.unit && <span className="text-sm text-fg-muted">{p.unit}</span>}
            </p>
            <p className="mt-3 text-sm">{p.description}</p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden />
                  <span className="text-fg">{f}</span>
                </li>
              ))}
              {(p.roadmap ?? []).map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-fg-muted" aria-hidden />
                  <span>
                    {f} <span className="ml-1 rounded border border-ink-strong px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-label text-fg-muted">Roadmap</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link href={p.cta.href} className={`${p.popular ? "btn-primary" : "btn-ghost"} mt-8`}>
              {p.cta.label}
            </Link>
          </div>
        ))}
      </div>
      <p className="mt-5 font-mono text-[11px] uppercase tracking-label text-fg-muted">Prices in US dollars · may change</p>
    </div>
  );
}
