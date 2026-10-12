import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { Accordion } from "@/components/Accordion";
import { FAQ, GLOSSARY } from "@/content/faq";
import { headingId } from "@/lib/text";

export const metadata: Metadata = { title: "FAQ" };

export default function FaqPage() {
  return (
    <div className="container-page py-14 md:py-20">
      <SectionHeading as="h1" label="FAQ" title="Questions, answered." />
      <div className="mt-14 grid gap-12 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="FAQ sections" className="hidden lg:block">
          <ul className="sticky top-24 space-y-2.5 text-sm">
            {FAQ.map((c) => (
              <li key={c.category}>
                <a href={`#${headingId(c.category)}`} className="text-fg-body hover:text-fg">
                  {c.category}
                </a>
              </li>
            ))}
            <li>
              <a href="#glossary" className="text-fg-body hover:text-fg">
                Glossary
              </a>
            </li>
          </ul>
        </nav>
        <div className="space-y-16">
          {FAQ.map((c) => (
            <section key={c.category} id={headingId(c.category)} className="scroll-mt-24">
              <p className="label-amber">{c.category}</p>
              <div className="mt-4">
                <Accordion items={c.items} defaultOpen={null} />
              </div>
            </section>
          ))}
          <section id="glossary" className="scroll-mt-24">
            <p className="label-amber">Glossary</p>
            <dl className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
              {GLOSSARY.map((g) => (
                <div key={g.term}>
                  <dt className="font-mono text-xs text-fg">{g.term}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed">{g.definition}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
