"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export type Theme = "dark" | "light";

/** localStorage key for the theme choice — disclosed on the Cookie Policy page. */
export const THEME_KEY = "cf-theme";

/**
 * Runs inline in <head> before the first paint, so a saved light theme never flashes dark.
 * Dark is the default; only an explicit choice changes it.
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private mode or blocked storage: the switch still works for this visit.
  }
}

/** Sliding switch: the knob slides between the moon (dark) and the sun (light). */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  // The inline script may already have applied a saved theme — read it after mount.
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  const light = theme === "light";
  const toggle = () => {
    const next: Theme = light ? "dark" : "light";
    applyTheme(next);
    setTheme(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={light}
      aria-label="Light theme"
      title={light ? "Switch to dark theme" : "Switch to light theme"}
      onClick={toggle}
      className={`relative inline-flex h-8 w-[3.75rem] shrink-0 items-center rounded-full border border-ink-strong bg-ink-surface/80 p-1 transition-colors hover:border-fg-muted ${className}`}
    >
      {/* Track icons: the inactive side shows faintly behind the knob's travel. */}
      <Moon aria-hidden className={`absolute left-2 h-3.5 w-3.5 transition-opacity ${light ? "opacity-40 text-fg-muted" : "opacity-0"}`} />
      <Sun aria-hidden className={`absolute right-2 h-3.5 w-3.5 transition-opacity ${light ? "opacity-0" : "opacity-40 text-fg-muted"}`} />
      {/* Knob */}
      <span
        aria-hidden
        className={`relative z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber text-on-amber shadow-[0_2px_8px_rgb(0_0_0/0.25)] transition-transform duration-300 ease-out ${
          light ? "translate-x-[26px]" : "translate-x-0"
        }`}
      >
        {light ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}
