"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FileText } from "lucide-react";
import { DashboardMaterialCard } from "@/components/ui/DashboardMaterialCard";
import type { UploadedItem } from "@/lib/types/account";

export default function AccountUploadsPage() {
  const t = useTranslations("accountPage.uploads");

  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title" | "popular">("newest");
  const [uploadedLoading, setUploadedLoading] = useState(false);

  // Fetch uploaded items
  const fetchUploaded = useCallback(async (search?: string, sort?: string) => {
    setUploadedLoading(true);
    try {
      const params = new URLSearchParams({ type: "uploaded" });
      if (search) params.set("search", search);
      if (sort) params.set("sort", sort);
      const response = await fetch(`/api/user/library?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUploadedItems(data.items);
      }
    } catch (error) {
      console.error("Error fetching uploaded:", error);
    } finally {
      setUploadedLoading(false);
    }
  }, []);

  // Fetch on mount and when search/sort changes (with debounce)
  useEffect(() => {
    const debounce = setTimeout(
      () => {
        fetchUploaded(searchQuery || undefined, sortBy);
      },
      searchQuery ? 300 : 0
    );
    return () => clearTimeout(debounce);
  }, [searchQuery, sortBy, fetchUploaded]);

  return (
    <div className="border-border bg-surface rounded-xl border p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-text text-xl font-semibold">{t("title")}</h2>
          <p className="text-text-muted mt-1 text-sm">{t("subtitle")}</p>
        </div>
        <Link
          href="/hochladen"
          className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
        >
          <span>+</span>
          {t("newMaterial")}
        </Link>
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
          className="border-border bg-bg text-text rounded-lg border px-3 py-2 text-sm"
        >
          <option value="newest">{t("sort.newest")}</option>
          <option value="oldest">{t("sort.oldest")}</option>
          <option value="title">{t("sort.title")}</option>
          <option value="popular">{t("sort.popular")}</option>
        </select>
      </div>

      {uploadedLoading ? (
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
      ) : uploadedItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {uploadedItems.map((item) => (
            <DashboardMaterialCard
              key={item.id}
              id={item.id}
              title={item.title}
              subject={item.subject}
              cycle={item.cycle}
              previewUrl={item.previewUrl}
              editHref={`/materialien/${item.id}/edit`}
              badge={{
                label:
                  item.status === "VERIFIED"
                    ? t("statusVerified")
                    : item.status === "PENDING"
                      ? t("statusPending")
                      : item.status,
                variant:
                  item.status === "VERIFIED"
                    ? "success"
                    : item.status === "PENDING"
                      ? "warning"
                      : "neutral",
              }}
              price={{
                formatted: item.priceFormatted,
                isFree: item.price === 0,
              }}
              stats={{
                downloads: item.downloadCount,
                purchases: item.purchaseCount,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <FileText className="text-text-faint mx-auto mb-4 h-16 w-16" />
          <h3 className="text-text mb-2 text-lg font-medium">{t("empty")}</h3>
          <p className="text-text-muted mb-4">{t("emptyDescription")}</p>
          <Link
            href="/hochladen"
            className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            {t("uploadFirst")}
          </Link>
        </div>
      )}
    </div>
  );
}
