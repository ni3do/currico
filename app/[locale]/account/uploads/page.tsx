"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { FileText } from "lucide-react";
import { useAccountData } from "@/lib/hooks/useAccountData";
import { DashboardMaterialCard } from "@/components/ui/DashboardMaterialCard";
import type { UploadedItem } from "@/lib/types/account";

export default function AccountUploadsPage() {
  const { userData, stats } = useAccountData();

  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadedLoading, setUploadedLoading] = useState(false);

  // Fetch uploaded items
  const fetchUploaded = useCallback(async (search?: string) => {
    setUploadedLoading(true);
    try {
      const params = new URLSearchParams({ type: "uploaded" });
      if (search) params.set("search", search);
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

  // Fetch on mount and when search changes (with debounce)
  useEffect(() => {
    const debounce = setTimeout(
      () => {
        fetchUploaded(searchQuery || undefined);
      },
      searchQuery ? 300 : 0
    );
    return () => clearTimeout(debounce);
  }, [searchQuery, fetchUploaded]);

  return (
    <div className="border-border bg-surface rounded-xl border p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-text text-xl font-semibold">Meine Uploads</h2>
          <p className="text-text-muted mt-1 text-sm">Materialien, die Sie hochgeladen haben</p>
        </div>
        <Link
          href="/upload"
          className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
        >
          <span>+</span>
          Neues Material
        </Link>
      </div>

      {/* Search */}
      {uploadedItems.length > 0 && !uploadedLoading && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Uploads durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary w-full rounded-lg border px-4 py-2 text-sm focus:ring-1 focus:outline-none"
          />
        </div>
      )}

      {uploadedLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse overflow-hidden">
              <div className="bg-bg-secondary aspect-[16/9]"></div>
              <div className="p-4">
                <div className="bg-surface-hover mb-3 h-5 w-20 rounded-full"></div>
                <div className="bg-surface-hover mb-2 h-3 w-24 rounded"></div>
                <div className="bg-surface-hover mb-2 h-5 w-full rounded"></div>
                <div className="bg-surface-hover mb-4 h-4 w-32 rounded"></div>
                <div className="bg-surface-hover h-10 w-full rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : uploadedItems.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {uploadedItems.map((item) => (
            <DashboardMaterialCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              subject={item.subject}
              cycle={item.cycle}
              previewUrl={item.previewUrl}
              badge={{
                label:
                  item.status === "VERIFIED"
                    ? "Verifiziert"
                    : item.status === "PENDING"
                      ? "Ausstehend"
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
              primaryAction={{
                label: "Ansehen",
                icon: "view",
                href: `/materialien/${item.id}`,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <FileText className="text-text-faint mx-auto mb-4 h-16 w-16" />
          <h3 className="text-text mb-2 text-lg font-medium">
            Noch keine hochgeladenen Materialien
          </h3>
          <p className="text-text-muted mb-4">
            Teilen Sie Ihre Unterrichtsmaterialien mit anderen Lehrpersonen.
          </p>
          <Link
            href="/upload"
            className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            Material hochladen
          </Link>
        </div>
      )}
    </div>
  );
}
