"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import { SITE } from "@/lib/site";

const TOPICS = ["General question", "Agency demo", "Enterprise", "Press"];

export function buildContactMailto(v: { name: string; topic: string; message: string }, to = SITE.contactEmail): string {
  const subject = `${v.topic}${v.name ? ` — ${v.name}` : ""}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(v.message)}`;
}

export function ContactForm() {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [ack, setAck] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="card space-y-5 p-6 md:p-8"
      aria-label="Contact"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!message.trim()) return setError("Write a short message first.");
        if (!ack) return setError("Please confirm you have read the KVKK notice.");
        setError(null);
        window.location.href = buildContactMailto({ name, topic, message });
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm text-fg">
          Name
          <input className="input mt-2" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
        <label className="block text-sm text-fg">
          Topic
          <select className="input mt-2" value={topic} onChange={(e) => setTopic(e.target.value)}>
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm text-fg">
        Message <span className="text-amber">*</span>
        <textarea className="input mt-2" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-amber" checked={ack} onChange={(e) => setAck(e.target.checked)} />
        <span>
          I have read the{" "}
          <Link href="/legal/kvkk" className="link-amber" target="_blank">
            KVKK notice
          </Link>
          .
        </span>
      </label>
      {error && (
        <p role="alert" className="text-xs text-status-rejected">
          {error}
        </p>
      )}
      <button type="submit" className="btn-primary">
        <Mail className="h-4 w-4" aria-hidden /> Write the e-mail
      </button>
    </form>
  );
}
