"use client";

import { useTranslations } from "next-intl";

interface BlurredPreviewOverlayProps {
  imageUrl: string;
  pageNumber: number;
  onUnlock?: () => void;
  ctaText?: string;
  alt?: string;
}

/**
 * Displays a blurred preview image with a "Buy to unlock" overlay.
 * Used for preview pages 2+ for non-purchasers.
 */
export function BlurredPreviewOverlay({
  imageUrl,
  pageNumber,
  onUnlock,
  ctaText,
  alt = "Vorschau",
}: BlurredPreviewOverlayProps) {
  const t = useTranslations("previewGallery");

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Blurred image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={`${alt} - Seite ${pageNumber}`}
        className="h-full w-full object-cover"
        style={{ filter: "blur(8px)" }}
      />

      {/* Overlay with lock icon and CTA */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
        {/* Lock icon */}
        <div className="bg-surface/90 mb-4 flex h-16 w-16 items-center justify-center rounded-full shadow-lg">
          <svg
            className="text-text-muted h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        {/* Text */}
        <p className="mb-4 text-center text-sm font-medium text-white drop-shadow-md">
          {t("blurredOverlay.description")}
        </p>

        {/* CTA Button */}
        {onUnlock && (
          <button
            onClick={onUnlock}
            className="btn-primary rounded-lg px-6 py-2 text-sm font-semibold shadow-lg transition-transform hover:scale-105"
          >
            {ctaText || t("blurredOverlay.cta")}
          </button>
        )}
      </div>
    </div>
  );
}
