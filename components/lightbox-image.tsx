"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type LightboxPhoto = {
  src: string;
  alt: string;
};

type LightboxImageProps = {
  photos: LightboxPhoto[];
  initialIndex: number;
};

export function LightboxImage({ photos, initialIndex }: LightboxImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartXRef = useRef<number | null>(null);

  const currentPhoto = photos[currentIndex];

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const goPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
      if (event.key === "ArrowRight") {
        goNext();
      }
      if (event.key === "ArrowLeft") {
        goPrevious();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, photos.length]);

  if (!currentPhoto) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setCurrentIndex(initialIndex);
          setIsOpen(true);
        }}
        className="relative h-72 w-full bg-[#f8eee7] sm:h-80"
        aria-label="Open image fullscreen"
      >
        <Image src={currentPhoto.src} alt={currentPhoto.alt} fill className="object-contain" sizes="100vw" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 rounded-full border border-white/40 px-3 py-1 text-sm font-semibold text-white"
          >
            Close
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goPrevious();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/30 px-3 py-2 text-sm font-semibold text-white"
                aria-label="Previous photo"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/30 px-3 py-2 text-sm font-semibold text-white"
                aria-label="Next photo"
              >
                Next
              </button>
            </>
          )}

          <div
            className="relative h-[88vh] w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => {
              touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              const startX = touchStartXRef.current;
              const endX = event.changedTouches[0]?.clientX ?? null;
              touchStartXRef.current = null;

              if (startX === null || endX === null) {
                return;
              }

              const deltaX = endX - startX;
              if (Math.abs(deltaX) < 40) {
                return;
              }

              if (deltaX < 0) {
                goNext();
              } else {
                goPrevious();
              }
            }}
          >
            <Image src={currentPhoto.src} alt={currentPhoto.alt} fill className="object-contain" sizes="100vw" />
          </div>

          {photos.length > 1 && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs text-white">
              {currentIndex + 1} / {photos.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
