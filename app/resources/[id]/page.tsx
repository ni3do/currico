"use client";

import { useState } from "react";
import Link from "next/link";

// Mock data - in real app, fetch based on id
const mockResource = {
  id: 1,
  title: "Bruchrechnen Übungsblätter",
  description:
    "Umfassende Übungen zur Bruchrechnung für Zyklus 2. Diese Sammlung enthält 20 Arbeitsblätter mit steigendem Schwierigkeitsgrad, von einfachen Bruchdarstellungen bis hin zu komplexen Rechenoperationen. Jedes Blatt wird von einem Lösungsschlüssel begleitet.",
  price: "CHF 12.00",
  quality: "Verified",
  type: "PDF",
  editable: true,
  subject: "Mathematik",
  cycle: "Zyklus 2",
  canton: "Zürich",
  competences: ["MA.1.A.2", "MA.1.A.3"],
  seller: {
    name: "Maria Schmidt",
    rating: 4.8,
    resources: 23,
  },
  previews: [
    { id: 1, type: "image", label: "Seite 1 Vorschau" },
    { id: 2, type: "image", label: "Seite 2 Vorschau" },
    { id: 3, type: "image", label: "Seite 3 Vorschau" },
  ],
};

const mockReviews = [
  {
    id: 1,
    author: "Peter Müller",
    rating: 5,
    comment: "Hervorragende Arbeitsblätter! Meine Klasse hat damit sehr gut gelernt. Die Progression ist perfekt.",
    date: "2026-01-05",
  },
  {
    id: 2,
    author: "Anna Weber",
    rating: 4,
    comment: "Sehr gute Qualität. Könnte noch mehr Aufgaben haben, aber insgesamt super Material.",
    date: "2026-01-03",
  },
  {
    id: 3,
    author: "Thomas Fischer",
    rating: 5,
    comment: "Genau was ich gesucht habe. Gut strukturiert und mit Lösungsschlüssel.",
    date: "2025-12-28",
  },
];

const relatedResources = [
  {
    id: 2,
    title: "Dezimalzahlen verstehen",
    subject: "Mathematik",
    cycle: "Zyklus 2",
    price: "CHF 10.00",
    quality: "Verified",
  },
  {
    id: 3,
    title: "Mathematik Spiele Bundle",
    subject: "Mathematik",
    cycle: "Zyklus 2",
    price: "CHF 25.00",
    quality: "AI-Checked",
  },
  {
    id: 4,
    title: "Kopfrechnen Training",
    subject: "Mathematik",
    cycle: "Zyklus 2",
    price: "Gratis",
    quality: "Verified",
  },
];

export default function ResourceDetailPage() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="min-h-screen bg-[--background]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[--border] bg-[--surface]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[--primary] to-[--secondary]">
                  <span className="text-xl font-bold text-[--background]">EL</span>
                </div>
                <span className="text-xl font-bold text-[--text]">Easy Lehrer</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/resources"
                className="text-[--text-muted] hover:text-[--text] transition-colors"
              >
                Ressourcen
              </Link>
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
              <Link
                href="/login"
                className="hidden sm:block text-[--text-muted] hover:text-[--text] transition-colors"
              >
                Anmelden
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-[--primary] to-[--secondary] px-6 py-2.5 font-medium text-[--background] hover:opacity-90 transition-opacity shadow-lg shadow-[--primary]/20"
              >
                Registrieren
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-[--text-muted]">
          <Link href="/resources" className="hover:text-[--primary]">
            Ressourcen
          </Link>
          <span>/</span>
          <Link href="/resources?subject=Mathematik" className="hover:text-[--primary]">
            Mathematik
          </Link>
          <span>/</span>
          <span className="text-[--text]">{mockResource.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Primary Information */}
            <div className="rounded-2xl border border-[--border] bg-[--surface] p-8">
              {/* Title and Badges */}
              <div className="mb-6">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[--background] px-3 py-1 text-sm font-medium text-[--text]">
                    {mockResource.type}
                  </span>
                  <span className="rounded-full bg-[--green]/20 px-3 py-1 text-sm font-medium text-[--green]">
                    ✓ Verifiziert
                  </span>
                  {mockResource.editable && (
                    <span className="rounded-full bg-[--sapphire]/20 px-3 py-1 text-sm font-medium text-[--sapphire]">
                      Editierbar
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-[--text]">
                  {mockResource.title}
                </h1>
              </div>

              {/* Description */}
              <p className="mb-6 leading-relaxed text-[--text-muted]">
                {mockResource.description}
              </p>

              {/* Price and Actions */}
              <div className="mb-8 flex flex-wrap items-center gap-4">
                <div className="text-3xl font-bold text-[--primary]">
                  {mockResource.price}
                </div>
                <button className="flex-1 rounded-xl bg-gradient-to-r from-[--primary] to-[--secondary] px-8 py-4 font-semibold text-[--background] hover:opacity-90 transition-opacity shadow-lg shadow-[--primary]/20">
                  Jetzt kaufen
                </button>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`rounded-xl border-2 p-4 transition-all ${
                    isWishlisted
                      ? "border-[--red] bg-[--red]/10 text-[--red]"
                      : "border-[--border] bg-[--background] text-[--text-muted] hover:border-[--red] hover:text-[--red]"
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
              <div className="mb-8 rounded-xl border border-[--border] bg-[--background] p-6">
                <h3 className="mb-4 font-semibold text-[--text]">Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm text-[--text-muted]">Fach</div>
                    <div className="font-medium text-[--text]">{mockResource.subject}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[--text-muted]">Zyklus</div>
                    <div className="font-medium text-[--text]">{mockResource.cycle}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[--text-muted]">Kanton</div>
                    <div className="font-medium text-[--text]">{mockResource.canton}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[--text-muted]">Lehrplan 21</div>
                    <div className="flex flex-wrap gap-2">
                      {mockResource.competences.map((comp) => (
                        <span
                          key={comp}
                          className="rounded-full bg-[--surface] px-2 py-1 text-xs font-medium text-[--text]"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="mb-8">
                <h3 className="mb-4 text-xl font-semibold text-[--text]">Vorschau</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  {mockResource.previews.map((preview) => (
                    <div
                      key={preview.id}
                      className="relative aspect-[3/4] overflow-hidden rounded-xl border border-[--border] bg-[--background]"
                    >
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <svg
                            className="mx-auto h-16 w-16 text-[--text-muted]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="mt-2 text-sm text-[--text-muted]">
                            {preview.label}
                          </p>
                        </div>
                      </div>
                      {/* Watermark overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-[--background]/50 backdrop-blur-[2px]">
                        <span className="rotate-[-45deg] text-4xl font-bold text-[--overlay1] opacity-30">
                          VORSCHAU
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-[--text-muted]">
                  Vollständige Dateien sind nach dem Kauf verfügbar
                </p>
              </div>

              {/* Report Button */}
              <button
                onClick={() => setShowReportModal(true)}
                className="text-sm text-[--text-muted] hover:text-[--red] transition-colors"
              >
                Ressource melden
              </button>
            </div>

            {/* Reviews Section */}
            <div className="mt-12 border-t border-[--border] pt-8">
              <h2 className="mb-6 text-2xl font-bold text-[--text]">
                Bewertungen ({mockReviews.length})
              </h2>

              {/* Average Rating */}
              <div className="mb-8 flex items-center gap-8 rounded-xl border border-[--border] bg-[--background] p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[--text]">
                    {(
                      mockReviews.reduce((sum, r) => sum + r.rating, 0) /
                      mockReviews.length
                    ).toFixed(1)}
                  </div>
                  <div className="mt-1 flex justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`h-5 w-5 ${
                          star <=
                          Math.round(
                            mockReviews.reduce((sum, r) => sum + r.rating, 0) /
                              mockReviews.length
                          )
                            ? "text-[--yellow]"
                            : "text-[--overlay1]"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="mt-1 text-sm text-[--text-muted]">
                    {mockReviews.length} Bewertungen
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = mockReviews.filter((r) => r.rating === rating).length;
                    const percentage = (count / mockReviews.length) * 100;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-sm text-[--text-muted] w-8">{rating} ★</span>
                        <div className="flex-1 h-2 rounded-full bg-[--surface]">
                          <div
                            className="h-full rounded-full bg-[--yellow]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-[--text-muted] w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {mockReviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-[--border] bg-[--background] p-6"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] text-sm font-bold text-[--background]">
                          {review.author.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-[--text]">{review.author}</div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? "text-[--yellow]"
                                    : "text-[--overlay1]"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-[--text-muted]">
                        {new Date(review.date).toLocaleDateString("de-CH")}
                      </div>
                    </div>
                    <p className="text-[--text-muted] leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Resources */}
            <div className="mt-12">
              <h2 className="mb-6 text-2xl font-bold text-[--text]">
                Ähnliche Ressourcen
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {relatedResources.map((resource) => (
                  <a
                    key={resource.id}
                    href={`/resources/${resource.id}`}
                    className="group rounded-xl border border-[--border] bg-[--surface] p-4 transition-all hover:-translate-y-1 hover:border-[--primary]/50 hover:shadow-lg hover:shadow-[--primary]/10"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full bg-[--background] px-2 py-1 text-xs text-[--text-muted]">
                        {resource.subject}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          resource.quality === "Verified"
                            ? "bg-[--green]/20 text-[--green]"
                            : "bg-[--sapphire]/20 text-[--sapphire]"
                        }`}
                      >
                        {resource.quality === "Verified" ? "✓" : "KI"}
                      </span>
                    </div>
                    <h3 className="mb-2 font-semibold text-[--text] group-hover:text-[--primary] transition-colors">
                      {resource.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[--primary]">{resource.price}</span>
                      <span className="text-xs text-[--text-muted]">{resource.cycle}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Seller Info */}
            <div className="sticky top-24 rounded-2xl border border-[--border] bg-[--surface] p-6">
              <h3 className="mb-4 font-semibold text-[--text]">Erstellt von</h3>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] text-lg font-bold text-[--background]">
                  {mockResource.seller.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-[--text]">
                    {mockResource.seller.name}
                  </div>
                  <div className="text-sm text-[--text-muted]">
                    {mockResource.seller.resources} Ressourcen
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4 flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.floor(mockResource.seller.rating)
                          ? "text-[--yellow]"
                          : "text-[--overlay1]"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-medium text-[--text]">
                  {mockResource.seller.rating}
                </span>
              </div>

              {/* Follow Button */}
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`w-full rounded-xl border-2 px-4 py-3 font-medium transition-all ${
                  isFollowing
                    ? "border-[--primary] bg-[--primary]/10 text-[--primary]"
                    : "border-[--border] bg-[--background] text-[--text] hover:border-[--primary] hover:bg-[--primary]/5"
                }`}
              >
                {isFollowing ? "✓ Folge ich" : "+ Folgen"}
              </button>

              {/* More from Seller */}
              <div className="mt-6 pt-6 border-t border-[--border]">
                <a
                  href="#"
                  className="text-sm font-medium text-[--primary] hover:text-[--primary-hover] transition-colors"
                >
                  Alle Ressourcen ansehen →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[--background]/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-[--border] bg-[--surface] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[--text]">
                Ressource melden
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-[--text-muted] hover:text-[--text]"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[--text]">
                  Grund
                </label>
                <select className="w-full rounded-lg border border-[--border] bg-[--background] px-3 py-2 text-[--text] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20">
                  <option>Unangemessener Inhalt</option>
                  <option>Urheberrechtsverletzung</option>
                  <option>Qualitätsprobleme</option>
                  <option>Falsches Fach/Zyklus</option>
                  <option>Anderes</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[--text]">
                  Kommentar (optional)
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-lg border border-[--border] bg-[--background] px-3 py-2 text-[--text] placeholder:text-[--text-muted] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20"
                  placeholder="Bitte beschreiben Sie das Problem..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-[--red] to-[--maroon] px-4 py-3 font-medium text-[--background] hover:opacity-90 transition-opacity"
                >
                  Melden
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="rounded-lg border border-[--border] px-6 py-3 font-medium text-[--text] hover:bg-[--surface1] transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
