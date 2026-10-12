"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { HEADER_CTA, HEADER_LINKS, SITE } from "@/lib/site";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  // Transparent over the top of the page (the landing hero shows through), solid once scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || open;

  return (
    <header
      className={`no-print sticky top-0 z-40 border-b transition-colors duration-300 ${
        solid ? "border-ink-line bg-ink/80 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center text-fg" aria-label={`${SITE.name} home`}>
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1 rounded-full border border-ink-line bg-ink-surface/60 p-1 backdrop-blur">
            {HEADER_LINKS.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition-colors ${
                      active
                        ? "bg-amber font-medium text-on-amber shadow-[0_4px_16px_-4px_rgba(245,166,35,0.6)]"
                        : "text-fg-body hover:bg-ink-raised/60 hover:text-fg"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
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
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-ink-line lg:hidden">
          <ul className="container-page flex flex-col gap-1 py-4">
            {HEADER_LINKS.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-base transition-colors ${
                      active ? "bg-amber font-medium text-on-amber" : "text-fg-body hover:bg-ink-raised/60 hover:text-fg"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
            <li className="mt-3">
              <Link href={HEADER_CTA.href} className="btn-primary w-full">
                {HEADER_CTA.label} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
