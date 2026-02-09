"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { MaterialCard } from "@/components/ui/MaterialCard";
import { Users, FileText, FolderOpen, Calendar, MapPin, Instagram, Lock } from "lucide-react";
import { VerifiedSellerBadge } from "@/components/ui/VerifiedSellerBadge";

interface ProfileData {
  id: string;
  name: string | null;
  display_name: string | null;
  image: string | null;
  bio: string | null;
  subjects: string[];
  cycles: string[];
  cantons: string[];
  instagram: string | null;
  pinterest: string | null;
  role: string;
  is_verified_seller: boolean;
  created_at: string;
  is_private: boolean;
  stats: {
    resourceCount: number;
    followerCount: number;
    followingCount: number;
    collectionCount: number;
  };
  isFollowing: boolean;
  isOwnProfile: boolean;
}

interface Material {
  id: string;
  title: string;
  description: string;
  price: number;
  preview_url: string | null;
  subjects: string[];
  cycles: string[];
  created_at: string;
  downloadCount: number;
  salesCount: number;
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  itemCount: number;
  previewItems: {
    id: string;
    title: string;
    preview_url: string | null;
  }[];
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("profile");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [bestMaterials, setBestMaterials] = useState<Material[]>([]);
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"uploads" | "collections">("uploads");
  const [materialPage, setMaterialPage] = useState(1);
  const [hasMoreMaterials, setHasMoreMaterials] = useState(false);

  // Fetch profile data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch profile, best resources, all resources, and collections in parallel
        const [profileRes, bestRes, allRes, collectionsRes] = await Promise.all([
          fetch(`/api/users/${id}/public`),
          fetch(`/api/users/${id}/materials?best=true`),
          fetch(`/api/users/${id}/materials?page=1&limit=12`),
          fetch(`/api/users/${id}/collections`),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        if (bestRes.ok) {
          const bestData = await bestRes.json();
          setBestMaterials(bestData.resources);
        }

        if (allRes.ok) {
          const allData = await allRes.json();
          setAllMaterials(allData.resources);
          setHasMoreMaterials(allData.pagination?.totalPages > 1);
        }

        if (collectionsRes.ok) {
          const collectionsData = await collectionsRes.json();
          setCollections(collectionsData.collections);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Handle follow/unfollow
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
                stats: {
                  ...prev.stats,
                  followerCount: data.followerCount,
                },
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  // Load more resources
  const loadMoreMaterials = async () => {
    const nextPage = materialPage + 1;
    try {
      const response = await fetch(`/api/users/${id}/materials?page=${nextPage}&limit=12`);
      if (response.ok) {
        const data = await response.json();
        setAllMaterials((prev) => [...prev, ...data.materials]);
        setMaterialPage(nextPage);
        setHasMoreMaterials(data.pagination?.page < data.pagination?.totalPages);
      }
    } catch (error) {
      console.error("Error loading more resources:", error);
    }
  };

  const displayName = profile?.display_name || profile?.name || "Benutzer";
  const formatPrice = (cents: number) =>
    cents === 0 ? "Gratis" : `CHF ${(cents / 100).toFixed(2)}`;

  const getSubjectPillClass = (subject: string): string => {
    const subjectMap: Record<string, string> = {
      Deutsch: "pill-deutsch",
      Mathematik: "pill-mathe",
      NMG: "pill-nmg",
      BG: "pill-gestalten",
      Musik: "pill-musik",
      Sport: "pill-sport",
      Englisch: "pill-fremdsprachen",
      Franzosisch: "pill-fremdsprachen",
    };
    return subjectMap[subject] || "pill-primary";
  };

  if (loading) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-text-muted flex items-center gap-3">
            <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Profil wird geladen...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-text mb-2 text-2xl font-bold sm:text-3xl">Profil nicht gefunden</h1>
            <p className="text-text-muted mb-4">
              Das gesuchte Profil existiert nicht oder wurde entfernt.
            </p>
            <Link href="/materialien" className="btn-primary px-6 py-3">
              Materialien durchsuchen
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
        {/* Profile Header */}
        <div className="card mb-8 p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.image ? (
                <Image
                  src={profile.image}
                  alt={displayName}
                  width={120}
                  height={120}
                  className="border-border rounded-full border-4 object-cover"
                />
              ) : (
                <div className="from-primary to-success flex h-[120px] w-[120px] items-center justify-center rounded-full bg-gradient-to-br text-4xl font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-text text-2xl font-bold sm:text-3xl">{displayName}</h1>
                  {profile.is_verified_seller && <VerifiedSellerBadge variant="full" />}
                </div>

                {/* Follow Button */}
                {!profile.isOwnProfile && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`flex items-center gap-2 rounded-lg px-6 py-2.5 font-medium transition-colors ${
                      profile.isFollowing
                        ? "border-border bg-surface text-text hover:bg-surface-elevated border"
                        : "bg-primary hover:bg-primary-hover text-white"
                    }`}
                  >
                    {followLoading ? (
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    ) : profile.isFollowing ? (
                      <>
                        <Users className="h-4 w-4" />
                        Gefolgt
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4" />
                        Folgen
                      </>
                    )}
                  </button>
                )}

                {profile.isOwnProfile && (
                  <Link
                    href="/profile/edit"
                    className="border-border bg-surface text-text hover:bg-surface-elevated flex items-center gap-2 rounded-lg border px-6 py-2.5 font-medium transition-colors"
                  >
                    Profil bearbeiten
                  </Link>
                )}
              </div>

              {/* Private Profile Notice */}
              {profile.is_private && !profile.isOwnProfile && (
                <div className="bg-surface-elevated border-border text-text-muted mt-4 flex items-center gap-2 rounded-lg border p-3 text-sm">
                  <Lock className="h-4 w-4" />
                  <span>
                    Dieses Profil ist privat. Nur öffentliche Materialien werden angezeigt.
                  </span>
                </div>
              )}

              {/* Bio - hidden for private profiles */}
              {profile.bio && !profile.is_private && (
                <p className="text-text-muted mb-4">{profile.bio}</p>
              )}

              {/* Meta Info - limited for private profiles */}
              <div className="text-text-muted flex flex-wrap gap-4 text-sm">
                {!profile.is_private && profile.cantons.length > 0 && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.cantons.join(", ")}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Mitglied seit{" "}
                  {new Date(profile.created_at).toLocaleDateString("de-CH", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Social Media Links - hidden for private profiles */}
              {!profile.is_private && (profile.instagram || profile.pinterest) && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {profile.instagram && (
                    <a
                      href={`https://instagram.com/${profile.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-primary flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-pink-500/10"
                    >
                      <Instagram className="h-4 w-4" />@{profile.instagram}
                    </a>
                  )}
                  {profile.pinterest && (
                    <a
                      href={`https://pinterest.com/${profile.pinterest}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-primary flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-red-500/10"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                      </svg>
                      @{profile.pinterest}
                    </a>
                  )}
                </div>
              )}

              {/* Subjects - hidden for private profiles */}
              {!profile.is_private && profile.subjects.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.subjects.map((subject) => (
                    <span key={subject} className={`pill ${getSubjectPillClass(subject)}`}>
                      {subject}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Stats - limited for private profiles */}
            <div className="border-border flex gap-6 border-t pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6">
              <div className="text-center">
                <div className="text-primary text-2xl font-bold">{profile.stats.resourceCount}</div>
                <div className="text-text-muted text-xs">Materialien</div>
              </div>
              {!profile.is_private && (
                <>
                  <div className="text-center">
                    <div className="text-success text-2xl font-bold">
                      {profile.stats.followerCount}
                    </div>
                    <div className="text-text-muted text-xs">Follower</div>
                  </div>
                  <div className="text-center">
                    <div className="text-accent text-2xl font-bold">
                      {profile.stats.followingCount}
                    </div>
                    <div className="text-text-muted text-xs">Folgt</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Best Uploads Section */}
        {bestMaterials.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-text text-xl font-semibold">Beste Uploads</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {bestMaterials.slice(0, 3).map((material) => (
                <MaterialCard
                  key={material.id}
                  id={material.id}
                  title={material.title}
                  description={material.description}
                  subject={material.subjects[0] || ""}
                  cycle={material.cycles[0] || ""}
                  priceFormatted={formatPrice(material.price)}
                  previewUrl={material.preview_url}
                  seller={{ displayName }}
                  subjectPillClass={getSubjectPillClass(material.subjects[0] || "")}
                />
              ))}
            </div>
          </section>
        )}

        {/* Tabs */}
        <div className="border-border mb-6 flex gap-4 border-b">
          <button
            onClick={() => setActiveTab("uploads")}
            className={`flex items-center gap-2 pb-4 text-sm font-medium transition-colors ${
              activeTab === "uploads"
                ? "border-primary text-primary border-b-2"
                : "text-text-muted hover:text-text"
            }`}
          >
            <FileText className="h-4 w-4" />
            Alle Uploads ({profile.stats.resourceCount})
          </button>
          {!profile.is_private && (
            <button
              onClick={() => setActiveTab("collections")}
              className={`flex items-center gap-2 pb-4 text-sm font-medium transition-colors ${
                activeTab === "collections"
                  ? "border-primary text-primary border-b-2"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              Sammlungen ({profile.stats.collectionCount})
            </button>
          )}
        </div>

        {/* All Uploads Tab */}
        {activeTab === "uploads" && (
          <section>
            {allMaterials.length === 0 ? (
              <div className="card flex flex-col items-center justify-center py-16">
                <FileText className="text-text-faint mb-4 h-12 w-12" />
                <p className="text-text">Noch keine Uploads vorhanden</p>
                <p className="text-text-muted text-sm">
                  {profile.isOwnProfile
                    ? "Laden Sie Ihr erstes Material hoch!"
                    : "Dieser Benutzer hat noch keine Materialien hochgeladen."}
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
                      priceFormatted={formatPrice(material.price)}
                      previewUrl={material.preview_url}
                      seller={{ displayName }}
                      subjectPillClass={getSubjectPillClass(material.subjects[0] || "")}
                    />
                  ))}
                </div>

                {hasMoreMaterials && (
                  <div className="mt-8 text-center">
                    <button onClick={loadMoreMaterials} className="btn-secondary px-8 py-3">
                      Mehr laden
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
                <p className="text-text">Noch keine Sammlungen vorhanden</p>
                <p className="text-text-muted text-sm">
                  {profile.isOwnProfile
                    ? "Erstellen Sie Ihre erste Sammlung!"
                    : "Dieser Benutzer hat noch keine öffentlichen Sammlungen."}
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
                      {collection.previewItems.slice(0, 4).map((item, idx) => (
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
                        {collection.itemCount} Materialien
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
