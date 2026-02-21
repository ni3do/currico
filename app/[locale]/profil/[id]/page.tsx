"use client";

import { useState, useEffect, useRef, use } from "react";
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
import { ProfilePageSkeleton } from "@/components/ui/Skeleton";

// Simple in-memory cache with 60s TTL for profile data
const profileCache = new Map<string, { data: ProfileBundleData; ts: number }>();
const CACHE_TTL_MS = 60_000;

interface ProfileBundleData {
  profile: PublicProfileData;
  bestMaterials: ProfileMaterial[];
  materials: ProfileMaterial[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  collections: ProfileCollection[];
}

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
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!isValidId(id) || fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchData() {
      // Check cache first
      const cached = profileCache.get(id);
      if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
        const { data } = cached;
        setProfile(data.profile);
        setBestMaterials(data.bestMaterials);
        setAllMaterials(data.materials);
        setCollections(data.collections);
        setHasMoreMaterials(data.pagination.totalPages > 1);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/users/${id}/profile-bundle`);

        if (!res.ok) {
          setError(true);
          return;
        }

        const data: ProfileBundleData = await res.json();

        // Store in cache
        profileCache.set(id, { data, ts: Date.now() });

        setProfile(data.profile);
        setBestMaterials(data.bestMaterials || []);
        setAllMaterials(data.materials || []);
        setCollections(data.collections || []);
        setHasMoreMaterials(data.pagination?.totalPages > 1);
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
        // Invalidate cache on follow/unfollow
        profileCache.delete(id);
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
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 2xl:max-w-[1440px]">
          <ProfilePageSkeleton />
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

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 2xl:max-w-[1440px]">
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
