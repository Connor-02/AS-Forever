import Image from "next/image";
import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import { createSignedPhotoUrls, listPhotos } from "@/lib/photos";
import type { Photo } from "@/lib/types";

export default async function GalleryPage() {
  let photos: Photo[] = [];
  let signedUrlMap = new Map<string, string>();
  let error: string | null = null;

  try {
    photos = await listPhotos();
    signedUrlMap = await createSignedPhotoUrls(photos.map((photo) => photo.file_path));
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load gallery.";
  }

  return (
    <main className="shell py-6 sm:py-10">
      <div className="mb-5 flex items-center justify-between gap-2">
        <Link href="/" className="text-sm text-rosegold hover:underline">
          ← Back to home
        </Link>
        <Link href="/upload" className="button-secondary px-3 py-2 text-xs">
          Upload More
        </Link>
      </div>

      <section className="mb-6">
        <h1 className="font-[var(--font-serif)] text-3xl font-semibold">Shared Gallery</h1>
        <p className="mt-1 text-sm text-stone-600">Recent uploads from the celebration.</p>
      </section>

      {error && (
        <p className="card p-4 text-sm text-red-700">
          Gallery is temporarily unavailable: {error}
        </p>
      )}

      {!error && photos.length === 0 && (
        <p className="card p-6 text-sm text-stone-600">No photos yet. Be the first to upload.</p>
      )}

      {!error && photos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => {
            const imageUrl = signedUrlMap.get(photo.file_path);
            if (!imageUrl) {
              return null;
            }

            return (
              <article key={photo.id} className="card overflow-hidden">
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={photo.caption || "Engagement party photo"}
                    fill
                    className="pointer-events-none select-none object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    draggable={false}
                  />
                </div>
                <div className="space-y-1 p-3">
                  <p className="text-sm font-semibold">{photo.guest_name || "Guest"}</p>
                  {photo.caption && <p className="text-sm text-stone-700">{photo.caption}</p>}
                  <p className="text-xs text-stone-500">{formatDateTime(photo.created_at)}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
