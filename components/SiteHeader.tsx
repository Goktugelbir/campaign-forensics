"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { HEADER_CTA, HEADER_LINKS, SITE } from "@/lib/site";
import { Logo } from "./Logo";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-ink-line bg-ink/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 text-fg" aria-label={`${SITE.name} home`}>
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {HEADER_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(pathname, l.href) ? "page" : undefined}
              className={`text-sm transition-colors hover:text-fg ${isActive(pathname, l.href) ? "text-fg" : "text-fg-body"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href={HEADER_CTA.href} className="btn-primary btn-sm hidden sm:inline-flex">
            {HEADER_CTA.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-strong text-fg lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-ink-line bg-ink lg:hidden">
          <div className="container-page flex flex-col py-3">
            {HEADER_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="py-2.5 text-fg">
                {l.label}
              </Link>
            ))}
            <Link href={HEADER_CTA.href} className="btn-primary mt-3 w-full">
              {HEADER_CTA.label} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
