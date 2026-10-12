import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { PricingCards } from "@/components/PricingCards";
import { Accordion } from "@/components/Accordion";
import { PRICING_FAQ } from "@/content/pricing";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="container-page py-14 md:py-20">
      <SectionHeading
        as="h1"
        label="Pricing"
        title="Simple pricing."
        intro="Pay per investigation, or run them every week. No ad-account access, no setup."
      />
      <div className="mt-12">
        <PricingCards />
      </div>
      <section className="mt-24 max-w-3xl">
        <h2 className="heading-serif text-3xl md:text-4xl">Pricing questions</h2>
        <div className="mt-8">
          <Accordion items={PRICING_FAQ} defaultOpen={null} />
        </div>
      </section>
    </div>
  );
}
