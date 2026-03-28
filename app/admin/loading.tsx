export default function AdminLoading() {
  return (
    <main className="shell py-6 sm:py-10">
      <section className="card mb-6 p-5 sm:p-7">
        <div className="h-8 w-52 animate-pulse rounded bg-stone-200" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-stone-200" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-sm">
          <div className="h-16 animate-pulse rounded-2xl bg-stone-200" />
          <div className="h-16 animate-pulse rounded-2xl bg-stone-200" />
        </div>
      </section>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <article key={index} className="card overflow-hidden">
            <div className="aspect-[4/5] animate-pulse bg-stone-200" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
              <div className="h-3 w-40 animate-pulse rounded bg-stone-200" />
              <div className="h-8 animate-pulse rounded-xl bg-stone-200" />
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
