import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCaseBundle, listCaseSlugs } from "@/lib/data";
import { ReportView } from "@/components/report/ReportView";
import { ReportSkeleton } from "@/components/report/ReportSkeleton";

type Props = { params: Promise<{ slug: string }> };

// Cases are files in data/cases, known at build time. Rejecting other slugs up front
// gives a real 404 status — with loading.tsx streaming, a notFound() thrown during
// render would arrive after a 200 header. Adding a case means rebuilding (as /cases does).
export const dynamicParams = false;

export function generateStaticParams() {
  return listCaseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const b = getCaseBundle(slug);
  if (!b) return { title: "Case not found" };
  return {
    title: `${b.case.brand} — ${b.case.campaign}`,
    description: b.diagnosis?.diagnosis.main_cause ?? b.case.summary,
  };
}

export default async function ReportPage({ params }: Props) {
  const { slug } = await params;
  const bundle = getCaseBundle(slug);
  if (!bundle) notFound();
  return (
    <Suspense fallback={<ReportSkeleton />}>
      <ReportView bundle={bundle} />
    </Suspense>
  );
}
