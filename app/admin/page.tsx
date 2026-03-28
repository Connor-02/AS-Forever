import Image from "next/image";
import { cookies } from "next/headers";
import { AutoRefresh } from "@/components/auto-refresh";
import { AdminLoginForm } from "@/components/admin-login-form";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";
import { formatDateTime } from "@/lib/format";
import { createSignedPhotoUrls, listPhotos } from "@/lib/photos";
import { deletePhotoAction, logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = verifyAdminSessionToken(token);

  if (!isAuthenticated) {
    return (
      <main className="shell page-fade-in py-8 sm:py-12">
        <AdminLoginForm />
      </main>
    );
  }

  const photos = await listPhotos();
  const signedUrlMap = await createSignedPhotoUrls(photos.map((photo) => photo.file_path));
  const recentUploads = photos.filter((photo) => {
    const uploadedAt = new Date(photo.created_at).getTime();
    return Date.now() - uploadedAt <= 60 * 60 * 1000;
  }).length;

  return (
    <main className="shell page-fade-in py-6 sm:py-10">
      <div className="sticky top-3 z-10 mb-6 rounded-3xl border border-[var(--border)] bg-white/90 p-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-[var(--font-serif)] text-3xl font-semibold">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">Live view of all uploads.</p>
          </div>
          <form action={logoutAction}>
            <button className="button-secondary px-4 py-2 text-sm" type="submit">
              Sign Out
            </button>
          </form>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-sm">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <p className="text-xs text-stone-500">Total uploads</p>
            <p className="text-xl font-semibold">{photos.length}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <p className="text-xs text-stone-500">Last 60 mins</p>
            <p className="text-xl font-semibold">{recentUploads}</p>
          </div>
        </div>
        <div className="mt-3">
          <AutoRefresh seconds={20} />
        </div>
      </div>

      {photos.length === 0 && (
        <section className="card p-8 text-center">
          <h2 className="font-[var(--font-serif)] text-2xl font-semibold">No uploads yet</h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Photos will appear here as guests start sharing.
          </p>
        </section>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => {
            const imageUrl = signedUrlMap.get(photo.file_path);
            if (!imageUrl) {
              return null;
            }

            return (
              <article key={photo.id} className="card overflow-hidden">
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={imageUrl}
                    alt={photo.caption || "Uploaded photo"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="space-y-2 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{photo.guest_name || "Guest"}</p>
                    <p className="text-xs text-stone-500">{formatDateTime(photo.created_at)}</p>
                  </div>
                  {photo.caption && <p className="text-sm text-[var(--ink-soft)]">{photo.caption}</p>}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`/api/admin/photos/${photo.id}/download`}
                      className="button-secondary px-3 py-2 text-center text-xs"
                    >
                      Download
                    </a>
                    <form action={deletePhotoAction}>
                      <input type="hidden" name="id" value={photo.id} />
                      <input type="hidden" name="file_path" value={photo.file_path} />
                      <button type="submit" className="button-secondary w-full px-3 py-2 text-xs">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
