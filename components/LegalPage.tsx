import { formatDateLong } from "@/lib/format";
import type { LegalDoc } from "@/lib/legal";
import { SITE } from "@/lib/site";

/** One template for all seven legal pages: title, Last updated, TOC, Markdown body, contact line. */
export function LegalPage({ doc, children }: { doc: LegalDoc; children?: React.ReactNode }) {
  return (
    <div className="container-page py-14 md:py-20">
      <p className="label-amber">Legal</p>
      <h1 className="heading-serif mt-4 text-5xl md:text-6xl">{doc.title}</h1>
      <p className="mt-4 font-mono text-[11px] tracking-label text-fg-muted">Last updated · {formatDateLong(doc.updated)}</p>
      {doc.summary && <p className="mt-6 max-w-2xl text-base leading-relaxed">{doc.summary}</p>}

      <div className="mt-14 grid gap-12 lg:grid-cols-[15rem_1fr]">
        {doc.toc.length > 0 && (
          <nav aria-label="Contents" className="lg:block">
            <div className="lg:sticky lg:top-24">
              <p className="label">Contents</p>
              <ol className="mt-4 space-y-2 text-sm">
                {doc.toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="text-fg-body hover:text-fg">
                      {t.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>
        )}
        <div className="min-w-0 max-w-3xl">
          <article className="prose-legal" dangerouslySetInnerHTML={{ __html: doc.html }} />
          {children}
          <p className="mt-14 border-t border-ink-line pt-6 text-sm">
            Questions?{" "}
            <a href={`mailto:${SITE.contactEmail}`} className="link-amber">
              {SITE.contactEmail}
            </a>
          </p>
          <p className="mt-3 text-xs text-fg-muted">This page is not legal advice and will be reviewed by a lawyer before public launch.</p>
        </div>
      </div>
    </div>
  );
}
