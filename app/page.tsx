import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell page-fade-in py-8 sm:py-12">
      <section className="card gradient-panel mx-auto max-w-5xl overflow-hidden p-6 sm:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="soft-pill">Engagement Party Memory Wall</p>
            <h1 className="mt-4 font-[var(--font-serif)] text-4xl font-semibold leading-tight sm:text-5xl">
              Capture every candid moment from tonight
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--ink-soft)] sm:text-base">
              Scan, snap, and share in seconds. Every guest photo appears in the live gallery so
              everyone can relive the celebration together.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/upload" className="button-primary">
                Share a Photo
              </Link>
              <Link href="/gallery" className="button-secondary">
                View Live Gallery
              </Link>
            </div>
            <p className="mt-4 text-xs text-stone-500">
              Hosts:{" "}
              <Link href="/admin" className="text-rosegold hover:underline">
                Open Admin Dashboard
              </Link>
            </p>
          </div>
          <div className="card bg-white/90 p-5">
            <p className="text-sm font-semibold">How it works</p>
            <ol className="mt-3 space-y-3 text-sm text-[var(--ink-soft)]">
              <li>1. Scan the event QR code.</li>
              <li>2. Tap Take Photo or choose from your gallery.</li>
              <li>3. Upload and see it appear in the shared memory wall.</li>
            </ol>
            <div className="subtle-divider my-4" />
            <p className="text-xs text-stone-500">
              Tip: keep this page bookmarked so you can upload throughout the night.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-7 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="card p-4">
          <p className="text-sm font-semibold">Camera-first upload</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Guests can take photos directly without leaving the page.
          </p>
        </article>
        <article className="card p-4">
          <p className="text-sm font-semibold">Live shared gallery</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Beautiful gallery view that refreshes as new memories arrive.
          </p>
        </article>
        <article className="card p-4">
          <p className="text-sm font-semibold">Host controls</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Private admin area for viewing, downloading, and deleting uploads.
          </p>
        </article>
      </section>
    </main>
  );
}
