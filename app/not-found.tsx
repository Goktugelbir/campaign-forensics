import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-24">
      <div className="card mx-auto max-w-xl p-10 text-center">
        <p className="label-amber">Error 404 · No record</p>
        <h1 className="heading-serif mt-4 text-4xl md:text-5xl">This case file doesn&apos;t exist.</h1>
        <p className="mt-4 text-sm">The link may be mistyped, or the case was never opened.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/cases" className="btn-primary">
            Back to cases
          </Link>
          <Link href="/" className="btn-ghost">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
