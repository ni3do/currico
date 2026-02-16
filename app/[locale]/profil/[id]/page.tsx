"use client";

import { useState, useEffect, use } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { MaterialCard } from "@/components/ui/MaterialCard";
import { AlertCircle } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/ui/animations";
import { getSubjectPillClass } from "@/lib/constants/subject-colors";
import { formatPrice } from "@/lib/utils/price";
import { isValidId } from "@/lib/rateLimit";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import type { PublicProfileData, ProfileMaterial, ProfileCollection } from "@/lib/types/profile";

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [bestMaterials, setBestMaterials] = useState<ProfileMaterial[]>([]);
  const [allMaterials, setAllMaterials] = useState<ProfileMaterial[]>([]);
  const [collections, setCollections] = useState<ProfileCollection[]>([]);
  const [loading, setLoading] = useState(() => isValidId(id));
  const [followLoading, setFollowLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<"uploads" | "collections">("uploads");
  const [materialPage, setMaterialPage] = useState(1);
  const [hasMoreMaterials, setHasMoreMaterials] = useState(false);
  const [error, setError] = useState(() => !isValidId(id));

  useEffect(() => {
    if (!isValidId(id)) return;

    async function fetchData() {
      setLoading(true);
      try {
        const [profileRes, bestRes, allRes, collectionsRes] = await Promise.all([
          fetch(`/api/users/${id}/public`),
          fetch(`/api/users/${id}/materials?best=true`),
          fetch(`/api/users/${id}/materials?page=1&limit=12`),
          fetch(`/api/users/${id}/collections`),
        ]);

        if (profileRes.ok) {
          setProfile(await profileRes.json());
        } else {
          setError(true);
        }

        if (bestRes.ok) {
          const bestData = await bestRes.json();
          setBestMaterials(bestData.materials || []);
        }

        if (allRes.ok) {
          const allData = await allRes.json();
          setAllMaterials(allData.materials || []);
          setHasMoreMaterials(allData.pagination?.totalPages > 1);
        }

        if (collectionsRes.ok) {
          const collectionsData = await collectionsRes.json();
          setCollections(collectionsData.collections || []);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleFollowToggle = async () => {
    if (!profile || profile.isOwnProfile) return;

    setFollowLoading(true);
    try {
      const method = profile.isFollowing ? "DELETE" : "POST";
      const response = await fetch(`/api/users/${id}/follow`, { method });

      if (response.ok) {
        const data = await response.json();
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                isFollowing: !prev.isFollowing,
                stats: { ...prev.stats, followerCount: data.followerCount },
              }
            : null
        );
      }
    } catch {
      // silently fail
    } finally {
      setFollowLoading(false);
    }
  };

  const loadMoreMaterials = async () => {
    setLoadingMore(true);
    const nextPage = materialPage + 1;
    try {
      const response = await fetch(`/api/users/${id}/materials?page=${nextPage}&limit=12`);
      if (response.ok) {
        const data = await response.json();
        setAllMaterials((prev) => [...prev, ...(data.materials || [])]);
        setMaterialPage(nextPage);
        setHasMoreMaterials(data.pagination?.page < data.pagination?.totalPages);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  };

  const displayName = profile?.display_name || profile?.name || tCommon("user");

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {/* Hero skeleton */}
          <div className="from-primary/15 via-accent/8 to-success/15 mb-8 overflow-hidden rounded-2xl bg-gradient-to-r">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="bg-surface/50 h-28 w-28 animate-pulse rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="bg-surface/50 h-8 w-48 animate-pulse rounded-lg" />
                  <div className="bg-surface/50 h-4 w-72 animate-pulse rounded" />
                  <div className="bg-surface/50 h-4 w-40 animate-pulse rounded" />
                </div>
              </div>
            </div>
          </div>
          {/* Stats skeleton */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-border bg-surface animate-pulse rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <div className="bg-bg-secondary h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <div className="bg-bg-secondary h-6 w-12 rounded" />
                    <div className="bg-bg-secondary h-3 w-16 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Tab skeleton */}
          <div className="border-border mb-6 flex gap-4 border-b pb-4">
            <div className="bg-surface h-5 w-28 animate-pulse rounded" />
            <div className="bg-surface h-5 w-28 animate-pulse rounded" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border-border bg-surface animate-pulse rounded-xl border">
                <div className="bg-bg-secondary h-40 rounded-t-xl" />
                <div className="space-y-2 p-4">
                  <div className="bg-bg-secondary h-4 w-3/4 rounded" />
                  <div className="bg-bg-secondary h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error / not found
  if (error || !profile) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="flex flex-1 items-center justify-center px-4">
          <FadeIn className="text-center">
            <AlertCircle className="text-text-muted mx-auto mb-4 h-12 w-12" />
            <h1 className="text-text mb-2 text-2xl font-bold sm:text-3xl">{t("notFound")}</h1>
            <p className="text-text-muted mb-6">{t("notFoundDescription")}</p>
            <Link href="/materialien" className="btn-primary px-6 py-3">
              {tCommon("breadcrumb.materials")}
            </Link>
          </FadeIn>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Breadcrumb
          items={[
            { label: tCommon("breadcrumb.materials"), href: "/materialien" },
            { label: displayName },
          ]}
        />

        <ProfileHero
          profile={profile}
          displayName={displayName}
          onFollowToggle={handleFollowToggle}
          followLoading={followLoading}
        />

        <ProfileStats
          resourceCount={profile.stats.resourceCount}
          followerCount={profile.stats.followerCount}
          followingCount={profile.stats.followingCount}
          isPrivate={profile.is_private}
        />

        {/* Best Uploads */}
        {bestMaterials.length > 0 && (
          <FadeIn>
            <section className="mb-8">
              <h2 className="text-text mb-4 text-xl font-semibold">{t("bestUploads")}</h2>
              <StaggerChildren className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" variant="grid">
                {bestMaterials.slice(0, 3).map((material) => (
                  <StaggerItem key={material.id} variant="card">
                    <MaterialCard
                      id={material.id}
                      title={material.title}
                      description={material.description}
                      subject={material.subjects[0] || ""}
                      cycle={material.cycles[0] || ""}
                      priceFormatted={formatPrice(material.price, { freeLabel: tCommon("free") })}
                      previewUrl={material.preview_url}
                      seller={{ displayName }}
                      subjectPillClass={getSubjectPillClass(material.subjects[0] || "")}
                    />
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </section>
          </FadeIn>
        )}

        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          resourceCount={profile.stats.resourceCount}
          collectionCount={profile.stats.collectionCount}
          isPrivate={profile.is_private}
          isOwnProfile={profile.isOwnProfile}
          displayName={displayName}
          materials={allMaterials}
          collections={collections}
          hasMoreMaterials={hasMoreMaterials}
          loadingMore={loadingMore}
          onLoadMore={loadMoreMaterials}
        />
      </main>

      <Footer />
    </div>
  );
}
