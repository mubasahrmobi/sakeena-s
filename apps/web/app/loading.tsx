/** Shown the instant you click a link, while the next page loads — so the site always feels responsive. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-5 py-14" aria-busy="true" aria-label="Loading">
      <div className="mx-auto h-10 w-64 bg-ink/10" />
      <div className="mx-auto mt-4 h-4 w-40 bg-ink/10" />
      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] bg-ink/10" />
            <div className="mt-4 h-3 w-1/3 bg-ink/10" />
            <div className="mt-2 h-4 w-4/5 bg-ink/10" />
            <div className="mt-2 h-4 w-1/4 bg-ink/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
