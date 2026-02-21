"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { getLoginUrl } from "@/lib/utils/login-redirect";
import { getSubjectPillClass } from "@/lib/constants/subject-colors";
import { Frown, AlertTriangle, Clock, FileText } from "lucide-react";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { MaterialCard } from "@/components/ui/MaterialCard";
import { CurriculumBox } from "@/components/curriculum";
import { PreviewGallery } from "@/components/ui/PreviewGallery";
import { ReviewsSection } from "@/components/reviews";
import { useToast } from "@/components/ui/Toast";
import { FadeIn } from "@/components/ui/animations";
import { PurchasePanel } from "@/components/materials/PurchasePanel";
import { ReportModal } from "@/components/materials/ReportModal";
import type { Material, RelatedMaterial } from "@/lib/types/material";
import { MaterialDetailSkeleton } from "@/components/ui/Skeleton";

export default function MaterialDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { status: sessionStatus } = useSession();
  const router = useRouter();
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
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

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
      // Record download first, then open file — ensures the download record
      // exists before we refresh the review section (fixes race condition)
      const res = await fetch(`/api/materials/${id}/download`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Download failed");
      }
      const { downloadUrl } = await res.json();
      window.open(downloadUrl, "_blank");
      toast(t("downloadStarted"), "success");
      // Refresh review section so user can leave a review without page reload
      setReviewRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("Download error:", error);
      toast(tCommon("errors.generic"), "error");
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
        const response = await fetch(`/api/user/wishlist?resourceId=${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setIsWishlisted(false);
          toast(tCommon("toast.removedFromWishlist"), "success");
        }
      } else {
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

  // Handle follow toggle
  const handleFollowToggle = async () => {
    if (sessionStatus !== "authenticated") {
      window.location.href = getLoginUrl(window.location.pathname);
      return;
    }
    if (!material) return;
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
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <MaterialDetailSkeleton />
        </main>
        <Footer />
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
            <Frown
              className="text-text-muted mx-auto mb-6 h-16 w-16"
              strokeWidth={1.5}
              aria-hidden="true"
            />
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
            <AlertTriangle
              className="text-error mx-auto mb-6 h-16 w-16"
              strokeWidth={1.5}
              aria-hidden="true"
            />
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
              <Clock className="text-warning h-5 w-5 flex-shrink-0" aria-hidden="true" />
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
            ...(material.cycles[0]
              ? [
                  {
                    label: material.cycles[0],
                    href: `/materialien?zyklus=${encodeURIComponent(material.cycles[0])}`,
                  },
                ]
              : []),
            {
              label: material.subjects[0] || t("subjectFallback"),
              href: `/materialien?${material.cycles[0] ? `zyklus=${encodeURIComponent(material.cycles[0])}&` : ""}fachbereich=${encodeURIComponent(material.subjects[0] || "")}`,
            },
            { label: material.title },
          ]}
          className="mb-8"
        />

        {/* HERO SECTION: Preview + Purchase (2-column on desktop) */}
        <FadeIn>
          <section className="mb-12">
            <div className="grid items-start gap-8 lg:grid-cols-[2fr_1fr] lg:gap-12">
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
                      <FileText
                        className="mx-auto mb-2 h-16 w-16"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      <p className="text-sm">{t("noPreview")}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Column 2: Info + Purchase Panel */}
              <PurchasePanel
                material={material}
                isFollowing={isFollowing}
                isWishlisted={isWishlisted}
                downloading={downloading}
                wishlistLoading={wishlistLoading}
                onFollowToggle={handleFollowToggle}
                onDownload={handleDownload}
                onWishlistToggle={handleWishlistToggle}
                onShowReport={() => setShowReportModal(true)}
              />
            </div>
          </section>
        </FadeIn>

        {/* DESCRIPTION SECTION */}
        <section className="mb-12 max-w-3xl">
          <h2 className="text-text mb-4 text-xl font-semibold">{t("description")}</h2>
          <p className="text-text-secondary leading-relaxed whitespace-pre-line">
            {material.description}
          </p>

          {/* Tags */}
          {material.tags && material.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {material.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/materialien?tags=${encodeURIComponent(tag)}`}
                  className="bg-surface hover:bg-primary/10 hover:text-primary text-text-muted inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
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

        {/* FEEDBACK SECTION: Reviews */}
        <section className="border-border mb-12 border-t pt-12">
          <h2 className="text-text mb-8 text-xl font-semibold">{t("feedbackTitle")}</h2>
          <ReviewsSection materialId={id} hideTitle refreshKey={reviewRefreshKey} />
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
                  subject={related.subjects[0] || t("subjectFallback")}
                  subjectPillClass={getSubjectPillClass(related.subjects[0] || "")}
                  cycle={related.cycles[0] || ""}
                  price={related.price}
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
      {showReportModal && <ReportModal materialId={id} onClose={() => setShowReportModal(false)} />}

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
                aria-label={t("a11y.downloadFree")}
                className="btn-action px-6 py-3 font-semibold disabled:opacity-60"
              >
                {downloading ? "..." : t("download")}
              </button>
            ) : (
              <button
                onClick={() => {
                  const purchaseSection = document.querySelector("[data-purchase-section]");
                  purchaseSection?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                aria-label={t("a11y.scrollToPurchase")}
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
