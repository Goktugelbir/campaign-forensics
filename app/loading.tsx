export default function Loading() {
  return (
    <div className="container-page py-16" aria-busy="true" aria-label="Loading">
      <div className="h-3 w-40 animate-pulse rounded bg-ink-raised" />
      <div className="mt-6 h-12 w-2/3 animate-pulse rounded bg-ink-raised" />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card h-40 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
