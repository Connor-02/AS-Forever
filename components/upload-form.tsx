"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MAX_IMAGE_UPLOAD_SIZE_BYTES, MAX_VIDEO_UPLOAD_SIZE_BYTES } from "@/lib/constants";
import { getMediaKindFromFileMeta } from "@/lib/media";

type UploadResponse = {
  message?: string;
  uploadedCount?: number;
};

function bytesToMb(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

type PreviewItem = {
  file: File;
  url: string;
  kind: "image" | "video";
};

export function UploadForm() {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const selectedItemsRef = useRef<PreviewItem[]>([]);

  const [selectedItems, setSelectedItems] = useState<PreviewItem[]>([]);
  const [guestName, setGuestName] = useState("");
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const clearPreviewUrls = (items: PreviewItem[]) => {
    for (const preview of items) {
      URL.revokeObjectURL(preview.url);
    }
  };

  useEffect(() => {
    selectedItemsRef.current = selectedItems;
  }, [selectedItems]);

  useEffect(() => {
    return () => {
      clearPreviewUrls(selectedItemsRef.current);
    };
  }, []);

  const validateClientFile = (file: File) => {
    const kind = getMediaKindFromFileMeta(file.name, file.type);
    if (kind === "unsupported") {
      return "Only image and video files are allowed.";
    }

    if (kind === "image" && file.size > MAX_IMAGE_UPLOAD_SIZE_BYTES) {
      return `Image ${file.name} exceeds 10MB.`;
    }
    if (kind === "video" && file.size > MAX_VIDEO_UPLOAD_SIZE_BYTES) {
      return `Video ${file.name} exceeds 50MB.`;
    }
    return null;
  };

  const onFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const nextFiles = Array.from(files);
    for (const file of nextFiles) {
      const validationError = validateClientFile(file);
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }
    }

    setSuccessMessage(null);
    setErrorMessage(null);
    setProgress(0);
    const nextItems = nextFiles.map((file) => ({
      file,
      kind: getMediaKindFromFileMeta(file.name, file.type) as "image" | "video",
      url: URL.createObjectURL(file),
    }));
    setSelectedItems((prev) => [...prev, ...nextItems]);
  };

  const resetForm = () => {
    clearPreviewUrls(selectedItems);
    setSelectedItems([]);
    setGuestName("");
    setCaption("");
    setProgress(0);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedItems((prev) => {
      const item = prev[index];
      if (item) {
        URL.revokeObjectURL(item.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadSingleFile = (
    file: File,
    fileIndex: number,
    totalFiles: number,
    guest: string,
    note: string,
  ) =>
    new Promise<void>((resolve, reject) => {
      const formData = new FormData();
      formData.append("media", file);
      formData.append("guest_name", guest);
      formData.append("caption", note);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/photos/upload");

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) {
          return;
        }
        const perFileProgress = event.loaded / event.total;
        const overall = ((fileIndex + perFileProgress) / totalFiles) * 100;
        setProgress(Math.min(100, Math.round(overall)));
      };

      xhr.onerror = () => {
        reject(new Error("Network error"));
      };

      xhr.onload = () => {
        const statusOk = xhr.status >= 200 && xhr.status < 300;
        let payload: UploadResponse = {};

        try {
          payload = JSON.parse(xhr.responseText) as UploadResponse;
        } catch {
          payload = {};
        }

        if (!statusOk) {
          reject(new Error(payload.message ?? "Upload failed."));
          return;
        }

        resolve();
      };

      xhr.send(formData);
    });

  const upload = async () => {
    if (selectedItems.length === 0 || isUploading) {
      return;
    }

    for (const { file } of selectedItems) {
      const validationError = validateClientFile(file);
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setProgress(0);

    const guest = guestName.trim();
    const note = caption.trim();
    const failedFiles: string[] = [];

    for (let index = 0; index < selectedItems.length; index += 1) {
      const item = selectedItems[index];
      try {
        await uploadSingleFile(item.file, index, selectedItems.length, guest, note);
      } catch {
        failedFiles.push(item.file.name);
      }
    }

    const uploadedCount = selectedItems.length - failedFiles.length;
    setIsUploading(false);
    setProgress(100);

    if (uploadedCount > 0) {
      setSuccessMessage(
        `${uploadedCount} file${uploadedCount === 1 ? "" : "s"} uploaded successfully.`,
      );
    }

    if (failedFiles.length > 0) {
      setErrorMessage(
        `${failedFiles.length} file${failedFiles.length === 1 ? "" : "s"} failed to upload.`,
      );
      return;
    }

    resetForm();
  };

  return (
    <section className="card mx-auto w-full max-w-2xl p-5 sm:p-7">
      <div className="mb-5">
        <h2 className="font-[var(--font-serif)] text-2xl font-semibold">Photo and Video Upload</h2>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Share multiple moments at once. Camera permissions are requested only when you tap capture.
        </p>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => onFilesSelected(event.target.files)}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={(event) => onFilesSelected(event.target.files)}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(event) => onFilesSelected(event.target.files)}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          className="button-primary w-full"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isUploading}
        >
          Take Photo
        </button>
        <button
          type="button"
          className="button-secondary w-full"
          onClick={() => videoInputRef.current?.click()}
          disabled={isUploading}
        >
          Record Video
        </button>
        <button
          type="button"
          className="button-secondary w-full"
          onClick={() => galleryInputRef.current?.click()}
          disabled={isUploading}
        >
          Choose Multiple
        </button>
      </div>

      <div
        className={`mt-4 rounded-2xl border border-dashed p-4 transition ${
          isDragOver ? "border-rosegold bg-[#fff2ea]" : "border-[var(--border)] bg-[var(--surface-muted)]"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragOver(false);
          onFilesSelected(event.dataTransfer.files);
        }}
      >
        <p className="text-sm font-medium">Drag and drop media here on desktop.</p>
        <p className="mt-1 text-xs text-stone-500">
          Images up to 10MB, videos up to 50MB. Select as many files as you want.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-3">
        {selectedItems.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">{selectedItems.length} file(s) selected</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {selectedItems.map((preview, index) => (
                <article key={`${preview.file.name}-${index}`} className="rounded-xl border border-[var(--border)] p-2">
                  <div className="relative h-24 w-full overflow-hidden rounded-lg bg-[#f8eee7]">
                    {preview.kind === "image" ? (
                      <Image
                        src={preview.url}
                        alt={preview.file.name}
                        fill
                        className="object-contain"
                        sizes="120px"
                      />
                    ) : (
                      <video src={preview.url} className="h-full w-full object-contain" muted playsInline />
                    )}
                  </div>
                  <p className="mt-2 line-clamp-1 text-xs font-medium">{preview.file.name}</p>
                  <p className="text-xs text-stone-500">{bytesToMb(preview.file.size)}MB</p>
                  <button
                    type="button"
                    className="mt-2 w-full rounded-lg border border-[var(--border)] px-2 py-1 text-xs"
                    onClick={() => removeSelectedFile(index)}
                  >
                    Remove
                  </button>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-600">No media selected yet.</p>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Your Name (optional)</span>
          <input
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
            maxLength={80}
            className="w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm outline-none ring-rosegold/25 focus:ring"
            placeholder="e.g. Alex and Jamie"
            disabled={isUploading}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Message (optional)</span>
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength={280}
            rows={3}
            className="w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm outline-none ring-rosegold/25 focus:ring"
            placeholder="Leave a short message for the couple"
            disabled={isUploading}
          />
        </label>
      </div>

      {isUploading && (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#f2e1db]">
            <div
              className="h-full rounded-full bg-rosegold transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-stone-600">{progress}% uploaded</p>
        </div>
      )}

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-700">{successMessage}</p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button type="button" onClick={resetForm} className="button-secondary w-full">
              Upload More
            </button>
            <Link href="/gallery" className="button-primary w-full">
              View Gallery
            </Link>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={upload}
        className="button-primary mt-5 w-full"
        disabled={selectedItems.length === 0 || isUploading}
      >
        {isUploading
          ? "Uploading..."
          : `Upload ${selectedItems.length || ""} Item${selectedItems.length === 1 ? "" : "s"}`.trim()}
      </button>
    </section>
  );
}
