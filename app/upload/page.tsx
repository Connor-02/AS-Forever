import Link from "next/link";
import { UploadForm } from "@/components/upload-form";

export default function UploadPage() {
  return (
    <main className="shell py-6 sm:py-10">
      <Link href="/" className="mb-4 inline-block text-sm text-rosegold hover:underline">
        ← Back to home
      </Link>
      <UploadForm />
    </main>
  );
}
