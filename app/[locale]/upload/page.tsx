"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/ui/TopBar";
import { CurriculumSelector } from "@/components/upload/CurriculumSelector";
import { checkForEszett, replaceEszett } from "@/lib/validations/swiss-quality";

type Step = 1 | 2 | 3 | 4;

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function UploadPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [createdResourceId, setCreatedResourceId] = useState<string | null>(null);

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
    competencies: [] as string[],
    lehrmittelIds: [] as string[],

    // Step 3: Properties
    priceType: "paid",
    price: "",
    editable: false,
    licenseScope: "individual",

    // Step 4: Files
    files: [] as File[],
    previewFiles: [] as File[],

    // Legal confirmations
    legalOwnContent: false,
    legalNoTextbookScans: false,
    legalNoTrademarks: false,
    legalSwissGerman: false,
    legalTermsAccepted: false,
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
    setUploadStatus("uploading");
    setUploadProgress(10);

    try {
      // Validate required fields
      if (!formData.title || !formData.description) {
        setError("Titel und Beschreibung sind erforderlich");
        setUploadStatus("error");
        return;
      }

      if (!formData.cycle || !formData.subject) {
        setError("Zyklus und Fach sind erforderlich");
        setUploadStatus("error");
        return;
      }

      if (formData.files.length === 0) {
        setError("Bitte laden Sie mindestens eine Datei hoch");
        setUploadStatus("error");
        return;
      }

      setUploadProgress(30);

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

      setUploadProgress(50);

      // Add main file (only the first one for now)
      if (formData.files[0]) {
        apiFormData.append("file", formData.files[0]);
      }

      // Add preview file if present
      if (formData.previewFiles[0]) {
        apiFormData.append("preview", formData.previewFiles[0]);
      }

      setUploadProgress(70);

      const response = await fetch("/api/resources", {
        method: "POST",
        body: apiFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Fehler beim Hochladen");
        setUploadStatus("error");
        return;
      }

      setUploadProgress(100);
      setUploadStatus("success");
      setCreatedResourceId(result.resource?.id);

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard/seller");
      }, 2000);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Ein unerwarteter Fehler ist aufgetreten");
      setUploadStatus("error");
    }
  };

  const updateFormData = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Eszett (ß) validation for Swiss German
  const eszettCheck = useMemo(() => {
    const titleCheck = checkForEszett(formData.title);
    const descriptionCheck = checkForEszett(formData.description);
    return {
      title: titleCheck,
      description: descriptionCheck,
      hasAny: titleCheck.hasEszett || descriptionCheck.hasEszett,
      totalCount: titleCheck.count + descriptionCheck.count,
    };
  }, [formData.title, formData.description]);

  const handleFixEszett = () => {
    setFormData((prev) => ({
      ...prev,
      title: replaceEszett(prev.title),
      description: replaceEszett(prev.description),
    }));
  };

  // Check if all legal confirmations are checked
  const allLegalChecked =
    formData.legalOwnContent &&
    formData.legalNoTextbookScans &&
    formData.legalNoTrademarks &&
    formData.legalSwissGerman &&
    formData.legalTermsAccepted;

  // Check if form can be published
  const canPublish =
    allLegalChecked &&
    formData.files.length > 0 &&
    !eszettCheck.hasAny;

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
        {error && uploadStatus === "idle" && (
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

              {/* Eszett (ß) Warning */}
              {eszettCheck.hasAny && (
                <div className="rounded-xl border border-[var(--color-warning)]/50 bg-[var(--color-warning)]/10 p-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-[var(--color-warning)]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--color-warning)]">
                        Eszett (ß) gefunden
                      </h4>
                      <p className="mt-1 text-sm text-[var(--color-text)]">
                        Ihr Text enthält {eszettCheck.totalCount} Eszett-Zeichen (ß).
                        In der Schweiz wird stattdessen &quot;ss&quot; verwendet.
                      </p>
                      {eszettCheck.title.hasEszett && (
                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                          Titel: {eszettCheck.title.count}x gefunden
                        </p>
                      )}
                      {eszettCheck.description.hasEszett && (
                        <p className="text-xs text-[var(--color-text-muted)]">
                          Beschreibung: {eszettCheck.description.count}x gefunden
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={handleFixEszett}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[var(--color-warning)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-warning)]/90 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Automatisch zu &quot;ss&quot; ändern
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Curriculum */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[var(--color-text)]">Lehrplan-Zuordnung</h2>

              <CurriculumSelector
                cycle={formData.cycle}
                subject={formData.subject}
                canton={formData.canton}
                competencies={formData.competencies}
                lehrmittelIds={formData.lehrmittelIds}
                onCycleChange={(cycle) => updateFormData("cycle", cycle)}
                onSubjectChange={(subject) => updateFormData("subject", subject)}
                onCantonChange={(canton) => updateFormData("canton", canton)}
                onCompetenciesChange={(competencies) => updateFormData("competencies", competencies)}
                onLehrmittelChange={(lehrmittelIds) => updateFormData("lehrmittelIds", lehrmittelIds)}
              />
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

              {/* Legal Copyright Confirmations */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--color-text)]">
                  <svg className="h-5 w-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Rechtliche Bestätigungen
                </h3>
                <p className="mb-4 text-sm text-[var(--color-text-muted)]">
                  Bitte bestätigen Sie die folgenden Punkte, um Ihre Ressource zu veröffentlichen:
                </p>

                <div className="space-y-4">
                  {/* Own Content */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--color-bg)]">
                    <input
                      type="checkbox"
                      checked={formData.legalOwnContent}
                      onChange={(e) => updateFormData("legalOwnContent", e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                    <div>
                      <div className="font-medium text-[var(--color-text)]">
                        Eigene Inhalte oder CC0-Lizenz
                      </div>
                      <div className="text-sm text-[var(--color-text-muted)]">
                        Ich habe alle Bilder, Grafiken und Texte selbst erstellt oder verwende nur
                        Materialien mit CC0-Lizenz (Public Domain).
                      </div>
                    </div>
                  </label>

                  {/* No Textbook Scans */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--color-bg)]">
                    <input
                      type="checkbox"
                      checked={formData.legalNoTextbookScans}
                      onChange={(e) => updateFormData("legalNoTextbookScans", e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                    <div>
                      <div className="font-medium text-[var(--color-text)]">
                        Keine Lehrmittel-Scans
                      </div>
                      <div className="text-sm text-[var(--color-text-muted)]">
                        Ich habe keine Seiten aus Lehrmitteln, Schulbüchern oder anderen
                        urheberrechtlich geschützten Werken eingescannt oder kopiert.
                      </div>
                    </div>
                  </label>

                  {/* No Trademarks */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--color-bg)]">
                    <input
                      type="checkbox"
                      checked={formData.legalNoTrademarks}
                      onChange={(e) => updateFormData("legalNoTrademarks", e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                    <div>
                      <div className="font-medium text-[var(--color-text)]">
                        Keine geschützten Marken oder Charaktere
                      </div>
                      <div className="text-sm text-[var(--color-text-muted)]">
                        Meine Ressource enthält keine geschützten Marken, Logos oder Figuren
                        (z.B. Disney, Marvel, Pokémon, etc.).
                      </div>
                    </div>
                  </label>

                  {/* Swiss German */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--color-bg)]">
                    <input
                      type="checkbox"
                      checked={formData.legalSwissGerman}
                      onChange={(e) => updateFormData("legalSwissGerman", e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                    <div>
                      <div className="font-medium text-[var(--color-text)]">
                        Schweizer Rechtschreibung
                      </div>
                      <div className="text-sm text-[var(--color-text-muted)]">
                        Meine Ressource verwendet die Schweizer Rechtschreibung (kein Eszett &quot;ß&quot;,
                        stattdessen &quot;ss&quot;).
                      </div>
                    </div>
                  </label>

                  {/* Terms Accepted */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border-t border-[var(--color-border)] p-3 pt-4 transition-colors hover:bg-[var(--color-bg)]">
                    <input
                      type="checkbox"
                      checked={formData.legalTermsAccepted}
                      onChange={(e) => updateFormData("legalTermsAccepted", e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                    <div>
                      <div className="font-medium text-[var(--color-text)]">
                        Verkäufervereinbarung akzeptieren
                      </div>
                      <div className="text-sm text-[var(--color-text-muted)]">
                        Ich akzeptiere die{" "}
                        <Link href="/terms" className="text-[var(--color-primary)] hover:underline">
                          Verkäufervereinbarung
                        </Link>{" "}
                        und bestätige, dass ich die Rechte habe, diese Ressource zu verkaufen.
                      </div>
                    </div>
                  </label>
                </div>

                {/* Validation Summary */}
                {!allLegalChecked && (
                  <div className="mt-4 rounded-lg bg-[var(--color-warning)]/10 p-3 text-sm text-[var(--color-warning)]">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Bitte bestätigen Sie alle Punkte, um fortzufahren.
                    </div>
                  </div>
                )}

                {eszettCheck.hasAny && (
                  <div className="mt-4 rounded-lg bg-[var(--color-error)]/10 p-3 text-sm text-[var(--color-error)]">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Ihr Titel oder Beschreibung enthält noch Eszett-Zeichen (ß). Bitte korrigieren Sie dies in Schritt 1.
                    </div>
                  </div>
                )}
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
                disabled={!canPublish || uploadStatus !== "idle"}
                className="rounded-lg bg-gradient-to-r from-[var(--color-success)] to-[var(--color-info)] px-8 py-3 font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-[var(--color-success)]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
              >
                Veröffentlichen
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

      {/* Upload Progress / Success / Error Modal */}
      {uploadStatus !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-[var(--color-surface)] p-8 shadow-2xl">
            {/* Uploading State */}
            {uploadStatus === "uploading" && (
              <div className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)]" />
                <h3 className="mb-2 text-xl font-semibold text-[var(--color-text)]">
                  Wird hochgeladen...
                </h3>
                <p className="mb-4 text-sm text-[var(--color-text-muted)]">
                  Bitte warten Sie, dies kann einen Moment dauern.
                </p>
                {/* Progress bar */}
                <div className="h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-success)] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">{uploadProgress}%</p>
              </div>
            )}

            {/* Success State */}
            {uploadStatus === "success" && (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success)]/20">
                  <svg className="h-8 w-8 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[var(--color-text)]">
                  Ressource erfolgreich erstellt!
                </h3>
                <p className="mb-4 text-sm text-[var(--color-text-muted)]">
                  Ihre Ressource wurde hochgeladen und wartet auf Freigabe durch unser Team.
                </p>
                <div className="rounded-lg bg-[var(--color-info)]/10 p-3 text-sm text-[var(--color-info)]">
                  <p>Sie werden in Kürze zum Dashboard weitergeleitet...</p>
                </div>
                {createdResourceId && (
                  <button
                    onClick={() => router.push(`/resources/${createdResourceId}`)}
                    className="mt-4 rounded-lg bg-[var(--color-primary)] px-6 py-2 font-medium text-white hover:bg-[var(--color-primary)]/90 transition-colors"
                  >
                    Zur Ressource
                  </button>
                )}
              </div>
            )}

            {/* Error State */}
            {uploadStatus === "error" && (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-error)]/20">
                  <svg className="h-8 w-8 text-[var(--color-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[var(--color-text)]">
                  Fehler beim Hochladen
                </h3>
                <p className="mb-4 text-sm text-[var(--color-error)]">
                  {error || "Ein unbekannter Fehler ist aufgetreten."}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setUploadStatus("idle");
                      setError(null);
                    }}
                    className="rounded-lg border border-[var(--color-border)] px-6 py-2 font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                  >
                    Zurück
                  </button>
                  <button
                    onClick={handlePublish}
                    className="rounded-lg bg-[var(--color-primary)] px-6 py-2 font-medium text-white hover:bg-[var(--color-primary)]/90 transition-colors"
                  >
                    Erneut versuchen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
