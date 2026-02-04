"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  StepSummary,
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
} from "lucide-react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

function UploadPageContent() {
  const router = useRouter();
  const tCommon = useTranslations("common");
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
  const [createdResourceId, setCreatedResourceId] = useState<string | null>(null);
  const [showDraftToast, setShowDraftToast] = useState(false);

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const previewFileInputRef = useRef<HTMLInputElement>(null);
  const hasShownDraftToast = useRef(false);

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
          setCreatedResourceId(result.resource?.id);

          // Clear draft on success
          localStorage.removeItem("currico_upload_draft");

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

    xhr.open("POST", "/api/resources");
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

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: tCommon("breadcrumb.upload") }]} className="mb-4" />

          {/* Page Header */}
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-text text-xl font-semibold">Ressource hochladen</h1>
          </div>

          {/* Step Navigation */}
          <StepNavigationBar />

          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Form Column */}
            <div className="lg:col-span-2">
              {/* Draft Indicator */}
              <div className="mb-6">
                <DraftIndicator />
              </div>

              {/* Form Card */}
              <div className="border-border bg-surface rounded-2xl border p-6 sm:p-8">
                {/* Step 1: Basics */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-text text-xl font-semibold">Grundinformationen</h2>

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
                        placeholder="Beschreiben Sie Ihre Ressource kurz..."
                        rows={4}
                        maxLength={2000}
                      />
                    </FormField>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField label="Sprache" tooltipKey="language" required>
                        <FormSelect
                          value={formData.language}
                          onChange={(e) => updateFormData("language", e.target.value)}
                        >
                          <option value="de">Deutsch</option>
                          <option value="en">Englisch</option>
                          <option value="fr">Französisch</option>
                          <option value="it">Italienisch</option>
                        </FormSelect>
                      </FormField>

                      <FormField label="Ressourcentyp" tooltipKey="resourceType" required>
                        <FormSelect
                          value={formData.resourceType}
                          onChange={(e) => updateFormData("resourceType", e.target.value)}
                        >
                          <option value="pdf">PDF</option>
                          <option value="word">Word</option>
                          <option value="powerpoint">PowerPoint</option>
                          <option value="excel">Excel</option>
                          <option value="other">Andere</option>
                        </FormSelect>
                      </FormField>
                    </div>

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
                    <h2 className="text-text text-xl font-semibold">Lehrplan-Zuordnung</h2>

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
                    <h2 className="text-text text-xl font-semibold">Eigenschaften & Preis</h2>

                    <FormField label="Preistyp" tooltipKey="priceType" required>
                      <div className="grid grid-cols-2 gap-4">
                        <RadioOption
                          value="free"
                          checked={formData.priceType === "free"}
                          onChange={(val) => updateFormData("priceType", val as "free" | "paid")}
                          label="Kostenlos"
                          description="Frei zugänglich"
                        />
                        <RadioOption
                          value="paid"
                          checked={formData.priceType === "paid"}
                          onChange={(val) => updateFormData("priceType", val as "free" | "paid")}
                          label="Kostenpflichtig"
                          description="Preis festlegen"
                        />
                      </div>
                    </FormField>

                    {formData.priceType === "paid" && (
                      <FormField
                        label="Preis (CHF)"
                        tooltipKey="price"
                        required
                        error={getFieldError("price")}
                        touched={touchedFields.price}
                        hint="Sie erhalten 70% des Verkaufspreises (30% Plattformgebühr)"
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
                            className="pl-12"
                          />
                          <span className="text-text-muted absolute top-1/2 left-4 -translate-y-1/2">
                            CHF
                          </span>
                        </div>
                      </FormField>
                    )}

                    <FormCheckbox
                      checked={formData.editable}
                      onChange={(checked) => updateFormData("editable", checked)}
                      label="Editierbar"
                      description="Käufer können die Datei bearbeiten (z.B. Word-Dokument)"
                      tooltipKey="editable"
                    />
                  </div>
                )}

                {/* Step 4: Files & Legal */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-text text-xl font-semibold">Dateien & Vorschau</h2>

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
                          <Upload className="text-text-muted mx-auto h-12 w-12" />
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
                                  {getFileIcon(file)}
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
                        <ImageIcon className="text-text-muted mx-auto h-10 w-10" />
                        <p className="text-text-muted mt-2 text-sm">PNG, JPG bis 5 MB</p>
                        {previewFiles.length > 0 && (
                          <p className="text-primary mt-2 text-sm font-medium">
                            {previewFiles.length} Vorschaubild(er) ausgewählt
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

                    {/* Legal Confirmations */}
                    <div className="border-border bg-surface-elevated rounded-xl border p-6">
                      <h3 className="text-text mb-4 flex items-center gap-2 text-lg font-semibold">
                        Rechtliche Bestätigungen
                      </h3>
                      <p className="text-text-muted mb-4 text-sm">
                        Bitte bestätigen Sie die folgenden Punkte:
                      </p>

                      <div className="space-y-2">
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
                          description="Meine Ressource enthält keine geschützten Marken, Logos oder Figuren."
                          hasError={touchedFields.legalNoTrademarks && !formData.legalNoTrademarks}
                          tooltipKey="legalNoTrademarks"
                        />

                        <FormCheckbox
                          checked={formData.legalSwissGerman}
                          onChange={(checked) => updateFormData("legalSwissGerman", checked)}
                          label="Schweizer Rechtschreibung"
                          description="Meine Ressource verwendet die Schweizer Rechtschreibung (kein Eszett)."
                          hasError={touchedFields.legalSwissGerman && !formData.legalSwissGerman}
                          tooltipKey="legalSwissGerman"
                        />

                        <div className="border-border border-t pt-2">
                          <FormCheckbox
                            checked={formData.legalTermsAccepted}
                            onChange={(checked) => updateFormData("legalTermsAccepted", checked)}
                            label="Verkäufervereinbarung akzeptieren"
                            description={
                              <>
                                Ich akzeptiere die{" "}
                                <Link
                                  href="/terms"
                                  target="_blank"
                                  className="text-primary hover:underline"
                                >
                                  Verkäufervereinbarung
                                </Link>{" "}
                                und bestätige, dass ich die Rechte habe, diese Ressource zu
                                verkaufen.
                              </>
                            }
                            hasError={
                              touchedFields.legalTermsAccepted && !formData.legalTermsAccepted
                            }
                            tooltipKey="legalTermsAccepted"
                          />
                        </div>
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
                <div className="border-border mt-8 flex justify-between border-t pt-6">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={currentStep === 1}
                    className="border-border text-text hover:bg-surface-elevated rounded-lg border px-6 py-3 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Zurück
                  </button>

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-primary text-text-on-accent shadow-primary/20 hover:bg-primary-hover rounded-lg px-8 py-3 font-semibold shadow-lg transition-colors"
                    >
                      Weiter
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={!canPublish || uploadStatus !== "idle"}
                      className="bg-primary text-text-on-accent shadow-primary/20 hover:bg-primary-hover rounded-lg px-8 py-3 font-semibold shadow-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Veröffentlichen
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Summary */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <StepSummary />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Draft Restored Toast */}
      {showDraftToast && <DraftRestoredToast onDismiss={() => setShowDraftToast(false)} />}

      {/* Upload Modal */}
      {uploadStatus !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface mx-4 w-full max-w-md rounded-2xl p-8 shadow-2xl">
            {uploadStatus === "uploading" && (
              <div className="text-center">
                <Loader2 className="text-primary mx-auto h-16 w-16 animate-spin" />
                <h3 className="text-text mt-4 text-xl font-semibold">Wird hochgeladen...</h3>
                <p className="text-text-muted mt-2 text-sm">
                  Bitte warten Sie, dies kann einen Moment dauern.
                </p>
                <div className="bg-border mt-4 h-3 overflow-hidden rounded-full">
                  <div
                    className="from-primary to-success h-full bg-gradient-to-r transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-text mt-2 text-sm font-medium">{uploadProgress}%</p>
              </div>
            )}

            {uploadStatus === "success" && (
              <div className="text-center">
                <div className="bg-success/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <Check className="text-success h-8 w-8" />
                </div>
                <h3 className="text-text text-xl font-semibold">Ressource erstellt!</h3>
                <p className="text-text-muted mt-2 text-sm">
                  Ihre Ressource wurde hochgeladen und wartet auf Freigabe.
                </p>
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

            {uploadStatus === "error" && (
              <div className="text-center">
                <div className="bg-error/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <X className="text-error h-8 w-8" />
                </div>
                <h3 className="text-text text-xl font-semibold">Fehler beim Hochladen</h3>
                <p className="text-error mt-2 text-sm">{error}</p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setUploadStatus("idle");
                      setError(null);
                    }}
                    className="border-border text-text hover:bg-surface-elevated rounded-lg border px-6 py-2 font-medium transition-colors"
                  >
                    Schliessen
                  </button>
                  <button
                    onClick={handlePublish}
                    className="bg-primary text-text-on-accent hover:bg-primary/90 rounded-lg px-6 py-2 font-medium transition-colors"
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

export default function UploadPage() {
  return (
    <UploadWizardProvider>
      <UploadPageContent />
    </UploadWizardProvider>
  );
}
