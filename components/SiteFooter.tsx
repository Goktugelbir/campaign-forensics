import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { listCases } from "@/lib/data";
import { CAMPAIGN_TYPE_LABEL } from "@/lib/format";
import { FOOTER_COLUMNS, LEGAL_LINKS, SITE } from "@/lib/site";
import { Logo } from "./Logo";

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <h2 className="label-amber">{title}</h2>
      <ul className="mt-5 space-y-3">{children}</ul>
    </nav>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="group inline-flex items-center text-sm text-fg-body transition-colors hover:text-fg">
        <span aria-hidden className="h-px w-0 bg-amber transition-all duration-200 group-hover:mr-2 group-hover:w-3" />
        {children}
      </Link>
    </li>
  );
}

export function SiteFooter() {
  const cases = listCases();

  return (
    <footer className="no-print relative mt-24 overflow-hidden border-t border-ink-line bg-gradient-to-b from-ink-surface/60 to-ink">
      {/* The logo's beam as a light line along the top edge. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber/70 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-40 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/[0.07] blur-3xl" />

      <div className="container-page relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.1fr_1.2fr] lg:gap-10">
        {/* Brand block */}
        <div className="md:col-span-2 lg:col-span-1">
          <Link href="/" className="inline-flex text-fg" aria-label={`${SITE.name} home`}>
            <Logo />
          </Link>
          <p className="mt-6 max-w-xs font-serif text-2xl leading-snug text-fg">{SITE.footerTagline}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">
            Public evidence, six tested explanations, one diagnosis — and the fixed campaign, produced.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/new" className="btn-primary btn-sm">
              Start a case <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <Link href="/cases" className="btn-ghost btn-sm">
              Sample reports
            </Link>
          </div>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <FooterColumn key={col.title} title={col.title}>
            {col.links.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </FooterColumn>
        ))}

        {cases.length > 0 && (
          <FooterColumn title="Case files">
            {cases.map((b) => (
              <li key={b.case.slug}>
                <Link href={`/cases/${b.case.slug}`} className="group block">
                  <span className="inline-flex items-center gap-1 text-sm text-fg-body transition-colors group-hover:text-fg">
                    {b.case.brand}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </span>
                  <span className="block font-mono text-[10px] uppercase tracking-label text-fg-muted">
                    {CAMPAIGN_TYPE_LABEL[b.case.campaign_type]} · {b.evidence?.evidence.length ?? 0} evidence
                  </span>
                </Link>
              </li>
            ))}
          </FooterColumn>
        )}

        <FooterColumn title="Legal">
          {LEGAL_LINKS.map((l) => (
            <FooterLink key={l.href} href={l.href}>
              {l.label}
            </FooterLink>
          ))}
        </FooterColumn>
      </div>

      <div className="relative border-t border-ink-line">
        {/* Extra bottom space so the floating buttons never sit on top of anything here. */}
        <div className="container-page flex flex-col gap-2 pb-28 pt-6 text-xs text-fg-muted md:flex-row md:items-center md:justify-between md:pb-8 md:pr-24">
          <p>
            © 2026 {SITE.name} · {SITE.builtWith}
          </p>
          <p>{SITE.brandDisclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
