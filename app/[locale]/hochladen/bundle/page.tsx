"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { getLoginUrl } from "@/lib/utils/login-redirect";
import { roundToNearestHalfFranc, formatPrice } from "@/lib/utils/price";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { checkForEszett, replaceEszett } from "@/lib/validations/swiss-quality";
import type { BundleMaterialOption } from "@/lib/types/material";

const MATERIALS_PER_PAGE = 20;

const SUBJECT_OPTIONS = ["Mathematik", "Deutsch", "Englisch", "Französisch", "NMG"] as const;

const CYCLE_VALUES = ["1", "2", "3"] as const;

interface BundleFormData {
  title: string;
  description: string;
  price: string;
  selectedMaterials: string[];
  subjects: string[];
  cycles: string[];
  coverImage: File | null;
}

export default function CreateBundlePage() {
  const router = useRouter();
  const tEszett = useTranslations("uploadWizard.eszett");
  const tCycles = useTranslations("uploadWizard.cycles");
  const tBundle = useTranslations("bundle");
  const [materials, setMaterials] = useState<BundleMaterialOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const [materialSearch, setMaterialSearch] = useState("");
  const [materialPage, setMaterialPage] = useState(1);
  const [autoFilledSubjects, setAutoFilledSubjects] = useState(false);
  const [autoFilledCycles, setAutoFilledCycles] = useState(false);
  const [formData, setFormData] = useState<BundleFormData>({
    title: "",
    description: "",
    price: "",
    selectedMaterials: [],
    subjects: [],
    cycles: [],
    coverImage: null,
  });

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const response = await fetch("/api/seller/materials");
        if (!response.ok) {
          if (response.status === 401) {
            router.push(getLoginUrl("/hochladen/bundle"));
            return;
          }
          if (response.status === 403) {
            setError(tBundle("errorNotSeller"));
            setLoading(false);
            return;
          }
          throw new Error(tBundle("errorLoadingMaterials"));
        }
        const data = await response.json();
        setMaterials(data.materials);
      } catch (err) {
        setError(err instanceof Error ? err.message : tBundle("errorGeneric"));
      } finally {
        setLoading(false);
      }
    }
    fetchMaterials();
  }, [router, tBundle]);

  const updateFormData = <K extends keyof BundleFormData>(field: K, value: BundleFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleMaterial = (materialId: string) => {
    const isSelected = formData.selectedMaterials.includes(materialId);
    const newSelection = isSelected
      ? formData.selectedMaterials.filter((id) => id !== materialId)
      : [...formData.selectedMaterials, materialId];
    updateFormData("selectedMaterials", newSelection);
  };

  // Auto-derive subjects/cycles from selected materials (multi-select)
  useEffect(() => {
    if (formData.selectedMaterials.length === 0) return;
    const selected = materials.filter((m) => formData.selectedMaterials.includes(m.id));
    if (selected.length === 0) return;

    // Collect ALL unique subjects
    const allSubjects = new Set<string>();
    selected.forEach((m) => {
      (m.subjects || []).forEach((s) => allSubjects.add(s));
    });

    // Collect ALL unique cycles (normalized)
    const allCycles = new Set<string>();
    selected.forEach((m) => {
      (m.cycles || []).forEach((c) => {
        const num = c.replace(/^Zyklus\s*/i, "");
        allCycles.add(num);
      });
    });

    if (allSubjects.size > 0 && formData.subjects.length === 0) {
      updateFormData("subjects", Array.from(allSubjects));
      setAutoFilledSubjects(true);
    }
    if (allCycles.size > 0 && formData.cycles.length === 0) {
      updateFormData("cycles", Array.from(allCycles));
      setAutoFilledCycles(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.selectedMaterials, materials]);

  // Reset pagination when search changes
  useEffect(() => {
    setMaterialPage(1);
  }, [materialSearch]);

  // Filter and paginate materials
  const filteredMaterials = useMemo(() => {
    return materials.filter(
      (m) => !materialSearch || m.title.toLowerCase().includes(materialSearch.toLowerCase())
    );
  }, [materials, materialSearch]);

  const totalPages = Math.ceil(filteredMaterials.length / MATERIALS_PER_PAGE);
  const paginatedMaterials = filteredMaterials.slice(
    (materialPage - 1) * MATERIALS_PER_PAGE,
    materialPage * MATERIALS_PER_PAGE
  );

  const calculateTotal = () => {
    return materials
      .filter((r) => formData.selectedMaterials.includes(r.id))
      .reduce((sum, r) => sum + r.price, 0);
  };

  const calculateDiscount = () => {
    const total = calculateTotal();
    const bundlePrice = (parseFloat(formData.price) || 0) * 100;
    return total > 0 ? Math.round(((total - bundlePrice) / total) * 100) : 0;
  };

  const calculateSavingsChf = () => {
    const total = calculateTotal();
    const bundlePrice = (parseFloat(formData.price) || 0) * 100;
    return total - bundlePrice;
  };

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

  const toggleSubject = (subject: string) => {
    const isSelected = formData.subjects.includes(subject);
    if (isSelected) {
      updateFormData(
        "subjects",
        formData.subjects.filter((s) => s !== subject)
      );
    } else {
      updateFormData("subjects", [...formData.subjects, subject]);
    }
    setAutoFilledSubjects(false);
  };

  const toggleCycle = (cycle: string) => {
    const isSelected = formData.cycles.includes(cycle);
    if (isSelected) {
      updateFormData(
        "cycles",
        formData.cycles.filter((c) => c !== cycle)
      );
    } else {
      updateFormData("cycles", [...formData.cycles, cycle]);
    }
    setAutoFilledCycles(false);
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError(tBundle("errorInvalidImage"));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(tBundle("errorImageTooLarge"));
        return;
      }
      setError(null);
      updateFormData("coverImage", file);
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
      throw new Error(tBundle("errorCoverUpload"));
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (eszettCheck.hasAny) return;

    if (
      formData.selectedMaterials.length > 0 &&
      parseFloat(formData.price) > 0 &&
      calculateDiscount() <= 0
    ) {
      setError(tBundle("errorPriceTooHigh"));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
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
          price: Math.round(parseFloat(formData.price) * 100),
          subject: formData.subjects,
          cycle: formData.cycles.map((c) => `Zyklus ${c}`),
          resourceIds: formData.selectedMaterials,
          coverImageUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || tBundle("errorCreateBundle"));
      }

      router.push("/konto");
    } catch (err) {
      setError(err instanceof Error ? err.message : tBundle("errorGeneric"));
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
          <Breadcrumb items={[{ label: tBundle("breadcrumb") }]} />
          <h1 className="text-text text-2xl font-bold sm:text-3xl">{tBundle("pageTitle")}</h1>
          <p className="text-text-muted mt-1">{tBundle("pageSubtitle")}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          </div>
        ) : error && materials.length === 0 ? (
          <div className="border-error/30 bg-error/10 rounded-xl border p-6 text-center">
            <p className="text-error">{error}</p>
            <Link href="/konto" className="text-primary mt-4 inline-block hover:underline">
              {tBundle("backToAccount")}
            </Link>
          </div>
        ) : materials.length === 0 ? (
          <div className="border-border bg-surface rounded-xl border p-8 text-center">
            <p className="text-text-muted">{tBundle("noMaterials")}</p>
            <Link
              href="/hochladen"
              className="bg-primary text-text-on-accent mt-4 inline-block rounded-xl px-6 py-3 font-semibold"
            >
              {tBundle("uploadMaterial")}
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
              <h2 className="text-text mb-6 text-xl font-semibold">{tBundle("infoTitle")}</h2>

              <div className="space-y-6">
                <div>
                  <label className="text-text mb-2 block text-sm font-medium">
                    {tBundle("titleLabel")} *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                    required
                    className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                    placeholder={tBundle("titlePlaceholder")}
                  />
                </div>

                <div>
                  <label className="text-text mb-2 block text-sm font-medium">
                    {tBundle("descriptionLabel")} *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    required
                    rows={4}
                    className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                    placeholder={tBundle("descriptionPlaceholder")}
                  />
                </div>

                {/* Eszett Warning */}
                {eszettCheck.hasAny && (
                  <div className="border-warning/50 bg-warning/10 rounded-xl border p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="text-warning h-5 w-5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-warning font-medium">{tEszett("title")}</h4>
                        <p className="text-text mt-1 text-sm">
                          {tEszett("message", { count: eszettCheck.totalCount })}
                        </p>
                        <button
                          type="button"
                          onClick={handleFixEszett}
                          className="bg-warning/20 text-warning hover:bg-warning/30 mt-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                        >
                          {tEszett("fix")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subject multi-select */}
                <div>
                  <label className="text-text mb-2 block text-sm font-medium">
                    {tBundle("subjectsLabel")}
                    {autoFilledSubjects && formData.subjects.length > 0 && (
                      <span className="text-text-muted ml-1 text-xs font-normal">(auto)</span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECT_OPTIONS.map((subject) => {
                      const isSelected = formData.subjects.includes(subject);
                      return (
                        <button
                          key={subject}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleSubject(subject)}
                          className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-bg text-text hover:border-primary/50"
                          }`}
                        >
                          {subject}
                          {isSelected && <X className="ml-1 inline h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                  {formData.subjects.length === 0 && (
                    <p className="text-text-muted mt-1 text-xs">{tBundle("subjectOptionalHint")}</p>
                  )}
                </div>

                {/* Cycle multi-select */}
                <div>
                  <label className="text-text mb-2 block text-sm font-medium">
                    {tBundle("cyclesLabel")}
                    {autoFilledCycles && formData.cycles.length > 0 && (
                      <span className="text-text-muted ml-1 text-xs font-normal">(auto)</span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CYCLE_VALUES.map((value) => {
                      const isSelected = formData.cycles.includes(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleCycle(value)}
                          className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-bg text-text hover:border-primary/50"
                          }`}
                        >
                          {tCycles(`cycle${value}` as "cycle1" | "cycle2" | "cycle3")}
                          {isSelected && <X className="ml-1 inline h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                  {formData.cycles.length === 0 && (
                    <p className="text-text-muted mt-1 text-xs">{tBundle("cycleOptionalHint")}</p>
                  )}
                </div>

                {/* Cover image */}
                <div>
                  <label className="text-text mb-2 block text-sm font-medium">
                    {tBundle("coverLabel")}
                  </label>
                  {coverImagePreview ? (
                    <div className="border-primary bg-primary/5 relative rounded-xl border-2 p-4">
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                        <Image
                          src={coverImagePreview}
                          alt={tBundle("coverPreviewAlt")}
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
                          <X className="h-4 w-4" />
                          {tBundle("remove")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => coverImageInputRef.current?.click()}
                      className="border-border bg-bg hover:border-primary cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors"
                    >
                      <ImageIcon className="text-text-muted mx-auto h-12 w-12" aria-hidden="true" />
                      <p className="text-text mt-2 text-sm">{tBundle("coverUploadLabel")}</p>
                      <p className="text-text-muted mt-1 text-xs">{tBundle("coverUploadHint")}</p>
                    </div>
                  )}
                  <input
                    ref={coverImageInputRef}
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg"
                    onChange={handleCoverImageChange}
                    aria-label={tBundle("coverLabel")}
                  />
                </div>
              </div>
            </div>

            {/* Select Resources */}
            <div className="border-border bg-surface rounded-2xl border p-8">
              <h2 className="text-text mb-6 text-xl font-semibold">{tBundle("selectMaterials")}</h2>

              <p className="text-text-muted mb-4 text-sm">{tBundle("selectMaterialsHint")}</p>

              {materials.length > 10 && (
                <input
                  type="text"
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  placeholder={tBundle("searchPlaceholder")}
                  className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 mb-4 w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:outline-none"
                />
              )}

              <div className="space-y-3">
                {paginatedMaterials.map((material) => (
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
                      <div className="text-text-muted text-sm">{material.subjects?.[0] || ""}</div>
                    </div>
                    <div className="text-primary font-semibold">{material.priceFormatted}</div>
                  </label>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-text-muted text-sm">
                    {tBundle("showingMaterials", {
                      start: (materialPage - 1) * MATERIALS_PER_PAGE + 1,
                      end: Math.min(materialPage * MATERIALS_PER_PAGE, filteredMaterials.length),
                      total: filteredMaterials.length,
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMaterialPage((p) => Math.max(1, p - 1))}
                      disabled={materialPage === 1}
                      className="border-border text-text hover:bg-surface-elevated rounded-lg border p-2 transition-colors disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-text text-sm">
                      {materialPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMaterialPage((p) => Math.min(totalPages, p + 1))}
                      disabled={materialPage === totalPages}
                      className="border-border text-text hover:bg-surface-elevated rounded-lg border p-2 transition-colors disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {formData.selectedMaterials.length > 0 && (
                <div className="border-border bg-bg mt-6 rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-sm">
                      {tBundle("materialsSelected", { count: formData.selectedMaterials.length })}
                    </span>
                    <div className="text-right">
                      <div className="text-text-muted text-sm">
                        {tBundle("totalIndividualPrice")}
                      </div>
                      <div className="text-text text-lg font-bold">
                        {formatPrice(calculateTotal())}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="border-border bg-surface rounded-2xl border p-8">
              <h2 className="text-text mb-6 text-xl font-semibold">{tBundle("priceTitle")}</h2>

              <div>
                <label className="text-text mb-2 block text-sm font-medium">
                  {tBundle("priceLabel")} *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateFormData("price", e.target.value)}
                    onBlur={() => {
                      const val = parseFloat(formData.price);
                      if (!isNaN(val) && val > 0) {
                        updateFormData("price", roundToNearestHalfFranc(val).toFixed(2));
                      }
                    }}
                    required
                    min="0.50"
                    max="25"
                    step="0.50"
                    className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 pl-12 focus:ring-2 focus:outline-none"
                    placeholder={tBundle("pricePlaceholder")}
                  />
                  <span className="text-text-muted absolute top-1/2 left-4 -translate-y-1/2">
                    CHF
                  </span>
                </div>

                {formData.price && formData.selectedMaterials.length > 0 && (
                  <>
                    {calculateDiscount() > 0 ? (
                      <div className="border-success/30 bg-success/10 mt-4 rounded-xl border p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="text-success h-5 w-5" aria-hidden="true" />
                          <div>
                            <div className="text-success font-semibold">
                              {tBundle("savings", {
                                percent: calculateDiscount(),
                                amount: formatPrice(calculateSavingsChf()),
                              })}
                            </div>
                            <div className="text-text-muted text-sm">
                              {tBundle("savingsBuyerHint")}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-error/30 bg-error/10 mt-4 rounded-xl border p-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="text-error h-5 w-5 flex-shrink-0" />
                          <div>
                            <div className="text-error text-sm font-medium">
                              {tBundle("errorPriceMustBeLower", {
                                total: formatPrice(calculateTotal()),
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <p className="text-text-muted mt-2 text-xs">{tBundle("platformFeeHint")}</p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Link
                href="/konto"
                className="border-border bg-surface text-text hover:bg-surface-elevated flex-1 rounded-xl border px-6 py-4 text-center font-semibold transition-colors"
              >
                {tBundle("cancel")}
              </Link>
              <button
                type="submit"
                disabled={
                  formData.selectedMaterials.length < 2 ||
                  submitting ||
                  eszettCheck.hasAny ||
                  (formData.selectedMaterials.length > 0 &&
                    parseFloat(formData.price) > 0 &&
                    calculateDiscount() <= 0)
                }
                className="bg-primary text-text-on-accent shadow-primary/20 hover:bg-primary-hover flex-1 rounded-xl px-6 py-4 font-semibold shadow-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? tBundle("creating") : tBundle("createBundle")}
              </button>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
