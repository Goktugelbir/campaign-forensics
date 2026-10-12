import type { Metadata } from "next";
import { listCases } from "@/lib/data";
import { toCaseSummary } from "@/lib/caseSummary";
import { SectionHeading } from "@/components/SectionHeading";
import { CaseList } from "@/components/CaseList";

export const metadata: Metadata = { title: "Sample reports" };

export default function CasesPage() {
  const cases = listCases().map(toCaseSummary);

  return (
    <div className="container-page py-14 md:py-20">
      <SectionHeading
        as="h1"
        label="Sample reports"
        title="Case files."
        intro="Each report reads in four steps: the case, the evidence, the diagnosis and the relaunch. Pick one to open it."
      />
      <div className="mt-12">
        <CaseList cases={cases} />
      </div>
    </div>
  );
}
