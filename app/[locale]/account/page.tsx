"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "library" | "wishlist" | "settings">("overview");
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // User data from session or fallback
  const userData = {
    name: session?.user?.name || "Benutzer",
    email: session?.user?.email || "",
    image: session?.user?.image || null,
    canton: "Zürich",
    subjects: ["Mathematik", "Deutsch", "NMG"],
    cycles: ["Zyklus 2"],
  };

  // Mock statistics
  const stats = {
    purchasedResources: 12,
    wishlistItems: 5,
    followedSellers: 3,
    uploadedResources: 0,
  };

  // Mock library items
  const libraryItems = [
    { id: 1, title: "Bruchrechnen Übungsblätter", type: "PDF", subject: "Mathematik", cycle: "Zyklus 2", verified: true },
    { id: 2, title: "Leseverständnis Texte", type: "PDF", subject: "Deutsch", cycle: "Zyklus 2", verified: true },
    { id: 3, title: "NMG Experimente Set", type: "Bundle", subject: "NMG", cycle: "Zyklus 2", verified: true },
  ];

  // Mock wishlist items
  const wishlistItems = [
    { id: 1, title: "Geometrie Arbeitsblätter", subject: "Mathematik", cycle: "Zyklus 2", price: 15.00 },
    { id: 2, title: "Französisch Vokabeltrainer", subject: "Französisch", cycle: "Zyklus 2", price: 12.00 },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <TopBar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header with User Info */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {userData.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userData.image}
                alt={userData.name}
                className="w-16 h-16 rounded-full border-2 border-[var(--color-border)]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {userData.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-[var(--color-text)]">{userData.name}</h1>
              <p className="text-[var(--color-text-muted)]">{userData.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-[var(--color-border)]">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-4 text-sm font-medium transition-colors ${
                activeTab === "overview"
                  ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Übersicht
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
            <button
              onClick={() => setActiveTab("settings")}
              className={`pb-4 text-sm font-medium transition-colors ${
                activeTab === "settings"
                  ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Einstellungen
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Statistics Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-[var(--color-surface)] p-6 border border-[var(--color-border)]">
                  <div className="text-3xl font-bold text-[var(--color-primary)]">{stats.purchasedResources}</div>
                  <div className="text-sm text-[var(--color-text-muted)] mt-1">Gekaufte Ressourcen</div>
                </div>
                <div className="rounded-xl bg-[var(--color-surface)] p-6 border border-[var(--color-border)]">
                  <div className="text-3xl font-bold text-[var(--color-accent)]">{stats.wishlistItems}</div>
                  <div className="text-sm text-[var(--color-text-muted)] mt-1">Auf der Wunschliste</div>
                </div>
                <div className="rounded-xl bg-[var(--color-surface)] p-6 border border-[var(--color-border)]">
                  <div className="text-3xl font-bold text-[var(--color-success)]">{stats.followedSellers}</div>
                  <div className="text-sm text-[var(--color-text-muted)] mt-1">Gefolgte Verkäufer</div>
                </div>
                <div className="rounded-xl bg-[var(--color-surface)] p-6 border border-[var(--color-border)]">
                  <div className="text-3xl font-bold text-[var(--color-text-muted)]">{stats.uploadedResources}</div>
                  <div className="text-sm text-[var(--color-text-muted)] mt-1">Eigene Ressourcen</div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="rounded-xl bg-[var(--color-surface)] p-6 border border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">Profilinformationen</h2>
                  <Link
                    href="/profile/edit"
                    className="text-sm text-[var(--color-primary)] hover:underline font-medium"
                  >
                    Bearbeiten
                  </Link>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text)]">Kanton</label>
                    <p className="text-[var(--color-text-secondary)] mt-1">{userData.canton}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text)]">Unterrichtsfächer</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {userData.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="px-3 py-1 bg-[var(--color-surface)] text-[var(--color-text-secondary)] text-sm rounded-md"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text)]">Zyklen</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {userData.cycles.map((cycle) => (
                        <span
                          key={cycle}
                          className="px-3 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm rounded-md"
                        >
                          {cycle}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Library Items */}
              <div className="rounded-xl bg-[var(--color-surface)] p-6 border border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">Letzte Käufe</h2>
                  <button
                    onClick={() => setActiveTab("library")}
                    className="text-sm text-[var(--color-primary)] hover:underline font-medium"
                  >
                    Alle anzeigen
                  </button>
                </div>

                <div className="space-y-3">
                  {libraryItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[var(--color-surface-elevated)] rounded-md flex items-center justify-center">
                          <svg className="w-5 h-5 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-[var(--color-text)]">{item.title}</h3>
                          <p className="text-sm text-[var(--color-text-muted)]">{item.subject} - {item.cycle}</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">
                        Öffnen
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="rounded-xl bg-[var(--color-surface)] p-6 border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)] mb-4">Schnellaktionen</h3>
                <div className="space-y-3">
                  <Link
                    href="/resources"
                    className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
                  >
                    <svg className="w-5 h-5 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-sm text-[var(--color-text-secondary)]">Ressourcen durchsuchen</span>
                  </Link>
                  <Link
                    href="/upload"
                    className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
                  >
                    <svg className="w-5 h-5 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-sm text-[var(--color-text-secondary)]">Material hochladen</span>
                  </Link>
                  <Link
                    href="/dashboard/seller"
                    className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
                  >
                    <svg className="w-5 h-5 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm text-[var(--color-text-secondary)]">Verkäufer Dashboard</span>
                  </Link>
                  <Link
                    href="/following"
                    className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
                  >
                    <svg className="w-5 h-5 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm text-[var(--color-text-secondary)]">Gefolgte Verkäufer</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === "library" && (
          <div className="rounded-xl bg-[var(--color-surface)] p-6 border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text)]">Meine Bibliothek</h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">Alle gekauften Ressourcen und Downloads</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Suchen..."
                  className="px-4 py-2 border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {libraryItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 hover:border-[var(--color-primary)] transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-1 bg-[var(--color-surface)] text-[var(--color-text-muted)] text-xs font-medium rounded">
                      {item.type}
                    </span>
                    {item.verified && (
                      <span className="px-2 py-1 bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] text-xs font-medium rounded">
                        Verifiziert
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-1">{item.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] mb-4">{item.subject} - {item.cycle}</p>
                  <button className="w-full px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">
                    Herunterladen
                  </button>
                </div>
              ))}
            </div>

            {libraryItems.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-[var(--color-text-faint)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">Ihre Bibliothek ist leer</h3>
                <p className="text-[var(--color-text-muted)] mb-4">Entdecken Sie unsere Ressourcen und beginnen Sie Ihre Sammlung.</p>
                <Link
                  href="/resources"
                  className="inline-flex items-center px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  Ressourcen entdecken
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === "wishlist" && (
          <div className="rounded-xl bg-[var(--color-surface)] p-6 border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text)]">Wunschliste</h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">Gespeicherte Ressourcen für später</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 hover:border-[var(--color-primary)] transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-1 bg-[var(--color-surface)] text-[var(--color-text-muted)] text-xs font-medium rounded">
                      {item.subject}
                    </span>
                    <button className="text-[var(--color-error)] hover:text-[var(--color-error-hover)]">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-1">{item.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] mb-4">{item.cycle}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[var(--color-primary)]">CHF {item.price.toFixed(2)}</span>
                    <button className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">
                      Kaufen
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {wishlistItems.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-[var(--color-text-faint)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">Ihre Wunschliste ist leer</h3>
                <p className="text-[var(--color-text-muted)] mb-4">Speichern Sie interessante Ressourcen für später.</p>
                <Link
                  href="/resources"
                  className="inline-flex items-center px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  Ressourcen entdecken
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-6">
            {/* Profile Settings */}
            <div className="rounded-xl bg-[var(--color-surface)] p-6 border border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Profileinstellungen</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Name</label>
                  <input
                    type="text"
                    value={userData.name}
                    disabled
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-surface)] text-[var(--color-text-muted)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">E-Mail</label>
                  <input
                    type="email"
                    value={userData.email}
                    disabled
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-surface)] text-[var(--color-text-muted)]"
                  />
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">E-Mail kann nicht geändert werden.</p>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  href="/profile/edit"
                  className="inline-flex items-center px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  Profil bearbeiten
                </Link>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="rounded-xl bg-[var(--color-surface)] p-6 border border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Benachrichtigungen</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-[var(--color-text)]">Neue Ressourcen</span>
                    <p className="text-sm text-[var(--color-text-muted)]">Benachrichtigungen über neue Materialien von gefolgten Verkäufern</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-[var(--color-primary)] rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-[var(--color-text)]">Preisänderungen</span>
                    <p className="text-sm text-[var(--color-text-muted)]">Benachrichtigungen bei Preisänderungen auf der Wunschliste</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-[var(--color-primary)] rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-[var(--color-text)]">Newsletter</span>
                    <p className="text-sm text-[var(--color-text-muted)]">Wöchentliche Updates und Tipps</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-[var(--color-primary)] rounded" />
                </label>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-xl bg-[var(--color-surface)] p-6 border border-[var(--color-error)]/30">
              <h2 className="text-lg font-semibold text-[var(--color-error)] mb-4">Gefahrenzone</h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Diese Aktionen sind unwiderruflich. Bitte seien Sie vorsichtig.
              </p>
              <button className="px-4 py-2 border border-[var(--color-error)] text-[var(--color-error)] text-sm font-medium rounded-md hover:bg-[var(--badge-error-bg)] transition-colors">
                Konto löschen
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
