"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  TrendingUp,
  Download,
  FileText,
  ExternalLink,
  User,
  Trash2,
  Sparkles,
  Clock,
  X,
  CircleCheck,
  FileEdit,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { WelcomeGuide } from "@/components/account/WelcomeGuide";
import { EmailVerificationBanner } from "@/components/account/EmailVerificationBanner";
import { StripeConnectStatus } from "@/components/account/StripeConnectStatus";
import { DeleteConfirmDialog } from "@/components/account/DeleteConfirmDialog";
import { useAccountData } from "@/lib/hooks/useAccountData";
import type { SellerStats, SellerMaterial, LibraryItem } from "@/lib/types/account";
import { SUBJECT_PILL_CLASSES } from "@/lib/types/account";

export default function AccountOverviewPage() {
  const router = useRouter();
  const t = useTranslations("accountPage");
  const { userData, loading: sharedLoading } = useAccountData();

  const [sellerStats, setSellerStats] = useState<SellerStats>({
    netEarnings: "CHF 0.00",
    totalDownloads: 0,
    followers: 0,
  });
  const [sellerMaterials, setSellerMaterials] = useState<SellerMaterial[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    type: "material" | "bundle";
    title: string;
  } | null>(null);
  const [profileBannerDismissed, setProfileBannerDismissed] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sellerRes, libraryRes] = await Promise.all([
        fetch("/api/seller/dashboard"),
        fetch("/api/user/library?type=acquired"),
      ]);
      if (sellerRes.ok) {
        const data = await sellerRes.json();
        setSellerStats(data.stats);
        setSellerMaterials(data.materials);
      }
      if (libraryRes.ok) {
        const data = await libraryRes.json();
        setLibraryItems(data.items);
      }
    } catch (error) {
      console.error("Error fetching overview data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!sharedLoading) {
      fetchData();
    }
  }, [sharedLoading, fetchData]);

  const getProfileCompletion = useCallback(() => {
    const items = [
      { done: !!userData?.emailVerified, label: "E-Mail verifizieren" },
      { done: !!(userData?.displayName || userData?.name), label: "Anzeigename" },
      { done: !!userData?.image, label: "Profilbild" },
      { done: !!userData?.bio, label: "Über mich" },
      { done: userData?.subjects && userData.subjects.length > 0, label: "Fächer" },
      { done: userData?.cycles && userData.cycles.length > 0, label: "Zyklen" },
      { done: !!userData?.school, label: "Schule" },
      { done: userData?.cantons && userData.cantons.length > 0, label: "Kanton" },
    ];
    const completed = items.filter((i) => i.done).length;
    const missing = items.filter((i) => !i.done).map((i) => i.label);
    return {
      percentage: Math.round((completed / items.length) * 100),
      missing,
      completed,
      total: items.length,
    };
  }, [userData]);

  useEffect(() => {
    const profile = getProfileCompletion();
    if (typeof window !== "undefined") {
      const dismissed =
        localStorage.getItem("currico-profile-banner-dismissed") === String(profile.percentage);
      setProfileBannerDismissed(dismissed || profile.percentage >= 100);
    }
  }, [getProfileCompletion]);

  const handleDownload = async (materialId: string) => {
    setDownloading(materialId);
    try {
      window.open(`/api/materials/${materialId}/download`, "_blank");
    } catch (error) {
      console.error("Download error:", error);
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

  const getSubjectPillClass = (subject: string): string => {
    return SUBJECT_PILL_CLASSES[subject] || "pill-neutral";
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
    return {
      label: t("overview.pending"),
      icon: Clock,
      className: "bg-warning/10 text-warning",
    };
  };

  const profile = getProfileCompletion();

  return (
    <>
      <div className="space-y-6">
        {/* Welcome Guide for new users */}
        <WelcomeGuide
          userName={userData?.displayName || userData?.name}
          onNavigate={(tab) => {
            router.push(`/account/${tab === "settings-profile" ? "settings" : tab}`);
          }}
        />

        {/* Profile Completion Banner */}
        {!profileBannerDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-primary/30 bg-primary/5 relative rounded-2xl border p-5"
          >
            <button
              onClick={() => {
                localStorage.setItem(
                  "currico-profile-banner-dismissed",
                  String(profile.percentage)
                );
                setProfileBannerDismissed(true);
              }}
              className="text-text-muted hover:text-text absolute top-3 right-3 p-1 transition-colors"
              aria-label={t("profile.close")}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                <User className="text-primary h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-text text-sm font-semibold">{t("profile.completeProfile")}</h3>
                <p className="text-text-muted mt-1 text-xs">
                  {t("profile.fieldsCompleted", {
                    completed: profile.completed,
                    total: profile.total,
                  })}
                </p>
                <div className="bg-border mt-3 h-2 overflow-hidden rounded-full">
                  <motion.div
                    className="bg-primary h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${profile.percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                {profile.missing.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {profile.missing.map((field) => (
                      <span
                        key={field}
                        className="bg-surface border-border text-text-muted rounded-full border px-2.5 py-0.5 text-xs"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  href="/account/settings"
                  className="bg-primary text-text-on-accent hover:bg-primary-hover mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  {t("profile.editProfile")}
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Email Verification Banner */}
        {userData && !userData.emailVerified && <EmailVerificationBanner email={userData.email} />}

        {/* Stripe Connect Status */}
        {userData && userData.emailVerified && <StripeConnectStatus isSeller={userData.isSeller} />}

        {/* KPI Metrics Row */}
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {[
            {
              label: t("overview.earnings"),
              value: loading ? "-" : sellerStats.netEarnings,
              subtitle: t("overview.thisMonth"),
              icon: TrendingUp,
              iconBg: "bg-success/10",
              iconColor: "text-success",
              accent: "from-success/5 to-transparent",
            },
            {
              label: t("overview.downloads"),
              value: loading ? "-" : sellerStats.totalDownloads,
              subtitle: t("overview.totalDownloads"),
              icon: Download,
              iconBg: "bg-primary/10",
              iconColor: "text-primary",
              accent: "from-primary/5 to-transparent",
            },
            {
              label: t("overview.contributions"),
              value: loading ? "-" : sellerMaterials.length,
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
                className={`border-border bg-surface group relative overflow-hidden rounded-2xl border p-6 transition-shadow hover:shadow-md`}
              >
                {/* Subtle gradient accent */}
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${kpi.accent}`}
                />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-text-muted text-sm font-medium">{kpi.label}</p>
                    <p className="text-text mt-2 text-3xl font-bold tracking-tight">{kpi.value}</p>
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

        {/* Resources Table */}
        <div className="border-border bg-surface overflow-hidden rounded-2xl border">
          <div className="border-border flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-text text-base font-semibold">{t("overview.myMaterials")}</h2>
            <Link
              href="/upload"
              className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            >
              {t("overview.newMaterial")}
            </Link>
          </div>

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
                <div className="bg-surface-hover mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <FileText className="text-text-faint h-8 w-8" />
                </div>
                <h3 className="text-text mb-2 text-lg font-medium">{t("overview.noMaterials")}</h3>
                <p className="text-text-muted mx-auto mb-6 max-w-sm text-sm">
                  {t("overview.noMaterialsDescription")}
                </p>
                <Link
                  href="/upload"
                  className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
                >
                  {t("overview.uploadFirst")}
                </Link>
              </div>
            ) : (
              <>
                {/* Mobile: Card layout */}
                <div className="space-y-2 sm:hidden">
                  {sellerMaterials.map((resource, index) => {
                    const statusConfig = getStatusConfig(resource.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-border bg-bg hover:border-primary/30 rounded-xl border p-4 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <Link href={`/materialien/${resource.id}`} className="min-w-0 flex-1">
                            <div className="text-text text-sm font-medium">{resource.title}</div>
                            <div className="text-text-muted mt-0.5 text-xs">{resource.type}</div>
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
                              href={`/materialien/${resource.id}/edit`}
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
                </div>

                {/* Desktop: Table layout */}
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full">
                    <thead>
                      <tr className="text-text-muted text-left text-xs font-medium tracking-wider uppercase">
                        <th className="pb-3 pl-1">{t("overview.title")}</th>
                        <th className="pb-3">{t("overview.status")}</th>
                        <th className="pb-3 text-right">{t("overview.downloads")}</th>
                        <th className="pb-3 text-right">{t("overview.earnings")}</th>
                        <th className="pb-3 text-right">{t("overview.actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                      {sellerMaterials.map((resource, index) => {
                        const statusConfig = getStatusConfig(resource.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                          <motion.tr
                            key={resource.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.03 }}
                            className="group hover:bg-bg transition-colors"
                          >
                            <td className="py-3.5 pr-4 pl-1">
                              <Link href={`/materialien/${resource.id}`} className="block">
                                <div className="text-text group-hover:text-primary text-sm font-medium transition-colors">
                                  {resource.title}
                                </div>
                                <div className="text-text-muted mt-0.5 text-xs">
                                  {resource.type}
                                </div>
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
                                  href={`/materialien/${resource.id}/edit`}
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
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Downloads */}
        <div className="border-border bg-surface rounded-2xl border">
          <div className="border-border flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-text text-base font-semibold">{t("overview.recentDownloads")}</h2>
            <Link
              href="/account/library"
              className="text-primary flex items-center gap-1 text-sm font-medium hover:underline"
            >
              {t("overview.viewAll")}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="p-4">
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
                    className="group border-border bg-bg hover:border-primary/30 flex items-center gap-3 rounded-xl border p-3.5 transition-all hover:shadow-sm"
                  >
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
                        <span className={`pill text-[10px] ${getSubjectPillClass(item.subject)}`}>
                          {item.subject}
                        </span>
                        <span className="text-text-faint text-[10px]">{item.cycle}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(item.id)}
                      disabled={downloading === item.id}
                      className="text-primary hover:bg-primary/10 shrink-0 rounded-lg p-2 transition-colors disabled:opacity-50"
                      title={t("overview.downloads")}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="bg-surface-hover mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Download className="text-text-faint h-6 w-6" />
                </div>
                <p className="text-text-muted mb-2 text-sm">{t("overview.noDownloads")}</p>
                <Link
                  href="/materialien"
                  className="text-primary text-sm font-medium hover:underline"
                >
                  {t("overview.discoverLink")}
                </Link>
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
