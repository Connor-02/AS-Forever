const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm", "m4v", "avi", "mkv"]);
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif", "gif", "bmp"]);

export function getMediaKindFromType(contentType: string): "image" | "video" | "unsupported" {
  if (contentType.startsWith("image/")) {
    return "image";
  }
  if (contentType.startsWith("video/")) {
    return "video";
  }
  return "unsupported";
}

export function getMediaKindFromFileMeta(
  fileName: string,
  contentType: string,
): "image" | "video" | "unsupported" {
  const typeKind = getMediaKindFromType(contentType);
  if (typeKind !== "unsupported") {
    return typeKind;
  }

  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (VIDEO_EXTENSIONS.has(extension)) {
    return "video";
  }
  if (IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }

  return "unsupported";
}

export function getMediaKindFromPath(filePath: string): "image" | "video" {
  const extension = filePath.split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXTENSIONS.has(extension) ? "video" : "image";
}
