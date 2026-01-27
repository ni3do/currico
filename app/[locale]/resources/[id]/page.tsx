"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { ResourceCard } from "@/components/ui/ResourceCard";
import { CurriculumBox } from "@/components/curriculum";
import { LP21Badge } from "@/components/curriculum/LP21Badge";

interface Competency {
  id: string;
  code: string;
  description_de: string;
  anforderungsstufe?: string | null;
  subjectCode?: string;
  subjectColor?: string;
}

interface Transversal {
  id: string;
  code: string;
  name_de: string;
  icon?: string | null;
  color?: string | null;
}

interface BneTheme {
  id: string;
  code: string;
  name_de: string;
  sdg_number?: number | null;
  icon?: string | null;
  color?: string | null;
}

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
  // LP21 curriculum fields
  isMiIntegrated?: boolean;
  competencies?: Competency[];
  transversals?: Transversal[];
  bneThemes?: BneTheme[];
}

interface RelatedResource {
  id: string;
  title: string;
  price: number;
  priceFormatted: string;
  subject: string;
  cycle: string;
  verified: boolean;
  previewUrl: string | null;
}

export default function ResourceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session, status: sessionStatus } = useSession();

  const [resource, setResource] = useState<Resource | null>(null);
  const [relatedResources, setRelatedResources] = useState<RelatedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Report form state
  const [reportReason, setReportReason] = useState("inappropriate");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportStatus, setReportStatus] = useState<"idle" | "success" | "error">("idle");
  const [reportErrorMessage, setReportErrorMessage] = useState("");

  const fetchResource = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchResource();
    }
  }, [id, fetchResource]);

  // Check if resource is wishlisted
  useEffect(() => {
    const checkWishlist = async () => {
      if (sessionStatus !== "authenticated" || !id) return;
      try {
        const response = await fetch("/api/user/wishlist");
        if (response.ok) {
          const data = await response.json();
          const isInWishlist = data.items.some((item: { id: string }) => item.id === id);
          setIsWishlisted(isInWishlist);
        }
      } catch (error) {
        console.error("Error checking wishlist:", error);
      }
    };
    checkWishlist();
  }, [id, sessionStatus]);

  // Handle download for free resources
  const handleDownload = async () => {
    if (sessionStatus !== "authenticated") {
      // Redirect to login
      window.location.href = "/login";
      return;
    }

    setDownloading(true);
    try {
      // Open the download in a new tab
      window.open(`/api/resources/${id}/download`, "_blank");
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setDownloading(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (sessionStatus !== "authenticated") {
      window.location.href = "/login";
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        // Remove from wishlist
        const response = await fetch(`/api/user/wishlist?resourceId=${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setIsWishlisted(false);
        }
      } else {
        // Add to wishlist
        const response = await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceId: id }),
        });
        if (response.ok) {
          setIsWishlisted(true);
        }
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Handle report submission
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sessionStatus !== "authenticated") {
      window.location.href = "/login";
      return;
    }

    setReportSubmitting(true);
    setReportErrorMessage("");

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: reportReason,
          description: reportDescription || undefined,
          resource_id: id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Senden der Meldung");
      }

      setReportStatus("success");
      // Close modal after showing success message
      setTimeout(() => {
        setShowReportModal(false);
        // Reset form state after closing
        setReportStatus("idle");
        setReportReason("inappropriate");
        setReportDescription("");
      }, 2000);
    } catch (error) {
      setReportStatus("error");
      setReportErrorMessage(
        error instanceof Error ? error.message : "Ein unerwarteter Fehler ist aufgetreten"
      );
    } finally {
      setReportSubmitting(false);
    }
  };

  // Reset report modal state when closing
  const handleCloseReportModal = () => {
    setShowReportModal(false);
    // Only reset if not showing success
    if (reportStatus !== "success") {
      setReportStatus("idle");
      setReportReason("inappropriate");
      setReportDescription("");
      setReportErrorMessage("");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <TopBar />
        <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-surface mb-8 h-4 w-48 rounded" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="card rounded-2xl p-8">
                  <div className="mb-4 flex gap-3">
                    <div className="bg-surface h-6 w-16 rounded-full" />
                    <div className="bg-surface h-6 w-24 rounded-full" />
                  </div>
                  <div className="bg-surface mb-6 h-10 w-3/4 rounded" />
                  <div className="bg-surface mb-4 h-4 w-full rounded" />
                  <div className="bg-surface mb-4 h-4 w-5/6 rounded" />
                  <div className="bg-surface mb-8 h-4 w-2/3 rounded" />
                  <div className="flex gap-4">
                    <div className="bg-surface h-12 w-32 rounded" />
                    <div className="bg-surface h-12 flex-1 rounded" />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="card rounded-2xl p-6">
                  <div className="bg-surface mb-4 h-5 w-24 rounded" />
                  <div className="flex gap-3">
                    <div className="bg-surface h-12 w-12 rounded-full" />
                    <div>
                      <div className="bg-surface mb-2 h-4 w-32 rounded" />
                      <div className="bg-surface h-3 w-24 rounded" />
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
      <div className="flex min-h-screen flex-col">
        <TopBar />
        <main className="mx-auto max-w-7xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-text mb-4 text-4xl font-bold">Ressource nicht gefunden</h1>
            <p className="text-text-muted mb-8">
              Die gesuchte Ressource existiert nicht oder ist nicht mehr verfügbar.
            </p>
            <Link
              href="/resources"
              className="btn-primary inline-flex items-center px-6 py-3 font-semibold"
            >
              Zurück zu den Ressourcen
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="flex min-h-screen flex-col">
        <TopBar />
        <main className="mx-auto max-w-7xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-text mb-4 text-4xl font-bold">Fehler beim Laden</h1>
            <p className="text-text-muted mb-8">
              Die Ressource konnte nicht geladen werden. Bitte versuchen Sie es später erneut.
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
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-text-muted mb-8 flex items-center gap-2 text-sm">
          <Link href="/resources" className="hover:text-primary">
            Ressourcen
          </Link>
          <span>/</span>
          <Link href={`/resources?subject=${resource.subject}`} className="hover:text-primary">
            {resource.subject}
          </Link>
          <span>/</span>
          <span className="text-text">{resource.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Primary Information */}
            <div className="card p-8">
              {/* Title and Badges */}
              <div className="mb-6">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="pill pill-neutral">PDF</span>
                  <span className="pill pill-success">Verifiziert</span>
                  {/* LP21 badges for primary competencies */}
                  {resource.competencies &&
                    resource.competencies
                      .slice(0, 2)
                      .map((comp) => (
                        <LP21Badge
                          key={comp.id}
                          code={comp.code}
                          description={comp.description_de}
                          anforderungsstufe={comp.anforderungsstufe as "grund" | "erweitert" | null}
                          subjectColor={comp.subjectColor}
                          size="sm"
                        />
                      ))}
                  {resource.competencies && resource.competencies.length > 2 && (
                    <span className="text-text-muted text-xs">
                      +{resource.competencies.length - 2}
                    </span>
                  )}
                </div>
                <h1 className="text-text text-3xl font-bold">{resource.title}</h1>
              </div>

              {/* Description */}
              <p className="text-text-muted mb-6 leading-relaxed">{resource.description}</p>

              {/* LP21 Curriculum Box */}
              {(resource.competencies?.length ||
                resource.transversals?.length ||
                resource.bneThemes?.length ||
                resource.isMiIntegrated) && (
                <div className="mb-8">
                  <CurriculumBox
                    competencies={resource.competencies}
                    transversals={resource.transversals}
                    bneThemes={resource.bneThemes}
                    isMiIntegrated={resource.isMiIntegrated}
                  />
                </div>
              )}

              {/* Price and Actions */}
              <div className="mb-8 flex flex-wrap items-center gap-4">
                <div
                  className={`text-3xl font-bold ${resource.price === 0 ? "text-success" : "text-primary"}`}
                >
                  {resource.priceFormatted}
                </div>
                <button
                  onClick={resource.price === 0 ? handleDownload : undefined}
                  disabled={downloading}
                  className="btn-primary flex-1 px-8 py-4 disabled:opacity-50"
                >
                  {downloading
                    ? "Wird heruntergeladen..."
                    : resource.price === 0
                      ? "Kostenlos herunterladen"
                      : "Jetzt kaufen"}
                </button>
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={`group rounded-lg border-2 p-4 transition-all disabled:opacity-50 ${
                    isWishlisted
                      ? "border-error bg-error/10 text-error"
                      : "border-border bg-bg text-text-muted hover:border-error hover:text-error"
                  }`}
                  title={isWishlisted ? "Von Wunschliste entfernen" : "Zur Wunschliste hinzufügen"}
                >
                  <svg
                    className={`h-6 w-6 transition-transform duration-200 ease-out group-active:scale-125 ${
                      isWishlisted ? "animate-[heartBeat_0.3s_ease-in-out]" : ""
                    }`}
                    fill={isWishlisted ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>

              {/* Metadata Block */}
              <div className="border-border bg-bg mb-8 rounded-xl border p-6">
                <h3 className="text-text mb-4 font-semibold">Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-text-muted text-sm">Fach</div>
                    <div className="text-text font-medium">{resource.subject}</div>
                  </div>
                  <div>
                    <div className="text-text-muted text-sm">Zyklus</div>
                    <div className="text-text font-medium">{resource.cycle || "-"}</div>
                  </div>
                  <div>
                    <div className="text-text-muted text-sm">Downloads</div>
                    <div className="text-text font-medium">{resource.downloadCount}</div>
                  </div>
                  <div>
                    <div className="text-text-muted text-sm">Veröffentlicht</div>
                    <div className="text-text font-medium">
                      {new Date(resource.createdAt).toLocaleDateString("de-CH")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              {resource.previewUrl && (
                <div className="mb-8">
                  <h3 className="text-text mb-4 text-xl font-semibold">Vorschau</h3>
                  <div className="border-border bg-bg relative aspect-[3/4] max-w-sm overflow-hidden rounded-xl border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resource.previewUrl}
                      alt="Vorschau"
                      className="h-full w-full object-cover"
                    />
                    {/* Watermark overlay */}
                    <div className="bg-bg/30 absolute inset-0 flex items-center justify-center backdrop-blur-[1px]">
                      <span className="text-text-muted rotate-[-45deg] text-4xl font-bold opacity-30">
                        VORSCHAU
                      </span>
                    </div>
                  </div>
                  <p className="text-text-muted mt-4 text-sm">
                    Vollständige Dateien sind nach dem Kauf verfügbar
                  </p>
                </div>
              )}

              {/* Report Button */}
              <button
                onClick={() => setShowReportModal(true)}
                className="text-text-muted hover:text-error text-sm transition-colors"
              >
                Ressource melden
              </button>
            </div>

            {/* Reviews Section - Coming Soon */}
            <div className="border-border mt-12 border-t pt-8">
              <h2 className="text-text mb-6 text-2xl font-bold">Bewertungen</h2>
              <div className="border-border bg-bg rounded-xl border p-8 text-center">
                <p className="text-text-muted mb-2">Bewertungen sind bald verfügbar</p>
                <p className="text-text-faint text-sm">
                  Diese Funktion wird in Kürze freigeschaltet
                </p>
              </div>
            </div>

            {/* Related Resources */}
            {relatedResources.length > 0 && (
              <div className="mt-12">
                <h2 className="text-text mb-6 text-2xl font-bold">Ähnliche Ressourcen</h2>
                <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
                  {relatedResources.map((related) => (
                    <ResourceCard
                      key={related.id}
                      id={related.id}
                      title={related.title}
                      subject={related.subject}
                      cycle={related.cycle}
                      priceFormatted={related.priceFormatted}
                      previewUrl={related.previewUrl}
                      variant="compact"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Seller Info */}
            <div className="card sticky top-24 p-6">
              <h3 className="text-text mb-4 font-semibold">Erstellt von</h3>
              <div className="mb-4 flex items-center gap-3">
                {resource.seller.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resource.seller.image}
                    alt={resource.seller.displayName || "Verkäufer"}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="bg-primary text-text-on-accent flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold">
                    {(resource.seller.displayName || "A").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-text font-medium">
                      {resource.seller.displayName || "Anonym"}
                    </span>
                    {resource.seller.verified && (
                      <svg className="text-primary h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="text-text-muted text-sm">
                    {resource.seller.resourceCount} Ressourcen
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`w-full rounded-lg border-2 px-4 py-3 font-medium transition-all ${
                  isFollowing
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border bg-bg text-text hover:border-primary hover:bg-primary-light"
                }`}
              >
                {isFollowing ? "Folge ich" : "+ Folgen"}
              </button>

              {/* More from Seller */}
              <div className="border-border mt-6 border-t pt-6">
                <Link
                  href={`/resources?seller=${resource.seller.id}`}
                  className="text-primary hover:text-primary-hover text-sm font-medium transition-colors"
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
        <div className="bg-ctp-crust/50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="card mx-4 w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-text text-xl font-semibold">Ressource melden</h3>
              <button onClick={handleCloseReportModal} className="text-text-muted hover:text-text">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {reportStatus === "success" ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="bg-success-light mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <svg
                    className="text-success h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h4 className="text-text mb-2 font-semibold">Vielen Dank für Ihre Meldung</h4>
                <p className="text-text-muted text-sm">Wir werden die Ressource überprüfen.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="report-reason"
                    className="text-text mb-2 block text-sm font-medium"
                  >
                    Grund
                  </label>
                  <select
                    id="report-reason"
                    name="reason"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="inappropriate">Unangemessener Inhalt</option>
                    <option value="copyright">Urheberrechtsverletzung</option>
                    <option value="quality">Qualitätsprobleme</option>
                    <option value="spam">Spam</option>
                    <option value="fraud">Betrug</option>
                    <option value="other">Anderes</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="report-description"
                    className="text-text mb-2 block text-sm font-medium"
                  >
                    Kommentar (optional)
                  </label>
                  <textarea
                    id="report-description"
                    name="description"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    className="input min-h-[100px] resize-y"
                    placeholder="Bitte beschreiben Sie das Problem..."
                  />
                </div>

                {/* Error Message */}
                {reportStatus === "error" && reportErrorMessage && (
                  <div className="border-error/50 bg-error/10 flex items-center gap-3 rounded-lg border p-3">
                    <svg
                      className="text-error h-5 w-5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-error text-sm">{reportErrorMessage}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="btn-danger flex-1 px-4 py-3 disabled:opacity-50"
                  >
                    {reportSubmitting ? "Wird gesendet..." : "Melden"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseReportModal}
                    disabled={reportSubmitting}
                    className="btn-secondary px-6 py-3 disabled:opacity-50"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
