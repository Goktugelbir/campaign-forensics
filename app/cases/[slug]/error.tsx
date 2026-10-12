"use client";

import { ErrorScreen } from "@/components/ErrorScreen";

export default function ReportError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorScreen {...props} title="Something went wrong loading this report." />;
}
