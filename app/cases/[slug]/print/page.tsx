import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCaseBundle, listCaseSlugs } from "@/lib/data";
import { formatDateLabel, SOURCE_LABEL } from "@/lib/format";
import { ReportHeader } from "@/components/report/ReportHeader";
import { CaseTab } from "@/components/report/CaseTab";
import { DiagnosisTab } from "@/components/report/DiagnosisTab";
import { RelaunchTab } from "@/components/report/RelaunchTab";
import { ReportFooterNote } from "@/components/report/ReportFooterNote";
import { InProgress } from "@/components/report/InProgress";
import { PrintButton } from "@/components/PrintButton";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return listCaseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const b = getCaseBundle(slug);
  return { title: b ? `Print — ${b.case.brand}` : "Case not found", robots: { index: false } };
}

/** All four tabs stacked on one page with print styles. The browser's "Save as PDF" does the export. */
export default async function PrintPage({ params }: Props) {
  const { slug } = await params;
  const bundle = getCaseBundle(slug);
  if (!bundle) notFound();
  const evidence = bundle.evidence?.evidence ?? [];

  return (
    <div className="print-surface container-page py-10">
      <div className="no-print mb-10 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/cases/${slug}`} className="inline-flex items-center gap-1.5 text-sm text-fg-body hover:text-fg">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to report
        </Link>
        <PrintButton />
      </div>

      <ReportHeader bundle={bundle} showActions={false} />

      <PrintSection title="01 · Case">
        <CaseTab bundle={bundle} />
      </PrintSection>

      <PrintSection title={`02 · Evidence [${evidence.length}]`} breakBefore>
        {bundle.evidence ? (
          <ol className="space-y-3">
            {evidence.map((e) => (
              <li key={e.id} className="print-avoid border-b border-ink-line pb-3 text-sm">
                <p className="font-mono text-[11px] uppercase tracking-label text-fg-muted">
                  <span className="print-accent text-amber">{e.id}</span> · {SOURCE_LABEL[e.source]} · {formatDateLabel(e.date)}
                  {e.sentiment ? ` · ${e.sentiment}` : ""}
                </p>
                <p className="mt-1 text-fg">“{e.text_en ?? e.text}”</p>
                <p className="mt-1 break-all text-xs text-fg-muted">{e.url}</p>
              </li>
            ))}
          </ol>
        ) : (
          <InProgress step="Evidence" />
        )}
      </PrintSection>

      <PrintSection title="03 · Diagnosis" breakBefore>
        <DiagnosisTab bundle={bundle} />
      </PrintSection>

      <PrintSection title="04 · Relaunch" breakBefore>
        <RelaunchTab bundle={bundle} />
      </PrintSection>

      <ReportFooterNote brand={bundle.case.brand} />
    </div>
  );
}

function PrintSection({ title, children, breakBefore }: { title: string; children: React.ReactNode; breakBefore?: boolean }) {
  return (
    <section className={`mt-14 ${breakBefore ? "print-break" : ""}`}>
      <h2 className="label-amber print-accent mb-6 border-b border-ink-line pb-3">{title}</h2>
      {children}
    </section>
  );
}
