"use client";

import Link from "next/link";
import { cloneElement, useState } from "react";
import { AlertTriangle, ArrowRight, Check, Download, Plus, Trash2 } from "lucide-react";
import {
  buildCaseDraft,
  EMPTY_FORM,
  validateCaseForm,
  type CaseFormValues,
  type FormErrors,
} from "@/lib/caseDraft";
import { FEATURED_CASE_SLUG } from "@/lib/site";
import type { Case } from "@/lib/types";
import { downloadJson } from "./report/ReportHeader";
import { Select } from "./Select";

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const MAX_URLS = 5;

export function NewCaseForm({ today = todayIso() }: { today?: string }) {
  const [values, setValues] = useState<CaseFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [draft, setDraft] = useState<Case | null>(null);

  const { warnings } = validateCaseForm(values, today);

  const update = <K extends keyof CaseFormValues>(k: K, v: CaseFormValues[K]) => {
    const next = { ...values, [k]: v };
    setValues(next);
    if (submitted) setErrors(validateCaseForm(next, today).errors);
  };

  const setUrl = (i: number, v: string) => update("urls", values.urls.map((u, j) => (j === i ? v : u)));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const result = validateCaseForm(values, today);
    setErrors(result.errors);
    if (!result.valid) {
      const first = Object.keys(result.errors)[0]?.replace(".", "-");
      if (first) document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setDraft(buildCaseDraft(values));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setDraft(null);
    setValues(EMPTY_FORM);
    setSubmitted(false);
    setErrors({});
  };

  if (draft) return <Queued draft={draft} onReset={reset} />;

  return (
    <form noValidate onSubmit={onSubmit} className="card space-y-7 p-6 md:p-10" aria-label="New case">
      <div className="grid gap-6 md:grid-cols-2">
        <Field id="f-brand" label="Brand" required error={errors.brand}>
          <input id="f-brand" className="input" value={values.brand} onChange={(e) => update("brand", e.target.value)} placeholder="e.g. Northwind Coffee" autoComplete="organization" />
        </Field>
        <Field id="f-campaign" label="Campaign name" required error={errors.campaign}>
          <input id="f-campaign" className="input" value={values.campaign} onChange={(e) => update("campaign", e.target.value)} placeholder="e.g. Logo refresh" />
        </Field>
        <Field id="f-campaign_type" label="Campaign type" required error={errors.campaign_type}>
          <Select
            id="f-campaign_type"
            value={values.campaign_type}
            onChange={(v) => update("campaign_type", v as CaseFormValues["campaign_type"])}
            options={[
              { value: "ad", label: "Ad" },
              { value: "rebrand", label: "Rebrand" },
              { value: "launch", label: "Launch" },
              { value: "other", label: "Other" },
            ]}
          />
        </Field>
        <Field
          id="f-launch_date"
          label="Launch date"
          required
          help={!errors.launch_date && !warnings.launch_date ? "Year-month-day, e.g. 2026-08-14." : undefined}
          error={errors.launch_date}
          warning={!errors.launch_date ? warnings.launch_date : undefined}
        >
          {/* A text field, not type="date": the native picker shows its placeholder in the browser's language. */}
          <input
            id="f-launch_date"
            type="text"
            inputMode="numeric"
            placeholder="YYYY-MM-DD"
            maxLength={10}
            autoComplete="off"
            className="input font-mono"
            value={values.launch_date}
            onChange={(e) => update("launch_date", e.target.value.trim())}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="text-sm text-fg">
          Campaign URL(s) <span className="text-amber">*</span>
        </legend>
        <p className="mt-1 text-xs text-fg-muted">The announcement post, the ad, the press release — anything public.</p>
        <div className="mt-3 space-y-2.5">
          {values.urls.map((u, i) => (
            <div key={i}>
              <div className="flex gap-2">
                <input
                  id={`f-urls-${i}`}
                  type="url"
                  inputMode="url"
                  className="input"
                  value={u}
                  onChange={(e) => setUrl(i, e.target.value)}
                  placeholder="https://"
                  aria-label={`Campaign URL ${i + 1}`}
                  aria-invalid={!!errors[`urls.${i}`]}
                  aria-describedby={errors[`urls.${i}`] ? `f-urls-${i}-error` : undefined}
                />
                {values.urls.length > 1 && (
                  <button type="button" className="btn-ghost btn-sm shrink-0" aria-label={`Remove URL ${i + 1}`} onClick={() => update("urls", values.urls.filter((_, j) => j !== i))}>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                )}
              </div>
              {errors[`urls.${i}`] && (
                <p id={`f-urls-${i}-error`} className="mt-1.5 text-xs text-status-rejected">
                  {errors[`urls.${i}`]}
                </p>
              )}
            </div>
          ))}
        </div>
        {values.urls.length < MAX_URLS && (
          <button type="button" className="mt-3 inline-flex items-center gap-1.5 text-xs text-amber hover:underline" onClick={() => update("urls", [...values.urls, ""])}>
            <Plus className="h-3.5 w-3.5" aria-hidden /> Add another URL
          </button>
        )}
      </fieldset>

      <Field id="f-claim" label="What did the brand want to achieve?" error={errors.claim}>
        <textarea id="f-claim" rows={3} className="input" value={values.claim} onChange={(e) => update("claim", e.target.value)} placeholder="The claim or goal behind the campaign." />
      </Field>

      <div className="grid gap-6 md:grid-cols-2">
        <Field id="f-competitors" label="Competitors / comparison" optional help="Separate names with commas." error={errors.competitors}>
          <input id="f-competitors" className="input" value={values.competitors} onChange={(e) => update("competitors", e.target.value)} placeholder="Previous version, rival brands…" />
        </Field>
        <Field id="f-email" label="Your e-mail for the report" optional help="Only used to send this report." error={errors.email}>
          <input id="f-email" type="email" className="input" value={values.email} onChange={(e) => update("email", e.target.value)} placeholder="you@agency.com" autoComplete="email" />
        </Field>
      </div>

      <div>
        <label className="checkbox-row">
          <input
            id="f-authorized"
            type="checkbox"
            className="checkbox"
            checked={values.authorized}
            onChange={(e) => update("authorized", e.target.checked)}
            aria-invalid={!!errors.authorized}
            aria-describedby={errors.authorized ? "f-authorized-error" : undefined}
          />
          <span>
            I confirm I am authorized to request this analysis and have read the{" "}
            <Link href="/legal/gdpr" className="link-amber" target="_blank">GDPR notice</Link> and{" "}
            <Link href="/legal/terms" className="link-amber" target="_blank">Terms</Link>. <span className="text-amber">*</span>
          </span>
        </label>
        {errors.authorized && (
          <p id="f-authorized-error" className="mt-1.5 pl-7 text-xs text-status-rejected">
            {errors.authorized}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink-line pt-6">
        <p className="text-xs text-fg-muted">
          We only use public signals. No ad-account access. Your e-mail is used only to send this report; it is not stored in the case file.
        </p>
        <button type="submit" className="btn-primary">
          Start investigation <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  optional,
  help,
  error,
  warning,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  /** Small "Optional" tag on the label row — kept to one line so side-by-side fields stay aligned. */
  optional?: boolean;
  /** Helper text under the input. */
  help?: string;
  error?: string;
  warning?: string;
  children: React.ReactElement<{ "aria-invalid"?: boolean | "true" | "false"; "aria-describedby"?: string }>;
}) {
  const describedBy = error ? `${id}-error` : warning ? `${id}-warning` : undefined;
  const child = cloneElement(children, { "aria-invalid": !!error, "aria-describedby": describedBy });
  return (
    <div>
      <label htmlFor={id} className="flex min-h-[1.5rem] items-center justify-between gap-3 text-sm text-fg">
        <span className="truncate">
          {label} {required && <span className="text-amber">*</span>}
        </span>
        {optional && (
          <span className="shrink-0 rounded-full border border-ink-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-label text-fg-muted">
            Optional
          </span>
        )}
      </label>
      <div className="mt-2">{child}</div>
      {help && !error && <p className="mt-1.5 text-xs text-fg-muted">{help}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-status-rejected">
          {error}
        </p>
      )}
      {warning && (
        <p id={`${id}-warning`} className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-amber">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> {warning}
        </p>
      )}
    </div>
  );
}

const STEPS = [
  { name: "Evidence", desc: "Public reactions collected and anonymised." },
  { name: "Diagnosis", desc: "Six hypotheses tested against the evidence." },
  { name: "Relaunch", desc: "Prescription, brief and the produced concept." },
];

function Queued({ draft, onReset }: { draft: Case; onReset: () => void }) {
  return (
    <div className="space-y-6" role="status" aria-live="polite">
      <div className="card p-6 md:p-10">
        <p className="label-amber">Investigation queued</p>
        <h2 className="heading-serif mt-4 text-4xl md:text-5xl">
          {draft.brand} — {draft.campaign}
        </h2>
        <p className="mt-4 text-sm">
          Typical turnaround: <span className="text-fg">under 48 hours</span>. We&apos;ll start from the case file below.
        </p>

        <ol className="mt-8 grid gap-3 md:grid-cols-3" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s.name} className={`rounded-lg border p-4 ${i === 0 ? "border-amber/60 bg-amber/5" : "border-ink-line"}`}>
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-label">
                <span className={i === 0 ? "text-amber" : "text-fg-muted"}>{String(i + 1).padStart(2, "0")}</span>
                <span className={i === 0 ? "text-fg" : "text-fg-body"}>{s.name}</span>
                <span className="ml-auto text-fg-muted">{i === 0 ? "Queued" : "Waiting"}</span>
              </p>
              <p className="mt-2 text-xs">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-line px-5 py-3">
          <p className="label">case.json · draft</p>
          <button type="button" className="btn-primary btn-sm" onClick={() => downloadJson("case.json", draft)}>
            <Download className="h-3.5 w-3.5" aria-hidden /> Download
          </button>
        </div>
        <pre className="max-h-96 overflow-auto p-5 font-mono text-xs leading-relaxed text-fg-body">{JSON.stringify(draft, null, 2)}</pre>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={`/cases/${FEATURED_CASE_SLUG}`} className="btn-ghost">
          See a sample report <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <button type="button" className="btn-ghost" onClick={onReset}>
          <Check className="h-4 w-4" aria-hidden /> Start another case
        </button>
      </div>
    </div>
  );
}
