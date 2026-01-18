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
  /** Button text for default footer */
  buttonText?: string;
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
  verified = true,
  seller,
  footer,
  variant = "default",
  href,
  buttonText = "Ansehen",
  subjectPillClass,
  showPriceBadge = true,
}: ResourceCardProps) {
  const isCompact = variant === "compact";
  const linkHref = href ?? `/resources/${id}`;
  const isFree = priceFormatted === "Gratis" || priceFormatted === "Free";
  const shouldShowPriceBadge = showPriceBadge && priceFormatted;

  const cardContent = (
    <>
      {/* Preview Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-bg-secondary">
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
        {/* Price badge */}
        {shouldShowPriceBadge && (
          <span
            className={`absolute rounded-full font-bold text-white shadow-md ${
              isFree ? "bg-success" : "bg-primary"
            } ${isCompact ? "bottom-2 right-2 px-2 py-0.5 text-xs" : "bottom-3 right-3 px-3 py-1 text-sm"}`}
          >
            {priceFormatted}
          </span>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-1 flex-col ${isCompact ? "p-4" : "p-5"}`}>
        {/* Badges */}
        <div className={`flex flex-wrap items-center ${isCompact ? "mb-2 gap-1.5" : "mb-3 gap-2"}`}>
          <span className={`pill ${subjectPillClass ?? "pill-primary"} ${isCompact ? "text-xs" : ""}`}>
            {subject}
          </span>
          {cycle && (
            <span className={`pill pill-neutral ${isCompact ? "text-xs" : ""}`}>
              {cycle}
            </span>
          )}
          {verified && (
            <span className={`pill pill-success ${isCompact ? "text-xs" : ""}`}>
              Verifiziert
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className={`line-clamp-2 font-bold text-text transition-colors group-hover:text-primary ${
            isCompact ? "" : "mb-2 text-lg"
          }`}
        >
          {title}
        </h3>

        {/* Description (default variant only) */}
        {!isCompact && description && (
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-text-muted">
            {description}
          </p>
        )}

        {/* Spacer */}
        {!isCompact && <div className="mt-auto" />}

        {/* Footer */}
        {!isCompact && (
          footer ?? (
            <div className="flex items-center justify-between border-t border-border-subtle pt-4">
              <span className="text-sm text-text-muted">
                {seller?.displayName || "Anonymous"}
              </span>
              <Link
                href={linkHref}
                className="btn-primary px-4 py-2 text-sm"
              >
                {buttonText}
              </Link>
            </div>
          )
        )}
      </div>
    </>
  );

  if (isCompact) {
    return (
      <Link
        href={linkHref}
        className="card group flex h-full flex-col overflow-hidden"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <article className="card group flex h-full flex-col overflow-hidden">
      {cardContent}
    </article>
  );
}

export default ResourceCard;
