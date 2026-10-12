import Link from "next/link";

/** Short disclaimer under every report (Disclaimer page has the long form). */
export function ReportFooterNote({ brand }: { brand: string }) {
  return (
    <p className="mt-16 border-t border-ink-line pt-6 text-xs leading-relaxed text-fg-muted">
      Independent analysis of public signals. Not affiliated with, endorsed or sponsored by {brand}. The diagnosis is the
      explanation the available evidence supports best — not a certainty — and no performance data was used. Generated
      creative is a concept, not an official design.{" "}
      <Link href="/legal/disclaimer" className="text-fg-body underline underline-offset-4 hover:text-fg">
        Read the full disclaimer
      </Link>
      .
    </p>
  );
}
