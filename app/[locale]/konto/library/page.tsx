"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { BookOpen, Gift, ShoppingBag, Sparkles } from "lucide-react";
import { DashboardMaterialCard } from "@/components/ui/DashboardMaterialCard";
import { useAccountData } from "@/lib/hooks/useAccountData";
import type { LibraryItem } from "@/lib/types/account";

export default function AccountLibraryPage() {
  const { status } = useSession();
  const { loading: sharedLoading } = useAccountData();
  const t = useTranslations("accountPage.library");
  const tSort = useTranslations("common.sort");

  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  // Fetch library items
  const fetchLibrary = useCallback(async (search?: string) => {
    try {
      const params = new URLSearchParams({ type: "acquired" });
      if (search) params.set("search", search);
      const response = await fetch(`/api/user/library?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLibraryItems(data.items);
      }
    } catch (error) {
      console.error("Error fetching library:", error);
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

  // Client-side sort (API returns newest first by default)
  const sortedItems = [...libraryItems].sort((a, b) => {
    if (sortBy === "oldest")
      return new Date(a.acquiredAt).getTime() - new Date(b.acquiredAt).getTime();
    if (sortBy === "title") return a.title.localeCompare(b.title);
    return 0; // "newest" is the default order from API
  });

  const isLoading = loading || sharedLoading;

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
            className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
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

        <div className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse overflow-hidden">
                  <div className="bg-bg-secondary aspect-[4/3]"></div>
                  <div className="px-3 pt-2.5 pb-3">
                    <div className="bg-surface-hover mb-2 h-3 w-20 rounded"></div>
                    <div className="bg-surface-hover mb-1.5 h-4 w-full rounded"></div>
                    <div className="border-border-subtle mt-3 border-t pt-2">
                      <div className="flex items-center justify-between">
                        <div className="bg-surface-hover h-3 w-16 rounded"></div>
                        <div className="bg-surface-hover h-6 w-14 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {sortedItems.map((item) => (
                <DashboardMaterialCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  subject={item.subject}
                  cycle={item.cycle}
                  previewUrl={item.previewUrl}
                  badge={{
                    label: item.type === "purchased" ? t("badgePurchased") : t("badgeFree"),
                    variant: item.type === "purchased" ? "primary" : "success",
                  }}
                  secondaryBadge={
                    item.verified ? { label: t("badgeVerified"), variant: "success" } : undefined
                  }
                  seller={{ displayName: item.seller.displayName }}
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
    </motion.div>
  );
}
