"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

interface ProfileData {
  name: string | null;
  display_name: string | null;
  email: string;
  cantons: string[];
  subjects: string[];
  cycles: string[];
}

interface WishlistItem {
  id: string;
  title: string;
  description: string;
  price: number;
  priceFormatted: string;
  previewUrl: string | null;
  subject: string;
  cycle: string;
  seller: {
    id: string;
    displayName: string | null;
    image: string | null;
  };
}

interface WishlistData {
  items: WishlistItem[];
  stats: {
    totalItems: number;
  };
}

export default function ProfilePage() {
  const tCommon = useTranslations("common");
  const [activeTab, setActiveTab] = useState<"profile" | "library" | "wishlist">("profile");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [wishlistData, setWishlistData] = useState<WishlistData | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [followingCount, setFollowingCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/users/me");
        if (!response.ok) {
          if (response.status === 401) {
            setError("Bitte melden Sie sich an");
            return;
          }
          throw new Error("Fehler beim Laden des Profils");
        }
        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Fehler beim Laden des Profils");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, []);

  useEffect(() => {
    async function fetchWishlist() {
      setWishlistLoading(true);
      setWishlistError(null);
      try {
        const response = await fetch("/api/user/wishlist");
        if (!response.ok) {
          if (response.status === 401) {
            setWishlistError("Bitte melden Sie sich an");
            return;
          }
          throw new Error("Fehler beim Laden der Wunschliste");
        }
        const data = await response.json();
        setWishlistData(data);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        setWishlistError("Fehler beim Laden der Wunschliste");
      } finally {
        setWishlistLoading(false);
      }
    }

    // Fetch on initial load for stats, or when switching to wishlist tab
    if (!wishlistData) {
      fetchWishlist();
    }
  }, [wishlistData]);

  useEffect(() => {
    async function fetchFollowing() {
      try {
        const response = await fetch("/api/user/following");
        if (response.ok) {
          const data = await response.json();
          setFollowingCount(data.sellers?.length ?? 0);
        }
      } catch (err) {
        console.error("Error fetching following:", err);
      }
    }

    fetchFollowing();
  }, []);

  async function handleRemoveFromWishlist(materialId: string) {
    setRemovingId(materialId);
    try {
      const response = await fetch(`/api/user/wishlist?resourceId=${materialId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setWishlistData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.filter((item) => item.id !== materialId),
            stats: {
              totalItems: prev.stats.totalItems - 1,
            },
          };
        });
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    } finally {
      setRemovingId(null);
    }
  }

  const displayName = profileData?.display_name || profileData?.name || "Benutzer";
  const displayCanton = profileData?.cantons?.[0] || "Nicht angegeben";

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: tCommon("breadcrumb.profile") }]} />
          <h1 className="text-text text-2xl font-bold sm:text-3xl">Mein Profil</h1>
          <p className="text-text-muted mt-1">
            Verwalten Sie Ihre Kontoinformationen und Einstellungen
          </p>
        </div>

        {/* Tabs */}
        <div className="border-border mb-8 flex gap-4 border-b">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-4 text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "border-primary text-primary border-b-2"
                : "text-text-muted hover:text-text"
            }`}
          >
            Profil
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`pb-4 text-sm font-medium transition-colors ${
              activeTab === "library"
                ? "border-primary text-primary border-b-2"
                : "text-text-muted hover:text-text"
            }`}
          >
            Meine Bibliothek
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`pb-4 text-sm font-medium transition-colors ${
              activeTab === "wishlist"
                ? "border-primary text-primary border-b-2"
                : "text-text-muted hover:text-text"
            }`}
          >
            Wunschliste
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Profile Information */}
            <div className="lg:col-span-2">
              <div className="border-border bg-surface rounded-2xl border p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-text text-xl font-semibold">Profil Informationen</h2>
                  <Link
                    href="/profil/edit"
                    className="border-border text-text hover:bg-surface-elevated rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Bearbeiten
                  </Link>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                  </div>
                ) : error ? (
                  <div className="bg-error/10 text-error rounded-lg p-4 text-center">{error}</div>
                ) : profileData ? (
                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="text-text mb-2 block text-sm font-medium">Name</label>
                      <div className="text-text-muted">{displayName}</div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-text mb-2 block text-sm font-medium">E-Mail</label>
                      <div className="text-text-muted">{profileData.email}</div>
                    </div>

                    {/* Canton */}
                    <div>
                      <label className="text-text mb-2 block text-sm font-medium">Kanton</label>
                      <div className="text-text-muted">{displayCanton}</div>
                    </div>

                    {/* Subjects */}
                    <div>
                      <label className="text-text mb-2 block text-sm font-medium">
                        Unterrichtsfächer
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {profileData.subjects?.length > 0 ? (
                          profileData.subjects.map((subject) => (
                            <span
                              key={subject}
                              className="bg-bg text-text rounded-full px-3 py-1 text-sm"
                            >
                              {subject}
                            </span>
                          ))
                        ) : (
                          <span className="text-text-muted">Keine Fächer ausgewählt</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              {/* Account Stats */}
              <div className="border-border bg-surface rounded-2xl border p-6">
                <h3 className="text-text mb-4 font-semibold">Statistiken</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-primary text-2xl font-bold">12</div>
                    <div className="text-text-muted text-sm">Gekaufte Materialien</div>
                  </div>
                  <div>
                    <div className="text-success text-2xl font-bold">
                      {wishlistData?.stats.totalItems ?? "–"}
                    </div>
                    <div className="text-text-muted text-sm">Wunschliste</div>
                  </div>
                  <div>
                    <div className="text-accent text-2xl font-bold">{followingCount ?? "–"}</div>
                    <div className="text-text-muted text-sm">Gefolgte Verkäufer</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-border bg-surface rounded-2xl border p-6">
                <h3 className="text-text mb-4 font-semibold">Schnellaktionen</h3>
                <div className="space-y-3">
                  <Link
                    href="/materialien"
                    className="border-border bg-bg text-text hover:bg-surface-elevated block rounded-lg border px-4 py-3 text-sm transition-colors"
                  >
                    Materialien durchsuchen
                  </Link>
                  <Link
                    href="/folge-ich"
                    className="border-border bg-bg text-text hover:bg-surface-elevated block rounded-lg border px-4 py-3 text-sm transition-colors"
                  >
                    Gefolgte Verkäufer
                  </Link>
                  <Link
                    href="/profil/edit"
                    className="border-border bg-bg text-text hover:bg-surface-elevated block rounded-lg border px-4 py-3 text-sm transition-colors"
                  >
                    Verkäufer werden
                  </Link>
                  <button className="border-error text-error hover:bg-error/10 w-full rounded-lg border px-4 py-3 text-sm transition-colors">
                    Abmelden
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === "library" && (
          <div className="border-border bg-surface rounded-2xl border p-8">
            <h2 className="text-text mb-6 text-xl font-semibold">Meine Bibliothek</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Mock library items */}
              {[1, 2, 3].map((item) => (
                <div key={item} className="border-border bg-bg rounded-xl border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="bg-surface text-text-muted rounded-full px-2 py-1 text-xs">
                      PDF
                    </span>
                    <span className="bg-success/20 text-success rounded-full px-2 py-1 text-xs font-medium">
                      ✓ Verifiziert
                    </span>
                  </div>
                  <h3 className="text-text mb-2 font-semibold">Bruchrechnen Übungsblätter</h3>
                  <p className="text-text-muted mb-4 text-sm">Mathematik • Zyklus 2</p>
                  <button className="bg-primary text-text-on-accent hover:bg-primary-hover w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                    Herunterladen
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === "wishlist" && (
          <div className="border-border bg-surface rounded-2xl border p-8">
            <h2 className="text-text mb-6 text-xl font-semibold">Wunschliste</h2>

            {wishlistLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
              </div>
            ) : wishlistError ? (
              <div className="bg-error/10 text-error rounded-lg p-4 text-center">
                {wishlistError}
              </div>
            ) : wishlistData?.items.length === 0 ? (
              <div className="py-12 text-center">
                <svg
                  className="text-text-muted mx-auto h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <h3 className="text-text mt-4 text-lg font-medium">Ihre Wunschliste ist leer</h3>
                <p className="text-text-muted mt-2">
                  Speichern Sie interessante Materialien für später.
                </p>
                <Link
                  href="/materialien"
                  className="bg-primary text-text-on-accent hover:bg-primary-hover mt-4 inline-block rounded-lg px-6 py-2 text-sm font-medium transition-colors"
                >
                  Materialien entdecken
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {wishlistData?.items.map((item) => (
                  <div key={item.id} className="border-border bg-bg rounded-xl border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="bg-surface text-text-muted rounded-full px-2 py-1 text-xs">
                        {item.subject}
                      </span>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        disabled={removingId === item.id}
                        className="text-error hover:text-error/80 transition-colors disabled:opacity-50"
                        aria-label="Aus Wunschliste entfernen"
                      >
                        {removingId === item.id ? (
                          <div className="border-error h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"></div>
                        ) : (
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <h3 className="text-text mb-2 line-clamp-2 font-semibold">{item.title}</h3>
                    <p className="text-text-muted mb-3 text-sm">
                      {item.subject} {item.cycle && `• ${item.cycle}`}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary text-lg font-bold">{item.priceFormatted}</span>
                      <Link
                        href={`/materialien/${item.id}`}
                        className="bg-primary text-text-on-accent hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                      >
                        Ansehen
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
