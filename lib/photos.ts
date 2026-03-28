import "server-only";
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
