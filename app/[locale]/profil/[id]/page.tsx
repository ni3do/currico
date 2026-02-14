"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { MaterialCard } from "@/components/ui/MaterialCard";
import {
  Users,
  FileText,
  FolderOpen,
  Calendar,
  MapPin,
  Instagram,
  Lock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { VerifiedSellerBadge } from "@/components/ui/VerifiedSellerBadge";
import { getSubjectPillClass } from "@/lib/constants/subject-colors";
import { formatPrice } from "@/lib/utils/price";
import type { PublicProfileData, ProfileMaterial, ProfileCollection } from "@/lib/types/profile";

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [bestMaterials, setBestMaterials] = useState<ProfileMaterial[]>([]);
  const [allMaterials, setAllMaterials] = useState<ProfileMaterial[]>([]);
  const [collections, setCollections] = useState<ProfileCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<"uploads" | "collections">("uploads");
  const [materialPage, setMaterialPage] = useState(1);
  const [hasMoreMaterials, setHasMoreMaterials] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
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
  const dateLocale = locale === "de" ? "de-CH" : "en-US";

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {/* Banner skeleton */}
          <div className="from-primary/15 via-accent/8 to-success/15 mb-8 overflow-hidden rounded-2xl bg-gradient-to-r">
            <div className="p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="bg-surface h-28 w-28 animate-pulse rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="bg-surface h-8 w-48 animate-pulse rounded-lg" />
                  <div className="bg-surface h-4 w-72 animate-pulse rounded" />
                  <div className="bg-surface h-4 w-40 animate-pulse rounded" />
                </div>
              </div>
            </div>
          </div>
          {/* Stats skeleton */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-border bg-surface animate-pulse rounded-xl border p-5">
                <div className="bg-bg-secondary mb-2 h-8 w-12 rounded" />
                <div className="bg-bg-secondary h-4 w-20 rounded" />
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
          <div className="text-center">
            <AlertCircle className="text-text-muted mx-auto mb-4 h-12 w-12" />
            <h1 className="text-text mb-2 text-2xl font-bold sm:text-3xl">{t("notFound")}</h1>
            <p className="text-text-muted mb-6">{t("notFoundDescription")}</p>
            <Link href="/materialien" className="btn-primary px-6 py-3">
              {tCommon("breadcrumb.materials")}
            </Link>
          </div>
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

        {/* Profile Hero */}
        <div className="from-primary/15 via-accent/8 to-success/15 mb-8 overflow-hidden rounded-2xl bg-gradient-to-r">
          <div className="bg-bg/60 backdrop-blur-sm">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {profile.image ? (
                    <Image
                      src={profile.image}
                      alt={displayName}
                      width={112}
                      height={112}
                      className="border-bg h-28 w-28 rounded-full border-4 object-cover shadow-lg"
                    />
                  ) : (
                    <div className="from-primary to-success flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br text-4xl font-bold text-white shadow-lg">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h1 className="text-text text-2xl font-bold sm:text-3xl">{displayName}</h1>
                      {profile.is_verified_seller && (
                        <div className="mt-1">
                          <VerifiedSellerBadge variant="full" />
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    {!profile.isOwnProfile ? (
                      <button
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        className={`flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 font-medium transition-colors ${
                          profile.isFollowing
                            ? "border-border bg-surface text-text hover:bg-surface-elevated border"
                            : "bg-primary hover:bg-primary-hover text-white"
                        }`}
                      >
                        {followLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Users className="h-4 w-4" />
                        )}
                        {profile.isFollowing ? t("following") : t("follow")}
                      </button>
                    ) : (
                      <Link
                        href="/profil/edit"
                        className="border-border bg-surface text-text hover:bg-surface-elevated flex items-center gap-2 rounded-lg border px-6 py-2.5 font-medium transition-colors"
                      >
                        {t("editProfile")}
                      </Link>
                    )}
                  </div>

                  {/* Private Profile Notice */}
                  {profile.is_private && !profile.isOwnProfile && (
                    <div className="bg-surface border-border text-text-muted mb-3 flex items-center gap-2 rounded-lg border p-3 text-sm">
                      <Lock className="h-4 w-4 flex-shrink-0" />
                      <span>{t("privacy.notice")}</span>
                    </div>
                  )}

                  {/* Bio */}
                  {profile.bio && !profile.is_private && (
                    <p className="text-text-secondary mb-3 leading-relaxed">{profile.bio}</p>
                  )}

                  {/* Meta: location + member since */}
                  <div className="text-text-muted flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {!profile.is_private && profile.cantons.length > 0 && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {profile.cantons.join(", ")}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {t("memberSince")}{" "}
                      {new Date(profile.created_at).toLocaleDateString(dateLocale, {
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  {/* Social Media + Subject Pills */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {!profile.is_private && profile.instagram && (
                      <a
                        href={`https://instagram.com/${profile.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Instagram: @${profile.instagram}`}
                        className="text-text-muted hover:text-primary border-border flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors hover:bg-pink-500/10"
                      >
                        <Instagram className="h-3.5 w-3.5" />@{profile.instagram}
                      </a>
                    )}
                    {!profile.is_private && profile.pinterest && (
                      <a
                        href={`https://pinterest.com/${profile.pinterest}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Pinterest: @${profile.pinterest}`}
                        className="text-text-muted hover:text-primary border-border flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors hover:bg-red-500/10"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                        </svg>
                        @{profile.pinterest}
                      </a>
                    )}
                    {!profile.is_private &&
                      profile.subjects.map((subject) => (
                        <span
                          key={subject}
                          className={`pill text-xs ${getSubjectPillClass(subject)}`}
                        >
                          {subject}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          className={`mb-8 grid gap-4 ${profile.is_private ? "max-w-xs grid-cols-1" : "grid-cols-3"}`}
        >
          <div className="border-border bg-surface rounded-xl border p-5 text-center">
            <div className="text-primary text-2xl font-bold">{profile.stats.resourceCount}</div>
            <div className="text-text-muted text-sm">{t("stats.materials")}</div>
          </div>
          {!profile.is_private && (
            <>
              <div className="border-border bg-surface rounded-xl border p-5 text-center">
                <div className="text-success text-2xl font-bold">{profile.stats.followerCount}</div>
                <div className="text-text-muted text-sm">{t("stats.followers")}</div>
              </div>
              <div className="border-border bg-surface rounded-xl border p-5 text-center">
                <div className="text-accent text-2xl font-bold">{profile.stats.followingCount}</div>
                <div className="text-text-muted text-sm">{t("stats.following")}</div>
              </div>
            </>
          )}
        </div>

        {/* Best Uploads */}
        {bestMaterials.length > 0 && (
          <section className="mb-8">
            <h2 className="text-text mb-4 text-xl font-semibold">{t("bestUploads")}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {bestMaterials.slice(0, 3).map((material) => (
                <MaterialCard
                  key={material.id}
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
              ))}
            </div>
          </section>
        )}

        {/* Tabs */}
        <div className="border-border mb-6 flex gap-4 border-b" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "uploads"}
            onClick={() => setActiveTab("uploads")}
            className={`flex items-center gap-2 pb-4 text-sm font-medium transition-colors ${
              activeTab === "uploads"
                ? "border-primary text-primary border-b-2"
                : "text-text-muted hover:text-text"
            }`}
          >
            <FileText className="h-4 w-4" />
            {t("tabs.uploads")} ({profile.stats.resourceCount})
          </button>
          {!profile.is_private && (
            <button
              role="tab"
              aria-selected={activeTab === "collections"}
              onClick={() => setActiveTab("collections")}
              className={`flex items-center gap-2 pb-4 text-sm font-medium transition-colors ${
                activeTab === "collections"
                  ? "border-primary text-primary border-b-2"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              {t("tabs.collections")} ({profile.stats.collectionCount})
            </button>
          )}
        </div>

        {/* Uploads Tab */}
        {activeTab === "uploads" && (
          <section>
            {allMaterials.length === 0 ? (
              <div className="card flex flex-col items-center justify-center py-16">
                <FileText className="text-text-faint mb-4 h-12 w-12" />
                <p className="text-text">{t("noUploads")}</p>
                <p className="text-text-muted text-sm">
                  {profile.isOwnProfile ? t("noUploadsOwn") : t("noUploadsOther")}
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {allMaterials.map((material) => (
                    <MaterialCard
                      key={material.id}
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
                  ))}
                </div>

                {hasMoreMaterials && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={loadMoreMaterials}
                      disabled={loadingMore}
                      className="btn-secondary inline-flex items-center gap-2 px-8 py-3 disabled:opacity-50"
                    >
                      {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                      {t("loadMore")}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* Collections Tab */}
        {activeTab === "collections" && (
          <section>
            {collections.length === 0 ? (
              <div className="card flex flex-col items-center justify-center py-16">
                <FolderOpen className="text-text-faint mb-4 h-12 w-12" />
                <p className="text-text">{t("noCollections")}</p>
                <p className="text-text-muted text-sm">
                  {profile.isOwnProfile ? t("noCollectionsOwn") : t("noCollectionsOther")}
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {collections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collections/${collection.id}`}
                    className="card group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Preview Grid */}
                    <div className="bg-bg-secondary grid h-40 grid-cols-2 gap-1 p-1">
                      {collection.previewItems.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          className="bg-surface relative overflow-hidden rounded-sm"
                        >
                          {item.preview_url ? (
                            <Image
                              src={item.preview_url}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <FileText className="text-text-faint h-6 w-6" />
                            </div>
                          )}
                        </div>
                      ))}
                      {collection.previewItems.length < 4 &&
                        Array.from({ length: 4 - collection.previewItems.length }).map((_, idx) => (
                          <div
                            key={`empty-${idx}`}
                            className="bg-surface flex items-center justify-center rounded-sm"
                          >
                            <div className="border-border h-6 w-6 rounded border-2 border-dashed" />
                          </div>
                        ))}
                    </div>

                    {/* Collection Info */}
                    <div className="p-4">
                      <h3 className="text-text group-hover:text-primary mb-1 font-semibold">
                        {collection.name}
                      </h3>
                      {collection.description && (
                        <p className="text-text-muted mb-2 line-clamp-2 text-sm">
                          {collection.description}
                        </p>
                      )}
                      <div className="text-text-muted flex items-center gap-1 text-sm">
                        <FileText className="h-4 w-4" />
                        {collection.itemCount} {t("stats.materials")}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
