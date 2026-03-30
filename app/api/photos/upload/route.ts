import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  MAX_IMAGE_UPLOAD_SIZE_BYTES,
  MAX_VIDEO_UPLOAD_SIZE_BYTES,
  PHOTOS_BUCKET,
} from "@/lib/constants";
import { getMediaKindFromFileMeta } from "@/lib/media";
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

function validateMediaFile(file: File) {
  const kind = getMediaKindFromFileMeta(file.name, file.type);
  if (kind === "unsupported") {
    return "Only image and video uploads are allowed.";
  }

  if (kind === "image" && file.size > MAX_IMAGE_UPLOAD_SIZE_BYTES) {
    return "Images must be 10MB or less.";
  }

  if (kind === "video" && file.size > MAX_VIDEO_UPLOAD_SIZE_BYTES) {
    return "Videos must be 50MB or less.";
  }

  return null;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const mediaFiles = formData.getAll("media").filter((item): item is File => item instanceof File);

  if (mediaFiles.length === 0) {
    return NextResponse.json({ message: "At least one image or video file is required." }, { status: 400 });
  }

  for (const file of mediaFiles) {
    const validationError = validateMediaFile(file);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }
  }

  const guestName = cleanOptionalText(formData.get("guest_name"), 80);
  const caption = cleanOptionalText(formData.get("caption"), 280);

  const supabase = createSupabaseServerClient();
  const uploadedPaths: string[] = [];

  try {
    for (const media of mediaFiles) {
      const filePath = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${getFileExtension(
        media.name,
      )}`;

      const buffer = Buffer.from(await media.arrayBuffer());
      const storageResult = await supabase.storage.from(PHOTOS_BUCKET).upload(filePath, buffer, {
        contentType:
          media.type || (getMediaKindFromFileMeta(media.name, media.type) === "video" ? "video/mp4" : "image/jpeg"),
        cacheControl: "3600",
        upsert: false,
      });

      if (storageResult.error) {
        throw new Error(storageResult.error.message);
      }

      uploadedPaths.push(filePath);

      const insertResult = await supabase.from("photos").insert({
        file_path: filePath,
        public_url: filePath,
        guest_name: guestName,
        caption,
        approved: true,
      });

      if (insertResult.error) {
        throw new Error(insertResult.error.message);
      }
    }
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from(PHOTOS_BUCKET).remove(uploadedPaths);
      await supabase.from("photos").delete().in("file_path", uploadedPaths);
    }

    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ message }, { status: 500 });
  }

  return NextResponse.json({
    message: `${mediaFiles.length} upload${mediaFiles.length > 1 ? "s" : ""} successful.`,
    uploadedCount: mediaFiles.length,
  });
}
