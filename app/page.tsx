import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell py-10 sm:py-14">
      <section className="card mx-auto max-w-3xl p-6 text-center sm:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-rosegold">Engagement Party</p>
        <h1 className="mt-3 font-[var(--font-serif)] text-4xl font-semibold sm:text-5xl">
          Share Tonight&rsquo;s Best Moments
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-stone-600 sm:text-base">
          Upload your photos in seconds so everyone can relive the celebration. Open this page
          from the event QR code and add as many photos as you like.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/upload" className="button-primary">
            Upload Photos
          </Link>
          <Link href="/gallery" className="button-secondary">
            View Gallery
          </Link>
        </div>
        <p className="mt-4 text-xs text-stone-500">
          Hosts:{" "}
          <Link href="/admin" className="text-rosegold hover:underline">
            Open Admin
          </Link>
        </p>
      </section>
    </main>
  );
}
