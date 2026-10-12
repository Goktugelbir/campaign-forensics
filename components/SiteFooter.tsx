import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FOOTER_LINKS, HEADER_CTA, LEGAL_LINKS, SITE } from "@/lib/site";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="no-print mt-24 border-t border-ink-line">
      <div className="container-page flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="text-fg" aria-label={`${SITE.name} home`}>
            <Logo />
          </Link>
          <p className="mt-3 max-w-xs text-sm text-fg-body">{SITE.footerTagline}</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {FOOTER_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-fg-body transition-colors hover:text-fg">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={HEADER_CTA.href} className="btn-primary btn-sm">
                {HEADER_CTA.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-ink-line">
        <div className="container-page space-y-3 py-6 text-xs text-fg-muted">
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col gap-1 md:flex-row md:justify-between">
            <p>© 2026 {SITE.name} · {SITE.builtWith}</p>
            <p>{SITE.brandDisclaimer}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
