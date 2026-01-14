"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/ui/TopBar";

interface Resource {
  id: string;
  title: string;
  description: string;
  price: number;
  priceFormatted: string;
  fileUrl: string;
  previewUrl: string | null;
  subjects: string[];
  cycles: string[];
  subject: string;
  cycle: string;
  createdAt: string;
  downloadCount: number;
  seller: {
    id: string;
    displayName: string | null;
    image: string | null;
    verified: boolean;
    resourceCount: number;
  };
}

interface RelatedResource {
  id: string;
  title: string;
  price: number;
  priceFormatted: string;
  subject: string;
  cycle: string;
  verified: boolean;
}

export default function ResourceDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [resource, setResource] = useState<Resource | null>(null);
  const [relatedResources, setRelatedResources] = useState<RelatedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchResource();
    }
  }, [id]);

  const fetchResource = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/resources/${id}`);
      if (response.status === 404) {
        setError("not_found");
        return;
      }
      if (!response.ok) {
        setError("fetch_error");
        return;
      }
      const data = await response.json();
      setResource(data.resource);
      setRelatedResources(data.relatedResources);
    } catch {
      setError("fetch_error");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <TopBar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-8 h-4 w-48 rounded bg-[var(--color-surface)]" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="card rounded-2xl p-8">
                  <div className="mb-4 flex gap-3">
                    <div className="h-6 w-16 rounded-full bg-[var(--color-surface)]" />
                    <div className="h-6 w-24 rounded-full bg-[var(--color-surface)]" />
                  </div>
                  <div className="mb-6 h-10 w-3/4 rounded bg-[var(--color-surface)]" />
                  <div className="mb-4 h-4 w-full rounded bg-[var(--color-surface)]" />
                  <div className="mb-4 h-4 w-5/6 rounded bg-[var(--color-surface)]" />
                  <div className="mb-8 h-4 w-2/3 rounded bg-[var(--color-surface)]" />
                  <div className="flex gap-4">
                    <div className="h-12 w-32 rounded bg-[var(--color-surface)]" />
                    <div className="h-12 flex-1 rounded bg-[var(--color-surface)]" />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="card rounded-2xl p-6">
                  <div className="mb-4 h-5 w-24 rounded bg-[var(--color-surface)]" />
                  <div className="flex gap-3">
                    <div className="h-12 w-12 rounded-full bg-[var(--color-surface)]" />
                    <div>
                      <div className="mb-2 h-4 w-32 rounded bg-[var(--color-surface)]" />
                      <div className="h-3 w-24 rounded bg-[var(--color-surface)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error states
  if (error === "not_found") {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <TopBar />
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[var(--color-text)] mb-4">Ressource nicht gefunden</h1>
            <p className="text-[var(--color-text-muted)] mb-8">
              Die gesuchte Ressource existiert nicht oder ist nicht mehr verfugbar.
            </p>
            <Link
              href="/resources"
              className="btn-primary inline-flex items-center px-6 py-3 font-semibold"
            >
              Zuruck zu den Ressourcen
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <TopBar />
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[var(--color-text)] mb-4">Fehler beim Laden</h1>
            <p className="text-[var(--color-text-muted)] mb-8">
              Die Ressource konnte nicht geladen werden. Bitte versuchen Sie es spater erneut.
            </p>
            <button
              onClick={fetchResource}
              className="btn-primary inline-flex items-center px-6 py-3 font-semibold"
            >
              Erneut versuchen
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <TopBar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <Link href="/resources" className="hover:text-[var(--color-primary)]">
            Ressourcen
          </Link>
          <span>/</span>
          <Link href={`/resources?subject=${resource.subject}`} className="hover:text-[var(--color-primary)]">
            {resource.subject}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-text)]">{resource.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Primary Information */}
            <div className="card p-8">
              {/* Title and Badges */}
              <div className="mb-6">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="pill pill-neutral">
                    PDF
                  </span>
                  <span className="pill pill-success">
                    Verifiziert
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-[var(--color-text)]">
                  {resource.title}
                </h1>
              </div>

              {/* Description */}
              <p className="mb-6 leading-relaxed text-[var(--color-text-muted)]">
                {resource.description}
              </p>

              {/* Price and Actions */}
              <div className="mb-8 flex flex-wrap items-center gap-4">
                <div className={`text-3xl font-bold ${resource.price === 0 ? "text-[var(--color-success)]" : "text-[var(--color-primary)]"}`}>
                  {resource.priceFormatted}
                </div>
                <button className="btn-primary flex-1 px-8 py-4">
                  {resource.price === 0 ? "Kostenlos herunterladen" : "Jetzt kaufen"}
                </button>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`rounded-lg border-2 p-4 transition-all ${
                    isWishlisted
                      ? "border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-error)]"
                      : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:border-[var(--color-error)] hover:text-[var(--color-error)]"
                  }`}
                >
                  <svg
                    className="h-6 w-6"
                    fill={isWishlisted ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              {/* Metadata Block */}
              <div className="mb-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
                <h3 className="mb-4 font-semibold text-[var(--color-text)]">Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm text-[var(--color-text-muted)]">Fach</div>
                    <div className="font-medium text-[var(--color-text)]">{resource.subject}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[var(--color-text-muted)]">Zyklus</div>
                    <div className="font-medium text-[var(--color-text)]">{resource.cycle || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[var(--color-text-muted)]">Downloads</div>
                    <div className="font-medium text-[var(--color-text)]">{resource.downloadCount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[var(--color-text-muted)]">Veroffentlicht</div>
                    <div className="font-medium text-[var(--color-text)]">
                      {new Date(resource.createdAt).toLocaleDateString("de-CH")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              {resource.previewUrl && (
                <div className="mb-8">
                  <h3 className="mb-4 text-xl font-semibold text-[var(--color-text)]">Vorschau</h3>
                  <div className="relative aspect-[3/4] max-w-sm overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resource.previewUrl}
                      alt="Vorschau"
                      className="h-full w-full object-cover"
                    />
                    {/* Watermark overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg)]/30 backdrop-blur-[1px]">
                      <span className="rotate-[-45deg] text-4xl font-bold text-[var(--color-text-muted)] opacity-30">
                        VORSCHAU
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-[var(--color-text-muted)]">
                    Vollstandige Dateien sind nach dem Kauf verfugbar
                  </p>
                </div>
              )}

              {/* Report Button */}
              <button
                onClick={() => setShowReportModal(true)}
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
              >
                Ressource melden
              </button>
            </div>

            {/* Reviews Section - Coming Soon */}
            <div className="mt-12 border-t border-[var(--color-border)] pt-8">
              <h2 className="mb-6 text-2xl font-bold text-[var(--color-text)]">
                Bewertungen
              </h2>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-8 text-center">
                <p className="text-[var(--color-text-muted)] mb-2">Bewertungen sind bald verfugbar</p>
                <p className="text-sm text-[var(--color-text-faint)]">Diese Funktion wird in Kurze freigeschaltet</p>
              </div>
            </div>

            {/* Related Resources */}
            {relatedResources.length > 0 && (
              <div className="mt-12">
                <h2 className="mb-6 text-2xl font-bold text-[var(--color-text)]">
                  Ahnliche Ressourcen
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {relatedResources.map((related) => (
                    <Link
                      key={related.id}
                      href={`/resources/${related.id}`}
                      className="group card p-4 transition-all hover:-translate-y-1 hover:border-[var(--color-primary)]/50"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="pill pill-neutral text-xs">
                          {related.subject}
                        </span>
                        {related.verified && (
                          <span className="pill pill-success text-xs">
                            Verifiziert
                          </span>
                        )}
                      </div>
                      <h3 className="mb-2 font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                        {related.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${related.priceFormatted === "Gratis" ? "text-[var(--color-success)]" : "text-[var(--color-primary)]"}`}>
                          {related.priceFormatted}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)]">{related.cycle}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Seller Info */}
            <div className="sticky top-24 card p-6">
              <h3 className="mb-4 font-semibold text-[var(--color-text)]">Erstellt von</h3>
              <div className="mb-4 flex items-center gap-3">
                {resource.seller.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resource.seller.image}
                    alt={resource.seller.displayName || "Verkaufer"}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-bold text-[var(--btn-primary-text)]">
                    {(resource.seller.displayName || "A").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--color-text)]">
                      {resource.seller.displayName || "Anonym"}
                    </span>
                    {resource.seller.verified && (
                      <svg className="h-4 w-4 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)]">
                    {resource.seller.resourceCount} Ressourcen
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`w-full rounded-lg border-2 px-4 py-3 font-medium transition-all ${
                  isFollowing
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                }`}
              >
                {isFollowing ? "Folge ich" : "+ Folgen"}
              </button>

              {/* More from Seller */}
              <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                <Link
                  href={`/resources?seller=${resource.seller.id}`}
                  className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
                >
                  Alle Ressourcen ansehen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ctp-crust)]/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[var(--color-text)]">
                Ressource melden
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Grund
                </label>
                <select className="input">
                  <option>Unangemessener Inhalt</option>
                  <option>Urheberrechtsverletzung</option>
                  <option>Qualitatsprobleme</option>
                  <option>Falsches Fach/Zyklus</option>
                  <option>Anderes</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Kommentar (optional)
                </label>
                <textarea
                  rows={4}
                  className="input min-h-[100px] resize-y"
                  placeholder="Bitte beschreiben Sie das Problem..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-danger flex-1 px-4 py-3"
                >
                  Melden
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="btn-secondary px-6 py-3"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-[var(--color-text-muted)]">
            <p>2026 EasyLehrer. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
