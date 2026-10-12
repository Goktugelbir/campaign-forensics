import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegalDoc, LEGAL_PAGES } from "@/lib/legal";
import { LegalPage } from "@/components/LegalPage";
import { DataRequestForm } from "@/components/DataRequestForm";

type Props = { params: Promise<{ page: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_PAGES.map((page) => ({ page }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const doc = getLegalDoc(page);
  return { title: doc?.title ?? "Legal" };
}

export default async function LegalRoute({ params }: Props) {
  const { page } = await params;
  const doc = getLegalDoc(page);
  if (!doc) notFound();
  return <LegalPage doc={doc}>{doc.slug === "data-request" && <DataRequestForm />}</LegalPage>;
}
