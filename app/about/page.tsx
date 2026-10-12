import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { TEAM } from "@/lib/site";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="container-page py-14 md:py-20">
      <SectionHeading
        as="h1"
        label="About"
        title="We built the post-mortem we never got."
        intro={
          <>
            <p>
              We pitched a campaign idea once. The room liked it — and we never heard back. No one could tell us what had
              actually gone wrong, and the next pitch repeated the same guesswork.
            </p>
            <p className="mt-4">
              Campaign Forensics is the answer we wanted: collect what people really said in public, test every reasonable
              explanation against it, and show the reasoning — with a fix you can see, not just read.
            </p>
          </>
        }
      />

      <section className="mt-20">
        <p className="label-amber">Team</p>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {TEAM.map((m, i) => (
            <li key={`${m.name}-${i}`} className="card p-6">
              <p className="font-serif text-2xl text-fg">{m.name}</p>
              <p className="mt-1 text-sm">{m.role}</p>
              {m.linkedin && (
                <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-xs text-amber hover:underline">
                  LinkedIn ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="card mt-16 p-8">
        <p className="label">Origin</p>
        <p className="mt-3 font-serif text-2xl text-fg">Built at 10X Your Brand Hackathon, Istanbul — 12 October 2026.</p>
        <p className="mt-3 text-sm">Istanbul Ignited by Slush&apos;D × Manus AI, DotsHub, Istanbul.</p>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/contact" className="btn-primary">
          Get in touch <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link href="/how-it-works" className="btn-ghost">
          How it works
        </Link>
      </div>
    </div>
  );
}
