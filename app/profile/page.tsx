"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "library" | "wishlist">("profile");

  // TODO: Replace with API fetch
  const profileData = {
    name: "Maria Schmidt",
    email: "maria.schmidt@example.com",
    canton: "Zürich",
    subjects: ["Mathematik", "Deutsch", "NMG"],
    cycles: ["Zyklus 2"],
  };

  return (
    <div className="min-h-screen bg-[--background]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[--border] bg-[--surface]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <a href="/" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[--primary] to-[--secondary]">
                  <span className="text-xl font-bold text-[--background]">EL</span>
                </div>
                <span className="text-xl font-bold text-[--text]">Easy Lehrer</span>
              </a>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a
                href="/resources"
                className="text-[--text-muted] hover:text-[--text] transition-colors"
              >
                Ressourcen
              </a>
              <a
                href="#"
                className="text-[--text-muted] hover:text-[--text] transition-colors"
              >
                Für Schulen
              </a>
              <a
                href="#"
                className="text-[--text-muted] hover:text-[--text] transition-colors"
              >
                Über uns
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <a
                href="/profile"
                className="flex items-center gap-2 rounded-full border-2 border-[--primary] px-4 py-2 font-medium text-[--primary] transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] text-xs font-bold text-[--background]">
                  {profileData.name.charAt(0)}
                </div>
                <span className="hidden sm:inline">{profileData.name.split(" ")[0]}</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[--text]">Mein Profil</h1>
          <p className="mt-2 text-[--text-muted]">
            Verwalten Sie Ihre Kontoinformationen und Einstellungen
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-[--border]">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-4 text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "border-b-2 border-[--primary] text-[--primary]"
                : "text-[--text-muted] hover:text-[--text]"
            }`}
          >
            Profil
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`pb-4 text-sm font-medium transition-colors ${
              activeTab === "library"
                ? "border-b-2 border-[--primary] text-[--primary]"
                : "text-[--text-muted] hover:text-[--text]"
            }`}
          >
            Meine Bibliothek
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`pb-4 text-sm font-medium transition-colors ${
              activeTab === "wishlist"
                ? "border-b-2 border-[--primary] text-[--primary]"
                : "text-[--text-muted] hover:text-[--text]"
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
              <div className="rounded-2xl border border-[--border] bg-[--surface] p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[--text]">
                    Profil Informationen
                  </h2>
                  <a
                    href="/profile/edit"
                    className="rounded-lg border border-[--border] px-4 py-2 text-sm font-medium text-[--text] hover:bg-[--surface1] transition-colors"
                  >
                    Bearbeiten
                  </a>
                </div>

                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[--text]">
                      Name
                    </label>
                    <div className="text-[--text-muted]">{profileData.name}</div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[--text]">
                      E-Mail
                    </label>
                    <div className="text-[--text-muted]">{profileData.email}</div>
                  </div>

                  {/* Canton */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[--text]">
                      Kanton
                    </label>
                    <div className="text-[--text-muted]">{profileData.canton}</div>
                  </div>

                  {/* Subjects */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[--text]">
                      Unterrichtsfächer
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {profileData.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="rounded-full bg-[--background] px-3 py-1 text-sm text-[--text]"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              {/* Account Stats */}
              <div className="rounded-2xl border border-[--border] bg-[--surface] p-6">
                <h3 className="mb-4 font-semibold text-[--text]">Statistiken</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-[--primary]">12</div>
                    <div className="text-sm text-[--text-muted]">Gekaufte Ressourcen</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[--secondary]">5</div>
                    <div className="text-sm text-[--text-muted]">Wunschliste</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[--accent]">3</div>
                    <div className="text-sm text-[--text-muted]">Gefolgte Verkäufer</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl border border-[--border] bg-[--surface] p-6">
                <h3 className="mb-4 font-semibold text-[--text]">Schnellaktionen</h3>
                <div className="space-y-3">
                  <a
                    href="/resources"
                    className="block rounded-lg border border-[--border] bg-[--background] px-4 py-3 text-sm text-[--text] hover:bg-[--surface1] transition-colors"
                  >
                    Ressourcen durchsuchen
                  </a>
                  <a
                    href="/profile/edit"
                    className="block rounded-lg border border-[--border] bg-[--background] px-4 py-3 text-sm text-[--text] hover:bg-[--surface1] transition-colors"
                  >
                    Verkäufer werden
                  </a>
                  <button className="w-full rounded-lg border border-[--red] px-4 py-3 text-sm text-[--red] hover:bg-[--red]/10 transition-colors">
                    Abmelden
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === "library" && (
          <div className="rounded-2xl border border-[--border] bg-[--surface] p-8">
            <h2 className="mb-6 text-xl font-semibold text-[--text]">
              Meine Bibliothek
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Mock library items */}
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-[--border] bg-[--background] p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-[--surface] px-2 py-1 text-xs text-[--text-muted]">
                      PDF
                    </span>
                    <span className="rounded-full bg-[--green]/20 px-2 py-1 text-xs font-medium text-[--green]">
                      ✓ Verifiziert
                    </span>
                  </div>
                  <h3 className="mb-2 font-semibold text-[--text]">
                    Bruchrechnen Übungsblätter
                  </h3>
                  <p className="mb-4 text-sm text-[--text-muted]">Mathematik • Zyklus 2</p>
                  <button className="w-full rounded-lg bg-gradient-to-r from-[--primary] to-[--secondary] px-4 py-2 text-sm font-medium text-[--background] hover:opacity-90 transition-opacity">
                    Herunterladen
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === "wishlist" && (
          <div className="rounded-2xl border border-[--border] bg-[--surface] p-8">
            <h2 className="mb-6 text-xl font-semibold text-[--text]">Wunschliste</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Mock wishlist items */}
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-[--border] bg-[--background] p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-[--surface] px-2 py-1 text-xs text-[--text-muted]">
                      Bundle
                    </span>
                    <button className="text-[--red] hover:text-[--red]/80">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="mb-2 font-semibold text-[--text]">
                    NMG Experimente Bundle
                  </h3>
                  <p className="mb-3 text-sm text-[--text-muted]">NMG • Zyklus 2</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[--primary]">CHF 25.00</span>
                    <button className="rounded-lg bg-gradient-to-r from-[--primary] to-[--secondary] px-4 py-2 text-sm font-medium text-[--background] hover:opacity-90 transition-opacity">
                      Kaufen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-[--border] bg-[--surface]/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-[--text-muted]">
            <p>© 2026 Easy Lehrer. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
