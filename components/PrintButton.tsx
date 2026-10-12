"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button type="button" className="btn-primary btn-sm" onClick={() => window.print()}>
      <Printer className="h-3.5 w-3.5" aria-hidden /> Print / Save as PDF
    </button>
  );
}
