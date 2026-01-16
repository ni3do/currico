"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

// Note: Following feature requires additional database models (follower relationships)
// that are not yet implemented. This page shows empty states for now.

interface Update {
  id: string;
  title: string;
  seller: string;
  type: string;
  publishDate: string;
  subject: string;
  price: string;
}

interface FollowedSeller {
  id: string;
  name: string;
  resources: number;
}

export default function FollowingPage() {
  // These features require additional database models (follower relationships)
  // For now, we show empty states
  const [updates] = useState<Update[]>([]);
  const [followedSellers] = useState<FollowedSeller[]>([]);
  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Folge ich</h1>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Neue Ressourcen von Verkäufern, denen Sie folgen
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - Updates */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="mb-6 text-xl font-semibold text-[var(--color-text)]">
                Neueste Updates
              </h2>

              <div className="space-y-4">
                {updates.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="mb-2 text-[var(--color-text-muted)]">Keine Updates vorhanden</p>
                    <p className="mb-4 text-sm text-[var(--color-text-faint)]">
                      Folgen Sie Verkäufern, um ihre neuen Ressourcen zu sehen
                    </p>
                    <p className="text-xs text-[var(--color-text-faint)]">
                      Diese Funktion wird bald verfügbar sein
                    </p>
                  </div>
                ) : (
                  updates.map((update) => (
                    <div
                      key={update.id}
                      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 transition-all hover:border-[var(--color-primary)]/50"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                update.type === "Bundle"
                                  ? "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]"
                                  : "bg-[var(--badge-primary-bg)] text-[var(--badge-primary-text)]"
                              }`}
                            >
                              {update.type}
                            </span>
                            <span className="pill pill-neutral">{update.subject}</span>
                          </div>
                          <h3 className="mb-2 text-lg font-semibold text-[var(--color-text)]">
                            {update.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-success)] text-xs font-bold text-[var(--ctp-crust)]">
                              {update.seller.charAt(0)}
                            </div>
                            <span>{update.seller}</span>
                            <span>•</span>
                            <span>{new Date(update.publishDate).toLocaleDateString("de-CH")}</span>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="mb-2 text-lg font-bold text-[var(--color-primary)]">
                            {update.price}
                          </div>
                          <a
                            href={`/resources/${update.id}`}
                            className="btn-primary inline-block px-4 py-2 text-sm"
                          >
                            Ansehen
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Load More - only show when there are updates */}
              {updates.length > 0 && (
                <div className="mt-6 text-center">
                  <button className="btn-secondary px-6 py-3 text-sm">Mehr laden</button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Followed Sellers */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h3 className="mb-4 font-semibold text-[var(--color-text)]">
                Folge ich ({followedSellers.length})
              </h3>

              <div className="space-y-3">
                {followedSellers.length === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Sie folgen noch niemandem
                    </p>
                  </div>
                ) : (
                  followedSellers.map((seller) => (
                    <div
                      key={seller.id}
                      className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-success)] text-xs font-bold text-[var(--ctp-crust)]">
                          {seller.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[var(--color-text)]">
                            {seller.name}
                          </div>
                          <div className="text-xs text-[var(--color-text-muted)]">
                            {seller.resources} Ressourcen
                          </div>
                        </div>
                      </div>
                      <button className="btn-ghost px-3 py-1 text-xs">Entfolgen</button>
                    </div>
                  ))
                )}
              </div>

              <Link
                href="/resources"
                className="mt-4 block text-center text-sm text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-hover)]"
              >
                Mehr Verkäufer entdecken →
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="card mt-6 p-6">
              <h3 className="mb-4 font-semibold text-[var(--color-text)]">Ihre Statistiken</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-[var(--color-primary)]">
                    {updates.length}
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)]">
                    Neue Updates diese Woche
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--color-success)]">
                    {followedSellers.length}
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)]">Gefolgte Verkäufer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
