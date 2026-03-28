import { basename } from "node:path";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";
import { PHOTOS_BUCKET } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "Missing photo id." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const record = await supabase.from("photos").select("file_path").eq("id", id).single();

  if (record.error || !record.data) {
    return NextResponse.json({ message: "Photo not found." }, { status: 404 });
  }

  const storageFile = await supabase.storage.from(PHOTOS_BUCKET).download(record.data.file_path);
  if (storageFile.error || !storageFile.data) {
    return NextResponse.json({ message: "File not found in storage." }, { status: 404 });
  }

  const arrayBuffer = await storageFile.data.arrayBuffer();
  const fileName = basename(record.data.file_path);

  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": storageFile.data.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
