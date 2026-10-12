"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Mail } from "lucide-react";
import { SITE } from "@/lib/site";
import { Select } from "./Select";

export const REQUEST_TYPES = ["Information", "Correction", "Deletion", "Remove evidence", "Objection"] as const;

/** Builds the mailto: link. No backend, so nothing is stored by the site. */
export function buildDataRequestMailto(v: { type: string; reference: string; description: string }, to = SITE.contactEmail): string {
  const subject = `Data request: ${v.type}${v.reference ? ` — ${v.reference}` : ""}`;
  const body = [`Request type: ${v.type}`, `Report link or evidence ID: ${v.reference || "—"}`, "", v.description].join("\n");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function Inner() {
  const params = useSearchParams();
  const prefill = [params.get("case") && `/cases/${params.get("case")}`, params.get("evidence")].filter(Boolean).join(" · ");
  const [type, setType] = useState<string>(params.get("evidence") ? "Remove evidence" : "Information");
  const [reference, setReference] = useState(prefill);
  const [description, setDescription] = useState("");

  return (
    <form
      className="card mt-12 space-y-5 p-6 md:p-8"
      aria-label="Data request"
      onSubmit={(e) => {
        e.preventDefault();
        window.location.href = buildDataRequestMailto({ type, reference, description });
      }}
    >
      <p className="label-amber">Send a request</p>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="text-sm text-fg">
          <span id="data-request-type-label">Request type</span>
          <Select
            className="mt-2 w-full"
            aria-labelledby="data-request-type-label"
            value={type}
            onChange={setType}
            options={REQUEST_TYPES.map((t) => ({ value: t, label: t }))}
          />
        </div>
        <label className="block text-sm text-fg">
          Report link or evidence ID
          <input className="input mt-2" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. ev_014" />
        </label>
      </div>
      <label className="block text-sm text-fg">
        Description
        <textarea className="input mt-2" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What should we do, and why?" />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-fg-muted">Opens your e-mail app with these fields filled in. We reply within 30 days at the latest.</p>
        <button type="submit" className="btn-primary">
          <Mail className="h-4 w-4" aria-hidden /> Write the e-mail
        </button>
      </div>
      <p className="text-xs text-fg-muted">
        Or write directly to <span className="text-fg">{SITE.contactEmail}</span>.
      </p>
    </form>
  );
}

export function DataRequestForm() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
