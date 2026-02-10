"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  UploadWizardProvider,
  useUploadWizard,
  StepNavigationBar,
  DraftIndicator,
  DraftRestoredToast,
  EnhancedCurriculumSelector,
  FormField,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  RadioOption,
  FIELD_TOOLTIPS,
} from "@/components/upload";
import { checkForEszett, replaceEszett } from "@/lib/validations/swiss-quality";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  ExternalLink,
  AlertTriangle,
  Check,
  Loader2,
  ClipboardCheck,
  Scale,
} from "lucide-react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

function UploadPageContent() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const tCommon = useTranslations("common");
  const tUpload = useTranslations("uploadWizard.upload");
  const tLegal = useTranslations("uploadWizard.legal");
  const {
    formData,
    updateFormData,
    currentStep,
    goNext,
    goBack,
    touchedFields,
    markFieldTouched,
    markStepTouched,
    getFieldErrors,
    isStepValid,
    files,
    setFiles,
    previewFiles,
    setPreviewFiles,
    hasDraft,
  } = useUploadWizard();

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileLoadingProgress, setFileLoadingProgress] = useState(0);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdMaterialId, setCreatedMaterialId] = useState<string | null>(null);
  const [showDraftToast, setShowDraftToast] = useState(false);

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const previewFileInputRef = useRef<HTMLInputElement>(null);
  const hasShownDraftToast = useRef(false);

  // Detect touch device for mobile-friendly upload area
  const isTouchDevice =
    typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  // Show draft restored toast on mount if draft exists
  useEffect(() => {
    if (hasDraft && formData.title && !hasShownDraftToast.current) {
      hasShownDraftToast.current = true;
      // Use setTimeout to avoid synchronous setState in effect
      const showTimer = setTimeout(() => setShowDraftToast(true), 100);
      const hideTimer = setTimeout(() => setShowDraftToast(false), 5100);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [hasDraft, formData.title]);

  // Eszett validation
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
    updateFormData("title", replaceEszett(formData.title));
    updateFormData("description", replaceEszett(formData.description));
  };

  // File handling
  const handleMainFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setIsLoadingFiles(true);
      setFileLoadingProgress(0);

      const fileArray = Array.from(selectedFiles);
      const totalSize = fileArray.reduce((acc, file) => acc + file.size, 0);
      let loadedSize = 0;

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
        setFiles([...files, ...fileArray]);
        setFileLoadingProgress(100);
        markFieldTouched("files");
        setTimeout(() => {
          setIsLoadingFiles(false);
          setFileLoadingProgress(0);
        }, 500);
      });
    }
  };

  const handlePreviewFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setPreviewFiles(Array.from(selectedFiles));
      markFieldTouched("previewFiles");
    }
  };

  const handleFilePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Navigation with validation
  const handleNext = () => {
    markStepTouched(currentStep);
    if (isStepValid(currentStep)) {
      goNext();
    }
  };

  // Publish
  const handlePublish = async () => {
    setError(null);
    setUploadStatus("uploading");
    setUploadProgress(0);

    // Validate all steps
    for (let step = 1; step <= 4; step++) {
      const errors = getFieldErrors(step as 1 | 2 | 3 | 4);
      if (errors.length > 0) {
        setError(errors[0].message);
        setUploadStatus("error");
        return;
      }
    }

    // Prepare form data
    const apiFormData = new FormData();
    apiFormData.append("title", formData.title);
    apiFormData.append("description", formData.description);
    apiFormData.append("language", formData.language);
    apiFormData.append("dialect", formData.dialect);
    apiFormData.append("resourceType", formData.resourceType);

    const cycleFullName = `Zyklus ${formData.cycle}`;
    apiFormData.append("subjects", JSON.stringify([formData.subjectCode || formData.subject]));
    apiFormData.append("cycles", JSON.stringify([cycleFullName]));

    const priceInCents =
      formData.priceType === "free" ? 0 : Math.round(parseFloat(formData.price || "0") * 100);
    apiFormData.append("price", priceInCents.toString());
    apiFormData.append("is_published", "true");

    if (files[0]) {
      apiFormData.append("file", files[0]);
    }

    if (previewFiles[0]) {
      apiFormData.append("preview", previewFiles[0]);
    }

    // Upload with progress
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          setUploadProgress(100);
          setUploadStatus("success");
          setCreatedMaterialId(result.material?.id);

          // Clear draft on success
          localStorage.removeItem("currico_upload_draft");

          setTimeout(() => {
            router.push("/konto");
          }, 2000);
        } catch {
          setError(tUpload("errorParseResponse"));
          setUploadStatus("error");
        }
      } else {
        // Specific error messages based on HTTP status
        if (xhr.status === 413) {
          const fileSizeMB = files[0] ? (files[0].size / (1024 * 1024)).toFixed(1) : "?";
          setError(tUpload("errorFileTooLarge", { size: fileSizeMB }));
        } else if (xhr.status === 401) {
          setError(tUpload("errorAuthExpired"));
        } else if (xhr.status === 422) {
          try {
            const result = JSON.parse(xhr.responseText);
            setError(tUpload("errorValidation", { details: result.error || result.message || "" }));
          } catch {
            setError(tUpload("errorValidation", { details: "" }));
          }
        } else if (xhr.status >= 500) {
          setError(tUpload("errorServer"));
        } else {
          try {
            const result = JSON.parse(xhr.responseText);
            setError(result.error || tUpload("error"));
          } catch {
            setError(`${tUpload("error")} (Status: ${xhr.status})`);
          }
        }
        setUploadStatus("error");
      }
    });

    xhr.addEventListener("error", () => {
      setError(tUpload("errorNetwork"));
      setUploadStatus("error");
    });

    xhr.open("POST", "/api/materials");
    xhr.send(apiFormData);
  };

  // Get errors for current step
  const currentStepErrors = getFieldErrors(currentStep);
  const getFieldError = (field: string) =>
    currentStepErrors.find((e) => e.field === field)?.message;

  // Check if all legal confirmations are checked
  const allLegalChecked =
    formData.legalOwnContent &&
    formData.legalNoTextbookScans &&
    formData.legalNoTrademarks &&
    formData.legalSwissGerman &&
    formData.legalTermsAccepted;

  const canPublish = allLegalChecked && files.length > 0 && !eszettCheck.hasAny;

  // File type icons
  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else if (file.type.includes("word") || file.name.match(/\.docx?$/)) {
      return <FileText className="h-8 w-8 text-blue-600" />;
    } else if (file.type.includes("powerpoint") || file.name.match(/\.pptx?$/)) {
      return <FileText className="h-8 w-8 text-orange-500" />;
    } else if (file.type.includes("excel") || file.name.match(/\.xlsx?$/)) {
      return <FileText className="h-8 w-8 text-green-600" />;
    }
    return <FileText className="text-text-muted h-8 w-8" />;
  };

  // Auth gate: show login prompt if not authenticated
  if (sessionStatus === "loading") {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-text-muted animate-pulse text-sm">{tUpload("loading")}</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (sessionStatus === "unauthenticated" || !session) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="mx-auto max-w-md text-center">
            <div className="bg-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
              <Upload className="text-primary h-8 w-8" />
            </div>
            <h1 className="text-text text-2xl font-bold">{tUpload("authRequired.title")}</h1>
            <p className="text-text-muted mt-3 text-base leading-relaxed">
              {tUpload("authRequired.description")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/registrieren"
                className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors"
              >
                {tUpload("authRequired.register")}
              </Link>
              <Link
                href="/anmelden"
                className="border-border text-text hover:bg-surface-elevated inline-flex items-center justify-center gap-2 rounded-xl border-2 px-6 py-3 text-sm font-medium transition-colors"
              >
                {tUpload("authRequired.login")}
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div>
          {/* Page Header */}
          <div className="mb-8">
            <Breadcrumb items={[{ label: tCommon("breadcrumb.upload") }]} />
            <h1 className="text-text text-2xl font-bold sm:text-3xl">Material hochladen</h1>
            <p className="text-text-muted mt-1">
              Teilen Sie Ihre Unterrichtsmaterialien mit der Currico-Community
            </p>
          </div>

          {/* Step Navigation */}
          <StepNavigationBar />

          {/* Main Content */}
          <div className="mx-auto max-w-3xl">
            {/* Draft Indicator */}
            <div className="mb-6">
              <DraftIndicator />
            </div>

            {/* Form Card */}
            <div className="border-border bg-surface rounded-2xl border p-6 shadow-lg shadow-black/5 transition-shadow duration-300 hover:shadow-xl sm:p-8">
              {/* Step 1: Basics */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-primary/20 border-b pb-4">
                    <h2 className="text-text text-xl font-semibold">Grundinformationen</h2>
                    <p className="text-text-muted mt-1 text-sm">Beschreiben Sie Ihr Material</p>
                  </div>

                  <FormField
                    label="Titel"
                    tooltipKey="title"
                    required
                    error={getFieldError("title")}
                    touched={touchedFields.title}
                    hint="Wählen Sie einen aussagekräftigen Titel (5-100 Zeichen)"
                  >
                    <FormInput
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateFormData("title", e.target.value)}
                      onBlur={() => markFieldTouched("title")}
                      hasError={touchedFields.title && !!getFieldError("title")}
                      placeholder="z.B. Bruchrechnen Übungsblätter Zyklus 2"
                      maxLength={100}
                    />
                  </FormField>

                  <FormField
                    label="Kurzbeschreibung"
                    tooltipKey="description"
                    required
                    error={getFieldError("description")}
                    touched={touchedFields.description}
                    hint={`${formData.description.length}/2000 Zeichen (min. 20)`}
                  >
                    <FormTextarea
                      value={formData.description}
                      onChange={(e) => updateFormData("description", e.target.value)}
                      onBlur={() => markFieldTouched("description")}
                      hasError={touchedFields.description && !!getFieldError("description")}
                      placeholder="Beschreiben Sie Ihr Material kurz..."
                      rows={4}
                      maxLength={2000}
                    />
                  </FormField>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Sprache" tooltipKey="language" required>
                      <FormSelect
                        value={formData.language}
                        onChange={(e) => {
                          updateFormData("language", e.target.value);
                          // Reset dialect when switching away from German
                          if (e.target.value !== "de") {
                            updateFormData("dialect", "BOTH");
                          }
                        }}
                      >
                        <option value="de">Deutsch</option>
                        <option value="en">Englisch</option>
                        <option value="fr">Französisch</option>
                        <option value="it">Italienisch</option>
                      </FormSelect>
                    </FormField>

                    <FormField label="Materialtyp" tooltipKey="resourceType" required>
                      <FormSelect
                        value={formData.resourceType}
                        onChange={(e) => updateFormData("resourceType", e.target.value)}
                      >
                        <option value="pdf">PDF</option>
                        <option value="word">Word</option>
                        <option value="powerpoint">PowerPoint</option>
                        <option value="excel">Excel</option>
                        <option value="onenote">OneNote</option>
                        <option value="other">Andere</option>
                      </FormSelect>
                    </FormField>
                  </div>

                  {/* Dialect toggle - only shown for German */}
                  {formData.language === "de" && (
                    <FormField
                      label="Sprachvariante"
                      hint="Ist Ihr Material in Schweizerdeutsch, Hochdeutsch oder beidem verfasst?"
                    >
                      <div className="flex gap-2">
                        {[
                          { value: "BOTH" as const, label: "Beide", desc: "CH + DE" },
                          { value: "SWISS" as const, label: "Schweizerdeutsch", desc: "CH" },
                          { value: "STANDARD" as const, label: "Hochdeutsch", desc: "DE" },
                        ].map((opt) => {
                          const isActive = formData.dialect === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => updateFormData("dialect", opt.value)}
                              className={`flex-1 rounded-lg border-2 px-3 py-2.5 text-center transition-colors ${
                                isActive
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-bg text-text-secondary hover:border-primary/50 hover:bg-surface-hover"
                              }`}
                            >
                              <div className="text-sm font-semibold">{opt.label}</div>
                              <div
                                className={`text-xs ${isActive ? "text-primary/80" : "text-text-muted"}`}
                              >
                                {opt.desc}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </FormField>
                  )}

                  {/* Eszett Warning */}
                  {eszettCheck.hasAny && (
                    <div className="border-warning/50 bg-warning/10 rounded-xl border p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="text-warning h-5 w-5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-warning font-medium">Eszett (ß) gefunden</h4>
                          <p className="text-text mt-1 text-sm">
                            Ihr Text enthält {eszettCheck.totalCount} Eszett-Zeichen (ß). In der
                            Schweiz wird stattdessen &quot;ss&quot; verwendet.
                          </p>
                          <button
                            type="button"
                            onClick={handleFixEszett}
                            className="bg-warning text-text-on-accent hover:bg-warning/90 mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                          >
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
                  <div className="border-primary/20 border-b pb-4">
                    <h2 className="text-text text-xl font-semibold">Lehrplan-Zuordnung</h2>
                    <p className="text-text-muted mt-1 text-sm">
                      Wählen Sie Zyklus, Fach und Kompetenzen
                    </p>
                  </div>

                  <EnhancedCurriculumSelector
                    cycle={formData.cycle}
                    subject={formData.subject}
                    subjectCode={formData.subjectCode}
                    canton={formData.canton}
                    competencies={formData.competencies}
                    onCycleChange={(cycle) => updateFormData("cycle", cycle)}
                    onSubjectChange={(subject, code) => {
                      updateFormData("subject", subject);
                      updateFormData("subjectCode", code || "");
                    }}
                    onCantonChange={(canton) => updateFormData("canton", canton)}
                    onCompetenciesChange={(comps) => updateFormData("competencies", comps)}
                    touchedCycle={touchedFields.cycle}
                    touchedSubject={touchedFields.subject}
                    cycleError={getFieldError("cycle")}
                    subjectError={getFieldError("subject")}
                    onCycleBlur={() => markFieldTouched("cycle")}
                    onSubjectBlur={() => markFieldTouched("subject")}
                  />
                </div>
              )}

              {/* Step 3: Properties & Price */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="border-primary/20 border-b pb-4">
                    <h2 className="text-text text-xl font-semibold">Preis festlegen</h2>
                    <p className="text-text-muted mt-1 text-sm">
                      Wählen Sie, ob Ihr Material kostenlos oder kostenpflichtig ist
                    </p>
                  </div>

                  <FormField label="Preismodell" tooltipKey="priceType" required>
                    <div
                      className="grid grid-cols-2 gap-4"
                      role="radiogroup"
                      aria-label="Preismodell"
                    >
                      <RadioOption
                        name="priceType"
                        value="free"
                        checked={formData.priceType === "free"}
                        onChange={(val) => updateFormData("priceType", val as "free" | "paid")}
                        label="Kostenlos"
                        description="Frei für alle zugänglich"
                      />
                      <RadioOption
                        name="priceType"
                        value="paid"
                        checked={formData.priceType === "paid"}
                        onChange={(val) => updateFormData("priceType", val as "free" | "paid")}
                        label="Kostenpflichtig"
                        description="CHF 1 – 50"
                      />
                    </div>
                  </FormField>

                  {formData.priceType === "paid" && (
                    <div>
                      <FormField
                        label="Preis (CHF)"
                        tooltipKey="price"
                        required
                        error={getFieldError("price")}
                        touched={touchedFields.price}
                        hint="Sie erhalten 70% des Verkaufspreises (30% Plattformgebühr). Maximum: CHF 50.00"
                      >
                        <div className="relative">
                          <FormInput
                            type="number"
                            value={formData.price}
                            onChange={(e) => updateFormData("price", e.target.value)}
                            onBlur={() => markFieldTouched("price")}
                            hasError={touchedFields.price && !!getFieldError("price")}
                            min="1"
                            max="50"
                            step="0.50"
                            placeholder="z.B. 5.00"
                            className="pl-14"
                          />
                          <span className="text-text-muted absolute top-1/2 left-4 -translate-y-1/2 font-medium">
                            CHF
                          </span>
                        </div>
                      </FormField>

                      {/* Price preview */}
                      {formData.price && parseFloat(formData.price) > 0 && (
                        <div className="border-success/30 bg-success/5 mt-4 rounded-xl border p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-text-muted text-sm">
                              Ihr Verdienst pro Verkauf:
                            </span>
                            <span className="text-success text-lg font-bold">
                              CHF {(parseFloat(formData.price) * 0.7).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Files & Legal */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="border-primary/20 border-b pb-4">
                    <h2 className="text-text text-xl font-semibold">Dateien & Rechtliches</h2>
                    <p className="text-text-muted mt-1 text-sm">
                      Laden Sie Ihre Dateien hoch und bestätigen Sie die rechtlichen Anforderungen
                    </p>
                  </div>

                  {/* Main File Upload */}
                  <FormField
                    label="Hauptdatei(en)"
                    tooltipKey="files"
                    required
                    error={getFieldError("files")}
                    touched={touchedFields.files}
                  >
                    {isLoadingFiles ? (
                      <div className="border-primary bg-primary/5 rounded-xl border-2 p-8">
                        <div className="text-center">
                          <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
                          <p className="text-text mt-4 text-sm font-medium">
                            Datei wird geladen...
                          </p>
                          <div className="mx-auto mt-4 max-w-xs">
                            <div className="bg-border h-3 overflow-hidden rounded-full">
                              <div
                                className="from-primary to-success h-full bg-gradient-to-r transition-all"
                                style={{ width: `${fileLoadingProgress}%` }}
                              />
                            </div>
                            <p className="text-primary mt-2 text-sm font-medium">
                              {fileLoadingProgress}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : files.length === 0 ? (
                      <div
                        onClick={() => mainFileInputRef.current?.click()}
                        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                          touchedFields.files && getFieldError("files")
                            ? "border-error bg-error/5 hover:border-error"
                            : "border-border bg-bg hover:border-primary"
                        } `}
                      >
                        {isTouchDevice ? (
                          <>
                            <div className="bg-primary/10 mx-auto flex h-14 w-14 items-center justify-center rounded-full">
                              <Upload className="text-primary h-7 w-7" />
                            </div>
                            <p className="text-text mt-3 text-sm font-medium">
                              Tippen Sie hier, um Dateien auszuwählen
                            </p>
                            <div className="bg-primary text-text-on-accent mx-auto mt-3 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold">
                              <Upload className="h-4 w-4" />
                              Durchsuchen
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload className="text-text-muted mx-auto h-12 w-12" />
                            <p className="text-text mt-2 text-sm">
                              Klicken Sie hier oder ziehen Sie Dateien hinein
                            </p>
                          </>
                        )}
                        <p className="text-text-muted mt-2 text-xs">
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
                    ) : (
                      <div className="border-primary bg-primary/5 rounded-xl border-2 p-4">
                        <div className="space-y-3">
                          {files.map((file, index) => (
                            <div
                              key={index}
                              className="border-border bg-surface hover:bg-surface-elevated flex items-center gap-4 rounded-lg border p-3 transition-colors"
                            >
                              <div
                                className="flex flex-1 cursor-pointer items-center gap-4"
                                onClick={() => handleFilePreview(file)}
                              >
                                <div className="relative flex-shrink-0">
                                  {file.type.startsWith("image/") ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt={file.name}
                                      className="h-10 w-10 rounded-lg object-cover"
                                    />
                                  ) : (
                                    getFileIcon(file)
                                  )}
                                  {file.type === "application/pdf" && (
                                    <span className="bg-primary/90 absolute -right-1 -bottom-1 rounded px-1 py-0.5 text-[8px] font-bold text-white">
                                      PDF
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-text truncate text-sm font-medium">
                                    {file.name}
                                  </p>
                                  <p className="text-text-muted text-xs">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                                <ExternalLink className="text-text-muted h-4 w-4" />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-text-muted hover:bg-error/10 hover:text-error rounded-lg p-2 transition-colors"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => mainFileInputRef.current?.click()}
                          className="border-border bg-bg text-text-muted hover:border-primary hover:text-primary mt-3 w-full rounded-lg border border-dashed p-3 text-sm transition-colors"
                        >
                          + Weitere Datei hinzufügen
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
                  </FormField>

                  {/* Auto Preview Info */}
                  <div className="border-success/30 bg-success/5 rounded-xl border p-4">
                    <div className="flex gap-3">
                      <Check className="text-success h-5 w-5 flex-shrink-0" />
                      <div className="text-text text-sm">
                        <strong>Automatische Vorschau:</strong> Für PDF-Dateien wird automatisch
                        eine Vorschau aus der ersten Seite erstellt.
                      </div>
                    </div>
                  </div>

                  {/* Preview Upload */}
                  <FormField
                    label="Eigenes Vorschaubild (optional)"
                    tooltipKey="previewFiles"
                    hint="Falls Sie ein eigenes Vorschaubild verwenden möchten"
                  >
                    <div
                      onClick={() => previewFileInputRef.current?.click()}
                      className="border-border bg-bg hover:border-primary cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors"
                    >
                      {previewFiles.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={URL.createObjectURL(previewFiles[0])}
                          alt="Vorschau"
                          className="mx-auto h-24 w-auto rounded-lg object-contain"
                        />
                      ) : (
                        <ImageIcon className="text-text-muted mx-auto h-10 w-10" />
                      )}
                      <p className="text-text-muted mt-2 text-sm">PNG, JPG bis 5 MB</p>
                      {previewFiles.length > 0 && (
                        <p className="text-primary mt-2 text-sm font-medium">
                          {previewFiles.length} Vorschaubild(er) ausgewählt — Tippen zum Ändern
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
                  </FormField>

                  {/* Pre-Upload Checklist Callout */}
                  <div className="border-primary/30 bg-primary/5 rounded-xl border p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                        <ClipboardCheck className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-text text-base font-semibold">
                          {tLegal("checklistTitle")}
                        </h3>
                        <p className="text-text-muted text-sm">{tLegal("checklistSubtitle")}</p>
                      </div>
                    </div>
                    <ul className="mb-4 space-y-2 pl-1">
                      {(
                        [
                          "ownWork",
                          "noScans",
                          "noTrademarks",
                          "swissSpelling",
                          "correctLicense",
                        ] as const
                      ).map((key) => (
                        <li key={key} className="flex items-start gap-2.5">
                          <Check className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span className="text-text-secondary text-sm">
                            {tLegal(`checklistItems.${key}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-4">
                      <Link
                        href="/urheberrecht"
                        target="_blank"
                        className="text-primary hover:bg-primary/10 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                      >
                        <Scale className="h-4 w-4" />
                        {tLegal("copyrightGuideFull")}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Legal Confirmations */}
                  <div className="border-border bg-surface-elevated rounded-xl border p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h3 className="text-text text-lg font-semibold">
                          Rechtliche Bestätigungen
                        </h3>
                        <p className="text-text-muted mt-1 text-sm">
                          Bitte bestätigen Sie alle Punkte, um fortfahren zu können.
                        </p>
                      </div>
                      <span
                        className={`text-sm font-bold ${allLegalChecked ? "text-[var(--ctp-green)]" : "text-text-muted"}`}
                      >
                        {
                          [
                            formData.legalOwnContent,
                            formData.legalNoTextbookScans,
                            formData.legalNoTrademarks,
                            formData.legalSwissGerman,
                            formData.legalTermsAccepted,
                          ].filter(Boolean).length
                        }{" "}
                        / 5
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="bg-border mb-5 h-1.5 overflow-hidden rounded-full">
                      <div
                        className={`h-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${allLegalChecked ? "bg-[var(--ctp-green)]" : "bg-primary"}`}
                        style={{
                          width: `${([formData.legalOwnContent, formData.legalNoTextbookScans, formData.legalNoTrademarks, formData.legalSwissGerman, formData.legalTermsAccepted].filter(Boolean).length / 5) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="space-y-3">
                      <FormCheckbox
                        checked={formData.legalOwnContent}
                        onChange={(checked) => updateFormData("legalOwnContent", checked)}
                        label="Eigene Inhalte oder CC0-Lizenz"
                        description="Ich habe alle Bilder, Grafiken und Texte selbst erstellt oder verwende nur Materialien mit CC0-Lizenz."
                        hasError={touchedFields.legalOwnContent && !formData.legalOwnContent}
                        tooltipKey="legalOwnContent"
                      />

                      <FormCheckbox
                        checked={formData.legalNoTextbookScans}
                        onChange={(checked) => updateFormData("legalNoTextbookScans", checked)}
                        label="Keine Lehrmittel-Scans"
                        description="Ich habe keine Seiten aus Lehrmitteln oder Schulbüchern eingescannt oder kopiert."
                        hasError={
                          touchedFields.legalNoTextbookScans && !formData.legalNoTextbookScans
                        }
                        tooltipKey="legalNoTextbookScans"
                      />

                      <FormCheckbox
                        checked={formData.legalNoTrademarks}
                        onChange={(checked) => updateFormData("legalNoTrademarks", checked)}
                        label="Keine geschützten Marken oder Charaktere"
                        description="Mein Material enthält keine geschützten Marken, Logos oder Figuren."
                        hasError={touchedFields.legalNoTrademarks && !formData.legalNoTrademarks}
                        tooltipKey="legalNoTrademarks"
                      />

                      <FormCheckbox
                        checked={formData.legalSwissGerman}
                        onChange={(checked) => updateFormData("legalSwissGerman", checked)}
                        label="Schweizer Rechtschreibung"
                        description="Mein Material verwendet die Schweizer Rechtschreibung (kein Eszett)."
                        hasError={touchedFields.legalSwissGerman && !formData.legalSwissGerman}
                        tooltipKey="legalSwissGerman"
                      />

                      <FormCheckbox
                        checked={formData.legalTermsAccepted}
                        onChange={(checked) => updateFormData("legalTermsAccepted", checked)}
                        label="Verkäufervereinbarung akzeptieren"
                        description={
                          <>
                            Ich akzeptiere die{" "}
                            <Link
                              href="/agb"
                              target="_blank"
                              className="text-primary hover:underline"
                            >
                              Verkäufervereinbarung
                            </Link>{" "}
                            und bestätige, dass ich die Rechte habe, dieses Material zu verkaufen.
                          </>
                        }
                        hasError={touchedFields.legalTermsAccepted && !formData.legalTermsAccepted}
                        tooltipKey="legalTermsAccepted"
                      />
                    </div>

                    {/* Copyright guide link */}
                    <div className="bg-primary/5 border-primary/20 mt-4 rounded-lg border p-3 text-sm">
                      <span className="text-text-secondary">{tLegal("copyrightGuideLink")} </span>
                      <Link
                        href="/urheberrecht"
                        target="_blank"
                        className="text-primary font-medium hover:underline"
                      >
                        {tLegal("copyrightGuideLinkText")} →
                      </Link>
                    </div>

                    {!allLegalChecked && (
                      <div className="bg-warning/10 text-warning mt-4 rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Bitte bestätigen Sie alle Punkte, um fortzufahren.
                        </div>
                      </div>
                    )}

                    {eszettCheck.hasAny && (
                      <div className="bg-error/10 text-error mt-4 rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Ihr Titel oder Beschreibung enthält noch Eszett-Zeichen (ß). Bitte
                          korrigieren Sie dies in Schritt 1.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="border-border mt-10 flex justify-between border-t pt-6">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={currentStep === 1}
                  className="border-border text-text hover:bg-surface-elevated rounded-xl border-2 px-6 py-3 font-medium transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ← Zurück
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-primary text-text-on-accent shadow-primary/25 hover:bg-primary-hover hover:shadow-primary/30 rounded-xl px-8 py-3 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.98]"
                  >
                    Weiter →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={!canPublish || uploadStatus !== "idle"}
                    className="from-primary to-primary-hover text-text-on-accent shadow-primary/25 hover:shadow-primary/30 rounded-xl bg-gradient-to-r px-8 py-3 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <Check className="h-5 w-5" />
                      Veröffentlichen
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Draft Restored Toast */}
      {showDraftToast && <DraftRestoredToast onDismiss={() => setShowDraftToast(false)} />}

      {/* Upload Progress Toast — fixed bottom-right */}
      {uploadStatus !== "idle" && (
        <div className="animate-in slide-in-from-bottom-4 fade-in fixed right-4 bottom-4 z-50 w-full max-w-sm duration-300 sm:right-6 sm:bottom-6">
          <div className="border-border bg-surface rounded-2xl border p-5 shadow-2xl">
            {uploadStatus === "uploading" && (
              <div>
                <div className="flex items-center gap-3">
                  <Loader2 className="text-primary h-6 w-6 flex-shrink-0 animate-spin" />
                  <div className="min-w-0 flex-1">
                    <p className="text-text text-sm font-semibold">{tUpload("uploading")}</p>
                    <p className="text-text-muted text-xs">{tUpload("pleaseWait")}</p>
                  </div>
                  <span className="text-primary text-sm font-bold">{uploadProgress}%</span>
                </div>
                <div className="bg-border mt-3 h-2 overflow-hidden rounded-full">
                  <div
                    className="from-primary to-success h-full bg-gradient-to-r transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {uploadStatus === "success" && (
              <div>
                <div className="flex items-start gap-3">
                  <div className="bg-success/20 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                    <Check className="text-success h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-text text-sm font-semibold">{tUpload("success")}</p>
                    <p className="text-text-muted text-xs">{tUpload("successMessage")}</p>
                  </div>
                  <button
                    onClick={() => {
                      setUploadStatus("idle");
                      setError(null);
                    }}
                    className="text-text-muted hover:text-text flex-shrink-0 p-1 transition-colors"
                    aria-label={tUpload("close")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {createdMaterialId && (
                  <button
                    onClick={() => router.push(`/materialien/${createdMaterialId}`)}
                    className="bg-primary text-text-on-accent hover:bg-primary-hover mt-3 w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    {tUpload("viewMaterial")} →
                  </button>
                )}
              </div>
            )}

            {uploadStatus === "error" && (
              <div>
                <div className="flex items-start gap-3">
                  <div className="bg-error/20 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                    <AlertTriangle className="text-error h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-text text-sm font-semibold">{tUpload("error")}</p>
                    <p className="text-error mt-1 text-xs">{error}</p>
                  </div>
                  <button
                    onClick={() => {
                      setUploadStatus("idle");
                      setError(null);
                    }}
                    className="text-text-muted hover:text-text flex-shrink-0 p-1 transition-colors"
                    aria-label={tUpload("close")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setUploadStatus("idle");
                      setError(null);
                    }}
                    className="border-border text-text hover:bg-surface-elevated flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
                  >
                    {tUpload("close")}
                  </button>
                  {error === tUpload("errorAuthExpired") ? (
                    <Link
                      href="/anmelden"
                      className="bg-primary text-text-on-accent hover:bg-primary-hover flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    >
                      {tUpload("loginAgain")}
                    </Link>
                  ) : (
                    <button
                      onClick={handlePublish}
                      className="bg-primary text-text-on-accent hover:bg-primary-hover flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    >
                      {tUpload("retry")}
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

export default function UploadPage() {
  return (
    <UploadWizardProvider>
      <UploadPageContent />
    </UploadWizardProvider>
  );
}
