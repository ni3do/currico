"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Flag,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  FileArchive,
  Presentation,
  Heart,
} from "lucide-react";
import { LP21Badge } from "@/components/curriculum/LP21Badge";
import { CheckoutButton } from "@/components/checkout/CheckoutButton";
import { useToast } from "@/components/ui/Toast";
import { getSubjectPillClass, getCyclePillClass } from "@/lib/constants/subject-colors";
import type { MaterialForPanel } from "@/lib/types/material";

interface PurchasePanelProps {
  material: MaterialForPanel;
  isFollowing: boolean;
  isWishlisted: boolean;
  downloading: boolean;
  wishlistLoading: boolean;
  onFollowToggle: () => void;
  onDownload: () => void;
  onWishlistToggle: () => void;
  onShowReport: () => void;
}

export function PurchasePanel({
  material,
  isFollowing,
  isWishlisted,
  downloading,
  wishlistLoading,
  onFollowToggle,
  onDownload,
  onWishlistToggle,
  onShowReport,
}: PurchasePanelProps) {
  const t = useTranslations("materialDetail");
  const { toast } = useToast();

  const formatIcon = (() => {
    const fmt = (material.fileFormat || "").toLowerCase();
    if (fmt.includes("pdf")) return <FileText className="h-3.5 w-3.5" />;
    if (fmt.includes("xls") || fmt.includes("excel") || fmt.includes("csv"))
      return <FileSpreadsheet className="h-3.5 w-3.5" />;
    if (fmt.includes("ppt") || fmt.includes("powerpoint") || fmt.includes("keynote"))
      return <Presentation className="h-3.5 w-3.5" />;
    if (
      fmt.includes("jpg") ||
      fmt.includes("jpeg") ||
      fmt.includes("png") ||
      fmt.includes("svg") ||
      fmt.includes("webp")
    )
      return <FileImage className="h-3.5 w-3.5" />;
    if (fmt.includes("zip") || fmt.includes("rar")) return <FileArchive className="h-3.5 w-3.5" />;
    return <File className="h-3.5 w-3.5" />;
  })();

  return (
    <div className="order-1 lg:sticky lg:top-24 lg:order-2">
      {/* Badges Row */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="pill pill-neutral inline-flex items-center gap-1">
          {formatIcon}
          {material.fileFormat || t("fileFormatUnknown")}
        </span>
        {material.isApproved ? (
          <span className="pill pill-success">{t("verified")}</span>
        ) : (
          <span className="pill pill-warning">{t("pendingStatus")}</span>
        )}
        {material.competencies &&
          material.competencies
            .slice(0, 2)
            .map((comp) => (
              <LP21Badge
                key={comp.id}
                code={comp.code}
                description={comp.description_de}
                anforderungsstufe={comp.anforderungsstufe as "grund" | "erweitert" | null}
                subjectColor={comp.subjectColor}
                size="sm"
              />
            ))}
        {material.competencies && material.competencies.length > 2 && (
          <span className="text-text-muted text-xs">+{material.competencies.length - 2}</span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-text mb-2 text-2xl font-bold sm:text-3xl">{material.title}</h1>

      {/* Inline Seller Trust Card */}
      <Link
        href={`/materialien?seller=${material.seller.id}`}
        className="border-border bg-surface/50 hover:border-primary/50 mb-4 flex items-center gap-3 rounded-lg border p-3 transition-colors"
      >
        {material.seller.image ? (
          <Image
            src={material.seller.image}
            alt={material.seller.displayName || t("anonymous")}
            width={40}
            height={40}
            className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="bg-primary text-text-on-accent flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold">
            {(material.seller.displayName || t("anonymous")).charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-text truncate font-medium">
              {material.seller.displayName || t("anonymous")}
            </span>
            {material.seller.verified && (
              <span className="text-primary flex items-center gap-1 text-xs">
                <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("verified")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-sm">
              {t("sellerMaterials", { count: material.seller.materialCount })}
            </span>
            <svg
              className="text-text-muted h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFollowToggle();
          }}
          aria-label={isFollowing ? t("a11y.unfollowSeller") : t("a11y.followSeller")}
          className={`flex-shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
            isFollowing
              ? "border-primary bg-primary-light text-primary"
              : "border-border bg-surface text-text hover:border-primary hover:bg-primary-light"
          }`}
        >
          {isFollowing ? t("following") : t("follow")}
        </button>
      </Link>

      {/* Tags Row — Subjects & Cycles */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {material.subjects.map((subj) => (
          <span key={subj} className={`pill ${getSubjectPillClass(subj)} text-xs`}>
            {subj}
          </span>
        ))}
        {material.cycles.map((c) => (
          <span key={c} className={`pill ${getCyclePillClass(c)} text-xs`}>
            {t("cycle", { number: c })}
          </span>
        ))}
      </div>

      {/* Stats Row — Downloads, Pages, Date */}
      <div className="text-text-muted mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span>{t("downloads", { count: material.downloadCount })}</span>
        {material.previewCount && material.previewCount > 0 && (
          <>
            <span className="text-border">·</span>
            <span>{t("pages", { count: material.previewCount })}</span>
          </>
        )}
        <span className="text-border">·</span>
        <span>{new Date(material.createdAt).toLocaleDateString("de-CH")}</span>
      </div>

      {/* Purchase Box */}
      <div className="border-primary/20 bg-primary/5 rounded-xl border-2 p-6" data-purchase-section>
        {/* Price */}
        <div
          className={`mb-4 text-3xl font-bold ${material.price === 0 ? "text-success" : "text-primary"}`}
        >
          {material.priceFormatted}
        </div>

        {/* Purchase Actions */}
        {!material.isApproved ? (
          <div className="border-warning/50 bg-warning/10 rounded-lg border px-6 py-4 text-center">
            <span className="text-warning font-medium">{t("availableAfterReview")}</span>
          </div>
        ) : material.price === 0 ? (
          <button
            onClick={onDownload}
            disabled={downloading}
            aria-label={t("a11y.downloadFree")}
            className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-60"
          >
            {downloading ? "..." : t("downloadFree")}
          </button>
        ) : (
          <CheckoutButton
            materialId={material.id}
            price={material.price}
            priceFormatted={material.priceFormatted}
            className="w-full"
          />
        )}

        {/* Wishlist Button */}
        <button
          onClick={onWishlistToggle}
          disabled={wishlistLoading}
          aria-label={isWishlisted ? t("a11y.removeFromWishlist") : t("a11y.addToWishlist")}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 px-4 py-2.5 font-medium transition-all disabled:opacity-60 ${
            isWishlisted
              ? "border-error bg-error/10 text-error"
              : "border-border bg-surface text-text-muted hover:border-error hover:text-error"
          }`}
        >
          <Heart
            className={`h-5 w-5 transition-transform duration-200 ease-out ${
              isWishlisted ? "scale-110" : ""
            }`}
            fill={isWishlisted ? "currentColor" : "none"}
            strokeWidth={2}
          />
          {isWishlisted ? t("wishlisted") : t("addToWishlist")}
        </button>
      </div>

      {/* Share + Report Row */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast(t("linkCopied"), "success");
          }}
          aria-label={t("a11y.shareLink")}
          className="text-text-muted hover:text-primary inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          {t("share")}
        </button>
        <button
          onClick={onShowReport}
          aria-label={t("a11y.reportMaterial")}
          className="text-text-muted hover:text-error hover:bg-error/10 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors"
        >
          <Flag className="h-4 w-4" />
          {t("reportMaterial")}
        </button>
      </div>
    </div>
  );
}

export default PurchasePanel;
