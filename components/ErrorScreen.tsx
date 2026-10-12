"use client";

import Link from "next/link";
import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

/** Shared body of app/error.tsx and app/cases/[slug]/error.tsx. Details go to the console, not the screen. */
export function ErrorScreen({ error, reset, title = "Something went wrong" }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page py-24">
      <div className="card mx-auto max-w-xl p-10 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-status-rejected/50 text-status-rejected">
          <TriangleAlert className="h-5 w-5" aria-hidden />
        </span>
        <p className="label mt-6">Error{error.digest ? ` · ${error.digest}` : ""}</p>
        <h1 className="heading-serif mt-3 text-4xl">{title}</h1>
        <p className="mt-4 text-sm">The page couldn&apos;t be loaded. Try again, or head back to the start.</p>
        <div className="mt-8 flex justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-ghost">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
