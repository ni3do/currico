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

  // Step validation - returns array of error messages for each step
  const getStepErrors = (step: number): { message: string; field: string }[] => {
    const errors: { message: string; field: string }[] = [];

    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          errors.push({ message: "Titel fehlt", field: "title" });
        }
        if (!formData.description.trim()) {
          errors.push({ message: "Beschreibung fehlt", field: "description" });
        }
        break;
      case 2:
        if (!formData.cycle) {
          errors.push({ message: "Zyklus fehlt", field: "cycle" });
        }
        if (!formData.subject) {
          errors.push({ message: "Fach fehlt", field: "subject" });
        }
        break;
      case 3:
        if (formData.priceType === "paid" && !formData.price) {
          errors.push({ message: "Preis fehlt", field: "price" });
        }
        break;
      case 4:
        if (formData.files.length === 0) {
          errors.push({ message: "Datei fehlt", field: "files" });
        }
        if (!allLegalChecked) {
          errors.push({ message: "Rechtliche Bestätigungen fehlen", field: "legal" });
        }
        break;
    }
    return errors;
  };

  // Check if a step has all required fields filled
  const isStepValid = (step: number): boolean => {
    return getStepErrors(step).length === 0;
  };

  // Get the step number that contains an error (for error modal)
  const getErrorStep = (errorMessage: string): number | null => {
    if (errorMessage.includes("Titel") || errorMessage.includes("Beschreibung")) return 1;
    if (errorMessage.includes("Zyklus") || errorMessage.includes("Fach")) return 2;
    if (errorMessage.includes("Preis")) return 3;
    if (errorMessage.includes("Datei")) return 4;
    return null;
  };

  // Navigate to error step
  const goToErrorStep = () => {
    if (error) {
      const step = getErrorStep(error);
      if (step) {
        setCurrentStep(step as Step);
        setUploadStatus("idle");
        setError(null);
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-text text-3xl font-bold">Ressource hochladen</h1>
          <p className="text-text-muted mt-2">
            Teilen Sie Ihre Unterrichtsmaterialien mit anderen Lehrpersonen
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4].map((step) => {
              const isCompleted = step < currentStep;
              const isCurrent = step === currentStep;
              const isClickable = step < currentStep;
              const stepErrors = getStepErrors(step);
              const hasWarning = isCompleted && stepErrors.length > 0;

              const stepLabels: Record<number, string> = {
                1: "Basics",
                2: "Lehrplan",
                3: "Preis",
                4: "Dateien",
              };

              return (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => isClickable && setCurrentStep(step as Step)}
                      disabled={!isClickable}
                      className={`group relative flex h-12 w-12 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300 ${
                        hasWarning
                          ? "border-warning bg-warning text-text-on-accent hover:shadow-warning/30 cursor-pointer hover:scale-110 hover:shadow-lg"
                          : isCompleted
                            ? "border-success bg-success text-text-on-accent hover:shadow-success/30 cursor-pointer hover:scale-110 hover:shadow-lg"
                            : isCurrent
                              ? "border-primary bg-primary text-text-on-accent shadow-primary/30 ring-primary/20 scale-110 shadow-lg ring-4"
                              : "border-border bg-surface text-text-muted cursor-not-allowed"
                      }`}
                      aria-label={`${stepLabels[step]}${hasWarning ? " (unvollständig)" : isCompleted ? " (abgeschlossen)" : isCurrent ? " (aktuell)" : ""}`}
                    >
                      {hasWarning ? (
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : isCompleted ? (
                        <svg
                          className="h-6 w-6 animate-[bounceIn_0.3s_ease-out]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <span className={isCurrent ? "animate-pulse" : ""}>{step}</span>
                      )}
                      {/* Tooltip for clickable steps */}
                      {isClickable && (
                        <span className="bg-surface-elevated text-text absolute -bottom-8 left-1/2 -translate-x-1/2 rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                          {hasWarning
                            ? `${stepLabels[step]} vervollständigen`
                            : `Zurück zu ${stepLabels[step]}`}
                        </span>
                      )}
                    </button>
                    <span
                      className={`mt-3 text-xs font-medium whitespace-nowrap transition-colors duration-300 ${
                        hasWarning
                          ? "text-warning"
                          : isCompleted
                            ? "text-success"
                            : isCurrent
                              ? "text-primary font-semibold"
                              : "text-text-muted"
                      }`}
                    >
                      {stepLabels[step]}
                    </span>
                  </div>
                  {step < 4 && (
                    <div className="bg-border relative mx-3 mb-6 h-1 w-16 overflow-hidden rounded-full sm:mx-4 sm:w-24">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${
                          step < currentStep
                            ? hasWarning
                              ? "from-warning to-warning w-full bg-gradient-to-r"
                              : "from-success to-success w-full bg-gradient-to-r"
                            : step === currentStep
                              ? "from-primary to-primary/50 w-1/2 bg-gradient-to-r"
                              : "w-0"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Progress text */}
          <p className="text-text-muted mt-4 text-center text-sm">
            Schritt {currentStep} von 4{currentStep === 4 && " – Fast geschafft!"}
          </p>
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
        <div className="border-border bg-surface rounded-2xl border p-8">
          {/* Step 1: Basics */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-text text-xl font-semibold">Grundinformationen</h2>

              <div>
                <label className="text-text mb-2 block text-sm font-medium">Titel *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  required
                  className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                  placeholder="z.B. Bruchrechnen Übungsblätter Zyklus 2"
                />
              </div>

              <div>
                <label className="text-text mb-2 block text-sm font-medium">
                  Kurzbeschreibung *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  required
                  rows={4}
                  className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                  placeholder="Beschreiben Sie Ihre Ressource kurz..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-text mb-2 block text-sm font-medium">Sprache *</label>
                  <select
                    value={formData.language}
                    onChange={(e) => updateFormData("language", e.target.value)}
                    className="border-border bg-bg text-text focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                  >
                    <option value="de">Deutsch</option>
                    <option value="en">Englisch</option>
                    <option value="fr">Französisch</option>
                    <option value="it">Italienisch</option>
                  </select>
                  <p className="text-text-faint mt-1 text-xs">Sprache des Inhalts</p>
                </div>

                <div>
                  <label className="text-text mb-2 block text-sm font-medium">
                    Ressourcentyp *
                  </label>
                  <select
                    value={formData.resourceType}
                    onChange={(e) => updateFormData("resourceType", e.target.value)}
                    className="border-border bg-bg text-text focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                  >
                    <option value="pdf">PDF</option>
                    <option value="word">Word</option>
                    <option value="powerpoint">PowerPoint</option>
                    <option value="excel">Excel</option>
                    <option value="other">Andere</option>
                  </select>
                  <p className="text-text-faint mt-1 text-xs">Dateiformat der Ressource</p>
                </div>
              </div>

              {/* Eszett (ß) Warning */}
              {eszettCheck.hasAny && (
                <div className="border-warning/50 bg-warning/10 rounded-xl border p-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="text-warning h-5 w-5 flex-shrink-0"
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
                      <h4 className="text-warning font-medium">Eszett (ß) gefunden</h4>
                      <p className="text-text mt-1 text-sm">
                        Ihr Text enthält {eszettCheck.totalCount} Eszett-Zeichen (ß). In der Schweiz
                        wird stattdessen &quot;ss&quot; verwendet.
                      </p>
                      {eszettCheck.title.hasEszett && (
                        <p className="text-text-muted mt-1 text-xs">
                          Titel: {eszettCheck.title.count}x gefunden
                        </p>
                      )}
                      {eszettCheck.description.hasEszett && (
                        <p className="text-text-muted text-xs">
                          Beschreibung: {eszettCheck.description.count}x gefunden
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={handleFixEszett}
                        className="bg-warning text-text-on-accent hover:bg-warning/90 mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
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
              <h2 className="text-text text-xl font-semibold">Lehrplan-Zuordnung</h2>

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
              <h2 className="text-text text-xl font-semibold">Eigenschaften & Preis</h2>

              <div>
                <label className="text-text mb-2 block text-sm font-medium">Preistyp *</label>
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
                      className="text-primary focus:ring-primary/20 h-4 w-4 focus:ring-2"
                    />
                    <div>
                      <div className="text-text font-medium">Kostenlos</div>
                      <div className="text-text-muted text-xs">Frei zugänglich</div>
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
                      className="text-primary focus:ring-primary/20 h-4 w-4 focus:ring-2"
                    />
                    <div>
                      <div className="text-text font-medium">Kostenpflichtig</div>
                      <div className="text-text-muted text-xs">Preis festlegen</div>
                    </div>
                  </label>
                </div>
              </div>

              {formData.priceType === "paid" && (
                <div>
                  <label className="text-text mb-2 block text-sm font-medium">Preis (CHF) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => updateFormData("price", e.target.value)}
                      min="0"
                      max="25"
                      step="0.50"
                      className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 pl-12 focus:ring-2 focus:outline-none"
                      placeholder="z.B. 12.00"
                    />
                    <span className="text-text-muted absolute top-1/2 left-4 -translate-y-1/2">
                      CHF
                    </span>
                  </div>
                  <p className="text-text-muted mt-1 text-xs">
                    Sie erhalten 70% des Verkaufspreises (30% Plattformgebühr)
                  </p>
                </div>
              )}

              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.editable}
                    onChange={(e) => updateFormData("editable", e.target.checked)}
                    className="border-border bg-bg text-primary focus:ring-primary/20 h-4 w-4 rounded focus:ring-2"
                  />
                  <div>
                    <div className="text-text text-sm font-medium">Editierbar</div>
                    <div className="text-text-muted text-xs">
                      Käufer können die Datei bearbeiten (z.B. Word-Dokument)
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Files */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-text text-xl font-semibold">Dateien & Vorschau</h2>

              <div>
                <label className="text-text mb-2 block text-sm font-medium">Hauptdatei(en) *</label>
                {/* Loading state with progress bar */}
                {isLoadingFiles && (
                  <div className="border-primary bg-primary/5 rounded-xl border-2 p-8">
                    <div className="text-center">
                      <div className="border-primary/30 border-t-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4" />
                      <p className="text-text mb-4 text-sm font-medium">Datei wird geladen...</p>
                      {/* Progress bar */}
                      <div className="mx-auto max-w-xs">
                        <div className="bg-border h-3 overflow-hidden rounded-full">
                          <div
                            className="from-primary to-success h-full bg-gradient-to-r transition-all duration-300 ease-out"
                            style={{ width: `${fileLoadingProgress}%` }}
                          />
                        </div>
                        <p className="text-primary mt-2 text-sm font-medium">
                          {fileLoadingProgress}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {!isLoadingFiles && formData.files.length === 0 && (
                  <div
                    onClick={() => mainFileInputRef.current?.click()}
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
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-text mt-2 text-sm">
                      Klicken Sie hier oder ziehen Sie Dateien hinein
                    </p>
                    <p className="text-text-muted mt-1 text-xs">
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
                  <div className="border-primary bg-primary/5 rounded-xl border-2 p-4">
                    <div className="space-y-3">
                      {formData.files.map((file, index) => (
                        <div
                          key={index}
                          className="border-border bg-surface hover:bg-surface-elevated flex items-center gap-4 rounded-lg border p-3 transition-colors"
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
                                  className="text-text-muted h-10 w-10"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4z" />
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-text truncate text-sm font-medium">{file.name}</p>
                              <p className="text-text-muted text-xs">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            {/* External link icon to indicate clickable */}
                            <svg
                              className="text-text-muted h-4 w-4 flex-shrink-0"
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
                            className="text-text-muted hover:bg-error/10 hover:text-error flex-shrink-0 rounded-lg p-2 transition-colors"
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
                      className="border-border bg-bg text-text-muted hover:border-primary hover:text-primary mt-3 w-full rounded-lg border border-dashed p-3 text-sm transition-colors"
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

              <div className="border-success/30 bg-success/5 rounded-xl border p-4">
                <div className="flex gap-3">
                  <svg
                    className="text-success h-5 w-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-text text-sm">
                    <strong>Automatische Vorschau:</strong> Fur PDF-Dateien wird automatisch eine
                    Vorschau aus der ersten Seite erstellt. Sie mussen kein separates Vorschaubild
                    hochladen.
                  </div>
                </div>
              </div>

              <div>
                <label className="text-text mb-2 block text-sm font-medium">
                  Eigenes Vorschaubild (optional)
                </label>
                <p className="text-text-muted mb-2 text-xs">
                  Falls Sie ein eigenes Vorschaubild verwenden mochten, konnen Sie es hier
                  hochladen.
                </p>
                <div
                  onClick={() => previewFileInputRef.current?.click()}
                  className="border-border bg-bg hover:border-primary cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors"
                >
                  <svg
                    className="text-text-muted mx-auto h-10 w-10"
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
                  <p className="text-text-muted mt-2 text-sm">PNG, JPG bis 5 MB</p>
                  {formData.previewFiles.length > 0 && (
                    <p className="text-primary mt-2 text-sm font-medium">
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

              <div className="border-border bg-bg rounded-xl border p-4">
                <div className="flex gap-3">
                  <svg
                    className="text-info h-5 w-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-text-muted text-sm">
                    <strong className="text-text">Hinweis:</strong> Die vollständigen Dateien sind
                    nur für Käufer zugänglich. Die Vorschau zeigt nur die erste Seite.
                  </div>
                </div>
              </div>

              {/* Legal Copyright Confirmations */}
              <div className="border-border bg-surface-elevated rounded-xl border p-6">
                <h3 className="text-text mb-4 flex items-center gap-2 text-lg font-semibold">
                  <svg
                    className="text-primary h-5 w-5"
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
                <p className="text-text-muted mb-4 text-sm">
                  Bitte bestätigen Sie die folgenden Punkte, um Ihre Ressource zu veröffentlichen:
                </p>

                <div className="space-y-4">
                  {/* Own Content */}
                  <label className="hover:bg-bg flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.legalOwnContent}
                      onChange={(e) => updateFormData("legalOwnContent", e.target.checked)}
                      className="border-border bg-bg text-primary focus:ring-primary/20 mt-0.5 h-5 w-5 rounded focus:ring-2"
                    />
                    <div>
                      <div className="text-text font-medium">Eigene Inhalte oder CC0-Lizenz</div>
                      <div className="text-text-muted text-sm">
                        Ich habe alle Bilder, Grafiken und Texte selbst erstellt oder verwende nur
                        Materialien mit CC0-Lizenz (Public Domain).
                      </div>
                    </div>
                  </label>

                  {/* No Textbook Scans */}
                  <label className="hover:bg-bg flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.legalNoTextbookScans}
                      onChange={(e) => updateFormData("legalNoTextbookScans", e.target.checked)}
                      className="border-border bg-bg text-primary focus:ring-primary/20 mt-0.5 h-5 w-5 rounded focus:ring-2"
                    />
                    <div>
                      <div className="text-text font-medium">Keine Lehrmittel-Scans</div>
                      <div className="text-text-muted text-sm">
                        Ich habe keine Seiten aus Lehrmitteln, Schulbüchern oder anderen
                        urheberrechtlich geschützten Werken eingescannt oder kopiert.
                      </div>
                    </div>
                  </label>

                  {/* No Trademarks */}
                  <label className="hover:bg-bg flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.legalNoTrademarks}
                      onChange={(e) => updateFormData("legalNoTrademarks", e.target.checked)}
                      className="border-border bg-bg text-primary focus:ring-primary/20 mt-0.5 h-5 w-5 rounded focus:ring-2"
                    />
                    <div>
                      <div className="text-text font-medium">
                        Keine geschützten Marken oder Charaktere
                      </div>
                      <div className="text-text-muted text-sm">
                        Meine Ressource enthält keine geschützten Marken, Logos oder Figuren (z.B.
                        Disney, Marvel, Pokémon, etc.).
                      </div>
                    </div>
                  </label>

                  {/* Swiss German */}
                  <label className="hover:bg-bg flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.legalSwissGerman}
                      onChange={(e) => updateFormData("legalSwissGerman", e.target.checked)}
                      className="border-border bg-bg text-primary focus:ring-primary/20 mt-0.5 h-5 w-5 rounded focus:ring-2"
                    />
                    <div>
                      <div className="text-text font-medium">Schweizer Rechtschreibung</div>
                      <div className="text-text-muted text-sm">
                        Meine Ressource verwendet die Schweizer Rechtschreibung (kein Eszett
                        &quot;ß&quot;, stattdessen &quot;ss&quot;).
                      </div>
                    </div>
                  </label>

                  {/* Terms Accepted */}
                  <label className="border-border hover:bg-bg flex cursor-pointer items-start gap-3 rounded-lg border-t p-3 pt-4 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.legalTermsAccepted}
                      onChange={(e) => updateFormData("legalTermsAccepted", e.target.checked)}
                      className="border-border bg-bg text-primary focus:ring-primary/20 mt-0.5 h-5 w-5 rounded focus:ring-2"
                    />
                    <div>
                      <div className="text-text font-medium">Verkäufervereinbarung akzeptieren</div>
                      <div className="text-text-muted text-sm">
                        Ich akzeptiere die{" "}
                        <Link
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Verkäufervereinbarung
                        </Link>{" "}
                        und bestätige, dass ich die Rechte habe, diese Ressource zu verkaufen.
                      </div>
                    </div>
                  </label>
                </div>

                {/* Validation Summary */}
                {!allLegalChecked && (
                  <div className="bg-warning/10 text-warning mt-4 rounded-lg p-3 text-sm">
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
                  <div className="bg-error/10 text-error mt-4 rounded-lg p-3 text-sm">
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
          <div className="border-border mt-8 flex justify-between border-t pt-6">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="border-border text-text hover:bg-surface-elevated rounded-lg border px-6 py-3 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Zurück
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="bg-primary text-text-on-accent shadow-primary/20 hover:bg-primary-hover rounded-lg px-8 py-3 font-semibold shadow-lg transition-colors"
              >
                Weiter
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={!canPublish || uploadStatus !== "idle"}
                className="bg-primary text-text-on-accent shadow-primary/20 hover:bg-primary-hover rounded-lg px-8 py-3 font-semibold shadow-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="bg-surface mx-4 w-full max-w-md rounded-2xl p-8 shadow-2xl">
            {/* Uploading State */}
            {uploadStatus === "uploading" && (
              <div className="text-center">
                <div className="border-primary/30 border-t-primary mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4" />
                <h3 className="text-text mb-2 text-xl font-semibold">Wird hochgeladen...</h3>
                <p className="text-text-muted mb-4 text-sm">
                  {formData.files[0]?.name && (
                    <span className="block truncate">
                      {formData.files[0].name} ({(formData.files[0].size / 1024 / 1024).toFixed(2)}{" "}
                      MB)
                    </span>
                  )}
                  Bitte warten Sie, dies kann einen Moment dauern.
                </p>
                {/* Progress bar */}
                <div className="bg-border h-3 overflow-hidden rounded-full">
                  <div
                    className="from-primary to-success h-full bg-gradient-to-r transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-text mt-2 text-sm font-medium">{uploadProgress}%</p>
              </div>
            )}

            {/* Success State */}
            {uploadStatus === "success" && (
              <div className="text-center">
                <div className="bg-success/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <svg
                    className="text-success h-8 w-8"
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
                <h3 className="text-text mb-2 text-xl font-semibold">
                  Ressource erfolgreich erstellt!
                </h3>
                <p className="text-text-muted mb-4 text-sm">
                  Ihre Ressource wurde hochgeladen und wartet auf Freigabe durch unser Team.
                </p>
                <div className="bg-info/10 text-info rounded-lg p-3 text-sm">
                  <p>Sie werden in Kürze zum Dashboard weitergeleitet...</p>
                </div>
                {createdResourceId && (
                  <button
                    onClick={() => router.push(`/resources/${createdResourceId}`)}
                    className="bg-primary text-text-on-accent hover:bg-primary/90 mt-4 rounded-lg px-6 py-2 font-medium transition-colors"
                  >
                    Zur Ressource
                  </button>
                )}
              </div>
            )}

            {/* Error State */}
            {uploadStatus === "error" && (
              <div className="text-center">
                <div className="bg-error/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <svg
                    className="text-error h-8 w-8"
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
                <h3 className="text-text mb-2 text-xl font-semibold">Fehler beim Hochladen</h3>
                <p className="text-error mb-4 text-sm">
                  {error || "Ein unbekannter Fehler ist aufgetreten."}
                </p>
                {/* Show which step has the error */}
                {error && getErrorStep(error) && (
                  <div className="bg-warning/10 text-warning mb-4 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Bitte überprüfen Sie Schritt {getErrorStep(error)}:{" "}
                      {
                        { 1: "Basics", 2: "Lehrplan", 3: "Preis", 4: "Dateien" }[
                          getErrorStep(error)!
                        ]
                      }
                    </div>
                  </div>
                )}
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setUploadStatus("idle");
                      setError(null);
                    }}
                    className="border-border text-text hover:bg-surface-elevated rounded-lg border px-6 py-2 font-medium transition-colors"
                  >
                    Schliessen
                  </button>
                  {error && getErrorStep(error) && (
                    <button
                      onClick={goToErrorStep}
                      className="bg-warning text-text-on-accent hover:bg-warning/90 rounded-lg px-6 py-2 font-medium transition-colors"
                    >
                      Zu Schritt {getErrorStep(error)}
                    </button>
                  )}
                  {(!error || !getErrorStep(error)) && (
                    <button
                      onClick={handlePublish}
                      className="bg-primary text-text-on-accent hover:bg-primary/90 rounded-lg px-6 py-2 font-medium transition-colors"
                    >
                      Erneut versuchen
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
