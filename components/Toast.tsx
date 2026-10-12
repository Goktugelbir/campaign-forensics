"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

type ToastFn = (message: string) => void;

const ToastContext = createContext<ToastFn>(() => {});

export function useToast(): ToastFn {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback<ToastFn>((msg) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(msg);
    timer.current = setTimeout(() => setMessage(null), 2600);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="no-print pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
        {message && (
          <div role="status" className="pointer-events-auto flex animate-fadein items-center gap-2 rounded-full border border-ink-strong bg-ink-raised px-4 py-2.5 text-sm text-fg shadow-2xl">
            <Check className="h-4 w-4 text-amber" aria-hidden />
            {message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
