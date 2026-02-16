"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FileText, AlertTriangle } from "lucide-react";
import { DashboardMaterialCard } from "@/components/ui/DashboardMaterialCard";
import type { UploadedItem } from "@/lib/types/account";

type StatusFilter = "ALL" | "PENDING" | "VERIFIED" | "REJECTED";

export default function AccountUploadsPage() {
  const t = useTranslations("accountPage.uploads");

  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title" | "popular">("newest");
  const [uploadedLoading, setUploadedLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

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

  const statusCounts = useMemo(() => {
    const counts = { ALL: 0, PENDING: 0, VERIFIED: 0, REJECTED: 0 };
    for (const item of uploadedItems) {
      counts.ALL++;
      if (item.status === "VERIFIED") counts.VERIFIED++;
      else if (item.status === "PENDING") counts.PENDING++;
      else if (item.status === "REJECTED") counts.REJECTED++;
    }
    return counts;
  }, [uploadedItems]);

  const pendingCount = statusCounts.PENDING;

  const filteredItems = useMemo(
    () =>
      statusFilter === "ALL"
        ? uploadedItems
        : uploadedItems.filter((item) => item.status === statusFilter),
    [uploadedItems, statusFilter]
  );

  const filterOptions: { key: StatusFilter; label: string }[] = [
    { key: "ALL", label: t("filterAll") },
    { key: "PENDING", label: t("filterUnderReview") },
    { key: "VERIFIED", label: t("filterVerified") },
    { key: "REJECTED", label: t("filterRejected") },
  ];

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

      {/* Pending Banner */}
      {pendingCount > 0 && statusFilter !== "PENDING" && (
        <div className="border-warning/50 bg-warning/10 mb-4 flex items-center gap-3 rounded-xl border p-4">
          <AlertTriangle className="text-warning h-5 w-5 flex-shrink-0" />
          <p className="text-text flex-1 text-sm">{t("pendingBanner", { count: pendingCount })}</p>
          <button
            onClick={() => setStatusFilter("PENDING")}
            className="text-warning hover:bg-warning/20 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors"
          >
            {t("filterShow")}
          </button>
        </div>
      )}

      {/* Search & Sort */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
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

      {/* Status Filter Pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filterOptions.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === key
                ? "bg-primary text-text-on-accent"
                : "bg-surface-hover text-text-muted hover:text-text"
            }`}
          >
            {label}
            <span
              className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs ${
                statusFilter === key ? "bg-white/20" : "bg-bg text-text-faint"
              }`}
            >
              {statusCounts[key]}
            </span>
          </button>
        ))}
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
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item) => (
            <DashboardMaterialCard
              key={item.id}
              id={item.id}
              title={item.title}
              subject={item.subjects[0] || "Allgemein"}
              cycle={item.cycles[0] || ""}
              previewUrl={item.previewUrl}
              editHref={`/materialien/${item.id}/edit`}
              badge={{
                label:
                  item.status === "VERIFIED"
                    ? t("statusVerified")
                    : item.status === "PENDING"
                      ? t("statusPending")
                      : item.status === "REJECTED"
                        ? t("statusRejected")
                        : item.status,
                variant:
                  item.status === "VERIFIED"
                    ? "success"
                    : item.status === "PENDING"
                      ? "warning"
                      : item.status === "REJECTED"
                        ? "error"
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
          <h3 className="text-text mb-2 text-lg font-medium">
            {statusFilter !== "ALL" ? t("noMatchingFilter") : t("empty")}
          </h3>
          <p className="text-text-muted mb-4">
            {statusFilter !== "ALL" ? t("noMatchingFilterDesc") : t("emptyDescription")}
          </p>
          {statusFilter !== "ALL" ? (
            <button
              onClick={() => setStatusFilter("ALL")}
              className="text-primary text-sm font-medium hover:underline"
            >
              {t("showAll")}
            </button>
          ) : (
            <Link
              href="/hochladen"
              className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              {t("uploadFirst")}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
