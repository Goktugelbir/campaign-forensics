import Link from "next/link";
import { FOOTER_COLUMNS, SITE } from "@/lib/site";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="no-print mt-24 border-t border-ink-line">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="text-fg">
            <Logo />
          </Link>
          <p className="mt-4 max-w-xs font-serif text-lg leading-snug text-fg-body">{SITE.footerTagline}</p>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="label">{col.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-fg-body transition-colors hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-ink-line">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-fg-muted md:flex-row md:items-center md:justify-between">
          <p>© 2026 {SITE.name} · {SITE.builtWith}</p>
          <p>{SITE.brandDisclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
