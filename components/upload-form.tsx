"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MAX_UPLOAD_SIZE_BYTES } from "@/lib/constants";

type UploadResponse = {
  message?: string;
};

function bytesToMb(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

export function UploadForm() {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const validateClientFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return "Only image files are allowed.";
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return `Image exceeds 10MB (selected: ${bytesToMb(file.size)}MB).`;
    }
    return null;
  };

  const onFileSelected = (file: File | null) => {
    if (!file) {
      return;
    }
    const validationError = validateClientFile(file);
    setSuccessMessage(null);
    setErrorMessage(validationError);
    setProgress(0);
    if (!validationError) {
      setSelectedFile(file);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setGuestName("");
    setCaption("");
    setProgress(0);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const upload = () => {
    if (!selectedFile || isUploading) {
      return;
    }

    const validationError = validateClientFile(selectedFile);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("guest_name", guestName.trim());
    formData.append("caption", caption.trim());

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/photos/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onerror = () => {
      setErrorMessage("Upload failed. Please try again.");
      setIsUploading(false);
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
        setErrorMessage(payload.message ?? "Upload failed. Please try again.");
        setIsUploading(false);
        return;
      }

      setIsUploading(false);
      setProgress(100);
      setSuccessMessage("Thank you for sharing this moment.");
      resetForm();
    };

    xhr.send(formData);
  };

  return (
    <section className="card mx-auto w-full max-w-xl p-5 sm:p-7">
      <div className="mb-5">
        <h2 className="font-[var(--font-serif)] text-2xl font-semibold">Photo Upload</h2>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Camera permission is requested only when you tap Take Photo.
        </p>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => onFileSelected(event.target.files?.[0] ?? null)}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => onFileSelected(event.target.files?.[0] ?? null)}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          onClick={() => galleryInputRef.current?.click()}
          disabled={isUploading}
        >
          Choose from Gallery
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
          onFileSelected(event.dataTransfer.files?.[0] ?? null);
        }}
      >
        <p className="text-sm font-medium">Drag and drop on desktop, or use the buttons above.</p>
        <p className="mt-1 text-xs text-stone-500">Images only, up to 10MB</p>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-3">
        {selectedFile && previewUrl ? (
          <div className="space-y-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
              <Image src={previewUrl} alt="Selected preview" fill className="object-cover" />
            </div>
            <p className="text-sm">
              Selected: <span className="font-semibold">{selectedFile.name}</span> (
              {bytesToMb(selectedFile.size)}MB)
            </p>
          </div>
        ) : (
          <p className="text-sm text-stone-600">No image selected yet.</p>
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
              Upload Another
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
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? "Uploading..." : "Upload Photo"}
      </button>
    </section>
  );
}
