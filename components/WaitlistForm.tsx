"use client";

import Link from "next/link";
import { useState } from "react";
import { useToast } from "./Toast";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * No backend: submitting only shows a thank-you. The marketing opt-in is a
 * separate, unticked box (KVKK: information ≠ consent).
 */
export function WaitlistForm() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [updates, setUpdates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setError("Enter a valid e-mail address.");
      return;
    }
    setError(null);
    setDone(true);
    toast("Thanks — you're on the list");
  };

  if (done) {
    return (
      <div className="card p-6" role="status">
        <p className="font-serif text-2xl text-fg">Thanks — you&apos;re on the list.</p>
        <p className="mt-2 text-sm">We&apos;ll be in touch as we onboard the next group of teams.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4" aria-label="Join the waitlist">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">E-mail</span>
          <input
            type="email"
            className="input py-3"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            aria-invalid={!!error}
            aria-describedby={error ? "waitlist-error" : undefined}
          />
        </label>
        <button type="submit" className="btn-primary py-3">
          Join the waitlist
        </button>
      </div>
      {error && (
        <p id="waitlist-error" className="text-xs text-status-rejected">
          {error}
        </p>
      )}
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-amber" checked={updates} onChange={(e) => setUpdates(e.target.checked)} />
        <span>Send me product updates by e-mail. I can unsubscribe anytime.</span>
      </label>
      <p className="text-xs text-fg-muted">
        By joining you acknowledge our{" "}
        <Link href="/legal/privacy" className="underline underline-offset-4 hover:text-fg">Privacy Policy</Link> and{" "}
        <Link href="/legal/kvkk" className="underline underline-offset-4 hover:text-fg">KVKK Notice</Link>.
      </p>
    </form>
  );
}
