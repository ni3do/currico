"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  TrendingUp,
  Download,
  ShoppingCart,
  FileText,
  ExternalLink,
  Trash2,
  Sparkles,
  Clock,
  CircleCheck,
  FileEdit,
  BarChart3,
  ArrowUpRight,
  XCircle,
  AlertCircle,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WelcomeGuide } from "@/components/account/WelcomeGuide";
import { EmailVerificationBanner } from "@/components/account/EmailVerificationBanner";
import { StripeConnectStatus } from "@/components/account/StripeConnectStatus";
import { DeleteConfirmDialog } from "@/components/account/DeleteConfirmDialog";
// SellerLevelCard moved to /konto/rewards
import { ProfileCompletionProgress } from "@/components/account/ProfileCompletionProgress";
import { MaterialTypeBadge } from "@/components/ui/MaterialTypeBadge";
import { useAccountData } from "@/lib/hooks/useAccountData";
import type { SellerStats, SellerMaterialStats, LibraryItem } from "@/lib/types/account";
import { getSubjectPillClass } from "@/lib/constants/subject-colors";

type StatusFilter = "all" | "Pending" | "Verified" | "Rejected";
type SortOption = "newest" | "downloads" | "earnings";

export default function AccountOverviewPage() {
  const router = useRouter();
  const t = useTranslations("accountPage");
  const { userData, loading: sharedLoading } = useAccountData();

  const [sellerStats, setSellerStats] = useState<SellerStats>({
    netEarnings: "CHF 0.00",
    totalDownloads: 0,
    totalPurchases: 0,
    followers: 0,
  });
  const [sellerMaterials, setSellerMaterials] = useState<SellerMaterialStats[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    type: "material" | "bundle";
    title: string;
  } | null>(null);
  // Level data moved to /konto/rewards

  // Filter and sort state for materials table
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const isSeller = userData?.isSeller ?? false;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const fetches: Promise<Response>[] = [fetch("/api/user/library?type=acquired")];
      if (isSeller) {
        fetches.push(fetch("/api/seller/dashboard"));
      }

      const responses = await Promise.all(fetches);
      const libraryRes = responses[0];

      if (libraryRes.ok) {
        const data = await libraryRes.json();
        setLibraryItems(data.items);
      }
      if (isSeller && responses[1]?.ok) {
        const data = await responses[1].json();
        setSellerStats(data.stats);
        setSellerMaterials(data.materials);
      }
      // Level data now fetched in /konto/rewards
    } catch (error) {
      console.error("Error fetching overview data:", error);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [isSeller]);

  useEffect(() => {
    if (!sharedLoading) {
      fetchData();
    }
  }, [sharedLoading, fetchData]);

  // Filtered and sorted materials
  const filteredMaterials = useMemo(() => {
    let items = [...sellerMaterials];

    // Apply status filter
    if (statusFilter !== "all") {
      items = items.filter((m) => m.status === statusFilter);
    }

    // Apply sorting
    if (sortBy === "downloads") {
      items.sort((a, b) => b.downloads - a.downloads);
    } else if (sortBy === "earnings") {
      const parseEarnings = (e: string) =>
        parseFloat(e.replace(/[^0-9.,-]/g, "").replace(",", ".")) || 0;
      items.sort((a, b) => parseEarnings(b.netEarnings) - parseEarnings(a.netEarnings));
    }
    // "newest" uses the default API order

    return items;
  }, [sellerMaterials, statusFilter, sortBy]);

  // Status filter counts
  const statusCounts = useMemo(() => {
    const counts = { all: sellerMaterials.length, Pending: 0, Verified: 0, Rejected: 0 };
    for (const m of sellerMaterials) {
      if (m.status === "Pending") counts.Pending++;
      else if (m.status === "Verified") counts.Verified++;
      else if (m.status === "Rejected") counts.Rejected++;
    }
    return counts;
  }, [sellerMaterials]);

  const handleDownload = async (materialId: string) => {
    setDownloading(materialId);
    setDownloadMessage(null);
    try {
      const downloadWindow = window.open(`/api/materials/${materialId}/download`, "_blank");
      if (!downloadWindow) {
        setDownloadMessage({ type: "error", text: t("overview.downloadError") });
      }
    } catch {
      setDownloadMessage({ type: "error", text: t("overview.downloadError") });
    } finally {
      setDownloading(null);
    }
  };

  const handleConfirmedDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const endpoint =
        deleteConfirm.type === "material"
          ? `/api/materials/${deleteConfirm.id}`
          : `/api/bundles/${deleteConfirm.id}`;
      const response = await fetch(endpoint, { method: "DELETE" });
      if (response.ok) {
        setSellerMaterials((prev) => prev.filter((m) => m.id !== deleteConfirm.id));
      }
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const getStatusConfig = (status: string) => {
    if (status === "Verified")
      return {
        label: t("overview.verified"),
        icon: CircleCheck,
        className: "bg-success/10 text-success",
      };
    if (status === "AI-Checked")
      return {
        label: t("overview.aiChecked"),
        icon: Sparkles,
        className: "bg-accent/10 text-accent",
      };
    if (status === "Draft")
      return {
        label: t("overview.draft"),
        icon: FileEdit,
        className: "bg-text-muted/10 text-text-muted",
      };
    if (status === "Rejected")
      return {
        label: t("overview.filterRejected"),
        icon: XCircle,
        className: "bg-error/10 text-error",
      };
    return {
      label: t("overview.pending"),
      icon: Clock,
      className: "bg-warning/10 text-warning",
    };
  };

  const STATUS_FILTERS: { value: StatusFilter; labelKey: string }[] = [
    { value: "all", labelKey: "overview.filterAll" },
    { value: "Pending", labelKey: "overview.filterPending" },
    { value: "Verified", labelKey: "overview.filterVerified" },
    { value: "Rejected", labelKey: "overview.filterRejected" },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Welcome Guide for new users */}
        <WelcomeGuide
          userName={userData?.displayName || userData?.name}
          onNavigate={(tab) => {
            router.push(`/konto/${tab === "settings-profile" ? "settings" : tab}`);
          }}
        />

        {/* Email Verification Banner */}
        {userData && !userData.emailVerified && <EmailVerificationBanner email={userData.email} />}

        {/* Stripe Connect Status */}
        {userData && userData.emailVerified && <StripeConnectStatus isSeller={userData.isSeller} />}

        {/* Profile Completion */}
        {userData && (
          <ProfileCompletionProgress
            profile={userData}
            onNavigateToSettings={() => router.push("/konto/settings")}
          />
        )}

        {/* Error state */}
        {fetchError && !loading && (
          <div className="border-error/50 bg-error/10 flex items-center gap-3 rounded-xl border p-4">
            <AlertCircle className="text-error h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <p className="text-text flex-1 text-sm">{t("overview.fetchError")}</p>
            <button
              onClick={fetchData}
              className="text-error hover:bg-error/20 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t("overview.retry")}
            </button>
          </div>
        )}

        {/* KPI Metrics Row */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {loading
            ? // Skeleton loaders for KPI cards
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="border-border bg-surface animate-pulse rounded-xl border p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="bg-border h-4 w-20 rounded" />
                      <div className="bg-border h-8 w-28 rounded" />
                      <div className="bg-border h-3 w-24 rounded" />
                    </div>
                    <div className="bg-border h-12 w-12 rounded-xl" />
                  </div>
                </div>
              ))
            : [
                {
                  label: t("overview.earnings"),
                  value: sellerStats.netEarnings,
                  subtitle: t("overview.total"),
                  icon: TrendingUp,
                  iconBg: "bg-success/10",
                  iconColor: "text-success",
                  accent: "from-success/5 to-transparent",
                },
                {
                  label: t("overview.downloads"),
                  value: sellerStats.totalDownloads,
                  subtitle: t("overview.totalDownloads"),
                  icon: Download,
                  iconBg: "bg-primary/10",
                  iconColor: "text-primary",
                  accent: "from-primary/5 to-transparent",
                },
                {
                  label: t("overview.purchases"),
                  value: sellerStats.totalPurchases,
                  subtitle: t("overview.totalPurchases"),
                  icon: ShoppingCart,
                  iconBg: "bg-warning/10",
                  iconColor: "text-warning",
                  accent: "from-warning/5 to-transparent",
                },
                {
                  label: t("overview.contributions"),
                  value: sellerMaterials.length,
                  subtitle: t("overview.materialsPublished"),
                  icon: BarChart3,
                  iconBg: "bg-accent/10",
                  iconColor: "text-accent",
                  accent: "from-accent/5 to-transparent",
                },
              ].map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-border bg-surface group relative overflow-hidden rounded-xl border p-6 transition-shadow hover:shadow-md"
                  >
                    {/* Subtle gradient accent */}
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${kpi.accent}`}
                    />
                    <div className="relative flex items-start justify-between">
                      <div>
                        <p className="text-text-muted text-sm font-medium">{kpi.label}</p>
                        <p className="text-text mt-2 text-3xl font-bold tracking-tight">
                          {kpi.value}
                        </p>
                        <p className="text-text-faint mt-1 text-xs">{kpi.subtitle}</p>
                      </div>
                      <div
                        className={`${kpi.iconBg} flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110`}
                      >
                        <Icon className={`${kpi.iconColor} h-6 w-6`} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
        </div>

        {/* Seller Level Card — moved to /konto/rewards */}

        {/* Resources Table */}
        <div className="border-border bg-surface overflow-hidden rounded-xl border">
          <div className="border-border flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-text text-base font-semibold">{t("overview.myMaterials")}</h2>
            <Link
              href="/konto/uploads"
              className="text-primary flex items-center gap-1 text-sm font-medium hover:underline"
            >
              {t("overview.viewAll")}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Status Filter Pills + Sort (only when materials exist) */}
          {!loading && sellerMaterials.length > 0 && (
            <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
              <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map((filter) => {
                  const count = statusCounts[filter.value];
                  const isActive = statusFilter === filter.value;
                  return (
                    <button
                      key={filter.value}
                      onClick={() => setStatusFilter(filter.value)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-text-on-accent"
                          : "bg-bg text-text-muted hover:text-text hover:bg-bg-secondary"
                      }`}
                    >
                      {t(filter.labelKey as never)}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                          isActive ? "bg-white/20" : "bg-border"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="text-text-muted h-3.5 w-3.5" aria-hidden="true" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label={t("overview.sortLabel")}
                  className="border-border bg-bg text-text rounded-lg border px-2 py-1 text-xs"
                >
                  <option value="newest">{t("overview.sortNewest")}</option>
                  <option value="downloads">{t("overview.sortDownloads")}</option>
                  <option value="earnings">{t("overview.sortEarnings")}</option>
                </select>
              </div>
            </div>
          )}

          <div className="p-4">
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="border-border flex items-center gap-4 rounded-xl border p-4"
                  >
                    <div className="bg-border h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="bg-border h-4 w-48 rounded" />
                      <div className="bg-border h-3 w-24 rounded" />
                    </div>
                    <div className="bg-border h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : sellerMaterials.length === 0 ? (
              <div className="py-16 text-center">
                <div className="bg-surface-hover mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl">
                  <FileText className="text-text-faint h-8 w-8" />
                </div>
                <h3 className="text-text mb-2 text-lg font-semibold">
                  {t("overview.noMaterials")}
                </h3>
                <p className="text-text-muted mx-auto max-w-sm text-sm">
                  {t("overview.noMaterialsDescription")}
                </p>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="py-10 text-center">
                <AlertCircle className="text-text-faint mx-auto mb-3 h-8 w-8" aria-hidden="true" />
                <p className="text-text-muted text-sm">{t("uploads.noMatchingFilter")}</p>
                <button
                  onClick={() => setStatusFilter("all")}
                  className="text-primary mt-2 text-sm font-medium hover:underline"
                >
                  {t("uploads.showAll")}
                </button>
              </div>
            ) : (
              <>
                {/* Mobile: Card layout */}
                <div className="space-y-2 sm:hidden">
                  <AnimatePresence mode="popLayout">
                    {filteredMaterials.map((resource, index) => {
                      const statusConfig = getStatusConfig(resource.status);
                      const StatusIcon = statusConfig.icon;
                      return (
                        <motion.div
                          key={resource.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                          layout
                          className="border-border bg-bg hover:border-primary/30 rounded-xl border p-4 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <Link href={`/materialien/${resource.id}`} className="min-w-0 flex-1">
                              <div className="text-text text-sm font-medium">{resource.title}</div>
                              {resource.fileFormat && (
                                <div className="mt-1">
                                  <MaterialTypeBadge format={resource.fileFormat} size="sm" />
                                </div>
                              )}
                            </Link>
                            <span
                              className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.className}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-text-muted flex items-center gap-1">
                                <Download className="h-3.5 w-3.5" />
                                {resource.downloads}
                              </span>
                              <span className="text-text-muted flex items-center gap-1">
                                <ShoppingCart className="h-3.5 w-3.5" />
                                {resource.purchases}
                              </span>
                              <span className="text-success font-semibold">
                                {resource.netEarnings}
                              </span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <Link
                                href={`/materialien/${resource.id}`}
                                className="text-text-muted hover:text-primary rounded-lg p-1.5 transition-colors"
                                aria-label={t("overview.view")}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                              <Link
                                href={`/materialien/${resource.id}/bearbeiten`}
                                className="text-text-muted hover:text-primary rounded-lg p-1.5 transition-colors"
                                aria-label={t("overview.edit")}
                              >
                                <FileEdit className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    id: resource.id,
                                    type: "material",
                                    title: resource.title,
                                  })
                                }
                                className="text-text-muted hover:text-error rounded-lg p-1.5 transition-colors"
                                aria-label={t("overview.delete")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Desktop: Table layout */}
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full">
                    <thead>
                      <tr className="text-text-muted text-left text-xs font-medium tracking-wider uppercase">
                        <th className="pb-3 pl-1">{t("overview.title")}</th>
                        <th className="pb-3">{t("overview.status")}</th>
                        <th className="pb-3 text-right">{t("overview.downloads")}</th>
                        <th className="pb-3 text-right">{t("overview.purchases")}</th>
                        <th className="pb-3 text-right">{t("overview.earnings")}</th>
                        <th className="pb-3 text-right">{t("overview.actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                      <AnimatePresence mode="popLayout">
                        {filteredMaterials.map((resource, index) => {
                          const statusConfig = getStatusConfig(resource.status);
                          const StatusIcon = statusConfig.icon;
                          return (
                            <motion.tr
                              key={resource.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ delay: index * 0.03 }}
                              layout
                              className="group hover:bg-bg rounded-lg transition-colors"
                            >
                              <td className="py-3.5 pr-4 pl-1">
                                <Link href={`/materialien/${resource.id}`} className="block">
                                  <div className="text-text group-hover:text-primary text-sm font-medium transition-colors">
                                    {resource.title}
                                  </div>
                                  {resource.fileFormat && (
                                    <div className="mt-1">
                                      <MaterialTypeBadge format={resource.fileFormat} size="sm" />
                                    </div>
                                  )}
                                </Link>
                              </td>
                              <td className="py-3.5 pr-4">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.className}`}
                                  aria-label={`Status: ${statusConfig.label}`}
                                >
                                  <StatusIcon className="h-3.5 w-3.5" />
                                  {statusConfig.label}
                                </span>
                              </td>
                              <td className="text-text py-3.5 pr-4 text-right text-sm font-medium">
                                {resource.downloads}
                              </td>
                              <td className="text-text py-3.5 pr-4 text-right text-sm font-medium">
                                {resource.purchases}
                              </td>
                              <td className="text-success py-3.5 pr-4 text-right text-sm font-semibold">
                                {resource.netEarnings}
                              </td>
                              <td className="py-3.5 text-right">
                                <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                  <Link
                                    href={`/materialien/${resource.id}`}
                                    className="text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg p-2 transition-colors"
                                    aria-label={t("overview.view")}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Link>
                                  <Link
                                    href={`/materialien/${resource.id}/bearbeiten`}
                                    className="text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg p-2 transition-colors"
                                    aria-label={t("overview.edit")}
                                  >
                                    <FileEdit className="h-4 w-4" />
                                  </Link>
                                  <button
                                    onClick={() =>
                                      setDeleteConfirm({
                                        id: resource.id,
                                        type: "material",
                                        title: resource.title,
                                      })
                                    }
                                    className="text-text-muted hover:text-error hover:bg-error/10 rounded-lg p-2 transition-colors"
                                    aria-label={t("overview.delete")}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Downloads */}
        <div className="border-border bg-surface rounded-xl border">
          <div className="border-border flex items-center justify-between border-b px-5 py-4">
            <div className="flex items-center gap-2">
              <h2 className="text-text text-base font-semibold">{t("overview.recentDownloads")}</h2>
              {!loading && libraryItems.length > 0 && (
                <span className="bg-bg-secondary text-text-muted rounded-full px-2 py-0.5 text-xs font-medium">
                  {libraryItems.length}
                </span>
              )}
            </div>
            {libraryItems.length > 6 && (
              <Link
                href="/konto/library"
                className="text-primary flex items-center gap-1 text-sm font-medium hover:underline"
              >
                {t("overview.viewAll")}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          <div className="p-4">
            {/* Download error/success toast */}
            <AnimatePresence>
              {downloadMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mb-3 flex items-center gap-2 rounded-lg p-3 text-sm ${
                    downloadMessage.type === "error"
                      ? "bg-error/10 text-error"
                      : "bg-success/10 text-success"
                  }`}
                >
                  {downloadMessage.type === "error" ? (
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <CircleCheck className="h-4 w-4 flex-shrink-0" />
                  )}
                  {downloadMessage.text}
                  <button
                    onClick={() => setDownloadMessage(null)}
                    className="ml-auto"
                    aria-label="Close"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-border animate-pulse rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-border h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="bg-border h-4 w-3/4 rounded" />
                        <div className="bg-border h-3 w-1/2 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : libraryItems.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {libraryItems.slice(0, 6).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group border-border bg-bg hover:border-primary/30 relative flex items-center gap-3 rounded-xl border p-3.5 transition-all hover:shadow-sm"
                  >
                    {/* Clickable card overlay */}
                    <Link
                      href={`/materialien/${item.id}`}
                      className="absolute inset-0 z-0 rounded-xl"
                      aria-label={item.title}
                    />
                    {/* Thumbnail or icon */}
                    {item.previewUrl ? (
                      <Image
                        src={item.previewUrl}
                        alt={item.title}
                        width={40}
                        height={40}
                        className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="bg-surface flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                        <FileText className="text-text-muted h-5 w-5" />
                      </div>
                    )}
                    <div className="mr-2 min-w-0 flex-1">
                      <h3 className="text-text group-hover:text-primary truncate text-sm font-medium transition-colors">
                        {item.title}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span
                          className={`pill text-[10px] ${getSubjectPillClass(item.subjects[0] || "Allgemein")}`}
                        >
                          {item.subjects[0] || "Allgemein"}
                        </span>
                        <span className="text-text-faint text-[10px]">{item.cycles[0] || ""}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDownload(item.id);
                      }}
                      disabled={downloading === item.id}
                      className="text-primary hover:bg-primary/10 relative z-10 shrink-0 rounded-lg p-2 transition-colors disabled:opacity-60"
                      title={t("overview.downloads")}
                      aria-label={t("overview.downloadLabel")}
                    >
                      {downloading === item.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="bg-surface-hover mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Download className="text-text-faint h-6 w-6" />
                </div>
                <p className="text-text-muted text-sm">{t("overview.noDownloads")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deleteConfirm}
        title={deleteConfirm?.title || ""}
        type={deleteConfirm?.type || "material"}
        onConfirm={handleConfirmedDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}
