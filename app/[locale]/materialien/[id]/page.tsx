"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { MaterialCard } from "@/components/ui/MaterialCard";
import { CurriculumBox } from "@/components/curriculum";
import { PreviewGallery } from "@/components/ui/PreviewGallery";
import { ReviewsSection } from "@/components/reviews";
import { CommentsSection } from "@/components/comments";
import { useToast } from "@/components/ui/Toast";
import { PurchasePanel } from "@/components/materials/PurchasePanel";
import { ReportModal } from "@/components/materials/ReportModal";

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
      router.push("/anmelden");
      return;
    }

    setDownloading(true);
    try {
      window.open(`/api/materials/${id}/download`, "_blank");
      toast(t("downloadStarted"), "success");
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
      router.push("/anmelden");
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
      router.push("/anmelden");
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
          <div className="animate-pulse">
            <div className="bg-surface mb-6 h-4 w-64 rounded" />
            <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="order-2 lg:order-1">
                <div className="bg-surface aspect-[3/4] w-full rounded-xl" />
              </div>
              <div className="order-1 lg:order-2">
                <div className="mb-3 flex gap-2">
                  <div className="bg-surface h-6 w-12 rounded-full" />
                  <div className="bg-surface h-6 w-20 rounded-full" />
                </div>
                <div className="bg-surface mb-4 h-9 w-3/4 rounded" />
                <div className="border-border mb-4 flex items-center gap-3 rounded-lg border p-3">
                  <div className="bg-surface h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <div className="bg-surface mb-1.5 h-4 w-32 rounded" />
                    <div className="bg-surface h-3 w-24 rounded" />
                  </div>
                  <div className="bg-surface h-8 w-20 rounded-lg" />
                </div>
                <div className="bg-surface mb-6 h-4 w-2/3 rounded" />
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

        {/* FEEDBACK SECTION: Reviews & Comments merged */}
        <section className="border-border mb-12 border-t pt-12">
          <h2 className="text-text mb-8 text-2xl font-bold">{t("feedbackTitle")}</h2>
          <ReviewsSection materialId={id} hideTitle />
          <div className="border-border/50 my-8 border-t" />
          <CommentsSection materialId={id} hideTitle />
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
