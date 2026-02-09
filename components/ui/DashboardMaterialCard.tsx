"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  Download,
  Eye,
  Trash2,
  ShoppingCart,
  FileText,
  CircleCheck,
  Clock,
  XCircle,
} from "lucide-react";
import { getSubjectTextColorByName } from "@/lib/constants/subject-colors";

export interface DashboardMaterialCardProps {
  id: string;
  title: string;
  description?: string;
  subject: string;
  cycle?: string;
  previewUrl?: string | null;

  // Badge configuration
  badge?: {
    label: string;
    variant: "success" | "warning" | "primary" | "neutral" | "price";
  };

  // Secondary badge (e.g., verified status)
  secondaryBadge?: {
    label: string;
    variant: "success" | "warning" | "primary" | "neutral";
  };

  // Price display
  price?: {
    formatted: string;
    isFree: boolean;
  };

  // Stats row (for uploads)
  stats?: {
    downloads?: number;
    purchases?: number;
  };

  // Seller info (for library/wishlist)
  seller?: {
    displayName: string | null;
  };

  // Actions
  primaryAction?: {
    label: string;
    icon: "download" | "view" | "cart";
    onClick?: () => void;
    href?: string;
    loading?: boolean;
  };

  // Remove button (for wishlist)
  onRemove?: () => void;
}

export function DashboardMaterialCard({
  id,
  title,
  description,
  subject,
  cycle,
  previewUrl,
  badge,
  secondaryBadge,
  price,
  stats,
  seller,
  primaryAction,
  onRemove,
}: DashboardMaterialCardProps) {
  const getBadgeClasses = (variant: string) => {
    switch (variant) {
      case "success":
        return "bg-success text-white";
      case "warning":
        return "bg-warning text-white";
      case "primary":
        return "bg-primary text-white";
      case "price":
        return "bg-price text-white";
      case "neutral":
      default:
        return "bg-text-muted text-white";
    }
  };

  const getPillClasses = (variant: string) => {
    switch (variant) {
      case "success":
        return "pill-success";
      case "warning":
        return "pill-warning";
      case "primary":
        return "pill-primary";
      case "neutral":
      default:
        return "pill-neutral";
    }
  };

  const ActionIcon =
    primaryAction?.icon === "download"
      ? Download
      : primaryAction?.icon === "cart"
        ? ShoppingCart
        : Eye;

  return (
    <div className="card group flex h-full flex-col overflow-hidden">
      {/* Preview Image */}
      <Link href={`/materialien/${id}`} className="block">
        <div className="bg-bg-secondary relative aspect-[16/9] w-full overflow-hidden">
          {previewUrl ? (
            <Image src={previewUrl} alt={title} fill className="image-zoom object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FileText className="text-text-faint h-12 w-12" />
            </div>
          )}

          {/* Price Badge - Top Right */}
          {price && (
            <span
              className={`absolute top-3 right-3 rounded-full px-3 py-1 text-sm font-bold shadow-md ${
                price.isFree ? "bg-success text-white" : "bg-price text-white"
              }`}
            >
              {price.formatted}
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Top Row: Badge + Secondary Badge / Remove Button */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {badge && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getBadgeClasses(badge.variant)}`}
                aria-label={`Status: ${badge.label}`}
              >
                {badge.variant === "success" ? (
                  <CircleCheck className="h-3 w-3" />
                ) : badge.variant === "warning" ? (
                  <Clock className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {badge.label}
              </span>
            )}
            {secondaryBadge && (
              <span className={`pill text-xs ${getPillClasses(secondaryBadge.variant)}`}>
                {secondaryBadge.label}
              </span>
            )}
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-text-muted hover:text-error -m-1 p-1 transition-colors"
              title="Entfernen"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Subject + Cycle Eyebrow */}
        <div className="mb-2">
          <span
            className={`text-xs font-semibold tracking-wide uppercase ${getSubjectTextColorByName(subject)}`}
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

        {/* Title */}
        <Link href={`/materialien/${id}`} className="block">
          <h3 className="text-text group-hover:text-primary mb-2 line-clamp-2 leading-snug font-semibold transition-colors">
            {title}
          </h3>
        </Link>

        {/* Description (optional) */}
        {description && <p className="text-text-muted mb-3 line-clamp-2 text-sm">{description}</p>}

        {/* Spacer */}
        <div className="mt-auto" />

        {/* Footer: Stats/Seller + Action Button */}
        <div className="border-border-subtle mt-3 border-t pt-3">
          {/* Stats Row (for uploads) */}
          {stats && (
            <div className="text-text-muted mb-3 flex items-center justify-between text-xs">
              {stats.downloads !== undefined && (
                <span className="flex items-center gap-1">
                  <Download className="h-3.5 w-3.5" />
                  {stats.downloads} Downloads
                </span>
              )}
              {stats.purchases !== undefined && (
                <span className="flex items-center gap-1">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  {stats.purchases} Verkäufe
                </span>
              )}
            </div>
          )}

          {/* Seller Info (for library/wishlist) */}
          {seller && (
            <div className="text-text-muted mb-3 text-sm">
              Von: {seller.displayName || "Unbekannt"}
            </div>
          )}

          {/* Primary Action Button */}
          {primaryAction &&
            (primaryAction.href ? (
              <Link
                href={primaryAction.href}
                className="bg-primary text-text-on-accent hover:bg-primary-hover flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              >
                <ActionIcon className="h-4 w-4" />
                {primaryAction.label}
              </Link>
            ) : (
              <button
                onClick={primaryAction.onClick}
                disabled={primaryAction.loading}
                className="bg-primary text-text-on-accent hover:bg-primary-hover flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
              >
                <ActionIcon className="h-4 w-4" />
                {primaryAction.loading ? "Wird geladen..." : primaryAction.label}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardMaterialCard;
