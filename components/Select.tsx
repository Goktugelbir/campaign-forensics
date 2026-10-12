"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  /** Shown when the value matches no option (e.g. "Select…"). */
  placeholder?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  /** Classes for the wrapper — e.g. "w-full" in forms, "w-auto" in filter rows. */
  className?: string;
}

/**
 * Styled replacement for <select>, following the ARIA "select-only combobox" pattern:
 * a button (role=combobox) opening a listbox. Keyboard: ↑/↓, Home/End, Enter/Space, Esc, Tab, type-ahead.
 */
export function Select({ value, onChange, options, id, placeholder = "Select…", className = "w-full", ...aria }: Props) {
  const autoId = useId();
  const buttonId = id ?? `select-${autoId}`;
  const listId = `${buttonId}-listbox`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapper = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options[selectedIndex];

  const openList = (index = Math.max(0, selectedIndex)) => {
    setActive(index);
    setOpen(true);
  };
  const choose = (index: number) => {
    const o = options[index];
    if (o) onChange(o.value);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (wrapper.current && !wrapper.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  // Keep the active option in view while moving with the keyboard.
  useEffect(() => {
    if (!open) return;
    const el = list.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView?.({ block: "nearest" });
  }, [open, active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = options.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => Math.min(last, i + 1));
        return;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        return;
      case "Home":
        e.preventDefault();
        setActive(0);
        return;
      case "End":
        e.preventDefault();
        setActive(last);
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        return;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        return;
      case "Tab":
        setOpen(false);
        return;
    }
    // Type-ahead: jump to the first option starting with the typed letters.
    if (e.key.length === 1 && /\S/.test(e.key)) {
      const now = Date.now();
      typed.current = { text: (now - typed.current.at < 700 ? typed.current.text : "") + e.key.toLowerCase(), at: now };
      const hit = options.findIndex((o) => o.label.replace(/^#/, "").toLowerCase().startsWith(typed.current.text));
      if (hit >= 0) setActive(hit);
    }
  };

  return (
    <div ref={wrapper} className={`relative ${className}`}>
      <button
        id={buttonId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        {...aria}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`input flex items-center justify-between gap-3 text-left transition-colors hover:border-fg-muted ${
          open ? "border-amber" : ""
        } ${aria["aria-invalid"] ? "border-status-rejected" : ""}`}
      >
        <span className={`truncate ${selected ? "text-fg" : "text-fg-muted"}`}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-fg-muted transition-transform duration-200 ${open ? "rotate-180 text-amber" : ""}`} aria-hidden />
      </button>

      {open && (
        <ul
          ref={list}
          id={listId}
          role="listbox"
          aria-labelledby={buttonId}
          className="absolute left-0 z-30 mt-2 max-h-72 w-full min-w-[12rem] animate-fadein overflow-auto rounded-xl border border-ink-strong bg-ink-raised/95 p-1 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)] backdrop-blur"
        >
          {options.map((o, i) => {
            const isSelected = o.value === value;
            return (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()} // keep focus on the button
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  i === active ? "bg-ink-strong text-fg" : isSelected ? "text-fg" : "text-fg-body"
                }`}
              >
                <span className="truncate">{o.label}</span>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-amber" aria-hidden />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
