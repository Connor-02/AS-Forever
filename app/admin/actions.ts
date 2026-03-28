"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";
import { PHOTOS_BUCKET } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function assertAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    throw new Error("Unauthorized.");
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin");
}

export async function deletePhotoAction(formData: FormData) {
  await assertAdminSession();

  const id = formData.get("id");
  const filePath = formData.get("file_path");

  if (typeof id !== "string" || typeof filePath !== "string") {
    throw new Error("Invalid delete payload.");
  }

  const supabase = createSupabaseServerClient();

  const storageDelete = await supabase.storage.from(PHOTOS_BUCKET).remove([filePath]);
  if (storageDelete.error) {
    throw new Error(storageDelete.error.message);
  }

  const dbDelete = await supabase.from("photos").delete().eq("id", id);
  if (dbDelete.error) {
    throw new Error(dbDelete.error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/gallery");
}
