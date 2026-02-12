"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { DashboardMaterialCard } from "@/components/ui/DashboardMaterialCard";
import { useAccountData } from "@/lib/hooks/useAccountData";
import type { WishlistItem } from "@/lib/types/account";

export default function AccountWishlistPage() {
  const { status } = useSession();
  const { stats, setStats, loading: sharedLoading } = useAccountData();
  const t = useTranslations("accountPage.wishlist");
  const tSort = useTranslations("common.sort");

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  // Fetch wishlist items on mount
  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/user/wishlist")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setWishlistItems(data.items);
      })
      .catch((err) => console.error("Error fetching wishlist:", err))
      .finally(() => setLoading(false));
  }, [status]);

  // Handle wishlist removal
  const handleRemoveFromWishlist = async (materialId: string) => {
    try {
      const response = await fetch(`/api/user/wishlist?resourceId=${materialId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setWishlistItems((prev) => prev.filter((item) => item.id !== materialId));
        if (stats) {
          setStats({ ...stats, wishlistItems: stats.wishlistItems - 1 });
        }
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const isLoading = loading || sharedLoading;

  // Client-side search + sort
  const filteredItems = wishlistItems
    .filter((item) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subject?.toLowerCase().includes(q) ||
        item.seller.displayName?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(); // newest
    });

  return (
    <motion.div
      key="wishlist"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="border-border bg-surface rounded-xl border p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-text text-xl font-semibold">{t("title")}</h2>
            <p className="text-text-muted mt-1 text-sm">{t("subtitle")}</p>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
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

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2].map((i) => (
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
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item) => (
              <DashboardMaterialCard
                key={item.id}
                id={item.id}
                title={item.title}
                subject={item.subject}
                cycle={item.cycle}
                previewUrl={item.previewUrl}
                price={{
                  formatted: item.priceFormatted,
                  isFree: item.price === 0,
                }}
                seller={{ displayName: item.seller.displayName }}
                onRemove={() => handleRemoveFromWishlist(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <svg
              className="text-text-faint mx-auto mb-4 h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h3 className="text-text mb-2 text-lg font-medium">{t("empty")}</h3>
            <p className="text-text-muted mb-4">{t("emptyDescription")}</p>
            <Link
              href="/materialien"
              className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              {t("discoverButton")}
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
