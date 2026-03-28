import Link from "next/link";
import { UploadForm } from "@/components/upload-form";

export default function UploadPage() {
  return (
    <main className="shell page-fade-in py-6 sm:py-10">
      <Link href="/" className="mb-4 inline-block text-sm text-rosegold hover:underline">
        {"< Back to home"}
      </Link>
      <section className="mx-auto mb-5 w-full max-w-xl">
        <p className="soft-pill">Share a Memory</p>
        <h1 className="mt-3 font-[var(--font-serif)] text-3xl font-semibold sm:text-4xl">
          Add your photos in seconds
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Choose camera or gallery, then tap upload. You can add your name and a short message if
          you want.
        </p>
      </section>
      <UploadForm />
    </main>
  );
}
