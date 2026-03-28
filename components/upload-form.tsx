"use client";

import { useRef, useState } from "react";
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
  const [guestName, setGuestName] = useState("");
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onFileSelected = (file: File | null) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    setProgress(0);
    setSelectedFile(file);
  };

  const validateClientFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return "Only image files are allowed.";
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return `Image exceeds 10MB (selected: ${bytesToMb(file.size)}MB).`;
    }
    return null;
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
      setSuccessMessage("Photo uploaded. Thank you for sharing this moment.");
      resetForm();
    };

    xhr.send(formData);
  };

  return (
    <section className="card mx-auto w-full max-w-xl p-5 sm:p-7">
      <div className="mb-5">
        <h1 className="font-[var(--font-serif)] text-3xl font-semibold">Upload a Photo</h1>
        <p className="mt-2 text-sm text-stone-600">
          Tap one option below. Camera permission will only be requested when taking a photo.
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
          className="button-primary"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isUploading}
        >
          Take Photo
        </button>
        <button
          type="button"
          className="button-secondary"
          onClick={() => galleryInputRef.current?.click()}
          disabled={isUploading}
        >
          Choose from Gallery
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm">
        {selectedFile ? (
          <p>
            Selected: <span className="font-semibold">{selectedFile.name}</span> (
            {bytesToMb(selectedFile.size)}MB)
          </p>
        ) : (
          <p className="text-stone-600">No image selected yet.</p>
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
            placeholder="e.g. Alex & Jamie"
            disabled={isUploading}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Caption (optional)</span>
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength={280}
            rows={3}
            className="w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm outline-none ring-rosegold/25 focus:ring"
            placeholder="Write a short message"
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
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </p>
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
