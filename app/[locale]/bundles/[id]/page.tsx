"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Package, FileText, Tag } from "lucide-react";

interface BundleResource {
  id: string;
  title: string;
  price: number;
  priceFormatted: string;
  previewUrl: string | null;
  description: string | null;
}

interface Bundle {
  id: string;
  title: string;
  description: string | null;
  price: number;
  priceFormatted: string;
  subject: string;
  subjects: string[];
  cycle: string;
  cycles: string[];
  coverImageUrl: string | null;
  createdAt: string;
  seller: {
    id: string;
    displayName: string | null;
    image: string | null;
    verified: boolean;
    resourceCount: number;
  };
  resources: BundleResource[];
  resourceCount: number;
  totalIndividualPrice: number;
  totalIndividualPriceFormatted: string;
  savings: number;
  savingsFormatted: string;
  savingsPercent: number;
}

export default function BundleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { status: sessionStatus } = useSession();
  const tCommon = useTranslations("common");
  const t = useTranslations("bundleDetail");
  const locale = useLocale();

  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchBundle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bundles/${id}`);
      if (response.status === 404) {
        setError("not_found");
        return;
      }
      if (!response.ok) {
        setError("fetch_error");
        return;
      }
      const data = await response.json();
      setBundle(data.bundle);
    } catch {
      setError("fetch_error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchBundle();
    }
  }, [id, fetchBundle]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-surface mb-8 h-4 w-48 rounded" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="card rounded-2xl p-8">
                  <div className="mb-4 flex gap-3">
                    <div className="bg-surface h-6 w-16 rounded-full" />
                    <div className="bg-surface h-6 w-24 rounded-full" />
                  </div>
                  <div className="bg-surface mb-6 h-10 w-3/4 rounded" />
                  <div className="bg-surface mb-4 h-4 w-full rounded" />
                  <div className="bg-surface mb-4 h-4 w-5/6 rounded" />
                  <div className="bg-surface mb-8 h-4 w-2/3 rounded" />
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="card rounded-2xl p-6">
                  <div className="bg-surface mb-4 h-5 w-24 rounded" />
                  <div className="flex gap-3">
                    <div className="bg-surface h-12 w-12 rounded-full" />
                    <div>
                      <div className="bg-surface mb-2 h-4 w-32 rounded" />
                      <div className="bg-surface h-3 w-24 rounded" />
                    </div>
                  </div>
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
          <div className="text-center">
            <Package className="text-text-muted mx-auto mb-4 h-16 w-16" />
            <h1 className="text-text mb-4 text-2xl font-bold sm:text-3xl">{t("notFound")}</h1>
            <p className="text-text-muted mb-8">{t("notFoundDescription")}</p>
            <Link
              href="/materialien"
              className="btn-primary inline-flex items-center px-6 py-3 font-semibold"
            >
              {t("backToMaterials")}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="text-center">
            <h1 className="text-text mb-4 text-2xl font-bold sm:text-3xl">{t("loadError")}</h1>
            <p className="text-text-muted mb-8">{t("loadErrorDescription")}</p>
            <button
              onClick={fetchBundle}
              className="btn-primary inline-flex items-center px-6 py-3 font-semibold"
            >
              {t("retry")}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: tCommon("breadcrumb.materials"), href: "/materialien" },
            { label: tCommon("breadcrumb.bundles"), href: "/materialien" },
            { label: bundle.title },
          ]}
          className="mb-8"
        />

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Primary Information */}
            <div className="card p-8">
              {/* Title and Badges */}
              <div className="mb-6">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="pill bg-accent/10 text-accent flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" />
                    {t("bundle")}
                  </span>
                  <span className="pill pill-success">{t("verified")}</span>
                  {bundle.savingsPercent > 0 && (
                    <span className="pill bg-success/10 text-success flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      {t("discount", { percent: bundle.savingsPercent })}
                    </span>
                  )}
                </div>
                <h1 className="text-text text-2xl font-bold sm:text-3xl">{bundle.title}</h1>
              </div>

              {/* Description */}
              {bundle.description && (
                <p className="text-text-muted mb-6 leading-relaxed">{bundle.description}</p>
              )}

              {/* Price and Savings */}
              <div className="border-border bg-bg mb-8 rounded-xl border p-6">
                <div className="mb-4 flex flex-wrap items-baseline gap-4">
                  <div className="text-primary text-4xl font-bold">{bundle.priceFormatted}</div>
                  {bundle.savings > 0 && (
                    <div className="text-text-muted text-lg line-through">
                      {bundle.totalIndividualPriceFormatted}
                    </div>
                  )}
                </div>
                {bundle.savings > 0 && (
                  <p className="text-success text-sm font-medium">
                    {t("savings", {
                      amount: bundle.savingsFormatted,
                      percent: bundle.savingsPercent,
                    })}
                  </p>
                )}
                <div className="mt-4">
                  {/* TODO: Bundle checkout integration */}
                  <button className="btn-primary w-full px-8 py-4" disabled>
                    {t("buyBundle", { price: bundle.priceFormatted })}
                  </button>
                  <p className="text-text-muted mt-2 text-center text-xs">{t("comingSoon")}</p>
                </div>
              </div>

              {/* Included Resources */}
              <div className="mb-8">
                <h2 className="text-text mb-4 text-xl font-semibold">
                  {t("includedMaterials", { count: bundle.resourceCount })}
                </h2>
                <div className="space-y-3">
                  {bundle.resources.map((resource) => (
                    <Link
                      key={resource.id}
                      href={`/materialien/${resource.id}`}
                      className="border-border bg-bg hover:border-primary group flex items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-sm"
                    >
                      {/* Preview thumbnail */}
                      {resource.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resource.previewUrl}
                          alt={resource.title}
                          className="h-16 w-12 flex-shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="bg-surface flex h-16 w-12 flex-shrink-0 items-center justify-center rounded-lg">
                          <FileText className="text-text-muted h-6 w-6" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-text group-hover:text-primary truncate font-medium transition-colors">
                          {resource.title}
                        </h3>
                        {resource.description && (
                          <p className="text-text-muted mt-1 line-clamp-1 text-sm">
                            {resource.description}
                          </p>
                        )}
                      </div>
                      <div className="text-text-muted flex-shrink-0 text-sm">
                        {resource.priceFormatted}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Metadata Block */}
              <div className="border-border bg-bg rounded-xl border p-6">
                <h3 className="text-text mb-4 font-semibold">{t("details")}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-text-muted text-sm">{t("subject")}</div>
                    <div className="text-text font-medium">{bundle.subject}</div>
                  </div>
                  <div>
                    <div className="text-text-muted text-sm">{t("cycle")}</div>
                    <div className="text-text font-medium">{bundle.cycle || "-"}</div>
                  </div>
                  <div>
                    <div className="text-text-muted text-sm">{t("materials")}</div>
                    <div className="text-text font-medium">{bundle.resourceCount}</div>
                  </div>
                  <div>
                    <div className="text-text-muted text-sm">{t("published")}</div>
                    <div className="text-text font-medium">
                      {new Date(bundle.createdAt).toLocaleDateString(
                        locale === "de" ? "de-CH" : "en-CH"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Seller Info */}
            <div className="card sticky top-24 p-6">
              <h3 className="text-text mb-4 font-semibold">{t("createdBy")}</h3>
              <div className="mb-4 flex items-center gap-3">
                {bundle.seller.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bundle.seller.image}
                    alt={bundle.seller.displayName || t("seller")}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="bg-primary text-text-on-accent flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold">
                    {(bundle.seller.displayName || "A").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-text font-medium">
                      {bundle.seller.displayName || t("anonymous")}
                    </span>
                    {bundle.seller.verified && (
                      <svg className="text-primary h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="text-text-muted text-sm">
                    {bundle.seller.resourceCount} {t("materials")}
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`w-full rounded-lg border-2 px-4 py-3 font-medium transition-all ${
                  isFollowing
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border bg-bg text-text hover:border-primary hover:bg-primary-light"
                }`}
              >
                {isFollowing ? t("following") : t("follow")}
              </button>

              {/* More from Seller */}
              <div className="border-border mt-6 border-t pt-6">
                <Link
                  href={`/materialien?seller=${bundle.seller.id}`}
                  className="text-primary hover:text-primary-hover text-sm font-medium transition-colors"
                >
                  {t("viewAllMaterials")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
