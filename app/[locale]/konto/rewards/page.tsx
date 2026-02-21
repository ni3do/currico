"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { SellerLevelCard } from "@/components/account/SellerLevelCard";
import { useAccountData } from "@/lib/hooks/useAccountData";

export default function RewardsPage() {
  const t = useTranslations("accountPage");
  const { userData } = useAccountData();
  const isSeller = userData?.isSeller ?? false;

  const [levelData, setLevelData] = useState<{
    uploads: number;
    downloads: number;
    reviews: number;
    avgRating: number | null;
    downloadMultiplier: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLevelData = useCallback(async () => {
    if (!isSeller) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/seller/level");
      if (res.ok) {
        const data = await res.json();
        setLevelData({
          uploads: data.uploads,
          downloads: data.downloads,
          reviews: data.reviews,
          avgRating: data.avgRating,
          downloadMultiplier: data.downloadMultiplier,
        });
      }
    } catch {
      // Silently ignore — non-critical
    } finally {
      setLoading(false);
    }
  }, [isSeller]);

  useEffect(() => {
    fetchLevelData();
  }, [fetchLevelData]);

  if (!isSeller) {
    return (
      <div className="text-text-muted py-12 text-center text-sm">{t("overview.noSellerData")}</div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="border-border bg-surface h-64 rounded-xl border" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {levelData && (
        <SellerLevelCard
          uploads={levelData.uploads}
          downloads={levelData.downloads}
          reviews={levelData.reviews}
          avgRating={levelData.avgRating}
          downloadMultiplier={levelData.downloadMultiplier}
        />
      )}
    </div>
  );
}
