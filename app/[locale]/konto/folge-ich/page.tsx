"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Users, FileText, Calendar } from "lucide-react";
import { useAccountData } from "@/lib/hooks/useAccountData";
import { SUBJECT_PILL_CLASSES } from "@/lib/types/account";

interface FollowedSellerDetail {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  subjects: string[];
  resourceCount: number;
  followedAt: string;
}

export default function AccountFollowingPage() {
  const { status } = useSession();
  const tCommon = useTranslations("common");
  const t = useTranslations("following");
  const locale = useLocale();
  const { loading: sharedLoading } = useAccountData();

  const [followedSellers, setFollowedSellers] = useState<FollowedSellerDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch followed sellers
  const fetchFollowing = useCallback(async () => {
    setError(false);
    try {
      const response = await fetch("/api/user/following");
      if (response.ok) {
        const data = await response.json();
        setFollowedSellers(data.sellers || []);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchFollowing();
    }
  }, [status, fetchFollowing]);

  // Unfollow a seller
  const handleUnfollow = async (sellerId: string) => {
    setUnfollowingId(sellerId);
    try {
      const response = await fetch(`/api/users/${sellerId}/follow`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFollowedSellers((prev) => prev.filter((s) => s.id !== sellerId));
      }
    } catch (error) {
      console.error("Error unfollowing:", error);
    } finally {
      setUnfollowingId(null);
    }
  };

  if (loading || sharedLoading) {
    return (
      <div className="card space-y-4 p-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-border animate-pulse rounded-xl border p-6">
            <div className="flex items-start gap-4">
              <div className="bg-border h-16 w-16 flex-shrink-0 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="bg-border h-5 w-40 rounded" />
                <div className="bg-border h-4 w-64 rounded" />
                <div className="flex gap-2">
                  <div className="bg-border h-5 w-16 rounded-full" />
                  <div className="bg-border h-5 w-20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const filteredSellers = followedSellers.filter((seller) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      seller.name.toLowerCase().includes(q) ||
      seller.bio?.toLowerCase().includes(q) ||
      seller.subjects.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-text text-xl font-semibold">
            {t("followedProfiles")} ({followedSellers.length})
          </h2>
          {followedSellers.length > 0 && (
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={t("searchPlaceholder")}
              className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary w-full rounded-lg border px-4 py-2 text-sm focus:ring-1 focus:outline-none sm:w-64"
            />
          )}
        </div>

        {error ? (
          <div className="py-12 text-center">
            <AlertCircle className="text-error mx-auto mb-3 h-10 w-10" aria-hidden="true" />
            <p className="text-text mb-1 font-medium">{t("errorLoading")}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchFollowing();
              }}
              className="text-primary hover:text-primary-hover mt-2 inline-flex items-center gap-1.5 text-sm font-medium"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t("retry")}
            </button>
          </div>
        ) : followedSellers.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="text-text-faint mx-auto mb-4 h-16 w-16" />
            <p className="text-text mb-2">{t("noFollowing")}</p>
            <p className="text-text-muted mb-4 text-sm">{t("noFollowingDescription")}</p>
            <Link
              href="/materialien?showCreators=true"
              className="bg-primary hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-6 py-2.5 font-medium text-white transition-colors"
            >
              {t("discoverProfiles")}
            </Link>
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="text-text-faint mx-auto mb-4 h-12 w-12" aria-hidden="true" />
            <p className="text-text-muted text-sm">{t("noSearchResults")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSellers.map((seller) => (
              <div
                key={seller.id}
                className="border-border bg-bg hover:border-primary/50 rounded-xl border p-6 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Link href={`/profil/${seller.id}`} className="flex-shrink-0">
                    {seller.image ? (
                      <Image
                        src={seller.image}
                        alt={seller.name}
                        width={64}
                        height={64}
                        className="border-border rounded-full border-2 object-cover"
                      />
                    ) : (
                      <div className="from-primary to-success flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-xl font-bold text-white">
                        {seller.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/profil/${seller.id}`}
                          className="text-text hover:text-primary text-lg font-semibold"
                        >
                          {seller.name}
                        </Link>
                        {seller.bio && (
                          <p className="text-text-muted mt-1 line-clamp-2 text-sm">{seller.bio}</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleUnfollow(seller.id)}
                        disabled={unfollowingId === seller.id}
                        className="border-border text-text hover:border-primary hover:text-primary flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {unfollowingId === seller.id ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            {t("unfollowing")}
                          </>
                        ) : (
                          <>
                            <Users className="h-4 w-4" />
                            {t("unfollow")}
                          </>
                        )}
                      </button>
                    </div>

                    {/* Subjects */}
                    {seller.subjects.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {seller.subjects.slice(0, 4).map((subject) => (
                          <span
                            key={subject}
                            className={`pill text-xs ${SUBJECT_PILL_CLASSES[subject] || "pill-primary"}`}
                          >
                            {subject}
                          </span>
                        ))}
                        {seller.subjects.length > 4 && (
                          <span className="text-text-muted text-xs">
                            +{seller.subjects.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="text-text-muted mt-3 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {seller.resourceCount} {tCommon("navigation.materials")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {t("followedSince")}{" "}
                        {new Date(seller.followedAt).toLocaleDateString(
                          locale === "de" ? "de-CH" : "en-US",
                          {
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
