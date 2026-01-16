"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

// TODO: Replace mock data with real API call to fetch seller's resources
// This page is a work-in-progress - bundle feature not yet implemented
const mockResources = [
  { id: 1, title: "Bruchrechnen Übungsblätter", subject: "Mathematik", price: "CHF 12.00" },
  { id: 2, title: "Geometrie Arbeitsblätter", subject: "Mathematik", price: "CHF 8.00" },
  { id: 3, title: "Kopfrechnen Training", subject: "Mathematik", price: "CHF 10.00" },
  { id: 4, title: "Textaufgaben Zyklus 2", subject: "Mathematik", price: "CHF 15.00" },
];

export default function CreateBundlePage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    selectedResources: [] as number[],
    subject: "",
    cycle: "",
    coverImage: null as File | null,
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleResource = (resourceId: number) => {
    const isSelected = formData.selectedResources.includes(resourceId);
    const newSelection = isSelected
      ? formData.selectedResources.filter((id) => id !== resourceId)
      : [...formData.selectedResources, resourceId];
    updateFormData("selectedResources", newSelection);
  };

  const calculateTotal = () => {
    return mockResources
      .filter((r) => formData.selectedResources.includes(r.id))
      .reduce((sum, r) => sum + parseFloat(r.price.replace("CHF ", "")), 0);
  };

  const calculateDiscount = () => {
    const total = calculateTotal();
    const bundlePrice = parseFloat(formData.price) || 0;
    return total > 0 ? Math.round(((total - bundlePrice) / total) * 100) : 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement bundle creation API call
    // 1. Create Bundle model in prisma/schema.prisma
    // 2. Create /api/bundles POST endpoint
    // 3. Submit form data to create bundle
    void formData; // Placeholder until API is implemented
  };

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Bundle erstellen</h1>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Kombinieren Sie mehrere Ressourcen zu einem vergünstigten Paket
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
            <h2 className="mb-6 text-xl font-semibold text-[var(--color-text)]">
              Bundle-Informationen
            </h2>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Bundle-Titel *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  required
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none"
                  placeholder="z.B. Mathematik Komplett-Paket Zyklus 2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Beschreibung *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none"
                  placeholder="Beschreiben Sie das Bundle und welchen Mehrwert es bietet..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Hauptfach *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => updateFormData("subject", e.target.value)}
                    required
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none"
                  >
                    <option value="">Wählen Sie...</option>
                    <option value="Mathematik">Mathematik</option>
                    <option value="Deutsch">Deutsch</option>
                    <option value="Englisch">Englisch</option>
                    <option value="Französisch">Französisch</option>
                    <option value="NMG">NMG</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Zyklus *
                  </label>
                  <select
                    value={formData.cycle}
                    onChange={(e) => updateFormData("cycle", e.target.value)}
                    required
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none"
                  >
                    <option value="">Wählen Sie...</option>
                    <option value="1">Zyklus 1</option>
                    <option value="2">Zyklus 2</option>
                    <option value="3">Zyklus 3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Cover-Bild
                </label>
                <div className="rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-8 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-[var(--color-text-muted)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-[var(--color-text)]">
                    Cover-Bild hochladen (optional)
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    PNG, JPG bis 5 MB - empfohlen: 1200x630 px
                  </p>
                  <input type="file" className="hidden" accept="image/png,image/jpeg" />
                </div>
              </div>
            </div>
          </div>

          {/* Select Resources */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
            <h2 className="mb-6 text-xl font-semibold text-[var(--color-text)]">
              Ressourcen auswählen
            </h2>

            <p className="mb-4 text-sm text-[var(--color-text-muted)]">
              Wählen Sie mindestens 2 Ihrer veröffentlichten Ressourcen für dieses Bundle
            </p>

            <div className="space-y-3">
              {mockResources.map((resource) => (
                <label
                  key={resource.id}
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                    formData.selectedResources.includes(resource.id)
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-primary)]/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedResources.includes(resource.id)}
                    onChange={() => toggleResource(resource.id)}
                    className="h-5 w-5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[var(--color-text)]">{resource.title}</div>
                    <div className="text-sm text-[var(--color-text-muted)]">{resource.subject}</div>
                  </div>
                  <div className="font-semibold text-[var(--color-primary)]">{resource.price}</div>
                </label>
              ))}
            </div>

            {formData.selectedResources.length > 0 && (
              <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {formData.selectedResources.length} Ressourcen ausgewählt
                  </span>
                  <div className="text-right">
                    <div className="text-sm text-[var(--color-text-muted)]">Gesamt-Einzelpreis</div>
                    <div className="text-lg font-bold text-[var(--color-text)]">
                      CHF {calculateTotal().toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
            <h2 className="mb-6 text-xl font-semibold text-[var(--color-text)]">Bundle-Preis</h2>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Bundle-Preis (CHF) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateFormData("price", e.target.value)}
                  required
                  min="0"
                  step="0.50"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 pl-12 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none"
                  placeholder="25.00"
                />
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--color-text-muted)]">
                  CHF
                </span>
              </div>

              {formData.price && formData.selectedResources.length > 0 && (
                <div className="mt-4 rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 p-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-[var(--color-success)]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <div className="font-semibold text-[var(--color-success)]">
                        {calculateDiscount()}% Ersparnis!
                      </div>
                      <div className="text-sm text-[var(--color-text-muted)]">
                        Käufer sparen CHF{" "}
                        {(calculateTotal() - parseFloat(formData.price)).toFixed(2)} im Vergleich
                        zum Einzelkauf
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                Sie erhalten 85% des Verkaufspreises (15% Plattformgebühr)
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Link
              href="/account"
              className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4 text-center font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-elevated)]"
            >
              Abbrechen
            </Link>
            <button
              type="submit"
              disabled={formData.selectedResources.length < 2}
              className="flex-1 rounded-xl bg-[var(--color-primary)] px-6 py-4 font-semibold text-white shadow-[var(--color-primary)]/20 shadow-lg transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Bundle erstellen
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
