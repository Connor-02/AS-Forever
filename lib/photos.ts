import "server-only";
import { PHOTOS_BUCKET } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Photo } from "@/lib/types";

export async function listPhotos(options?: { approvedOnly?: boolean }): Promise<Photo[]> {
  const supabase = createSupabaseServerClient();

  let query = supabase
    .from("photos")
    .select("id, created_at, file_path, public_url, guest_name, caption, approved")
    .order("created_at", { ascending: false });

  if (options?.approvedOnly) {
    query = query.eq("approved", true);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createSignedPhotoUrls(filePaths: string[], expiresIn = 3600) {
  if (filePaths.length === 0) {
    return new Map<string, string>();
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .createSignedUrls(filePaths, expiresIn);

  if (error) {
    throw new Error(error.message);
  }

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    if (row.path && row.signedUrl) {
      map.set(row.path, row.signedUrl);
    }
  }

  return map;
}
