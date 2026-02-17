"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Heart } from "lucide-react";
import { getSubjectTextColor } from "@/lib/constants/subject-colors";
import { VerifiedSellerBadge } from "@/components/ui/VerifiedSellerBadge";
import { StarRating } from "@/components/ui/StarRating";

export interface MaterialCardProps {
  id: string;
  title: string;
  description?: string;
  subject: string;
  cycle?: string;
  /** Numeric price in cents (used for free detection — avoids fragile string comparison) */
  price?: number;
  priceFormatted?: string;
  previewUrl?: string | null;
  verified?: boolean;
  seller?: {
    displayName: string | null;
    isVerifiedSeller?: boolean;
  };
  /** Render custom footer content instead of default */
  footer?: React.ReactNode;
  /** Card size variant */
  variant?: "default" | "compact";
  /** Link href - defaults to /materialien/[id] */
  href?: string;
  /** Custom pill class for subject badge */
  subjectPillClass?: string;
  /** Show/hide the price badge overlay on image */
  showPriceBadge?: boolean;
  /** Whether this material is in the user's wishlist */
  isWishlisted?: boolean;
  /** Callback when wishlist button is clicked */
  onWishlistToggle?: (id: string, currentState: boolean) => Promise<boolean>;
  /** Show/hide the wishlist heart icon */
  showWishlist?: boolean;
  /** Translated aria-label for adding to wishlist */
  wishlistAddLabel?: string;
  /** Translated aria-label for removing from wishlist */
  wishlistRemoveLabel?: string;
  /** Translated label for anonymous seller */
  anonymousLabel?: string;
  /** Average rating (1-5) from reviews */
  averageRating?: number;
  /** Number of reviews */
  reviewCount?: number;
}

export function MaterialCard({
  id,
  title,
  description,
  subject,
  cycle,
  price,
  priceFormatted,
  previewUrl,
  seller,
  footer,
  variant = "default",
  href,
  subjectPillClass,
  showPriceBadge = true,
  isWishlisted: initialWishlisted = false,
  onWishlistToggle,
  showWishlist = false,
  wishlistAddLabel,
  wishlistRemoveLabel,
  anonymousLabel,
  averageRating,
  reviewCount,
}: MaterialCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Sync with parent's wishlist state (e.g., when wishlist is fetched after mount)
  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  const isCompact = variant === "compact";
  const linkHref = href ?? `/materialien/${id}`;
  const isFree =
    price !== undefined ? price === 0 : priceFormatted === "Gratis" || priceFormatted === "Free";
  const shouldShowPriceBadge = showPriceBadge && priceFormatted;

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!onWishlistToggle || wishlistLoading) return;

    // Optimistic update - flip immediately
    const previousState = isWishlisted;
    setIsWishlisted(!isWishlisted);
    setWishlistLoading(true);
    try {
      const success = await onWishlistToggle(id, previousState);
      if (!success) {
        // Roll back on failure
        setIsWishlisted(previousState);
      }
    } catch {
      // Roll back on error
      setIsWishlisted(previousState);
    } finally {
      setWishlistLoading(false);
    }
  };

  const cardContent = (
    <>
      {/* Preview Image with Price Badge */}
      <div
        className={`bg-bg-secondary relative overflow-hidden ${isCompact ? "aspect-square w-32 flex-shrink-0 sm:w-40" : "aspect-[4/3] w-full"}`}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className={`text-text-faint ${isCompact ? "h-10 w-10" : "h-12 w-12"}`}
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
          </div>
        )}

        {/* Price Badge - moved to footer for non-compact, keep overlay for compact */}
        {shouldShowPriceBadge && isCompact && (
          <span className="bg-price text-text-on-accent absolute top-3 right-3 rounded-full px-2 py-0.5 text-xs font-bold shadow-md">
            {priceFormatted}
          </span>
        )}

        {/* Wishlist Heart - Top Left */}
        {showWishlist && (
          <button
            onClick={handleWishlistClick}
            disabled={wishlistLoading}
            className={`absolute top-3 left-3 drop-shadow-md transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110 active:scale-95 disabled:opacity-50 ${
              isWishlisted ? "text-error" : "text-text-on-accent hover:text-error"
            }`}
            aria-label={
              isWishlisted
                ? wishlistRemoveLabel || "Von Wunschliste entfernen"
                : wishlistAddLabel || "Zur Wunschliste hinzufügen"
            }
          >
            <Heart
              className={`h-7 w-7 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${wishlistLoading ? "animate-pulse" : ""} ${isWishlisted ? "scale-100" : "scale-90 group-hover:scale-100"}`}
              fill={isWishlisted ? "currentColor" : "none"}
              strokeWidth={2}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-1 flex-col ${isCompact ? "justify-center p-3 sm:p-4" : "p-5"}`}>
        {/* Eyebrow Tag - Subject & Level */}
        <div className={`${isCompact ? "mb-1" : "mb-2"}`}>
          <span
            className={`text-xs font-semibold tracking-wide uppercase ${getSubjectTextColor(subjectPillClass)}`}
          >
            {subject}
            {cycle && (
              <>
                <span className="text-text-faint mx-1.5">•</span>
                <span className="text-text-muted">{cycle}</span>
              </>
            )}
          </span>
        </div>

        {/* Title - Primary Heading Style */}
        <h3
          className={`text-text group-hover:text-primary line-clamp-2 font-bold transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isCompact ? "text-sm sm:text-base" : "mb-1.5 text-lg leading-snug"
          }`}
        >
          {title}
        </h3>

        {/* Rating */}
        {reviewCount != null && reviewCount > 0 && averageRating != null && (
          <div className={`flex items-center gap-1.5 ${isCompact ? "mt-0.5" : "mb-1"}`}>
            <StarRating rating={averageRating} size="sm" />
            <span className="text-text-muted text-xs">({reviewCount})</span>
          </div>
        )}

        {/* Description */}
        {!isCompact && description && (
          <p className="text-text-muted mb-3 line-clamp-2 text-sm leading-relaxed">{description}</p>
        )}
        {isCompact && description && (
          <p className="text-text-muted mt-1 line-clamp-1 hidden text-xs sm:block">{description}</p>
        )}

        {/* Compact footer: seller + price inline */}
        {isCompact && (
          <div className="text-text-muted mt-2 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              {seller?.displayName || anonymousLabel || ""}
              {seller?.isVerifiedSeller && <VerifiedSellerBadge variant="compact" />}
            </span>
            {priceFormatted && (
              <span className={`font-semibold ${isFree ? "text-success" : "text-price"}`}>
                {priceFormatted}
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        {!isCompact && <div className="mt-auto" />}

        {/* Footer */}
        {!isCompact &&
          (footer ?? (
            <div className="border-border-subtle flex items-center justify-between border-t pt-3">
              <span className="text-text-muted flex items-center gap-1.5 text-sm transition-colors duration-300">
                {seller?.displayName || anonymousLabel || ""}
                {seller?.isVerifiedSeller && <VerifiedSellerBadge variant="compact" />}
              </span>
              {shouldShowPriceBadge ? (
                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold ${
                    isFree ? "bg-success text-text-on-accent" : "bg-price text-text-on-accent"
                  }`}
                >
                  {priceFormatted}
                </span>
              ) : (
                <svg
                  className="text-text-muted group-hover:text-primary h-5 w-5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </div>
          ))}
      </div>
    </>
  );

  // Consistent hover effect for both variants - smooth premium feel
  const cardClasses = isCompact
    ? "card group flex h-full flex-row overflow-hidden cursor-pointer"
    : "card group flex h-full flex-col overflow-hidden cursor-pointer";

  return (
    <Link
      href={linkHref}
      className={`${cardClasses} focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2`}
    >
      {cardContent}
    </Link>
  );
}

export default MaterialCard;
