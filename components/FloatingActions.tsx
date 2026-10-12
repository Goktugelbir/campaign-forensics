"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, FilePlus2, FolderOpen, MessageSquare, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Back-to-top appears only after this much scrolling. */
export const BACK_TO_TOP_AFTER = 400;

const ACTIONS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Start a case", href: "/new", icon: FilePlus2 },
  { label: "Sample reports", href: "/cases", icon: FolderOpen },
  { label: "Contact us", href: "/contact", icon: MessageSquare },
];

/**
 * One floating group in the bottom-right corner, above the safe-area inset:
 * back-to-top (past 400 px) on top, then the speed-dial FAB. Add a chat launcher here
 * if one is ever needed, so nothing else floats over the page.
 */
export function FloatingActions() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const group = useRef<HTMLDivElement>(null);
  const firstAction = useRef<HTMLAnchorElement>(null);
  const fab = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > BACK_TO_TOP_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on Escape (focus back to the FAB) and on any click outside the group.
  useEffect(() => {
    if (!open) return;
    firstAction.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        fab.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (group.current && !group.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const toTop = () => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div
      ref={group}
      className="no-print fixed right-4 z-40 flex flex-col items-end gap-3 sm:right-6"
      style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
    >
      {showTop && !open && (
        <button
          type="button"
          onClick={toTop}
          aria-label="Back to top"
          className="flex h-10 w-10 animate-fadein items-center justify-center rounded-full border border-ink-strong bg-ink-raised/90 text-fg shadow-lg backdrop-blur transition-colors hover:border-fg-muted"
        >
          <ArrowUp className="h-4 w-4" aria-hidden />
        </button>
      )}

      {open && (
        <ul id="quick-actions" aria-label="Quick actions" className="flex flex-col items-end gap-2.5">
          {ACTIONS.map((a, i) => (
            <li key={a.href} className="animate-fadein">
              <Link
                ref={i === 0 ? firstAction : undefined}
                href={a.href}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3"
              >
                <span className="rounded-full border border-ink-strong bg-ink-raised/95 px-3 py-1.5 text-sm text-fg shadow-lg backdrop-blur">
                  {a.label}
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-strong bg-ink-raised text-amber shadow-lg transition-colors group-hover:border-amber">
                  <a.icon className="h-4 w-4" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <button
        ref={fab}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close quick actions" : "Open quick actions"}
        aria-expanded={open}
        aria-controls="quick-actions"
        className="flex h-14 w-14 items-center justify-center hover-bright rounded-full bg-amber text-white shadow-[0_12px_32px_-8px_rgba(245,166,35,0.6)] transition-colors hover:bg-[#ffb94a]"
      >
        <Plus
          className={`h-6 w-6 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)] transition-transform duration-200 ${open ? "rotate-45" : ""}`}
          strokeWidth={2.75}
          aria-hidden
        />
      </button>
    </div>
  );
}
