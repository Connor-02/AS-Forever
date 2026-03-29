import Link from "next/link";
import { AutoRefresh } from "@/components/auto-refresh";
import { LightboxImage } from "@/components/lightbox-image";
import { formatDateTime } from "@/lib/format";
import { getMediaKindFromPath } from "@/lib/media";
import { createSignedPhotoUrls, listPhotos } from "@/lib/photos";
import type { Photo } from "@/lib/types";
//Forced dynamic
export const dynamic = "force-dynamic";

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

  const visiblePhotos = photos.filter((photo) => signedUrlMap.has(photo.file_path));
  const lightboxPhotos = visiblePhotos
    .map((photo) => {
      const imageUrl = signedUrlMap.get(photo.file_path);
      if (!imageUrl) {
        return null;
      }
      return {
        src: imageUrl,
        alt: photo.caption || "Engagement party photo",
        kind: getMediaKindFromPath(photo.file_path),
      };
    })
    .filter((photo): photo is { src: string; alt: string; kind: "image" | "video" } => photo !== null);

  return (
    <main className="shell page-fade-in py-6 sm:py-10">
      <div className="mb-5 flex items-center justify-between gap-2">
        <Link href="/" className="text-sm text-rosegold hover:underline">
          {"< Back to home"}
        </Link>
        <Link href="/upload" className="button-secondary px-3 py-2 text-xs">
          Upload a Photo
        </Link>
      </div>

      <section className="card gradient-panel mb-6 p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="soft-pill">Live Memory Wall</p>
            <h1 className="mt-3 font-[var(--font-serif)] text-3xl font-semibold sm:text-4xl">
              Shared Gallery
            </h1>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Every upload appears here so guests can enjoy moments as they happen.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-semibold">{visiblePhotos.length}</p>
            <p className="text-xs text-stone-500">Total media</p>
          </div>
        </div>
        <div className="mt-3">
          <AutoRefresh seconds={20} />
        </div>
      </section>

      {error && (
        <p className="card p-4 text-sm text-red-700">
          Gallery is temporarily unavailable: {error}
        </p>
      )}

      {!error && visiblePhotos.length === 0 && (
        <section className="card p-8 text-center">
          <h2 className="font-[var(--font-serif)] text-2xl font-semibold">No photos yet</h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Be the first guest to share a memory from tonight.
          </p>
          <Link href="/upload" className="button-primary mt-5">
            Upload the First Photo
          </Link>
        </section>
      )}

      {!error && visiblePhotos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePhotos.map((photo, index) => {
            const imageUrl = signedUrlMap.get(photo.file_path);
            if (!imageUrl) {
              return null;
            }

            return (
              <article key={photo.id} className="card overflow-hidden">
                <LightboxImage media={lightboxPhotos} initialIndex={index} />
                <div className="space-y-1 p-3">
                  <p className="text-sm font-semibold">{photo.guest_name || "Guest"}</p>
                  {photo.caption && <p className="text-sm text-[var(--ink-soft)]">{photo.caption}</p>}
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
