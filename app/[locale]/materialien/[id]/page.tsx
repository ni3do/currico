"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getLoginUrl } from "@/lib/utils/login-redirect";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { MaterialCard } from "@/components/ui/MaterialCard";
import { CurriculumBox } from "@/components/curriculum";
import { LP21Badge } from "@/components/curriculum/LP21Badge";
import { CheckoutButton } from "@/components/checkout/CheckoutButton";
import { PreviewGallery } from "@/components/ui/PreviewGallery";
import { ReviewsSection } from "@/components/reviews";
import { CommentsSection } from "@/components/comments";
import { Flag } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { FocusTrap } from "@/components/ui/FocusTrap";

interface Competency {
  id: string;
  code: string;
  description_de: string;
  anforderungsstufe?: string | null;
  subjectCode?: string;
  subjectColor?: string;
}

interface Transversal {
  id: string;
  code: string;
  name_de: string;
  icon?: string | null;
  color?: string | null;
}

interface BneTheme {
  id: string;
  code: string;
  name_de: string;
  sdg_number?: number | null;
  icon?: string | null;
  color?: string | null;
}

interface Material {
  id: string;
  title: string;
  description: string;
  price: number;
  priceFormatted: string;
  fileUrl: string;
  fileFormat?: string;
  previewUrl: string | null;
  previewUrls?: string[];
  previewCount?: number;
  hasAccess?: boolean;
  subjects: string[];
  cycles: string[];
  subject: string;
  cycle: string;
  createdAt: string;
  downloadCount: number;
  isApproved: boolean;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  seller: {
    id: string;
    displayName: string | null;
    image: string | null;
    verified: boolean;
    materialCount: number;
  };
  // LP21 curriculum fields
  isMiIntegrated?: boolean;
  competencies?: Competency[];
  transversals?: Transversal[];
  bneThemes?: BneTheme[];
}

interface RelatedMaterial {
  id: string;
  title: string;
  price: number;
  priceFormatted: string;
  subject: string;
  cycle: string;
  verified: boolean;
  previewUrl: string | null;
  sellerName: string | null;
}

export default function MaterialDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session, status: sessionStatus } = useSession();
  const tCommon = useTranslations("common");
  const t = useTranslations("materialDetail");
  const { toast } = useToast();

  const [material, setMaterial] = useState<Material | null>(null);
  const [relatedMaterials, setRelatedMaterials] = useState<RelatedMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Report form state
  const [reportReason, setReportReason] = useState("inappropriate");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportStatus, setReportStatus] = useState<"idle" | "success" | "error">("idle");
  const [reportErrorMessage, setReportErrorMessage] = useState("");

  const fetchMaterial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/materials/${id}`);
      if (response.status === 404) {
        setError("not_found");
        return;
      }
      if (!response.ok) {
        setError("fetch_error");
        return;
      }
      const data = await response.json();
      setMaterial(data.material);
      setRelatedMaterials(data.relatedMaterials);
    } catch {
      setError("fetch_error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchMaterial();
    }
  }, [id, fetchMaterial]);

  // Check if resource is wishlisted and if following seller
  useEffect(() => {
    const checkWishlistAndFollowing = async () => {
      if (sessionStatus !== "authenticated" || !id) return;
      try {
        const [wishlistRes, followingRes] = await Promise.all([
          fetch("/api/user/wishlist"),
          fetch("/api/user/following"),
        ]);
        if (wishlistRes.ok) {
          const data = await wishlistRes.json();
          const isInWishlist = data.items.some((item: { id: string }) => item.id === id);
          setIsWishlisted(isInWishlist);
        }
        if (followingRes.ok && material?.seller?.id) {
          const data = await followingRes.json();
          const isFollowingSeller = data.sellers.some(
            (s: { id: string }) => s.id === material.seller.id
          );
          setIsFollowing(isFollowingSeller);
        }
      } catch (error) {
        console.error("Error checking wishlist/following:", error);
      }
    };
    checkWishlistAndFollowing();
  }, [id, sessionStatus, material?.seller?.id]);

  // Handle download for free resources
  const handleDownload = async () => {
    if (sessionStatus !== "authenticated") {
      window.location.href = getLoginUrl(window.location.pathname);
      return;
    }

    setDownloading(true);
    try {
      // Open the download in a new tab
      window.open(`/api/materials/${id}/download`, "_blank");
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setDownloading(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (sessionStatus !== "authenticated") {
      window.location.href = getLoginUrl(window.location.pathname);
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        // Remove from wishlist
        const response = await fetch(`/api/user/wishlist?resourceId=${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setIsWishlisted(false);
          toast(tCommon("toast.removedFromWishlist"), "success");
        }
      } else {
        // Add to wishlist
        const response = await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceId: id }),
        });
        if (response.ok) {
          setIsWishlisted(true);
          toast(tCommon("toast.addedToWishlist"), "success");
        }
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast(tCommon("toast.error"), "error");
    } finally {
      setWishlistLoading(false);
    }
  };

  // Handle report submission
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sessionStatus !== "authenticated") {
      window.location.href = getLoginUrl(window.location.pathname);
      return;
    }

    setReportSubmitting(true);
    setReportErrorMessage("");

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: reportReason,
          description: reportDescription || undefined,
          resource_id: id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("report.errorSend"));
      }

      setReportStatus("success");
      toast(tCommon("toast.reportSubmitted"), "success");
      // Close modal after showing success message
      setTimeout(() => {
        setShowReportModal(false);
        // Reset form state after closing
        setReportStatus("idle");
        setReportReason("inappropriate");
        setReportDescription("");
      }, 2000);
    } catch (error) {
      setReportStatus("error");
      setReportErrorMessage(error instanceof Error ? error.message : t("report.errorUnexpected"));
    } finally {
      setReportSubmitting(false);
    }
  };

  // Reset report modal state when closing
  const handleCloseReportModal = () => {
    setShowReportModal(false);
    // Only reset if not showing success
    if (reportStatus !== "success") {
      setReportStatus("idle");
      setReportReason("inappropriate");
      setReportDescription("");
      setReportErrorMessage("");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="animate-pulse">
            {/* Breadcrumb skeleton */}
            <div className="bg-surface mb-6 h-4 w-64 rounded" />

            {/* Hero section skeleton */}
            <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
              {/* Preview skeleton */}
              <div className="order-2 lg:order-1">
                <div className="bg-surface aspect-[3/4] w-full rounded-xl" />
              </div>

              {/* Info panel skeleton */}
              <div className="order-1 lg:order-2">
                {/* Badges */}
                <div className="mb-3 flex gap-2">
                  <div className="bg-surface h-6 w-12 rounded-full" />
                  <div className="bg-surface h-6 w-20 rounded-full" />
                </div>
                {/* Title */}
                <div className="bg-surface mb-4 h-9 w-3/4 rounded" />
                {/* Seller card */}
                <div className="border-border mb-4 flex items-center gap-3 rounded-lg border p-3">
                  <div className="bg-surface h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <div className="bg-surface mb-1.5 h-4 w-32 rounded" />
                    <div className="bg-surface h-3 w-24 rounded" />
                  </div>
                  <div className="bg-surface h-8 w-20 rounded-lg" />
                </div>
                {/* Metadata */}
                <div className="bg-surface mb-6 h-4 w-2/3 rounded" />
                {/* Purchase box */}
                <div className="border-primary/20 bg-primary/5 rounded-xl border-2 p-6">
                  <div className="bg-surface mb-4 h-9 w-24 rounded" />
                  <div className="bg-surface mb-4 h-14 w-full rounded-lg" />
                  <div className="bg-surface h-12 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error states
  if (error === "not_found") {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="py-16 text-center">
            <svg
              className="text-text-muted mx-auto mb-6 h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="text-text mb-4 text-2xl font-bold sm:text-3xl">{t("notFound")}</h1>
            <p className="text-text-muted mx-auto mb-8 max-w-md">{t("notFoundDescription")}</p>
            <Link
              href="/materialien"
              className="btn-primary inline-flex items-center px-6 py-3 font-semibold"
            >
              {t("backToMaterials")}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="py-16 text-center">
            <svg
              className="text-error mx-auto mb-6 h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h1 className="text-text mb-4 text-2xl font-bold sm:text-3xl">{t("loadError")}</h1>
            <p className="text-text-muted mx-auto mb-8 max-w-md">{t("loadErrorDescription")}</p>
            <button
              onClick={fetchMaterial}
              className="btn-primary inline-flex items-center px-6 py-3 font-semibold"
            >
              {t("retry")}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-24 sm:px-6 sm:py-12 lg:px-8 lg:pb-8">
        {/* Pending Review Banner */}
        {!material.isApproved && (
          <div className="border-warning/50 bg-warning/10 mb-6 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <svg
                className="text-warning h-5 w-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-warning font-medium">{t("pendingReview")}</p>
                <p className="text-text-muted text-sm">{t("pendingReviewDescription")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: tCommon("breadcrumb.materials"), href: "/materialien" },
            { label: material.subject, href: `/materialien?subject=${material.subject}` },
            { label: material.title },
          ]}
          className="mb-8"
        />

        {/* HERO SECTION: Preview + Purchase (2-column on desktop) */}
        <section className="mb-12">
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Column 1: Preview Gallery - Primary Visual */}
            <div className="order-2 lg:order-1">
              {material.previewUrls?.length || material.previewUrl ? (
                <PreviewGallery
                  previewUrls={
                    material.previewUrls?.length
                      ? material.previewUrls
                      : material.previewUrl
                        ? [material.previewUrl]
                        : []
                  }
                  previewCount={material.previewCount || 1}
                  hasAccess={material.hasAccess ?? material.price === 0}
                  resourceTitle={material.title}
                  priceFormatted={material.priceFormatted}
                  onPurchaseClick={() => {
                    const purchaseSection = document.querySelector("[data-purchase-section]");
                    purchaseSection?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                />
              ) : (
                <div className="border-border bg-bg flex aspect-[3/4] max-h-[70vh] items-center justify-center rounded-xl border">
                  <div className="text-text-muted text-center">
                    <svg
                      className="mx-auto mb-2 h-16 w-16"
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
              )}
            </div>

            {/* Column 2: Info + Purchase Panel */}
            <div className="order-1 lg:sticky lg:top-24 lg:order-2">
              {/* Badges Row */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="pill pill-neutral">{material.fileFormat || "PDF"}</span>
                {material.isApproved ? (
                  <span className="pill pill-success">{t("verified")}</span>
                ) : (
                  <span className="pill pill-warning">{t("pendingStatus")}</span>
                )}
                {/* LP21 badges for primary competencies */}
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
                  <span className="text-text-muted text-xs">
                    +{material.competencies.length - 2}
                  </span>
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
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={material.seller.image}
                    alt={material.seller.displayName || t("anonymous")}
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
                        <svg
                          className="h-3.5 w-3.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (sessionStatus !== "authenticated") {
                      window.location.href = getLoginUrl(window.location.pathname);
                      return;
                    }
                    const previousState = isFollowing;
                    setIsFollowing(!isFollowing);
                    try {
                      const response = await fetch(`/api/users/${material.seller.id}/follow`, {
                        method: previousState ? "DELETE" : "POST",
                      });
                      if (!response.ok) {
                        setIsFollowing(previousState);
                        toast(tCommon("toast.error"), "error");
                      }
                    } catch {
                      setIsFollowing(previousState);
                      toast(tCommon("toast.error"), "error");
                    }
                  }}
                  className={`flex-shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                    isFollowing
                      ? "border-primary bg-primary-light text-primary"
                      : "border-border bg-surface text-text hover:border-primary hover:bg-primary-light"
                  }`}
                >
                  {isFollowing ? t("following") : t("follow")}
                </button>
              </Link>

              {/* Quick Metadata Row */}
              <div className="text-text-muted mb-6 flex flex-wrap items-center gap-2 text-sm">
                <span className={`pill pill-${material.subject.toLowerCase()} text-xs`}>
                  {material.subject}
                </span>
                <span className="text-border">·</span>
                <span>{t("cycle", { number: material.cycle || "-" })}</span>
                <span className="text-border">·</span>
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
              <div
                className="border-primary/20 bg-primary/5 rounded-xl border-2 p-6"
                data-purchase-section
              >
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
                    onClick={handleDownload}
                    disabled={downloading}
                    className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50"
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
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 px-4 py-2.5 font-medium transition-all disabled:opacity-50 ${
                    isWishlisted
                      ? "border-error bg-error/10 text-error"
                      : "border-border bg-surface text-text-muted hover:border-error hover:text-error"
                  }`}
                >
                  <svg
                    className={`h-5 w-5 transition-transform duration-200 ease-out ${
                      isWishlisted ? "animate-[heartBeat_0.3s_ease-in-out]" : ""
                    }`}
                    fill={isWishlisted ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
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
                  onClick={() => setShowReportModal(true)}
                  className="text-text-muted hover:text-error hover:bg-error/10 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors"
                >
                  <Flag className="h-4 w-4" />
                  {t("reportMaterial")}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* DESCRIPTION SECTION */}
        <section className="mb-12 max-w-3xl">
          <h2 className="text-text mb-4 text-xl font-semibold">{t("description")}</h2>
          <p className="text-text-secondary leading-relaxed whitespace-pre-line">
            {material.description}
          </p>
        </section>

        {/* LP21 CURRICULUM SECTION */}
        {(material.competencies?.length ||
          material.transversals?.length ||
          material.bneThemes?.length ||
          material.isMiIntegrated) && (
          <section className="mb-12">
            <CurriculumBox
              competencies={material.competencies}
              transversals={material.transversals}
              bneThemes={material.bneThemes}
              isMiIntegrated={material.isMiIntegrated}
            />
          </section>
        )}

        {/* REVIEWS SECTION */}
        <section className="border-border mb-12 border-t pt-12">
          <ReviewsSection materialId={id} />
        </section>

        {/* COMMENTS SECTION */}
        <section className="border-border mb-12 border-t pt-12">
          <CommentsSection materialId={id} />
        </section>

        {/* RELATED RESOURCES */}
        {relatedMaterials.length > 0 && (
          <section className="border-border border-t pt-12">
            <h2 className="text-text mb-6 text-xl font-semibold">{t("similarMaterials")}</h2>
            <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
              {relatedMaterials.map((related) => (
                <MaterialCard
                  key={related.id}
                  id={related.id}
                  title={related.title}
                  subject={related.subject}
                  cycle={related.cycle}
                  priceFormatted={related.priceFormatted}
                  previewUrl={related.previewUrl}
                  seller={{ displayName: related.sellerName }}
                  anonymousLabel={t("anonymous")}
                  variant="compact"
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Report Modal */}
      {showReportModal && (
        <div className="bg-ctp-crust/50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <FocusTrap onEscape={handleCloseReportModal}>
            <div className="card mx-4 w-full max-w-md p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-text text-xl font-semibold">{t("report.title")}</h3>
                <button
                  onClick={handleCloseReportModal}
                  className="text-text-muted hover:text-text"
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
              </div>

              {reportStatus === "success" ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="bg-success-light mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                    <svg
                      className="text-success h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h4 className="text-text mb-2 font-semibold">{t("report.successTitle")}</h4>
                  <p className="text-text-muted text-sm">{t("report.successDescription")}</p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="report-reason"
                      className="text-text mb-2 block text-sm font-medium"
                    >
                      {t("report.reason")}
                    </label>
                    <select
                      id="report-reason"
                      name="reason"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="input rounded-full"
                      required
                    >
                      <option value="inappropriate">{t("report.reasons.inappropriate")}</option>
                      <option value="copyright">{t("report.reasons.copyright")}</option>
                      <option value="quality">{t("report.reasons.quality")}</option>
                      <option value="spam">{t("report.reasons.spam")}</option>
                      <option value="fraud">{t("report.reasons.fraud")}</option>
                      <option value="other">{t("report.reasons.other")}</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="report-description"
                      className="text-text mb-2 block text-sm font-medium"
                    >
                      {t("report.commentLabel")}
                    </label>
                    <textarea
                      id="report-description"
                      name="description"
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      rows={4}
                      maxLength={1000}
                      className="input min-h-[100px] resize-y"
                      placeholder={t("report.commentPlaceholder")}
                    />
                  </div>

                  {/* Error Message */}
                  {reportStatus === "error" && reportErrorMessage && (
                    <div className="border-error/50 bg-error/10 flex items-center gap-3 rounded-lg border p-3">
                      <svg
                        className="text-error h-5 w-5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-error text-sm">{reportErrorMessage}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={reportSubmitting}
                      className="btn-danger flex-1 px-4 py-3 disabled:opacity-50"
                    >
                      {reportSubmitting ? t("report.submitting") : t("report.submit")}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseReportModal}
                      disabled={reportSubmitting}
                      className="btn-secondary px-6 py-3 disabled:opacity-50"
                    >
                      {t("report.cancel")}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </FocusTrap>
        </div>
      )}

      {/* Mobile Sticky Purchase Bar */}
      {material.isApproved && (
        <div className="border-border bg-surface fixed inset-x-0 bottom-0 z-40 border-t p-4 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div
                className={`text-xl font-bold ${material.price === 0 ? "text-success" : "text-primary"}`}
              >
                {material.priceFormatted}
              </div>
              <div className="text-text-muted text-xs">{material.title}</div>
            </div>
            {material.price === 0 ? (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-action px-6 py-3 font-semibold disabled:opacity-50"
              >
                {downloading ? "..." : t("download")}
              </button>
            ) : (
              <button
                onClick={() => {
                  const purchaseSection = document.querySelector("[data-purchase-section]");
                  purchaseSection?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="btn-action px-6 py-3 font-semibold"
              >
                {t("buy")}
              </button>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
