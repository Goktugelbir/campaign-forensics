import type { Metadata } from "next";
import { NewCaseForm } from "@/components/NewCaseForm";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = { title: "Start a case" };

export default function NewCasePage() {
  return (
    <div className="container-page max-w-4xl py-14 md:py-20">
      <SectionHeading
        as="h1"
        label="New case"
        title="Open an investigation."
        intro="Tell us which campaign to investigate. We collect the public reaction, test six explanations and send you the report — no ad-account access needed."
      />
      <div className="mt-12">
        <NewCaseForm />
      </div>
    </div>
  );
}
