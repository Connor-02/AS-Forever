import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { MAX_UPLOAD_SIZE_BYTES, PHOTOS_BUCKET } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function cleanOptionalText(input: FormDataEntryValue | null, maxLength: number) {
  if (typeof input !== "string") {
    return null;
  }
  const value = input.trim();
  if (!value) {
    return null;
  }
  return value.slice(0, maxLength);
}

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  const extension = parts.length > 1 ? parts.pop() : "jpg";
  return (extension || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json({ message: "Image file is required." }, { status: 400 });
  }

  if (!image.type.startsWith("image/")) {
    return NextResponse.json({ message: "Only image uploads are allowed." }, { status: 400 });
  }

  if (image.size > MAX_UPLOAD_SIZE_BYTES) {
    return NextResponse.json({ message: "Max upload size is 10MB." }, { status: 400 });
  }

  const guestName = cleanOptionalText(formData.get("guest_name"), 80);
  const caption = cleanOptionalText(formData.get("caption"), 280);

  const filePath = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${getFileExtension(
    image.name,
  )}`;

  const supabase = createSupabaseServerClient();
  const buffer = Buffer.from(await image.arrayBuffer());

  const storageResult = await supabase.storage.from(PHOTOS_BUCKET).upload(filePath, buffer, {
    contentType: image.type,
    cacheControl: "3600",
    upsert: false,
  });

  if (storageResult.error) {
    return NextResponse.json({ message: storageResult.error.message }, { status: 500 });
  }

  const insertResult = await supabase
    .from("photos")
    .insert({
      file_path: filePath,
      public_url: filePath,
      guest_name: guestName,
      caption,
      approved: true,
    })
    .select("id")
    .single();

  if (insertResult.error) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([filePath]);
    return NextResponse.json({ message: insertResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Upload successful.",
    id: insertResult.data.id,
  });
}
