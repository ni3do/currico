"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { CurriculumSelector } from "@/components/upload/CurriculumSelector";
import { checkForEszett, replaceEszett } from "@/lib/validations/swiss-quality";

type Step = 1 | 2 | 3 | 4;

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function UploadPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileLoadingProgress, setFileLoadingProgress] = useState(0);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
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
    if (files && files.length > 0) {
      setIsLoadingFiles(true);
      setFileLoadingProgress(0);

      const fileArray = Array.from(files);
      const totalSize = fileArray.reduce((acc, file) => acc + file.size, 0);
      let loadedSize = 0;

      // Read each file to track progress
      const readPromises = fileArray.map((file) => {
        return new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onprogress = (event) => {
            if (event.lengthComputable) {
              const currentLoaded = loadedSize + event.loaded;
              const progress = Math.round((currentLoaded / totalSize) * 100);
              setFileLoadingProgress(progress);
            }
          };
          reader.onload = () => {
            loadedSize += file.size;
            setFileLoadingProgress(Math.round((loadedSize / totalSize) * 100));
            resolve();
          };
          reader.onerror = () => resolve();
          reader.readAsArrayBuffer(file);
        });
      });

      Promise.all(readPromises).then(() => {
        setFormData((prev) => ({ ...prev, files: fileArray }));
        setFileLoadingProgress(100);
        setTimeout(() => {
          setIsLoadingFiles(false);
          setFileLoadingProgress(0);
        }, 500);
      });
    }
  };

  const handlePreviewFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData((prev) => ({ ...prev, previewFiles: Array.from(files) }));
    }
  };

  const handleFilePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");
    // Clean up the URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
    setUploadProgress(0);

    // Validate required fields first
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
      formData.priceType === "free" ? 0 : Math.round(parseFloat(formData.price || "0") * 100);
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

    // Use XMLHttpRequest for real progress tracking
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          setUploadProgress(100);
          setUploadStatus("success");
          setCreatedResourceId(result.resource?.id);

          // Redirect after a short delay
          setTimeout(() => {
            router.push("/account");
          }, 2000);
        } catch {
          setError("Fehler beim Verarbeiten der Antwort");
          setUploadStatus("error");
        }
      } else {
        try {
          const result = JSON.parse(xhr.responseText);
          setError(result.error || "Fehler beim Hochladen");
        } catch {
          setError(`Fehler beim Hochladen (Status: ${xhr.status})`);
        }
        setUploadStatus("error");
      }
    });

    xhr.addEventListener("error", () => {
      setError("Netzwerkfehler: Bitte überprüfen Sie Ihre Internetverbindung");
      setUploadStatus("error");
    });

    xhr.addEventListener("abort", () => {
      setError("Upload wurde abgebrochen");
      setUploadStatus("error");
    });

    xhr.open("POST", "/api/resources");
    xhr.send(apiFormData);
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
  const canPublish = allLegalChecked && formData.files.length > 0 && !eszettCheck.hasAny;

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text">Ressource hochladen</h1>
          <p className="mt-2 text-text-muted">
            Teilen Sie Ihre Unterrichtsmaterialien mit anderen Lehrpersonen
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all ${
                      step <= currentStep
                        ? "border-primary bg-primary text-text-on-accent"
                        : "border-border bg-surface text-text-muted"
                    }`}
                  >
                    {step}
                  </div>
                  <span className="mt-2 text-xs whitespace-nowrap text-text-muted">
                    {step === 1 && "Basics"}
                    {step === 2 && "Lehrplan"}
                    {step === 3 && "Preis"}
                    {step === 4 && "Dateien"}
                  </span>
                </div>
                {step < 4 && (
                  <div
                    className={`mx-3 mb-6 h-0.5 w-16 sm:mx-4 sm:w-24 ${
                      step < currentStep ? "bg-primary" : "bg-border"
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
        <div className="rounded-2xl border border-border bg-surface p-8">
          {/* Step 1: Basics */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-text">Grundinformationen</h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Titel *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-faint focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="z.B. Bruchrechnen Übungsblätter"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Kurzbeschreibung *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-faint focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="Beschreiben Sie Ihre Ressource in 2-3 Sätzen..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-text">
                    Sprache *
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => updateFormData("language", e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  >
                    <option value="de">Deutsch</option>
                    <option value="fr">Französisch</option>
                    <option value="it">Italienisch</option>
                    <option value="en">Englisch</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-text">
                    Ressourcentyp *
                  </label>
                  <select
                    value={formData.resourceType}
                    onChange={(e) => updateFormData("resourceType", e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
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
                <div className="rounded-xl border border-warning/50 bg-warning/10 p-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-warning"
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
                      <h4 className="font-medium text-warning">
                        Eszett (ß) gefunden
                      </h4>
                      <p className="mt-1 text-sm text-text">
                        Ihr Text enthält {eszettCheck.totalCount} Eszett-Zeichen (ß). In der Schweiz
                        wird stattdessen &quot;ss&quot; verwendet.
                      </p>
                      {eszettCheck.title.hasEszett && (
                        <p className="mt-1 text-xs text-text-muted">
                          Titel: {eszettCheck.title.count}x gefunden
                        </p>
                      )}
                      {eszettCheck.description.hasEszett && (
                        <p className="text-xs text-text-muted">
                          Beschreibung: {eszettCheck.description.count}x gefunden
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={handleFixEszett}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-warning px-4 py-2 text-sm font-medium text-text-on-accent transition-colors hover:bg-warning/90"
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
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
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
              <h2 className="text-xl font-semibold text-text">Lehrplan-Zuordnung</h2>

              <CurriculumSelector
                cycle={formData.cycle}
                subject={formData.subject}
                canton={formData.canton}
                competencies={formData.competencies}
                lehrmittelIds={formData.lehrmittelIds}
                onCycleChange={(cycle) => updateFormData("cycle", cycle)}
                onSubjectChange={(subject) => updateFormData("subject", subject)}
                onCantonChange={(canton) => updateFormData("canton", canton)}
                onCompetenciesChange={(competencies) =>
                  updateFormData("competencies", competencies)
                }
                onLehrmittelChange={(lehrmittelIds) =>
                  updateFormData("lehrmittelIds", lehrmittelIds)
                }
              />
            </div>
          )}

          {/* Step 3: Properties */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-text">
                Eigenschaften & Preis
              </h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Preistyp *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      formData.priceType === "free"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-bg"
                    }`}
                  >
                    <input
                      type="radio"
                      name="priceType"
                      value="free"
                      checked={formData.priceType === "free"}
                      onChange={(e) => updateFormData("priceType", e.target.value)}
                      className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <div>
                      <div className="font-medium text-text">Kostenlos</div>
                      <div className="text-xs text-text-muted">Frei zugänglich</div>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      formData.priceType === "paid"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-bg"
                    }`}
                  >
                    <input
                      type="radio"
                      name="priceType"
                      value="paid"
                      checked={formData.priceType === "paid"}
                      onChange={(e) => updateFormData("priceType", e.target.value)}
                      className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <div>
                      <div className="font-medium text-text">Kostenpflichtig</div>
                      <div className="text-xs text-text-muted">Preis festlegen</div>
                    </div>
                  </label>
                </div>
              </div>

              {formData.priceType === "paid" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-text">
                    Preis (CHF) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => updateFormData("price", e.target.value)}
                      min="0"
                      step="0.50"
                      className="w-full rounded-xl border border-border bg-bg px-4 py-3 pl-12 text-text placeholder:text-text-faint focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      placeholder="12.00"
                    />
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted">
                      CHF
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
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
                    className="h-4 w-4 rounded border-border bg-bg text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <div>
                    <div className="text-sm font-medium text-text">Editierbar</div>
                    <div className="text-xs text-text-muted">
                      Käufer können die Datei bearbeiten (z.B. Word-Dokument)
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Lizenzumfang *
                </label>
                <select
                  value={formData.licenseScope}
                  onChange={(e) => updateFormData("licenseScope", e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <option value="individual">Einzellizenz</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Files */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-text">Dateien & Vorschau</h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Hauptdatei(en) *
                </label>
                {/* Loading state with progress bar */}
                {isLoadingFiles && (
                  <div className="rounded-xl border-2 border-primary bg-primary/5 p-8">
                    <div className="text-center">
                      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                      <p className="mb-4 text-sm font-medium text-text">
                        Datei wird geladen...
                      </p>
                      {/* Progress bar */}
                      <div className="mx-auto max-w-xs">
                        <div className="h-3 overflow-hidden rounded-full bg-border">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-success transition-all duration-300 ease-out"
                            style={{ width: `${fileLoadingProgress}%` }}
                          />
                        </div>
                        <p className="mt-2 text-sm font-medium text-primary">
                          {fileLoadingProgress}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {!isLoadingFiles && formData.files.length === 0 && (
                  <div
                    onClick={() => mainFileInputRef.current?.click()}
                    className="cursor-pointer rounded-xl border-2 border-dashed border-border bg-bg p-8 text-center transition-colors hover:border-primary"
                  >
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
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-text">
                      Klicken Sie hier oder ziehen Sie Dateien hinein
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      PDF, Word, PowerPoint, Excel bis 50 MB
                    </p>
                    <input
                      ref={mainFileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                      onChange={handleMainFilesChange}
                    />
                  </div>
                )}
                {!isLoadingFiles && formData.files.length > 0 && (
                  <div className="rounded-xl border-2 border-primary bg-primary/5 p-4">
                    <div className="space-y-3">
                      {formData.files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-surface-elevated"
                        >
                          <div
                            className="flex flex-1 cursor-pointer items-center gap-4"
                            onClick={() => handleFilePreview(file)}
                            title="Klicken zum Öffnen"
                          >
                            <div className="flex-shrink-0">
                              {file.type === "application/pdf" ? (
                                <svg
                                  className="h-10 w-10 text-red-500"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 13H10v4.5a.5.5 0 0 1-1 0V14H8.5a.5.5 0 0 1 0-1zm2.5.5a.5.5 0 0 1 .5-.5h1c.83 0 1.5.67 1.5 1.5v2c0 .83-.67 1.5-1.5 1.5h-1a.5.5 0 0 1-.5-.5v-4zm1 .5v3h.5a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5H12zm3 0h1.5a.5.5 0 0 1 0 1H16v1h.5a.5.5 0 0 1 0 1H16v1a.5.5 0 0 1-1 0v-3.5a.5.5 0 0 1 .5-.5h.5z" />
                                </svg>
                              ) : file.type.includes("word") ||
                                file.name.endsWith(".doc") ||
                                file.name.endsWith(".docx") ? (
                                <svg
                                  className="h-10 w-10 text-blue-600"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM7 17l1.5-6h1l1 4 1-4h1l1.5 6h-1l-1-4-1 4h-1l-1-4-1 4H7z" />
                                </svg>
                              ) : file.type.includes("powerpoint") ||
                                file.name.endsWith(".ppt") ||
                                file.name.endsWith(".pptx") ? (
                                <svg
                                  className="h-10 w-10 text-orange-500"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM9 13h2.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5H10v2H9v-5zm1 2h1.5a.5.5 0 0 0 0-1H10v1z" />
                                </svg>
                              ) : file.type.includes("excel") ||
                                file.name.endsWith(".xls") ||
                                file.name.endsWith(".xlsx") ? (
                                <svg
                                  className="h-10 w-10 text-green-600"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM9 13l1.5 2.5L9 18h1.2l1-1.7 1 1.7h1.2l-1.5-2.5L13.4 13h-1.2l-1 1.7-1-1.7H9z" />
                                </svg>
                              ) : (
                                <svg
                                  className="h-10 w-10 text-text-muted"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4z" />
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-text">
                                {file.name}
                              </p>
                              <p className="text-xs text-text-muted">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            {/* External link icon to indicate clickable */}
                            <svg
                              className="h-4 w-4 flex-shrink-0 text-text-muted"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData((prev) => ({
                                ...prev,
                                files: prev.files.filter((_, i) => i !== index),
                              }));
                            }}
                            className="flex-shrink-0 rounded-lg p-2 text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                          >
                            <svg
                              className="h-5 w-5"
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
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => mainFileInputRef.current?.click()}
                      className="mt-3 w-full rounded-lg border border-dashed border-border bg-bg p-3 text-sm text-text-muted transition-colors hover:border-primary hover:text-primary"
                    >
                      + Weitere Datei hinzufugen
                    </button>
                    <input
                      ref={mainFileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                      onChange={handleMainFilesChange}
                    />
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-success/30 bg-success/5 p-4">
                <div className="flex gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-success"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-text">
                    <strong>Automatische Vorschau:</strong> Fur PDF-Dateien wird automatisch eine
                    Vorschau aus der ersten Seite erstellt. Sie mussen kein separates Vorschaubild
                    hochladen.
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Eigenes Vorschaubild (optional)
                </label>
                <p className="mb-2 text-xs text-text-muted">
                  Falls Sie ein eigenes Vorschaubild verwenden mochten, konnen Sie es hier
                  hochladen.
                </p>
                <div
                  onClick={() => previewFileInputRef.current?.click()}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-border bg-bg p-6 text-center transition-colors hover:border-primary"
                >
                  <svg
                    className="mx-auto h-10 w-10 text-text-muted"
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
                  <p className="mt-2 text-sm text-text-muted">PNG, JPG bis 5 MB</p>
                  {formData.previewFiles.length > 0 && (
                    <p className="mt-2 text-sm font-medium text-primary">
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

              <div className="rounded-xl border border-border bg-bg p-4">
                <div className="flex gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-info"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-text-muted">
                    <strong className="text-text">Hinweis:</strong> Die vollständigen
                    Dateien sind nur für Käufer zugänglich. Die Vorschau zeigt nur die erste Seite.
                  </div>
                </div>
              </div>

              {/* Legal Copyright Confirmations */}
              <div className="rounded-xl border border-border bg-surface-elevated p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Rechtliche Bestätigungen
                </h3>
                <p className="mb-4 text-sm text-text-muted">
                  Bitte bestätigen Sie die folgenden Punkte, um Ihre Ressource zu veröffentlichen:
                </p>

                <div className="space-y-4">
                  {/* Own Content */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-bg">
                    <input
                      type="checkbox"
                      checked={formData.legalOwnContent}
                      onChange={(e) => updateFormData("legalOwnContent", e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-border bg-bg text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <div>
                      <div className="font-medium text-text">
                        Eigene Inhalte oder CC0-Lizenz
                      </div>
                      <div className="text-sm text-text-muted">
                        Ich habe alle Bilder, Grafiken und Texte selbst erstellt oder verwende nur
                        Materialien mit CC0-Lizenz (Public Domain).
                      </div>
                    </div>
                  </label>

                  {/* No Textbook Scans */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-bg">
                    <input
                      type="checkbox"
                      checked={formData.legalNoTextbookScans}
                      onChange={(e) => updateFormData("legalNoTextbookScans", e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-border bg-bg text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <div>
                      <div className="font-medium text-text">
                        Keine Lehrmittel-Scans
                      </div>
                      <div className="text-sm text-text-muted">
                        Ich habe keine Seiten aus Lehrmitteln, Schulbüchern oder anderen
                        urheberrechtlich geschützten Werken eingescannt oder kopiert.
                      </div>
                    </div>
                  </label>

                  {/* No Trademarks */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-bg">
                    <input
                      type="checkbox"
                      checked={formData.legalNoTrademarks}
                      onChange={(e) => updateFormData("legalNoTrademarks", e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-border bg-bg text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <div>
                      <div className="font-medium text-text">
                        Keine geschützten Marken oder Charaktere
                      </div>
                      <div className="text-sm text-text-muted">
                        Meine Ressource enthält keine geschützten Marken, Logos oder Figuren (z.B.
                        Disney, Marvel, Pokémon, etc.).
                      </div>
                    </div>
                  </label>

                  {/* Swiss German */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-bg">
                    <input
                      type="checkbox"
                      checked={formData.legalSwissGerman}
                      onChange={(e) => updateFormData("legalSwissGerman", e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-border bg-bg text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <div>
                      <div className="font-medium text-text">
                        Schweizer Rechtschreibung
                      </div>
                      <div className="text-sm text-text-muted">
                        Meine Ressource verwendet die Schweizer Rechtschreibung (kein Eszett
                        &quot;ß&quot;, stattdessen &quot;ss&quot;).
                      </div>
                    </div>
                  </label>

                  {/* Terms Accepted */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border-t border-border p-3 pt-4 transition-colors hover:bg-bg">
                    <input
                      type="checkbox"
                      checked={formData.legalTermsAccepted}
                      onChange={(e) => updateFormData("legalTermsAccepted", e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-border bg-bg text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <div>
                      <div className="font-medium text-text">
                        Verkäufervereinbarung akzeptieren
                      </div>
                      <div className="text-sm text-text-muted">
                        Ich akzeptiere die{" "}
                        <Link href="/terms" className="text-primary hover:underline">
                          Verkäufervereinbarung
                        </Link>{" "}
                        und bestätige, dass ich die Rechte habe, diese Ressource zu verkaufen.
                      </div>
                    </div>
                  </label>
                </div>

                {/* Validation Summary */}
                {!allLegalChecked && (
                  <div className="mt-4 rounded-lg bg-warning/10 p-3 text-sm text-warning">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Bitte bestätigen Sie alle Punkte, um fortzufahren.
                    </div>
                  </div>
                )}

                {eszettCheck.hasAny && (
                  <div className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Ihr Titel oder Beschreibung enthält noch Eszett-Zeichen (ß). Bitte korrigieren
                      Sie dies in Schritt 1.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between border-t border-border pt-6">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="rounded-lg border border-border px-6 py-3 font-medium text-text transition-colors hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-50"
            >
              Zurück
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="rounded-lg bg-primary px-8 py-3 font-semibold text-text-on-accent shadow-primary/20 shadow-lg transition-colors hover:bg-primary-hover"
              >
                Weiter
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={!canPublish || uploadStatus !== "idle"}
                className="rounded-lg bg-primary px-8 py-3 font-semibold text-text-on-accent shadow-primary/20 shadow-lg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Veröffentlichen
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Upload Progress / Success / Error Modal */}
      {uploadStatus !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-surface p-8 shadow-2xl">
            {/* Uploading State */}
            {uploadStatus === "uploading" && (
              <div className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                <h3 className="mb-2 text-xl font-semibold text-text">
                  Wird hochgeladen...
                </h3>
                <p className="mb-4 text-sm text-text-muted">
                  {formData.files[0]?.name && (
                    <span className="block truncate">
                      {formData.files[0].name} ({(formData.files[0].size / 1024 / 1024).toFixed(2)}{" "}
                      MB)
                    </span>
                  )}
                  Bitte warten Sie, dies kann einen Moment dauern.
                </p>
                {/* Progress bar */}
                <div className="h-3 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-success transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm font-medium text-text">
                  {uploadProgress}%
                </p>
              </div>
            )}

            {/* Success State */}
            {uploadStatus === "success" && (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
                  <svg
                    className="h-8 w-8 text-success"
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
                <h3 className="mb-2 text-xl font-semibold text-text">
                  Ressource erfolgreich erstellt!
                </h3>
                <p className="mb-4 text-sm text-text-muted">
                  Ihre Ressource wurde hochgeladen und wartet auf Freigabe durch unser Team.
                </p>
                <div className="rounded-lg bg-info/10 p-3 text-sm text-info">
                  <p>Sie werden in Kürze zum Dashboard weitergeleitet...</p>
                </div>
                {createdResourceId && (
                  <button
                    onClick={() => router.push(`/resources/${createdResourceId}`)}
                    className="mt-4 rounded-lg bg-primary px-6 py-2 font-medium text-text-on-accent transition-colors hover:bg-primary/90"
                  >
                    Zur Ressource
                  </button>
                )}
              </div>
            )}

            {/* Error State */}
            {uploadStatus === "error" && (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/20">
                  <svg
                    className="h-8 w-8 text-error"
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
                </div>
                <h3 className="mb-2 text-xl font-semibold text-text">
                  Fehler beim Hochladen
                </h3>
                <p className="mb-4 text-sm text-error">
                  {error || "Ein unbekannter Fehler ist aufgetreten."}
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setUploadStatus("idle");
                      setError(null);
                    }}
                    className="rounded-lg border border-border px-6 py-2 font-medium text-text transition-colors hover:bg-surface-elevated"
                  >
                    Zurück
                  </button>
                  <button
                    onClick={handlePublish}
                    className="rounded-lg bg-primary px-6 py-2 font-medium text-text-on-accent transition-colors hover:bg-primary/90"
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
