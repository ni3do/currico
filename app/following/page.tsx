"use client";

import Link from "next/link";
import TopBar from "@/components/ui/TopBar";

// Mock data - updates from followed sellers
const mockUpdates = [
  {
    id: 1,
    title: "Geometrie Arbeitsblätter Zyklus 3",
    seller: "Maria Schmidt",
    type: "Resource",
    publishDate: "2026-01-08",
    subject: "Mathematik",
    price: "CHF 14.00",
  },
  {
    id: 2,
    title: "Deutsch Komplett-Paket",
    seller: "Peter Müller",
    type: "Bundle",
    publishDate: "2026-01-07",
    subject: "Deutsch",
    price: "CHF 35.00",
  },
  {
    id: 3,
    title: "Textaufgaben für Fortgeschrittene",
    seller: "Maria Schmidt",
    type: "Resource",
    publishDate: "2026-01-05",
    subject: "Mathematik",
    price: "CHF 12.00",
  },
  {
    id: 4,
    title: "Naturwissenschaftliche Experimente",
    seller: "Anna Weber",
    type: "Resource",
    publishDate: "2026-01-04",
    subject: "NMG",
    price: "CHF 18.00",
  },
  {
    id: 5,
    title: "Leseverständnis Übungen",
    seller: "Peter Müller",
    type: "Resource",
    publishDate: "2026-01-02",
    subject: "Deutsch",
    price: "Gratis",
  },
];

const mockFollowedSellers = [
  { id: 1, name: "Maria Schmidt", resources: 23 },
  { id: 2, name: "Peter Müller", resources: 15 },
  { id: 3, name: "Anna Weber", resources: 12 },
];

export default function FollowingPage() {
  return (
    <div className="min-h-screen bg-[--background]">
      <TopBar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[--text]">Folge ich</h1>
          <p className="mt-2 text-[--text-muted]">
            Neue Ressourcen von Verkäufern, denen Sie folgen
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - Updates */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-[--border] bg-[--surface] p-8">
              <h2 className="mb-6 text-xl font-semibold text-[--text]">
                Neueste Updates
              </h2>

              <div className="space-y-4">
                {mockUpdates.map((update) => (
                  <div
                    key={update.id}
                    className="rounded-xl border border-[--border] bg-[--background] p-6 hover:border-[--primary]/50 transition-all"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              update.type === "Bundle"
                                ? "bg-[--secondary]/20 text-[--secondary]"
                                : "bg-[--primary]/20 text-[--primary]"
                            }`}
                          >
                            {update.type}
                          </span>
                          <span className="rounded-full bg-[--surface] px-2 py-0.5 text-xs text-[--text-muted]">
                            {update.subject}
                          </span>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-[--text]">
                          {update.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-[--text-muted]">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] text-xs font-bold text-[--background]">
                            {update.seller.charAt(0)}
                          </div>
                          <span>{update.seller}</span>
                          <span>•</span>
                          <span>
                            {new Date(update.publishDate).toLocaleDateString("de-CH")}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="mb-2 text-lg font-bold text-[--primary]">
                          {update.price}
                        </div>
                        <a
                          href={`/resources/${update.id}`}
                          className="inline-block rounded-lg bg-gradient-to-r from-[--primary] to-[--secondary] px-4 py-2 text-sm font-medium text-[--background] hover:opacity-90 transition-opacity"
                        >
                          Ansehen
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="mt-6 text-center">
                <button className="rounded-lg border border-[--border] bg-[--background] px-6 py-3 text-sm font-medium text-[--text] hover:bg-[--surface1] transition-colors">
                  Mehr laden
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Followed Sellers */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-[--border] bg-[--surface] p-6">
              <h3 className="mb-4 font-semibold text-[--text]">
                Folge ich ({mockFollowedSellers.length})
              </h3>

              <div className="space-y-3">
                {mockFollowedSellers.map((seller) => (
                  <div
                    key={seller.id}
                    className="flex items-center justify-between rounded-lg border border-[--border] bg-[--background] p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] text-xs font-bold text-[--background]">
                        {seller.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[--text]">
                          {seller.name}
                        </div>
                        <div className="text-xs text-[--text-muted]">
                          {seller.resources} Ressourcen
                        </div>
                      </div>
                    </div>
                    <button className="rounded-lg border border-[--border] px-3 py-1 text-xs text-[--text] hover:bg-[--surface1] transition-colors">
                      Entfolgen
                    </button>
                  </div>
                ))}
              </div>

              <Link
                href="/resources"
                className="mt-4 block text-center text-sm text-[--primary] hover:text-[--primary-hover] transition-colors"
              >
                Mehr Verkäufer entdecken →
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 rounded-2xl border border-[--border] bg-[--surface] p-6">
              <h3 className="mb-4 font-semibold text-[--text]">Ihre Statistiken</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-[--primary]">
                    {mockUpdates.length}
                  </div>
                  <div className="text-sm text-[--text-muted]">
                    Neue Updates diese Woche
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[--secondary]">
                    {mockFollowedSellers.length}
                  </div>
                  <div className="text-sm text-[--text-muted]">Gefolgte Verkäufer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
