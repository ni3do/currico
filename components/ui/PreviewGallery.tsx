"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { BlurredPreviewOverlay } from "./BlurredPreviewOverlay";

interface PreviewGalleryProps {
  previewUrls: string[];
  previewCount: number;
  hasAccess: boolean;
  resourceTitle: string;
  priceFormatted: string;
  onPurchaseClick?: () => void;
}

/**
 * Gallery component for displaying multi-page PDF previews.
 * - Page 1 is always shown clearly
 * - Pages 2+ are blurred with "Buy to unlock" CTA for non-purchasers
 * - Includes thumbnail strip, main preview, lightbox, and mobile swipe
 */
export function PreviewGallery({
  previewUrls,
  previewCount,
  hasAccess,
  resourceTitle,
  priceFormatted,
  onPurchaseClick,
}: PreviewGalleryProps) {
  const t = useTranslations("previewGallery");
  const [currentPage, setCurrentPage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const mainPreviewRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Handle keyboard navigation in lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft" && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else if (e.key === "ArrowRight" && currentPage < previewUrls.length - 1) {
        setCurrentPage(currentPage + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, currentPage, previewUrls.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;

      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX.current - touchEndX;

      // Swipe threshold of 50px
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentPage < previewUrls.length - 1) {
          // Swipe left - next page
          setCurrentPage(currentPage + 1);
        } else if (diff < 0 && currentPage > 0) {
          // Swipe right - previous page
          setCurrentPage(currentPage - 1);
        }
      }

      touchStartX.current = null;
    },
    [currentPage, previewUrls.length]
  );

  // If no previews, show placeholder
  if (previewUrls.length === 0) {
    return (
      <div className="border-border bg-bg flex aspect-[3/4] max-w-sm items-center justify-center rounded-xl border">
        <div className="text-text-muted text-center">
          <svg
            className="mx-auto mb-2 h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm">{t("noPreview")}</p>
        </div>
      </div>
    );
  }

  const currentUrl = previewUrls[currentPage];
  const isBlurred = !hasAccess && currentPage > 0;

  return (
    <div>
      <h3 className="text-text mb-4 text-xl font-semibold">{t("title")}</h3>

      {/* Main layout container - side by side on larger screens */}
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        {/* Main Preview - Larger for hero display */}
        <div className="flex-1">
          <div
            ref={mainPreviewRef}
            className="border-border bg-bg relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-lg"
            onClick={() => setIsLightboxOpen(true)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {isBlurred ? (
              <BlurredPreviewOverlay
                imageUrl={currentUrl}
                pageNumber={currentPage + 1}
                onUnlock={onPurchaseClick}
                ctaText={`${priceFormatted} - ${t("blurredOverlay.cta")}`}
                alt={resourceTitle}
              />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUrl}
                  alt={`${resourceTitle} - Seite ${currentPage + 1}`}
                  className="h-full w-full object-cover"
                />
                {/* Zoom hint overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity hover:bg-black/20 hover:opacity-100">
                  <svg
                    className="h-10 w-10 text-white drop-shadow-lg"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </>
            )}
          </div>

          {/* Page indicator - below main preview */}
          {previewUrls.length > 1 && (
            <p className="text-text-muted mt-2 text-center text-sm">
              {t("pageOf", { current: currentPage + 1, total: previewCount })}
            </p>
          )}
        </div>

        {/* Thumbnail strip - vertical on larger screens, horizontal on mobile */}
        {previewUrls.length > 1 && (
          <div className="flex flex-col">
            <div
              className="flex gap-2 overflow-x-auto pb-2 sm:flex-col sm:overflow-x-visible sm:overflow-y-auto sm:pr-2 sm:pb-0"
              style={{ maxHeight: "calc(80px * 4 + 24px)" }}
            >
              {previewUrls.map((url, index) => {
                const isThumbBlurred = !hasAccess && index > 0;
                const isActive = index === currentPage;

                return (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    className={`relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      isActive
                        ? "border-primary ring-primary/30 ring-2"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Seite ${index + 1}`}
                      className="h-full w-full object-cover"
                      style={isThumbBlurred ? { filter: "blur(4px)" } : undefined}
                    />
                    {isThumbBlurred && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <svg
                          className="h-4 w-4 text-white"
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
                    )}
                    <span className="bg-bg/80 absolute right-0.5 bottom-0.5 rounded px-1 text-[10px] font-medium">
                      {index + 1}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Helper text - next to thumbnails on larger screens */}
            <p className="text-text-muted mt-4 hidden text-sm sm:block">
              {hasAccess ? t("fullAccessHint") : t("purchaseHint")}
            </p>
          </div>
        )}
      </div>

      {/* Page indicator dots (alternative for mobile) */}
      {previewUrls.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5 sm:hidden">
          {previewUrls.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentPage ? "bg-primary w-4" : "bg-border"
              }`}
              aria-label={`Seite ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Helper text - mobile only */}
      <p className="text-text-muted mt-4 text-sm sm:hidden">
        {hasAccess ? t("fullAccessHint") : t("purchaseHint")}
      </p>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={() => setIsLightboxOpen(false)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Navigation arrows */}
          {currentPage > 0 && (
            <button
              className="absolute left-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage(currentPage - 1);
              }}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {currentPage < previewUrls.length - 1 && (
            <button
              className="absolute right-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage(currentPage + 1);
              }}
              style={{ right: "4rem" }} // Offset from close button
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Lightbox content */}
          <div
            className="max-h-[90vh] max-w-4xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {isBlurred ? (
              <div className="relative aspect-[3/4] w-full max-w-2xl overflow-hidden rounded-xl">
                <BlurredPreviewOverlay
                  imageUrl={currentUrl}
                  pageNumber={currentPage + 1}
                  onUnlock={() => {
                    setIsLightboxOpen(false);
                    onPurchaseClick?.();
                  }}
                  ctaText={`${priceFormatted} - ${t("blurredOverlay.cta")}`}
                  alt={resourceTitle}
                />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentUrl}
                alt={`${resourceTitle} - Seite ${currentPage + 1}`}
                className="max-h-[90vh] max-w-full rounded-lg object-contain"
              />
            )}
          </div>

          {/* Page indicator in lightbox */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
            {t("pageOf", { current: currentPage + 1, total: previewCount })}
          </div>
        </div>
      )}
    </div>
  );
}
