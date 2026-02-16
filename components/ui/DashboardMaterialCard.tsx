"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  Download,
  Trash2,
  ShoppingCart,
  FileText,
  CircleCheck,
  Clock,
  XCircle,
  FileEdit,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { getSubjectTextColorByName } from "@/lib/constants/subject-colors";
import { MaterialTypeBadge } from "@/components/ui/MaterialTypeBadge";

export interface DashboardMaterialCardProps {
  id: string;
  title: string;
  subject: string;
  cycle?: string;
  previewUrl?: string | null;

  // Badge configuration
  badge?: {
    label: string;
    variant: "success" | "warning" | "error" | "primary" | "neutral" | "price";
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

  // File format key for MaterialTypeBadge (e.g. "pdf", "word")
  fileFormat?: string;

  // Edit link (for uploads)
  editHref?: string;

  // Remove button (for wishlist)
  onRemove?: () => void;
}

export function DashboardMaterialCard({
  id,
  title,
  subject,
  cycle,
  previewUrl,
  badge,
  secondaryBadge,
  price,
  stats,
  seller,
  fileFormat,
  editHref,
  onRemove,
}: DashboardMaterialCardProps) {
  const t = useTranslations("dashboardCard");

  const getBadgeClasses = (variant: string) => {
    switch (variant) {
      case "success":
        return "bg-success text-white";
      case "warning":
        return "bg-warning text-white";
      case "error":
        return "bg-error text-white";
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

  return (
    <div className="card group relative flex h-full flex-col overflow-hidden">
      {/* Clickable overlay link covering the entire card */}
      <Link href={`/materialien/${id}`} className="absolute inset-0 z-0" aria-label={title} />

      {/* Preview Image */}
      <div className="bg-bg-secondary relative aspect-[4/3] w-full overflow-hidden">
        {previewUrl ? (
          <Image src={previewUrl} alt={title} fill className="image-zoom object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FileText className="text-text-faint h-8 w-8" />
          </div>
        )}
        {fileFormat && (
          <div className="absolute bottom-2 left-2 z-[1]">
            <MaterialTypeBadge format={fileFormat} size="sm" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-3 pt-2.5 pb-3">
        {/* Subject + Cycle Eyebrow with Remove Button */}
        <div className="mb-1 flex items-center justify-between">
          <span
            className={`text-[11px] font-semibold tracking-wide uppercase ${getSubjectTextColorByName(subject)}`}
          >
            {subject}
            {cycle && (
              <>
                <span className="text-text-faint mx-1">&bull;</span>
                <span className="text-text-muted">{cycle}</span>
              </>
            )}
          </span>
          <div className="flex items-center gap-1">
            {editHref && (
              <Link
                href={editHref}
                className="text-text-muted hover:text-primary relative z-10 -m-0.5 p-0.5 transition-colors"
                title={t("edit")}
              >
                <FileEdit className="h-3.5 w-3.5" />
              </Link>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                className="text-text-muted hover:text-error relative z-10 -m-0.5 p-0.5 transition-colors"
                title={t("remove")}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-text group-hover:text-primary mb-0.5 line-clamp-2 text-sm leading-snug font-semibold transition-colors">
          {title}
        </h3>

        {/* Badges */}
        {(badge || secondaryBadge) && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {badge && (
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-px text-[10px] font-semibold ${getBadgeClasses(badge.variant)}`}
                aria-label={`Status: ${badge.label}`}
              >
                {badge.variant === "success" ? (
                  <CircleCheck className="h-2.5 w-2.5" />
                ) : badge.variant === "warning" ? (
                  <Clock className="h-2.5 w-2.5" />
                ) : badge.variant === "error" ? (
                  <XCircle className="h-2.5 w-2.5" />
                ) : null}
                {badge.label}
              </span>
            )}
            {secondaryBadge && (
              <span className={`pill text-[10px] ${getPillClasses(secondaryBadge.variant)}`}>
                {secondaryBadge.label}
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="mt-auto" />

        {/* Footer */}
        <div className="border-border-subtle mt-2 border-t pt-2">
          {/* Stats Row (for uploads) */}
          {stats && (
            <div className="text-text-muted mb-2 flex items-center justify-between text-[11px]">
              {stats.downloads !== undefined && (
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {stats.downloads} {t("downloads")}
                </span>
              )}
              {stats.purchases !== undefined && (
                <span className="flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3" />
                  {stats.purchases} {t("sales")}
                </span>
              )}
            </div>
          )}

          {/* Seller Info + Price Row */}
          <div className="flex items-center justify-between gap-2">
            {seller && (
              <span className="text-text-muted truncate text-xs">
                {seller.displayName || t("unknownSeller")}
              </span>
            )}

            {price && (
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                  price.isFree ? "bg-success text-white" : "bg-price text-white"
                }`}
              >
                {price.formatted}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardMaterialCard;
