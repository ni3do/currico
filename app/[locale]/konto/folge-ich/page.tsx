"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Users, FileText, Calendar } from "lucide-react";
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
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

  // Fetch followed sellers
  const fetchFollowing = useCallback(async () => {
    try {
      const response = await fetch("/api/user/following");
      if (response.ok) {
        const data = await response.json();
        setFollowedSellers(data.sellers || []);
      }
    } catch (error) {
      console.error("Error fetching following:", error);
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
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card p-8">
        <h2 className="text-text mb-6 text-xl font-semibold">
          {t("followedProfiles")} ({followedSellers.length})
        </h2>

        {followedSellers.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="text-text-faint mx-auto mb-4 h-16 w-16" />
            <p className="text-text mb-2">{t("noFollowing")}</p>
            <p className="text-text-muted mb-4 text-sm">{t("noFollowingDescription")}</p>
            <Link
              href="/materialien"
              className="bg-primary hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-6 py-2.5 font-medium text-white transition-colors"
            >
              {t("discoverProfiles")}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {followedSellers.map((seller) => (
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
                          <p className="text-text-muted mt-1 line-clamp-2 text-sm">
                            {seller.bio}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleUnfollow(seller.id)}
                        disabled={unfollowingId === seller.id}
                        className="border-border text-text hover:border-error hover:text-error flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
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
                          locale === "de" ? "de-CH" : "en-CH",
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
