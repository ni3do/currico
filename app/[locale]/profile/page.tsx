"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

interface ProfileData {
  name: string | null;
  display_name: string | null;
  email: string;
  cantons: string[];
  subjects: string[];
  cycles: string[];
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "library" | "wishlist">("profile");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const displayName = profileData?.display_name || profileData?.name || "Benutzer";
  const displayCanton = profileData?.cantons?.[0] || "Nicht angegeben";

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <TopBar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Mein Profil</h1>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Verwalten Sie Ihre Kontoinformationen und Einstellungen
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-4 text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            Profil
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`pb-4 text-sm font-medium transition-colors ${
              activeTab === "library"
                ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            Meine Bibliothek
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`pb-4 text-sm font-medium transition-colors ${
              activeTab === "wishlist"
                ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
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
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[var(--color-text)]">
                    Profil Informationen
                  </h2>
                  <Link
                    href="/profile/edit"
                    className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                  >
                    Bearbeiten
                  </Link>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
                  </div>
                ) : error ? (
                  <div className="rounded-lg bg-[var(--color-error)]/10 p-4 text-center text-[var(--color-error)]">
                    {error}
                  </div>
                ) : profileData ? (
                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                        Name
                      </label>
                      <div className="text-[var(--color-text-muted)]">{displayName}</div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                        E-Mail
                      </label>
                      <div className="text-[var(--color-text-muted)]">{profileData.email}</div>
                    </div>

                    {/* Canton */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                        Kanton
                      </label>
                      <div className="text-[var(--color-text-muted)]">{displayCanton}</div>
                    </div>

                    {/* Subjects */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                        Unterrichtsfächer
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {profileData.subjects?.length > 0 ? (
                          profileData.subjects.map((subject) => (
                            <span
                              key={subject}
                              className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-sm text-[var(--color-text)]"
                            >
                              {subject}
                            </span>
                          ))
                        ) : (
                          <span className="text-[var(--color-text-muted)]">Keine Fächer ausgewählt</span>
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
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <h3 className="mb-4 font-semibold text-[var(--color-text)]">Statistiken</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-[var(--color-primary)]">12</div>
                    <div className="text-sm text-[var(--color-text-muted)]">Gekaufte Ressourcen</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--color-success)]">5</div>
                    <div className="text-sm text-[var(--color-text-muted)]">Wunschliste</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--color-accent)]">3</div>
                    <div className="text-sm text-[var(--color-text-muted)]">Gefolgte Verkäufer</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <h3 className="mb-4 font-semibold text-[var(--color-text)]">Schnellaktionen</h3>
                <div className="space-y-3">
                  <Link
                    href="/resources"
                    className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                  >
                    Ressourcen durchsuchen
                  </Link>
                  <Link
                    href="/profile/edit"
                    className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                  >
                    Verkäufer werden
                  </Link>
                  <button className="w-full rounded-lg border border-[var(--color-error)] px-4 py-3 text-sm text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors">
                    Abmelden
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === "library" && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
            <h2 className="mb-6 text-xl font-semibold text-[var(--color-text)]">
              Meine Bibliothek
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Mock library items */}
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text-muted)]">
                      PDF
                    </span>
                    <span className="rounded-full bg-[var(--color-success)]/20 px-2 py-1 text-xs font-medium text-[var(--color-success)]">
                      ✓ Verifiziert
                    </span>
                  </div>
                  <h3 className="mb-2 font-semibold text-[var(--color-text)]">
                    Bruchrechnen Übungsblätter
                  </h3>
                  <p className="mb-4 text-sm text-[var(--color-text-muted)]">Mathematik • Zyklus 2</p>
                  <button className="w-full rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-success)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
                    Herunterladen
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === "wishlist" && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
            <h2 className="mb-6 text-xl font-semibold text-[var(--color-text)]">Wunschliste</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Mock wishlist items */}
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text-muted)]">
                      Bundle
                    </span>
                    <button className="text-[var(--color-error)] hover:text-[var(--color-error)]/80">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="mb-2 font-semibold text-[var(--color-text)]">
                    NMG Experimente Bundle
                  </h3>
                  <p className="mb-3 text-sm text-[var(--color-text-muted)]">NMG • Zyklus 2</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[var(--color-primary)]">CHF 25.00</span>
                    <button className="rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-success)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
                      Kaufen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
