import type { Metadata } from "next";
import { listCases } from "@/lib/data";
import { SectionHeading } from "@/components/SectionHeading";
import { CaseList, type CaseSummary } from "@/components/CaseList";
import { caseCode, firstSentence } from "@/lib/format";

export const metadata: Metadata = { title: "Sample reports" };

export default function CasesPage() {
  const cases: CaseSummary[] = listCases().map((b) => ({
    slug: b.case.slug,
    code: caseCode(b.case.slug, b.case.case_code),
    brand: b.case.brand,
    campaign: b.case.campaign,
    type: b.case.campaign_type,
    status: b.case.status,
    launchDate: b.case.launch_date,
    evidenceCount: b.evidence?.evidence.length ?? 0,
    mainCause: b.diagnosis ? firstSentence(b.diagnosis.diagnosis.main_cause) : null,
    isMock: b.isMock,
  }));

  return (
    <div className="container-page py-14 md:py-20">
      <SectionHeading
        as="h1"
        label="Sample reports"
        title="Case files."
        intro="Every investigation ends in a report: the evidence, six tested hypotheses, the diagnosis, and the produced relaunch."
      />
      <div className="mt-12">
        <CaseList cases={cases} />
      </div>
    </div>
  );
}
