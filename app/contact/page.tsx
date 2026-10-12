import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { ContactForm } from "@/components/ContactForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container-page max-w-4xl py-14 md:py-20">
      <SectionHeading
        as="h1"
        label="Contact"
        title="Talk to us."
        intro={
          <>
            Agency demo, enterprise sources, press or anything else. Write to <span className="text-fg">{SITE.contactEmail}</span>{" "}
            or use the form — it opens your e-mail app, so nothing is stored on this site.
          </>
        }
      />
      <div className="mt-12">
        <ContactForm />
      </div>
    </div>
  );
}
