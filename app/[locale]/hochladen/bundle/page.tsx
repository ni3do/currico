"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

interface SellerMaterial {
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
  const [materials, setMaterials] = useState<SellerMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    selectedMaterials: [] as string[],
    subject: "",
    cycle: "",
    coverImage: null as File | null,
  });

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const response = await fetch("/api/seller/materials");
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/anmelden");
            return;
          }
          if (response.status === 403) {
            setError("Sie müssen Verkäufer sein, um Bundles zu erstellen.");
            setLoading(false);
            return;
          }
          throw new Error("Fehler beim Laden der Materialien");
        }
        const data = await response.json();
        setMaterials(data.materials);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
      } finally {
        setLoading(false);
      }
    }
    fetchMaterials();
  }, [router]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleMaterial = (materialId: string) => {
    const isSelected = formData.selectedMaterials.includes(materialId);
    const newSelection = isSelected
      ? formData.selectedMaterials.filter((id) => id !== materialId)
      : [...formData.selectedMaterials, materialId];
    updateFormData("selectedMaterials", newSelection);
  };

  const calculateTotal = () => {
    return materials
      .filter((r) => formData.selectedMaterials.includes(r.id))
      .reduce((sum, r) => sum + r.price, 0);
  };

  const calculateDiscount = () => {
    const total = calculateTotal();
    const bundlePrice = (parseFloat(formData.price) || 0) * 100; // Convert to cents
    return total > 0 ? Math.round(((total - bundlePrice) / total) * 100) : 0;
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Bitte wählen Sie eine Bilddatei aus.");
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("Das Bild darf maximal 5 MB gross sein.");
        return;
      }
      setError(null);
      updateFormData("coverImage", file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setCoverImagePreview(previewUrl);
    }
  };

  const removeCoverImage = () => {
    updateFormData("coverImage", null);
    if (coverImagePreview) {
      URL.revokeObjectURL(coverImagePreview);
      setCoverImagePreview(null);
    }
    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = "";
    }
  };

  const uploadCoverImage = async (file: File): Promise<string | null> => {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("type", "preview");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: uploadFormData,
    });

    if (!response.ok) {
      throw new Error("Fehler beim Hochladen des Cover-Bildes");
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Upload cover image if provided
      let coverImageUrl: string | null = null;
      if (formData.coverImage) {
        coverImageUrl = await uploadCoverImage(formData.coverImage);
      }

      const response = await fetch("/api/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
          subject: [formData.subject],
          cycle: [formData.cycle],
          resourceIds: formData.selectedMaterials,
          coverImageUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Fehler beim Erstellen des Bundles");
      }

      router.push("/konto");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: "Bundle erstellen" }]} />
          <h1 className="text-text text-2xl font-bold sm:text-3xl">Bundle erstellen</h1>
          <p className="text-text-muted mt-1">
            Kombinieren Sie mehrere Materialien zu einem vergünstigten Paket
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          </div>
        ) : error && materials.length === 0 ? (
          <div className="border-error/30 bg-error/10 rounded-xl border p-6 text-center">
            <p className="text-error">{error}</p>
            <Link href="/konto" className="text-primary mt-4 inline-block hover:underline">
              Zurück zum Konto
            </Link>
          </div>
        ) : materials.length === 0 ? (
          <div className="border-border bg-surface rounded-xl border p-8 text-center">
            <p className="text-text-muted">
              Sie haben noch keine veröffentlichten Materialien. Laden Sie zuerst Materialien hoch,
              um ein Bundle zu erstellen.
            </p>
            <Link
              href="/hochladen"
              className="bg-primary text-text-on-accent mt-4 inline-block rounded-xl px-6 py-3 font-semibold"
            >
              Material hochladen
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="border-error/30 bg-error/10 rounded-xl border p-4">
                <p className="text-error">{error}</p>
              </div>
            )}
            {/* Basic Information */}
            <div className="border-border bg-surface rounded-2xl border p-8">
              <h2 className="text-text mb-6 text-xl font-semibold">Bundle-Informationen</h2>

              <div className="space-y-6">
                <div>
                  <label className="text-text mb-2 block text-sm font-medium">Bundle-Titel *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                    required
                    className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                    placeholder="z.B. Mathematik Komplett-Paket Zyklus 2"
                  />
                </div>

                <div>
                  <label className="text-text mb-2 block text-sm font-medium">Beschreibung *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    required
                    rows={4}
                    className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                    placeholder="Beschreiben Sie das Bundle und welchen Mehrwert es bietet..."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-text mb-2 block text-sm font-medium">Hauptfach *</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => updateFormData("subject", e.target.value)}
                      required
                      className={`border-border bg-bg focus:border-primary focus:ring-primary/20 w-full rounded-full border px-4 py-3 focus:ring-2 focus:outline-none ${
                        formData.subject === "" ? "text-text-faint" : "text-text"
                      }`}
                    >
                      <option value="" disabled hidden>
                        Fach auswählen...
                      </option>
                      <option value="Mathematik" className="text-text">
                        Mathematik
                      </option>
                      <option value="Deutsch" className="text-text">
                        Deutsch
                      </option>
                      <option value="Englisch" className="text-text">
                        Englisch
                      </option>
                      <option value="Französisch" className="text-text">
                        Französisch
                      </option>
                      <option value="NMG" className="text-text">
                        NMG
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-text mb-2 block text-sm font-medium">Zyklus *</label>
                    <select
                      value={formData.cycle}
                      onChange={(e) => updateFormData("cycle", e.target.value)}
                      required
                      className={`border-border bg-bg focus:border-primary focus:ring-primary/20 w-full rounded-full border px-4 py-3 focus:ring-2 focus:outline-none ${
                        formData.cycle === "" ? "text-text-faint" : "text-text"
                      }`}
                    >
                      <option value="" disabled hidden>
                        Zyklus auswählen...
                      </option>
                      <option value="1" className="text-text">
                        Zyklus 1
                      </option>
                      <option value="2" className="text-text">
                        Zyklus 2
                      </option>
                      <option value="3" className="text-text">
                        Zyklus 3
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-text mb-2 block text-sm font-medium">Cover-Bild</label>
                  {coverImagePreview ? (
                    <div className="border-primary bg-primary/5 relative rounded-xl border-2 p-4">
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                        <Image
                          src={coverImagePreview}
                          alt="Cover-Vorschau"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-text text-sm font-medium">{formData.coverImage?.name}</p>
                        <button
                          type="button"
                          onClick={removeCoverImage}
                          className="text-error hover:bg-error/10 flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Entfernen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => coverImageInputRef.current?.click()}
                      className="border-border bg-bg hover:border-primary cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors"
                    >
                      <svg
                        className="text-text-muted mx-auto h-12 w-12"
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
                      <p className="text-text mt-2 text-sm">Cover-Bild hochladen (optional)</p>
                      <p className="text-text-muted mt-1 text-xs">
                        PNG, JPG bis 5 MB - empfohlen: 1200x630 px
                      </p>
                    </div>
                  )}
                  <input
                    ref={coverImageInputRef}
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg"
                    onChange={handleCoverImageChange}
                  />
                </div>
              </div>
            </div>

            {/* Select Resources */}
            <div className="border-border bg-surface rounded-2xl border p-8">
              <h2 className="text-text mb-6 text-xl font-semibold">Materialien auswählen</h2>

              <p className="text-text-muted mb-4 text-sm">
                Wählen Sie mindestens 2 Ihrer veröffentlichten Materialien für dieses Bundle
              </p>

              <div className="space-y-3">
                {materials.map((material) => (
                  <label
                    key={material.id}
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                      formData.selectedMaterials.includes(material.id)
                        ? "border-primary bg-primary/10"
                        : "border-border bg-bg hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedMaterials.includes(material.id)}
                      onChange={() => toggleMaterial(material.id)}
                      className="border-border text-primary focus:ring-primary/20 h-5 w-5 rounded focus:ring-2"
                    />
                    <div className="flex-1">
                      <div className="text-text font-medium">{material.title}</div>
                      <div className="text-text-muted text-sm">{material.subject}</div>
                    </div>
                    <div className="text-primary font-semibold">{material.priceFormatted}</div>
                  </label>
                ))}
              </div>

              {formData.selectedMaterials.length > 0 && (
                <div className="border-border bg-bg mt-6 rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-sm">
                      {formData.selectedMaterials.length} Materialien ausgewählt
                    </span>
                    <div className="text-right">
                      <div className="text-text-muted text-sm">Gesamt-Einzelpreis</div>
                      <div className="text-text text-lg font-bold">
                        CHF {(calculateTotal() / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="border-border bg-surface rounded-2xl border p-8">
              <h2 className="text-text mb-6 text-xl font-semibold">Bundle-Preis</h2>

              <div>
                <label className="text-text mb-2 block text-sm font-medium">
                  Bundle-Preis (CHF) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateFormData("price", e.target.value)}
                    required
                    min="0"
                    max="25"
                    step="0.50"
                    className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 pl-12 focus:ring-2 focus:outline-none"
                    placeholder="z.B. 25.00"
                  />
                  <span className="text-text-muted absolute top-1/2 left-4 -translate-y-1/2">
                    CHF
                  </span>
                </div>

                {formData.price &&
                  formData.selectedMaterials.length > 0 &&
                  calculateDiscount() > 0 && (
                    <div className="border-success/30 bg-success/10 mt-4 rounded-xl border p-4">
                      <div className="flex items-center gap-2">
                        <svg
                          className="text-success h-5 w-5"
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
                          <div className="text-success font-semibold">
                            {calculateDiscount()}% Ersparnis!
                          </div>
                          <div className="text-text-muted text-sm">
                            Käufer sparen CHF{" "}
                            {(calculateTotal() / 100 - parseFloat(formData.price)).toFixed(2)} im
                            Vergleich zum Einzelkauf
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                <p className="text-text-muted mt-2 text-xs">
                  Sie erhalten 70% des Verkaufspreises (30% Plattformgebühr)
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Link
                href="/konto"
                className="border-border bg-surface text-text hover:bg-surface-elevated flex-1 rounded-xl border px-6 py-4 text-center font-semibold transition-colors"
              >
                Abbrechen
              </Link>
              <button
                type="submit"
                disabled={formData.selectedMaterials.length < 2 || submitting}
                className="bg-primary text-text-on-accent shadow-primary/20 hover:bg-primary-hover flex-1 rounded-xl px-6 py-4 font-semibold shadow-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
