"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/ui/TopBar";

type Step = 1 | 2 | 3 | 4;

export default function UploadPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // Step 1: Basics
    title: "",
    description: "",
    language: "de",
    resourceType: "pdf",

    // Step 2: Curriculum
    cycle: "",
    subject: "",
    canton: "",
    competences: [] as string[],

    // Step 3: Properties
    priceType: "paid",
    price: "",
    editable: false,
    licenseScope: "individual",

    // Step 4: Files
    files: [] as File[],
    previewFiles: [] as File[],
  });

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const previewFileInputRef = useRef<HTMLInputElement>(null);

  const handleMainFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData((prev) => ({ ...prev, files: Array.from(files) }));
    }
  };

  const handlePreviewFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData((prev) => ({ ...prev, previewFiles: Array.from(files) }));
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handlePublish = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description) {
        setError("Titel und Beschreibung sind erforderlich");
        setIsSubmitting(false);
        return;
      }

      if (!formData.cycle || !formData.subject) {
        setError("Zyklus und Fach sind erforderlich");
        setIsSubmitting(false);
        return;
      }

      if (formData.files.length === 0) {
        setError("Bitte laden Sie mindestens eine Datei hoch");
        setIsSubmitting(false);
        return;
      }

      // Prepare form data for API
      const apiFormData = new FormData();
      apiFormData.append("title", formData.title);
      apiFormData.append("description", formData.description);
      apiFormData.append("language", formData.language);
      apiFormData.append("resourceType", formData.resourceType);

      // Convert cycle to full name (e.g., "1" -> "Zyklus 1")
      const cycleFullName = `Zyklus ${formData.cycle}`;
      apiFormData.append("subjects", JSON.stringify([formData.subject]));
      apiFormData.append("cycles", JSON.stringify([cycleFullName]));

      // Calculate price in cents
      const priceInCents =
        formData.priceType === "free"
          ? 0
          : Math.round(parseFloat(formData.price || "0") * 100);
      apiFormData.append("price", priceInCents.toString());

      // Publish immediately as draft (not published yet, needs admin approval)
      apiFormData.append("is_published", "true");

      // Add main file (only the first one for now)
      if (formData.files[0]) {
        apiFormData.append("file", formData.files[0]);
      }

      // Add preview file if present
      if (formData.previewFiles[0]) {
        apiFormData.append("preview", formData.previewFiles[0]);
      }

      const response = await fetch("/api/resources", {
        method: "POST",
        body: apiFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Fehler beim Hochladen");
        setIsSubmitting(false);
        return;
      }

      // Success - redirect to seller dashboard
      router.push("/dashboard/seller");
    } catch (err) {
      console.error("Upload error:", err);
      setError("Ein unerwarteter Fehler ist aufgetreten");
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <TopBar />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Ressource hochladen</h1>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Teilen Sie Ihre Unterrichtsmaterialien mit anderen Lehrpersonen
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all ${
                      step <= currentStep
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
                    }`}
                  >
                    {step}
                  </div>
                  <span className="mt-2 text-xs text-[var(--color-text-muted)]">
                    {step === 1 && "Basics"}
                    {step === 2 && "Lehrplan"}
                    {step === 3 && "Preis"}
                    {step === 4 && "Dateien"}
                  </span>
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step < currentStep ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex gap-3">
              <svg
                className="h-5 w-5 flex-shrink-0 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
          {/* Step 1: Basics */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[var(--color-text)]">Grundinformationen</h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Titel *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  required
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  placeholder="z.B. Bruchrechnen Übungsblätter"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Kurzbeschreibung *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  placeholder="Beschreiben Sie Ihre Ressource in 2-3 Sätzen..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Sprache *
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => updateFormData("language", e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  >
                    <option value="de">Deutsch</option>
                    <option value="fr">Französisch</option>
                    <option value="it">Italienisch</option>
                    <option value="en">Englisch</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Ressourcentyp *
                  </label>
                  <select
                    value={formData.resourceType}
                    onChange={(e) => updateFormData("resourceType", e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  >
                    <option value="pdf">PDF</option>
                    <option value="word">Word</option>
                    <option value="powerpoint">PowerPoint</option>
                    <option value="excel">Excel</option>
                    <option value="other">Andere</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Curriculum */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[var(--color-text)]">Lehrplan-Zuordnung</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Zyklus *
                  </label>
                  <select
                    value={formData.cycle}
                    onChange={(e) => updateFormData("cycle", e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  >
                    <option value="">Wählen Sie...</option>
                    <option value="1">Zyklus 1</option>
                    <option value="2">Zyklus 2</option>
                    <option value="3">Zyklus 3</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Hauptfach *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => updateFormData("subject", e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  >
                    <option value="">Wählen Sie...</option>
                    <option value="Mathematik">Mathematik</option>
                    <option value="Deutsch">Deutsch</option>
                    <option value="Englisch">Englisch</option>
                    <option value="Französisch">Französisch</option>
                    <option value="NMG">NMG</option>
                    <option value="BG">Bildnerisches Gestalten</option>
                    <option value="Musik">Musik</option>
                    <option value="Sport">Sport</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Kanton *
                </label>
                <select
                  value={formData.canton}
                  onChange={(e) => updateFormData("canton", e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                >
                  <option value="">Wählen Sie...</option>
                  <option value="ZH">Zürich</option>
                  <option value="BE">Bern</option>
                  <option value="LU">Luzern</option>
                  <option value="AG">Aargau</option>
                  <option value="SG">St. Gallen</option>
                  <option value="all">Alle Kantone</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Lehrplan 21 Kompetenzen
                </label>
                <input
                  type="text"
                  placeholder="z.B. MA.1.A.2, MA.1.A.3 (kommagetrennt)"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Optional: Geben Sie die Kompetenzcodes aus dem Lehrplan 21 ein
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Properties */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[var(--color-text)]">Eigenschaften & Preis</h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Preistyp *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      formData.priceType === "free"
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                        : "border-[var(--color-border)] bg-[var(--color-bg)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="priceType"
                      value="free"
                      checked={formData.priceType === "free"}
                      onChange={(e) => updateFormData("priceType", e.target.value)}
                      className="h-4 w-4 text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                    <div>
                      <div className="font-medium text-[var(--color-text)]">Kostenlos</div>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        Frei zugänglich
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      formData.priceType === "paid"
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                        : "border-[var(--color-border)] bg-[var(--color-bg)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="priceType"
                      value="paid"
                      checked={formData.priceType === "paid"}
                      onChange={(e) => updateFormData("priceType", e.target.value)}
                      className="h-4 w-4 text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                    <div>
                      <div className="font-medium text-[var(--color-text)]">Kostenpflichtig</div>
                      <div className="text-xs text-[var(--color-text-muted)]">Preis festlegen</div>
                    </div>
                  </label>
                </div>
              </div>

              {formData.priceType === "paid" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Preis (CHF) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => updateFormData("price", e.target.value)}
                      min="0"
                      step="0.50"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 pl-12 text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                      placeholder="12.00"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                      CHF
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Sie erhalten 85% des Verkaufspreises (15% Plattformgebühr)
                  </p>
                </div>
              )}

              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.editable}
                    onChange={(e) => updateFormData("editable", e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                  <div>
                    <div className="text-sm font-medium text-[var(--color-text)]">
                      Editierbar
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      Käufer können die Datei bearbeiten (z.B. Word-Dokument)
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Lizenzumfang *
                </label>
                <select
                  value={formData.licenseScope}
                  onChange={(e) => updateFormData("licenseScope", e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                >
                  <option value="individual">Einzellizenz</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Files */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[var(--color-text)]">Dateien & Vorschau</h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Hauptdatei(en) *
                </label>
                <div
                  onClick={() => mainFileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-8 text-center cursor-pointer hover:border-[var(--color-primary)] transition-colors"
                >
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-[var(--color-text)]">
                    Klicken Sie hier oder ziehen Sie Dateien hinein
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    PDF, Word, PowerPoint, Excel bis 50 MB
                  </p>
                  {formData.files.length > 0 && (
                    <p className="mt-2 text-sm text-[var(--color-primary)] font-medium">
                      {formData.files.length} Datei(en) ausgewählt
                    </p>
                  )}
                  <input
                    ref={mainFileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    onChange={handleMainFilesChange}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Vorschaudateien
                </label>
                <div
                  onClick={() => previewFileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-8 text-center cursor-pointer hover:border-[var(--color-primary)] transition-colors"
                >
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
                    Vorschaubilder hochladen (optional)
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    PNG, JPG bis 10 MB - wird mit Wasserzeichen versehen
                  </p>
                  {formData.previewFiles.length > 0 && (
                    <p className="mt-2 text-sm text-[var(--color-primary)] font-medium">
                      {formData.previewFiles.length} Vorschaubild(er) ausgewählt
                    </p>
                  )}
                  <input
                    ref={previewFileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/png,image/jpeg"
                    onChange={handlePreviewFilesChange}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                <div className="flex gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-[var(--color-info)]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-[var(--color-text-muted)]">
                    <strong className="text-[var(--color-text)]">Hinweis:</strong> Vorschaudateien werden
                    automatisch mit einem Wasserzeichen versehen. Die vollständigen
                    Dateien sind nur für Käufer zugänglich.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between border-t border-[var(--color-border)] pt-6">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="rounded-lg border border-[var(--color-border)] px-6 py-3 font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zurück
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-success)] px-8 py-3 font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-[var(--color-primary)]/20"
              >
                Weiter
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={isSubmitting}
                className="rounded-lg bg-gradient-to-r from-[var(--color-success)] to-[var(--color-info)] px-8 py-3 font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-[var(--color-success)]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Wird hochgeladen...
                  </>
                ) : (
                  "Veröffentlichen"
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-[var(--color-border)] bg-[var(--color-surface)]/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-[var(--color-text-muted)]">
            <p>© 2026 Easy Lehrer. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
