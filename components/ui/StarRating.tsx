"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  showValue = false,
  className = "",
}: StarRatingProps) {
  const t = useTranslations("reviews");
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const gapClasses = {
    sm: "gap-0.5",
    md: "gap-1",
    lg: "gap-1.5",
  };

  const textClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`flex items-center ${gapClasses[size]} ${className}`}>
      <div className={`flex ${gapClasses[size]}`}>
        {Array.from({ length: maxRating }, (_, i) => {
          const value = i + 1;
          const isFilled = value <= displayRating;
          const isPartiallyFilled = value - 0.5 <= displayRating && value > displayRating;

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(value)}
              onMouseEnter={() => handleMouseEnter(value)}
              onMouseLeave={handleMouseLeave}
              disabled={!interactive}
              className={`relative transition-transform ${
                interactive
                  ? "focus:ring-primary cursor-pointer rounded hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  : "cursor-default"
              }`}
              aria-label={t("starsLabel", { count: value })}
            >
              {/* Background star (empty) */}
              <Star
                className={`${sizeClasses[size]} text-text-faint`}
                fill="none"
                strokeWidth={1.5}
              />
              {/* Foreground star (filled) */}
              {(isFilled || isPartiallyFilled) && (
                <Star
                  className={`${sizeClasses[size]} text-warning absolute inset-0`}
                  fill="currentColor"
                  strokeWidth={0}
                  style={
                    isPartiallyFilled
                      ? {
                          clipPath: `inset(0 ${100 - (displayRating - Math.floor(displayRating)) * 100}% 0 0)`,
                        }
                      : undefined
                  }
                />
              )}
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className={`text-text-muted ml-1 ${textClasses[size]}`}>{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

// Rating summary component for displaying aggregate ratings
interface RatingSummaryProps {
  averageRating: number;
  totalReviews: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RatingSummary({
  averageRating,
  totalReviews,
  size = "md",
  className = "",
}: RatingSummaryProps) {
  const t = useTranslations("reviews");
  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <StarRating rating={averageRating} size={size} showValue />
      <span className={`text-text-muted ${textClasses[size]}`}>
        ({t("basedOn", { count: totalReviews })})
      </span>
    </div>
  );
}

// Rating distribution component for showing rating breakdown
interface RatingDistributionProps {
  distribution: { [key: number]: number };
  totalReviews: number;
  className?: string;
}

export function RatingDistribution({
  distribution,
  totalReviews,
  className = "",
}: RatingDistributionProps) {
  const t = useTranslations("reviews");

  return (
    <div className={`space-y-1 ${className}`} role="list" aria-label={t("title")}>
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = distribution[stars] || 0;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return (
          <div
            key={stars}
            className="flex items-center gap-2 text-sm"
            role="listitem"
            aria-label={`${t("starsLabel", { count: stars })}: ${count}`}
          >
            <span className="text-text-muted w-6 text-right text-xs">{stars}</span>
            <Star
              className="text-warning h-3 w-3 flex-shrink-0"
              fill="currentColor"
              strokeWidth={0}
            />
            <div
              className="bg-surface-hover h-2 flex-1 overflow-hidden rounded-full"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="bg-warning h-full rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-text-muted w-6 text-right text-xs">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default StarRating;
