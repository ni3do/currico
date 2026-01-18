"use client";

import { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

interface SellerResource {
  id: string;
  title: string;
  price: number;
  priceFormatted: string;
  subject: string;
  subjects: string[];
  cycles: string[];
}

export default function CreateBundlePage() {
  const router = useRouter();
  const [resources, setResources] = useState<SellerResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    selectedResources: [] as string[],
    subject: "",
    cycle: "",
    coverImage: null as File | null,
  });

  useEffect(() => {
    async function fetchResources() {
      try {
        const response = await fetch("/api/seller/resources");
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          if (response.status === 403) {
            setError("Sie müssen Verkäufer sein, um Bundles zu erstellen.");
            setLoading(false);
            return;
          }
          throw new Error("Fehler beim Laden der Ressourcen");
        }
        const data = await response.json();
        setResources(data.resources);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, [router]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleResource = (resourceId: string) => {
    const isSelected = formData.selectedResources.includes(resourceId);
    const newSelection = isSelected
      ? formData.selectedResources.filter((id) => id !== resourceId)
      : [...formData.selectedResources, resourceId];
    updateFormData("selectedResources", newSelection);
  };

  const calculateTotal = () => {
    return resources
      .filter((r) => formData.selectedResources.includes(r.id))
      .reduce((sum, r) => sum + r.price, 0);
  };

  const calculateDiscount = () => {
    const total = calculateTotal();
    const bundlePrice = (parseFloat(formData.price) || 0) * 100; // Convert to cents
    return total > 0 ? Math.round(((total - bundlePrice) / total) * 100) : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
          subject: [formData.subject],
          cycle: [formData.cycle],
          resourceIds: formData.selectedResources,
          coverImageUrl: null, // TODO: Implement image upload
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Fehler beim Erstellen des Bundles");
      }

      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text">Bundle erstellen</h1>
          <p className="mt-2 text-text-muted">
            Kombinieren Sie mehrere Ressourcen zu einem vergünstigten Paket
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : error && resources.length === 0 ? (
          <div className="rounded-xl border border-error/30 bg-error/10 p-6 text-center">
            <p className="text-error">{error}</p>
            <Link
              href="/account"
              className="mt-4 inline-block text-primary hover:underline"
            >
              Zurück zum Konto
            </Link>
          </div>
        ) : resources.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <p className="text-text-muted">
              Sie haben noch keine veröffentlichten Ressourcen. Laden Sie zuerst
              Ressourcen hoch, um ein Bundle zu erstellen.
            </p>
            <Link
              href="/upload"
              className="mt-4 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-text-on-accent"
            >
              Ressource hochladen
            </Link>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="rounded-xl border border-error/30 bg-error/10 p-4">
              <p className="text-error">{error}</p>
            </div>
          )}
          {/* Basic Information */}
          <div className="rounded-2xl border border-border bg-surface p-8">
            <h2 className="mb-6 text-xl font-semibold text-text">
              Bundle-Informationen
            </h2>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Bundle-Titel *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="z.B. Mathematik Komplett-Paket Zyklus 2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Beschreibung *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="Beschreiben Sie das Bundle und welchen Mehrwert es bietet..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-text">
                    Hauptfach *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => updateFormData("subject", e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
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
                  <label className="mb-2 block text-sm font-medium text-text">
                    Zyklus *
                  </label>
                  <select
                    value={formData.cycle}
                    onChange={(e) => updateFormData("cycle", e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  >
                    <option value="">Wählen Sie...</option>
                    <option value="1">Zyklus 1</option>
                    <option value="2">Zyklus 2</option>
                    <option value="3">Zyklus 3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Cover-Bild
                </label>
                <div className="rounded-xl border-2 border-dashed border-border bg-bg p-8 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-text-muted"
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
                  <p className="mt-2 text-sm text-text">
                    Cover-Bild hochladen (optional)
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    PNG, JPG bis 5 MB - empfohlen: 1200x630 px
                  </p>
                  <input type="file" className="hidden" accept="image/png,image/jpeg" />
                </div>
              </div>
            </div>
          </div>

          {/* Select Resources */}
          <div className="rounded-2xl border border-border bg-surface p-8">
            <h2 className="mb-6 text-xl font-semibold text-text">
              Ressourcen auswählen
            </h2>

            <p className="mb-4 text-sm text-text-muted">
              Wählen Sie mindestens 2 Ihrer veröffentlichten Ressourcen für dieses Bundle
            </p>

            <div className="space-y-3">
              {resources.map((resource) => (
                <label
                  key={resource.id}
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                    formData.selectedResources.includes(resource.id)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-bg hover:border-primary/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedResources.includes(resource.id)}
                    onChange={() => toggleResource(resource.id)}
                    className="h-5 w-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-text">{resource.title}</div>
                    <div className="text-sm text-text-muted">{resource.subject}</div>
                  </div>
                  <div className="font-semibold text-primary">{resource.priceFormatted}</div>
                </label>
              ))}
            </div>

            {formData.selectedResources.length > 0 && (
              <div className="mt-6 rounded-xl border border-border bg-bg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">
                    {formData.selectedResources.length} Ressourcen ausgewählt
                  </span>
                  <div className="text-right">
                    <div className="text-sm text-text-muted">Gesamt-Einzelpreis</div>
                    <div className="text-lg font-bold text-text">
                      CHF {(calculateTotal() / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="rounded-2xl border border-border bg-surface p-8">
            <h2 className="mb-6 text-xl font-semibold text-text">Bundle-Preis</h2>

            <div>
              <label className="mb-2 block text-sm font-medium text-text">
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
                  className="w-full rounded-xl border border-border bg-bg px-4 py-3 pl-12 text-text placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="25.00"
                />
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted">
                  CHF
                </span>
              </div>

              {formData.price && formData.selectedResources.length > 0 && calculateDiscount() > 0 && (
                <div className="mt-4 rounded-xl border border-success/30 bg-success/10 p-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-success"
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
                      <div className="font-semibold text-success">
                        {calculateDiscount()}% Ersparnis!
                      </div>
                      <div className="text-sm text-text-muted">
                        Käufer sparen CHF{" "}
                        {((calculateTotal() / 100) - parseFloat(formData.price)).toFixed(2)} im Vergleich
                        zum Einzelkauf
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <p className="mt-2 text-xs text-text-muted">
                Sie erhalten 85% des Verkaufspreises (15% Plattformgebühr)
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Link
              href="/account"
              className="flex-1 rounded-xl border border-border bg-surface px-6 py-4 text-center font-semibold text-text transition-colors hover:bg-surface-elevated"
            >
              Abbrechen
            </Link>
            <button
              type="submit"
              disabled={formData.selectedResources.length < 2 || submitting}
              className="flex-1 rounded-xl bg-primary px-6 py-4 font-semibold text-text-on-accent shadow-primary/20 shadow-lg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Wird erstellt..." : "Bundle erstellen"}
            </button>
          </div>
        </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
