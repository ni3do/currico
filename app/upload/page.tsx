"use client";

import { useState, useRef } from "react";
import TopBar from "@/components/ui/TopBar";

type Step = 1 | 2 | 3 | 4;

export default function UploadPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
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

  const handlePublish = () => {
    console.log("Publishing resource:", formData);
    // Handle publish logic
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[--background]">
      <TopBar />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[--text]">Ressource hochladen</h1>
          <p className="mt-2 text-[--text-muted]">
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
                        ? "border-[--primary] bg-[--primary] text-[--background]"
                        : "border-[--border] bg-[--surface] text-[--text-muted]"
                    }`}
                  >
                    {step}
                  </div>
                  <span className="mt-2 text-xs text-[--text-muted]">
                    {step === 1 && "Basics"}
                    {step === 2 && "Lehrplan"}
                    {step === 3 && "Preis"}
                    {step === 4 && "Dateien"}
                  </span>
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step < currentStep ? "bg-[--primary]" : "bg-[--border]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-[--border] bg-[--surface] p-8">
          {/* Step 1: Basics */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[--text]">Grundinformationen</h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-[--text]">
                  Titel *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  required
                  className="w-full rounded-xl border border-[--border] bg-[--background] px-4 py-3 text-[--text] placeholder:text-[--text-muted] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20"
                  placeholder="z.B. Bruchrechnen Übungsblätter"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[--text]">
                  Kurzbeschreibung *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-xl border border-[--border] bg-[--background] px-4 py-3 text-[--text] placeholder:text-[--text-muted] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20"
                  placeholder="Beschreiben Sie Ihre Ressource in 2-3 Sätzen..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[--text]">
                    Sprache *
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => updateFormData("language", e.target.value)}
                    className="w-full rounded-xl border border-[--border] bg-[--background] px-4 py-3 text-[--text] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20"
                  >
                    <option value="de">Deutsch</option>
                    <option value="fr">Französisch</option>
                    <option value="it">Italienisch</option>
                    <option value="en">Englisch</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[--text]">
                    Ressourcentyp *
                  </label>
                  <select
                    value={formData.resourceType}
                    onChange={(e) => updateFormData("resourceType", e.target.value)}
                    className="w-full rounded-xl border border-[--border] bg-[--background] px-4 py-3 text-[--text] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20"
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
              <h2 className="text-xl font-semibold text-[--text]">Lehrplan-Zuordnung</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[--text]">
                    Zyklus *
                  </label>
                  <select
                    value={formData.cycle}
                    onChange={(e) => updateFormData("cycle", e.target.value)}
                    className="w-full rounded-xl border border-[--border] bg-[--background] px-4 py-3 text-[--text] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20"
                  >
                    <option value="">Wählen Sie...</option>
                    <option value="1">Zyklus 1</option>
                    <option value="2">Zyklus 2</option>
                    <option value="3">Zyklus 3</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[--text]">
                    Hauptfach *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => updateFormData("subject", e.target.value)}
                    className="w-full rounded-xl border border-[--border] bg-[--background] px-4 py-3 text-[--text] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20"
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
                <label className="mb-2 block text-sm font-medium text-[--text]">
                  Kanton *
                </label>
                <select
                  value={formData.canton}
                  onChange={(e) => updateFormData("canton", e.target.value)}
                  className="w-full rounded-xl border border-[--border] bg-[--background] px-4 py-3 text-[--text] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20"
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
                <label className="mb-2 block text-sm font-medium text-[--text]">
                  Lehrplan 21 Kompetenzen
                </label>
                <input
                  type="text"
                  placeholder="z.B. MA.1.A.2, MA.1.A.3 (kommagetrennt)"
                  className="w-full rounded-xl border border-[--border] bg-[--background] px-4 py-3 text-[--text] placeholder:text-[--text-muted] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20"
                />
                <p className="mt-1 text-xs text-[--text-muted]">
                  Optional: Geben Sie die Kompetenzcodes aus dem Lehrplan 21 ein
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Properties */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[--text]">Eigenschaften & Preis</h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-[--text]">
                  Preistyp *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      formData.priceType === "free"
                        ? "border-[--primary] bg-[--primary]/10"
                        : "border-[--border] bg-[--background]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="priceType"
                      value="free"
                      checked={formData.priceType === "free"}
                      onChange={(e) => updateFormData("priceType", e.target.value)}
                      className="h-4 w-4 text-[--primary] focus:ring-2 focus:ring-[--primary]/20"
                    />
                    <div>
                      <div className="font-medium text-[--text]">Kostenlos</div>
                      <div className="text-xs text-[--text-muted]">
                        Frei zugänglich
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      formData.priceType === "paid"
                        ? "border-[--primary] bg-[--primary]/10"
                        : "border-[--border] bg-[--background]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="priceType"
                      value="paid"
                      checked={formData.priceType === "paid"}
                      onChange={(e) => updateFormData("priceType", e.target.value)}
                      className="h-4 w-4 text-[--primary] focus:ring-2 focus:ring-[--primary]/20"
                    />
                    <div>
                      <div className="font-medium text-[--text]">Kostenpflichtig</div>
                      <div className="text-xs text-[--text-muted]">Preis festlegen</div>
                    </div>
                  </label>
                </div>
              </div>

              {formData.priceType === "paid" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-[--text]">
                    Preis (CHF) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => updateFormData("price", e.target.value)}
                      min="0"
                      step="0.50"
                      className="w-full rounded-xl border border-[--border] bg-[--background] px-4 py-3 pl-12 text-[--text] placeholder:text-[--text-muted] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20"
                      placeholder="12.00"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[--text-muted]">
                      CHF
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[--text-muted]">
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
                    className="h-4 w-4 rounded border-[--border] bg-[--background] text-[--primary] focus:ring-2 focus:ring-[--primary]/20"
                  />
                  <div>
                    <div className="text-sm font-medium text-[--text]">
                      Editierbar
                    </div>
                    <div className="text-xs text-[--text-muted]">
                      Käufer können die Datei bearbeiten (z.B. Word-Dokument)
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[--text]">
                  Lizenzumfang *
                </label>
                <select
                  value={formData.licenseScope}
                  onChange={(e) => updateFormData("licenseScope", e.target.value)}
                  className="w-full rounded-xl border border-[--border] bg-[--background] px-4 py-3 text-[--text] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20"
                >
                  <option value="individual">Einzellizenz</option>
                  <option value="school">Schullizenz</option>
                  <option value="both">Beide</option>
                </select>
                <p className="mt-1 text-xs text-[--text-muted]">
                  Schullizenzen erlauben allen Lehrpersonen einer Schule die Nutzung
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Files */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[--text]">Dateien & Vorschau</h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-[--text]">
                  Hauptdatei(en) *
                </label>
                <div
                  onClick={() => mainFileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-[--border] bg-[--background] p-8 text-center cursor-pointer hover:border-[--primary] transition-colors"
                >
                  <svg
                    className="mx-auto h-12 w-12 text-[--text-muted]"
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
                  <p className="mt-2 text-sm text-[--text]">
                    Klicken Sie hier oder ziehen Sie Dateien hinein
                  </p>
                  <p className="mt-1 text-xs text-[--text-muted]">
                    PDF, Word, PowerPoint, Excel bis 50 MB
                  </p>
                  {formData.files.length > 0 && (
                    <p className="mt-2 text-sm text-[--primary] font-medium">
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
                <label className="mb-2 block text-sm font-medium text-[--text]">
                  Vorschaudateien
                </label>
                <div
                  onClick={() => previewFileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-[--border] bg-[--background] p-8 text-center cursor-pointer hover:border-[--primary] transition-colors"
                >
                  <svg
                    className="mx-auto h-12 w-12 text-[--text-muted]"
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
                  <p className="mt-2 text-sm text-[--text]">
                    Vorschaubilder hochladen (optional)
                  </p>
                  <p className="mt-1 text-xs text-[--text-muted]">
                    PNG, JPG bis 10 MB - wird mit Wasserzeichen versehen
                  </p>
                  {formData.previewFiles.length > 0 && (
                    <p className="mt-2 text-sm text-[--primary] font-medium">
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

              <div className="rounded-xl border border-[--border] bg-[--background] p-4">
                <div className="flex gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-[--sapphire]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-[--text-muted]">
                    <strong className="text-[--text]">Hinweis:</strong> Vorschaudateien werden
                    automatisch mit einem Wasserzeichen versehen. Die vollständigen
                    Dateien sind nur für Käufer zugänglich.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between border-t border-[--border] pt-6">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="rounded-lg border border-[--border] px-6 py-3 font-medium text-[--text] hover:bg-[--surface1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zurück
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="rounded-lg bg-gradient-to-r from-[--primary] to-[--secondary] px-8 py-3 font-semibold text-[--background] hover:opacity-90 transition-opacity shadow-lg shadow-[--primary]/20"
              >
                Weiter
              </button>
            ) : (
              <button
                onClick={handlePublish}
                className="rounded-lg bg-gradient-to-r from-[--green] to-[--teal] px-8 py-3 font-semibold text-[--background] hover:opacity-90 transition-opacity shadow-lg shadow-[--green]/20"
              >
                Veröffentlichen
              </button>
            )}
          </div>
        </div>
      </main>

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
