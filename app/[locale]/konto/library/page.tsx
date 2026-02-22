"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { AlertCircle, BookOpen, Gift, RefreshCw, ShoppingBag, Sparkles } from "lucide-react";
import { DashboardMaterialCard } from "@/components/ui/DashboardMaterialCard";
import { DashboardMaterialGridSkeleton } from "@/components/ui/Skeleton";
import { BulkActionBar } from "@/components/ui/BulkActionBar";
import { useToast } from "@/components/ui/Toast";
import { useAccountData } from "@/lib/hooks/useAccountData";
import type { LibraryItem } from "@/lib/types/account";

type TypeFilter = "all" | "free" | "purchased";

export default function AccountLibraryPage() {
  const { status } = useSession();
  const { loading: sharedLoading } = useAccountData();
  const t = useTranslations("accountPage.library");
  const tSort = useTranslations("common.sort");
  const { toast } = useToast();

  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);

  // Fetch library items
  const fetchLibrary = useCallback(async (search?: string) => {
    setError(false);
    try {
      const params = new URLSearchParams({ type: "acquired" });
      if (search) params.set("search", search);
      const response = await fetch(`/api/user/library?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLibraryItems(data.items);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and when search changes (with debounce)
  useEffect(() => {
    if (status !== "authenticated") return;
    const debounce = setTimeout(
      () => {
        fetchLibrary(searchQuery || undefined);
      },
      searchQuery ? 300 : 0
    );
    return () => clearTimeout(debounce);
  }, [status, searchQuery, fetchLibrary]);

  // Client-side filter and sort
  const filteredAndSortedItems = useMemo(() => {
    let items = [...libraryItems];

    // Apply type filter
    if (typeFilter !== "all") {
      items = items.filter((i) => i.type === typeFilter);
    }

    // Apply sort
    if (sortBy === "oldest")
      items.sort((a, b) => new Date(a.acquiredAt).getTime() - new Date(b.acquiredAt).getTime());
    else if (sortBy === "title") items.sort((a, b) => a.title.localeCompare(b.title));

    return items;
  }, [libraryItems, typeFilter, sortBy]);

  // Selection: only count items that are currently visible (filtered)
  const visibleIds = useMemo(
    () => new Set(filteredAndSortedItems.map((i) => i.id)),
    [filteredAndSortedItems]
  );
  const visibleSelectedCount = useMemo(
    () => [...selectedIds].filter((id) => visibleIds.has(id)).length,
    [selectedIds, visibleIds]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of visibleIds) next.add(id);
      return next;
    });
  }, [visibleIds]);

  const deselectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of visibleIds) next.delete(id);
      return next;
    });
  }, [visibleIds]);

  // Bulk download: sequential window.open with 500ms stagger
  const handleBulkDownload = useCallback(async () => {
    const ids = [...selectedIds].filter((id) => visibleIds.has(id));
    if (ids.length === 0) return;

    setDownloading(true);
    let successCount = 0;

    for (let i = 0; i < ids.length; i++) {
      try {
        window.open(`/api/materials/${ids[i]}/download`, "_blank");
        successCount++;
        // Stagger between downloads
        if (i < ids.length - 1) {
          await new Promise((r) => setTimeout(r, 500));
        }
      } catch {
        // Continue with remaining downloads
      }
    }

    setDownloading(false);

    if (successCount === ids.length) {
      toast(t("bulk.downloadSuccess", { count: successCount }), "success");
    } else {
      toast(t("bulk.downloadPartial", { success: successCount, total: ids.length }), "warning");
    }

    setSelectedIds(new Set());
  }, [selectedIds, visibleIds, toast, t]);

  const isLoading = loading || sharedLoading;
  const hasSelection = visibleSelectedCount > 0;

  return (
    <motion.div
      key="library"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border-border bg-surface rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <BookOpen className="text-primary h-5 w-5" />
            </div>
            <div>
              <p className="text-text-muted text-xs font-medium">{t("stats.total")}</p>
              <p className="text-text text-xl font-bold">{isLoading ? "-" : libraryItems.length}</p>
            </div>
          </div>
        </div>
        <div className="border-border bg-surface rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Gift className="text-success h-5 w-5" />
            </div>
            <div>
              <p className="text-text-muted text-xs font-medium">{t("stats.free")}</p>
              <p className="text-text text-xl font-bold">
                {isLoading ? "-" : libraryItems.filter((i) => i.type === "free").length}
              </p>
            </div>
          </div>
        </div>
        <div className="border-border bg-surface rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <ShoppingBag className="text-accent h-5 w-5" />
            </div>
            <div>
              <p className="text-text-muted text-xs font-medium">{t("stats.purchased")}</p>
              <p className="text-text text-xl font-bold">
                {isLoading ? "-" : libraryItems.filter((i) => i.type === "purchased").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="border-border bg-surface rounded-xl border">
        <div className="border-border flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-text text-xl font-semibold">{t("title")}</h2>
            <p className="text-text-muted mt-1 text-sm">{t("subtitle")}</p>
          </div>
          <Link
            href="/materialien"
            className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
          >
            {t("discoverMore")}
          </Link>
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col gap-3 px-6 pt-4 sm:flex-row">
          <input
            type="text"
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t("search")}
            className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary flex-1 rounded-lg border px-4 py-2 text-sm focus:ring-1 focus:outline-none"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            aria-label={tSort("label")}
            className="border-border bg-bg text-text rounded-lg border px-3 py-2 text-sm"
          >
            <option value="newest">{tSort("newest")}</option>
            <option value="oldest">{tSort("oldest")}</option>
            <option value="title">{tSort("alphabetical")}</option>
          </select>
        </div>

        {/* Type Filter Pills */}
        {!isLoading && libraryItems.length > 0 && (
          <div className="flex gap-1.5 px-6 pt-3">
            {(
              [
                { value: "all", label: t("filterAll"), count: libraryItems.length },
                {
                  value: "free",
                  label: t("filterFree"),
                  count: libraryItems.filter((i) => i.type === "free").length,
                },
                {
                  value: "purchased",
                  label: t("filterPurchased"),
                  count: libraryItems.filter((i) => i.type === "purchased").length,
                },
              ] as const
            ).map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTypeFilter(filter.value)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  typeFilter === filter.value
                    ? "bg-primary text-text-on-accent"
                    : "bg-bg text-text-muted hover:text-text hover:bg-bg-secondary"
                }`}
              >
                {filter.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                    typeFilter === filter.value ? "bg-white/20" : "bg-border"
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className={`p-6 ${hasSelection ? "pb-24" : ""}`}>
          {error ? (
            <div className="py-12 text-center">
              <AlertCircle className="text-error mx-auto mb-3 h-10 w-10" aria-hidden="true" />
              <p className="text-text mb-1 font-medium">{t("errorLoading")}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  fetchLibrary(searchQuery || undefined);
                }}
                className="text-primary hover:text-primary-hover mt-2 inline-flex items-center gap-1.5 text-sm font-medium"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {t("retry")}
              </button>
            </div>
          ) : isLoading ? (
            <DashboardMaterialGridSkeleton />
          ) : filteredAndSortedItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 min-[1920px]:grid-cols-5 sm:gap-5 md:grid-cols-3 2xl:grid-cols-4">
              {filteredAndSortedItems.map((item) => (
                <DashboardMaterialCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  subject={item.subjects[0] || "Allgemein"}
                  cycle={item.cycles[0] || ""}
                  previewUrl={item.previewUrl}
                  badge={{
                    label: item.type === "purchased" ? t("badgePurchased") : t("badgeFree"),
                    variant: item.type === "purchased" ? "primary" : "success",
                  }}
                  secondaryBadge={
                    item.verified ? { label: t("badgeVerified"), variant: "success" } : undefined
                  }
                  seller={{ displayName: item.seller.displayName }}
                  selectable
                  selected={selectedIds.has(item.id)}
                  onSelect={toggleSelect}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="bg-primary/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                <BookOpen className="text-primary h-10 w-10" aria-hidden="true" />
              </div>
              <h3 className="text-text mb-2 text-xl font-semibold">{t("empty")}</h3>
              <p className="text-text-muted mx-auto mb-6 max-w-md">{t("emptyDescription")}</p>
              <Link
                href="/materialien"
                className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-colors"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {t("discoverButton")}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={visibleSelectedCount}
        totalCount={filteredAndSortedItems.length}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onDownload={handleBulkDownload}
        downloading={downloading}
      />
    </motion.div>
  );
}
