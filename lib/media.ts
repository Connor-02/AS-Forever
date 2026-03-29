const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm", "m4v", "avi", "mkv"]);

export function getMediaKindFromType(contentType: string): "image" | "video" | "unsupported" {
  if (contentType.startsWith("image/")) {
    return "image";
  }
  if (contentType.startsWith("video/")) {
    return "video";
  }
  return "unsupported";
}

export function getMediaKindFromPath(filePath: string): "image" | "video" {
  const extension = filePath.split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXTENSIONS.has(extension) ? "video" : "image";
}
