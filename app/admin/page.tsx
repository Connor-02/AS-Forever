import Image from "next/image";
import { cookies } from "next/headers";
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
      <main className="shell py-8 sm:py-12">
        <AdminLoginForm />
      </main>
    );
  }

  const photos = await listPhotos();
  const signedUrlMap = await createSignedPhotoUrls(photos.map((photo) => photo.file_path));

  return (
    <main className="shell py-6 sm:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-serif)] text-3xl font-semibold">Admin Gallery</h1>
          <p className="mt-1 text-sm text-stone-600">Newest uploads appear first.</p>
        </div>
        <form action={logoutAction}>
          <button className="button-secondary px-4 py-2 text-sm" type="submit">
            Sign Out
          </button>
        </form>
      </div>

      {photos.length === 0 && (
        <p className="card p-6 text-sm text-stone-600">No uploads yet.</p>
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
                  <p className="text-sm font-semibold">{photo.guest_name || "Guest"}</p>
                  {photo.caption && <p className="text-sm text-stone-700">{photo.caption}</p>}
                  <p className="text-xs text-stone-500">{formatDateTime(photo.created_at)}</p>
                  <a
                    href={`/api/admin/photos/${photo.id}/download`}
                    className="button-secondary block w-full px-3 py-2 text-center text-xs"
                  >
                    Download Original
                  </a>
                  <form action={deletePhotoAction}>
                    <input type="hidden" name="id" value={photo.id} />
                    <input type="hidden" name="file_path" value={photo.file_path} />
                    <button type="submit" className="button-secondary w-full px-3 py-2 text-xs">
                      Delete Photo
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
