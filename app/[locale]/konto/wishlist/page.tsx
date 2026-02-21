"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Heart } from "lucide-react";
import { DashboardMaterialCard } from "@/components/ui/DashboardMaterialCard";
import { DashboardMaterialGridSkeleton } from "@/components/ui/Skeleton";
import { useAccountData } from "@/lib/hooks/useAccountData";
import type { WishlistItem } from "@/lib/types/account";

export default function AccountWishlistPage() {
  const { status } = useSession();
  const { stats, setStats, loading: sharedLoading } = useAccountData();
  const t = useTranslations("accountPage.wishlist");
  const tSort = useTranslations("common.sort");

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  const fetchWishlist = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/user/wishlist");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setWishlistItems(data.items);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchWishlist();
    }
  }, [status, fetchWishlist]);

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
        item.subjects[0]?.toLowerCase().includes(q) ||
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

        {error ? (
          <div className="py-12 text-center">
            <AlertCircle className="text-error mx-auto mb-3 h-10 w-10" aria-hidden="true" />
            <p className="text-text mb-1 font-medium">{t("errorLoading")}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchWishlist();
              }}
              className="text-primary hover:text-primary-hover mt-2 inline-flex items-center gap-1.5 text-sm font-medium"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t("retry")}
            </button>
          </div>
        ) : isLoading ? (
          <DashboardMaterialGridSkeleton />
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
            {filteredItems.map((item) => (
              <DashboardMaterialCard
                key={item.id}
                id={item.id}
                title={item.title}
                subject={item.subjects[0] || "Allgemein"}
                cycle={item.cycles[0] || ""}
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
            <Heart
              className="text-text-faint mx-auto mb-4 h-16 w-16"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <h3 className="text-text mb-2 text-lg font-semibold">{t("empty")}</h3>
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
