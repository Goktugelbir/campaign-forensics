/** Card skeletons, not a spinner (page map, group E #21). */
export function ReportSkeleton() {
  const bar = "animate-pulse rounded bg-ink-raised";
  return (
    <div className="container-page py-10 md:py-14" aria-busy="true" aria-label="Loading report">
      <div className={`${bar} h-3 w-72`} />
      <div className={`${bar} mt-6 h-12 w-2/3`} />
      <div className={`${bar} mt-4 h-3 w-1/2`} />
      <div className="mt-10 flex gap-6 border-b border-ink-line pb-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${bar} h-4 w-20`} />
        ))}
      </div>
      <div className="card mt-10 h-56 animate-pulse" />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card h-40 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
