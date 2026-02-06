"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Heart } from "lucide-react";
import { getSubjectTextColor } from "@/lib/constants/subject-colors";

export interface MaterialCardProps {
  id: string;
  title: string;
  description?: string;
  subject: string;
  cycle?: string;
  priceFormatted?: string;
  previewUrl?: string | null;
  verified?: boolean;
  seller?: {
    displayName: string | null;
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
}

export function MaterialCard({
  id,
  title,
  description,
  subject,
  cycle,
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
}: MaterialCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Sync with parent's wishlist state (e.g., when wishlist is fetched after mount)
  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  const isCompact = variant === "compact";
  const linkHref = href ?? `/materialien/${id}`;
  const isFree = priceFormatted === "Gratis" || priceFormatted === "Free";
  const shouldShowPriceBadge = showPriceBadge && priceFormatted;

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!onWishlistToggle || wishlistLoading) return;

    setWishlistLoading(true);
    try {
      const success = await onWishlistToggle(id, isWishlisted);
      if (success) {
        setIsWishlisted(!isWishlisted);
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const cardContent = (
    <>
      {/* Preview Image with Price Badge */}
      <div className="bg-bg-secondary relative aspect-[16/9] w-full overflow-hidden">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={title}
            fill
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

        {/* Price Badge - Top Right with Warm Accent */}
        {shouldShowPriceBadge && (
          <span
            className={`absolute top-3 right-3 rounded-full px-3 py-1 text-sm font-bold shadow-md ${
              isFree ? "bg-success text-white" : "bg-price text-white"
            } ${isCompact ? "px-2 py-0.5 text-xs" : ""}`}
          >
            {priceFormatted}
          </span>
        )}

        {/* Wishlist Heart - Top Left */}
        {showWishlist && (
          <button
            onClick={handleWishlistClick}
            disabled={wishlistLoading}
            className={`absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110 hover:bg-white active:scale-95 disabled:opacity-50 ${
              isWishlisted ? "text-red-500" : "text-text-muted hover:text-red-500"
            }`}
            aria-label={isWishlisted ? "Aus Wunschliste entfernen" : "Zur Wunschliste hinzufügen"}
          >
            <Heart
              className={`h-5 w-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${wishlistLoading ? "animate-pulse" : ""} ${isWishlisted ? "scale-100" : "scale-90 group-hover:scale-100"}`}
              fill={isWishlisted ? "currentColor" : "none"}
              strokeWidth={2}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-1 flex-col ${isCompact ? "p-4" : "p-5"}`}>
        {/* Eyebrow Tag - Subject & Level */}
        <div className={`${isCompact ? "mb-2" : "mb-3"}`}>
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
            isCompact ? "text-base" : "mb-2 text-lg leading-snug"
          }`}
        >
          {title}
        </h3>

        {/* Description - Muted Body Text (default variant only) */}
        {!isCompact && description && (
          <p className="text-text-muted mb-4 line-clamp-2 text-sm leading-relaxed">{description}</p>
        )}

        {/* Spacer */}
        {!isCompact && <div className="mt-auto" />}

        {/* Footer */}
        {!isCompact &&
          (footer ?? (
            <div className="border-border-subtle flex items-center justify-between border-t pt-4">
              <span className="text-text-muted text-sm transition-colors duration-300">
                {seller?.displayName || "Anonymous"}
              </span>
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
            </div>
          ))}
      </div>
    </>
  );

  // Consistent hover effect for both variants - smooth premium feel
  const cardClasses = "card group flex h-full flex-col overflow-hidden cursor-pointer";

  return (
    <Link href={linkHref} className={cardClasses}>
      {cardContent}
    </Link>
  );
}

export default MaterialCard;
