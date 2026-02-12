"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAccountData } from "@/lib/hooks/useAccountData";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  CircleCheck,
  Clock,
  XCircle,
  FileEdit,
  Package,
  Trash2,
  MoreVertical,
  Check,
  ExternalLink,
  X,
} from "lucide-react";
import { DeleteConfirmDialog } from "@/components/account/DeleteConfirmDialog";
import type { SellerBundle } from "@/lib/types/account";

export default function AccountBundlesPage() {
  const { userData, loading } = useAccountData();
  const t = useTranslations("accountPage.bundles");
  const [sellerBundles, setSellerBundles] = useState<SellerBundle[]>([]);
  const [bundlesLoading, setBundlesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openBundleActionMenu, setOpenBundleActionMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    type: "bundle";
    title: string;
  } | null>(null);
  const bundleActionMenuRef = useRef<HTMLDivElement>(null);

  // Fetch seller bundles
  const fetchSellerBundles = useCallback(async () => {
    setBundlesLoading(true);
    try {
      const response = await fetch("/api/seller/bundles");
      if (response.ok) {
        const data = await response.json();
        setSellerBundles(data.bundles);
      }
    } catch (error) {
      console.error("Error fetching seller bundles:", error);
    } finally {
      setBundlesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userData?.isSeller) {
      fetchSellerBundles();
    }
  }, [userData?.isSeller, fetchSellerBundles]);

  // Close action menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bundleActionMenuRef.current &&
        !bundleActionMenuRef.current.contains(event.target as Node)
      ) {
        setOpenBundleActionMenu(null);
      }
    };

    if (openBundleActionMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openBundleActionMenu]);

  // Handle bundle publish toggle
  const handleToggleBundlePublish = async (bundleId: string, currentlyPublished: boolean) => {
    try {
      const response = await fetch(`/api/bundles/${bundleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentlyPublished }),
      });
      if (response.ok) {
        setSellerBundles((prev) =>
          prev.map((b) => (b.id === bundleId ? { ...b, isPublished: !currentlyPublished } : b))
        );
      }
    } catch (error) {
      console.error("Error toggling bundle publish:", error);
    }
    setOpenBundleActionMenu(null);
  };

  // Open delete confirmation dialog
  const handleDeleteBundle = (bundleId: string, bundleTitle?: string) => {
    setDeleteConfirm({
      id: bundleId,
      type: "bundle",
      title: bundleTitle || "Bundle",
    });
  };

  // Handle confirmed deletion
  const handleConfirmedDelete = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;

    try {
      const response = await fetch(`/api/bundles/${id}`, { method: "DELETE" });
      if (response.ok) {
        setSellerBundles((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (error) {
      console.error("Error deleting bundle:", error);
    }
    setDeleteConfirm(null);
    setOpenBundleActionMenu(null);
  };

  // Client-side search filtering
  const filteredBundles = sellerBundles.filter((bundle) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      bundle.title.toLowerCase().includes(q) ||
      bundle.subject?.toLowerCase().includes(q) ||
      bundle.cycle?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="border-border bg-surface rounded-xl border p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-text text-xl font-semibold">{t("title")}</h2>
            <p className="text-text-muted mt-1 text-sm">{t("subtitle")}</p>
          </div>
          <Link
            href="/hochladen/bundle"
            className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
          >
            <span>+</span>
            {t("newBundle")}
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t("search")}
            className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary w-full rounded-lg border px-4 py-2 text-sm focus:ring-1 focus:outline-none"
          />
        </div>

        {loading || bundlesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-border animate-pulse rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="bg-surface-hover h-4 w-48 rounded" />
                    <div className="bg-surface-hover h-3 w-32 rounded" />
                  </div>
                  <div className="bg-surface-hover h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBundles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-text-muted text-left text-xs font-medium tracking-wider uppercase">
                  <th className="pb-4">{t("table.title")}</th>
                  <th className="pb-4">{t("table.status")}</th>
                  <th className="pb-4 text-center">{t("table.materials")}</th>
                  <th className="pb-4 text-right">{t("table.price")}</th>
                  <th className="pb-4 text-right">{t("table.savings")}</th>
                  <th className="pb-4 text-right">{t("table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {filteredBundles.map((bundle) => (
                  <tr key={bundle.id} className="group hover:bg-bg transition-colors">
                    <td className="py-4 pr-4">
                      <Link href={`/bundles/${bundle.id}`} className="block">
                        <div className="text-text group-hover:text-primary flex items-center gap-2 text-sm font-medium">
                          <Package className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                          {bundle.title}
                        </div>
                        <div className="text-text-muted mt-0.5 text-xs">
                          {bundle.subject} · {bundle.cycle}
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                            bundle.status === "VERIFIED"
                              ? "bg-success/10 text-success"
                              : bundle.status === "PENDING"
                                ? "bg-warning/10 text-warning"
                                : "bg-error/10 text-error"
                          }`}
                          aria-label={
                            bundle.status === "VERIFIED"
                              ? `Status: ${t("status.verified")}`
                              : bundle.status === "PENDING"
                                ? `Status: ${t("status.pending")}`
                                : `Status: ${t("status.rejected")}`
                          }
                        >
                          {bundle.status === "VERIFIED" ? (
                            <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : bundle.status === "PENDING" ? (
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          {bundle.status === "VERIFIED"
                            ? t("status.verified")
                            : bundle.status === "PENDING"
                              ? t("status.pending")
                              : t("status.rejected")}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-xs ${
                            bundle.isPublished ? "text-success" : "text-text-muted"
                          }`}
                        >
                          {bundle.isPublished ? (
                            <CircleCheck className="h-3 w-3" aria-hidden="true" />
                          ) : (
                            <FileEdit className="h-3 w-3" aria-hidden="true" />
                          )}
                          {bundle.isPublished ? t("published") : t("draft")}
                        </span>
                      </div>
                    </td>
                    <td className="text-text py-4 pr-4 text-center text-sm font-medium">
                      {bundle.resourceCount}
                    </td>
                    <td className="text-text py-4 pr-4 text-right text-sm font-medium">
                      {bundle.priceFormatted}
                    </td>
                    <td className="py-4 pr-4 text-right">
                      {bundle.savingsPercent > 0 && (
                        <span className="text-success text-sm font-medium">
                          {bundle.savingsPercent}%
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <div
                        className="relative inline-block"
                        ref={openBundleActionMenu === bundle.id ? bundleActionMenuRef : null}
                      >
                        <button
                          onClick={() =>
                            setOpenBundleActionMenu(
                              openBundleActionMenu === bundle.id ? null : bundle.id
                            )
                          }
                          className="text-text-muted hover:bg-surface-hover hover:text-text rounded-lg p-2 transition-colors"
                          aria-label={t("actionsLabel")}
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        {openBundleActionMenu === bundle.id && (
                          <div className="border-border bg-surface absolute right-0 z-10 mt-1 w-48 rounded-xl border py-1.5 shadow-lg">
                            <Link
                              href={`/bundles/${bundle.id}`}
                              className="text-text hover:bg-bg flex items-center gap-2.5 px-4 py-2 text-sm transition-colors"
                              onClick={() => setOpenBundleActionMenu(null)}
                            >
                              <ExternalLink className="h-4 w-4" aria-hidden="true" />
                              {t("view")}
                            </Link>
                            <button
                              onClick={() =>
                                handleToggleBundlePublish(bundle.id, bundle.isPublished)
                              }
                              className="text-text hover:bg-bg flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors"
                            >
                              {bundle.isPublished ? (
                                <>
                                  <X className="h-4 w-4" aria-hidden="true" />
                                  {t("unpublish")}
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4" aria-hidden="true" />
                                  {t("publish")}
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteBundle(bundle.id, bundle.title)}
                              className="text-error hover:bg-error/10 flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              {t("delete")}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <Package className="text-text-faint mx-auto mb-4 h-16 w-16" aria-hidden="true" />
            <h3 className="text-text mb-2 text-lg font-medium">{t("empty")}</h3>
            <p className="text-text-muted mb-4">{t("emptyDescription")}</p>
            <Link
              href="/hochladen/bundle"
              className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              {t("createFirst")}
            </Link>
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={!!deleteConfirm}
        title={deleteConfirm?.title || ""}
        type="bundle"
        onConfirm={handleConfirmedDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}
