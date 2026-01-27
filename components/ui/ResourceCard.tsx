"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";

export interface ResourceCardProps {
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
  /** Link href - defaults to /resources/[id] */
  href?: string;
  /** Custom pill class for subject badge */
  subjectPillClass?: string;
  /** Show/hide the price badge overlay on image */
  showPriceBadge?: boolean;
}

export function ResourceCard({
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
}: ResourceCardProps) {
  const isCompact = variant === "compact";
  const linkHref = href ?? `/resources/${id}`;
  const isFree = priceFormatted === "Gratis" || priceFormatted === "Free";
  const shouldShowPriceBadge = showPriceBadge && priceFormatted;

  // Get subject color for eyebrow tag
  const getSubjectColor = (pillClass?: string): string => {
    const colorMap: Record<string, string> = {
      "pill-deutsch": "text-subject-deutsch",
      "pill-mathe": "text-subject-mathe",
      "pill-nmg": "text-subject-nmg",
      "pill-gestalten": "text-subject-gestalten",
      "pill-musik": "text-subject-musik",
      "pill-sport": "text-subject-sport",
      "pill-fremdsprachen": "text-subject-fremdsprachen",
      "pill-medien": "text-subject-medien",
    };
    return colorMap[pillClass ?? ""] || "text-text-muted";
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
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
      </div>

      {/* Content */}
      <div className={`flex flex-1 flex-col ${isCompact ? "p-4" : "p-5"}`}>
        {/* Eyebrow Tag - Subject & Level */}
        <div className={`${isCompact ? "mb-2" : "mb-3"}`}>
          <span
            className={`text-xs font-semibold tracking-wide uppercase ${getSubjectColor(subjectPillClass)}`}
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
          className={`text-text group-hover:text-primary line-clamp-2 font-bold transition-colors ${
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
              <span className="text-text-muted text-sm">{seller?.displayName || "Anonymous"}</span>
              <svg
                className="text-text-muted group-hover:text-primary h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
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

  // Consistent hover effect for both variants
  const cardClasses =
    "card group flex h-full flex-col overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg";

  return (
    <Link href={linkHref} className={cardClasses}>
      {cardContent}
    </Link>
  );
}

export default ResourceCard;
