"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LoginLink } from "@/components/ui/LoginLink";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useToast } from "@/components/ui/Toast";
import { MaterialTypeBadge } from "@/components/ui/MaterialTypeBadge";
import {
  EnhancedCurriculumSelector,
  FormField,
  FormInput,
  FormTextarea,
  RadioOption,
  TagInput,
} from "@/components/upload";
import { SONSTIGE_CODE } from "@/lib/validations/material";
import { checkForEszett, replaceEszett } from "@/lib/validations/swiss-quality";
import { roundToNearestHalfFranc } from "@/lib/utils/price";
import { getFachbereichByCode } from "@/lib/data/lehrplan21";
import { SELLER_PAYOUT_PERCENT } from "@/lib/constants";
import { Save, Loader2, Lock, AlertTriangle, Info, ExternalLink, Eye, Upload } from "lucide-react";

interface MaterialEditData {
  id: string;
  title: string;
  description: string;
  price: number;
  fileFormat?: string;
  previewUrl: string | null;
  subjects: string[];
  cycles: string[];
  tags?: string[];
  isApproved: boolean;
  isPublished?: boolean;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  seller: { id: string };
}

interface FormState {
  title: string;
  description: string;
  cycle: string;
  subject: string;
  subjectCode: string;
  tags: string[];
  priceType: "free" | "paid";
  price: string;
  isPublished: boolean;
}

/**
 * Parse "Zyklus 2" → "2", or return empty string
 */
function parseCycleNumber(cycleStr: string): string {
  const match = cycleStr.match(/\d+/);
  return match ? match[0] : "";
}

/**
 * Map a subject code like "MA" to its display name via LP21 data
 */
function resolveSubjectName(code: string): string {
  if (code === SONSTIGE_CODE) return "Sonstige";
  const fb = getFachbereichByCode(code);
  return fb ? fb.name : code;
}

export default function EditMaterialPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const t = useTranslations("editMaterial");
  const tCommon = useTranslations("common");
  const tFields = useTranslations("uploadWizard.fields");
  const tValidation = useTranslations("uploadWizard.validation");
  const tEszett = useTranslations("uploadWizard.eszett");
  const { toast } = useToast();

  const materialId = params.id as string;

  // Loading / error states
  const [material, setMaterial] = useState<MaterialEditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    cycle: "",
    subject: "",
    subjectCode: "",
    tags: [],
    priceType: "free",
    price: "",
    isPublished: true,
  });

  // Initial values for dirty tracking
  const initialFormRef = useRef<FormState | null>(null);

  // Touched tracking
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  // Duplicate title state
  const [duplicateTitle, setDuplicateTitle] = useState<{
    exists: boolean;
    matchType?: "exact" | "similar";
    existingTitle?: string;
    existingId?: string;
  } | null>(null);

  // Update a form field
  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Fetch material data
  useEffect(() => {
    if (!materialId) return;

    async function fetchMaterial() {
      try {
        const response = await fetch(`/api/materials/${materialId}`);
        if (!response.ok) {
          setError(t("notFound"));
          setLoading(false);
          return;
        }
        const data = await response.json();
        const m = data.material as MaterialEditData;
        setMaterial(m);

        // Map API data to form state
        const cycleNum = m.cycles[0] ? parseCycleNumber(m.cycles[0]) : "";
        const subjectCode = m.subjects[0] || "";
        const subjectName = subjectCode ? resolveSubjectName(subjectCode) : "";
        const priceInCHF = m.price / 100;
        const isPaid = m.price > 0;

        const initialState: FormState = {
          title: m.title,
          description: m.description,
          cycle: cycleNum,
          subject: subjectName,
          subjectCode: subjectCode,
          tags: Array.isArray(m.tags) ? m.tags : [],
          priceType: isPaid ? "paid" : "free",
          price: isPaid ? priceInCHF.toFixed(2) : "",
          isPublished: m.isPublished ?? true,
        };

        setForm(initialState);
        initialFormRef.current = initialState;
      } catch {
        setError(t("errorLoad"));
      } finally {
        setLoading(false);
      }
    }

    fetchMaterial();
  }, [materialId, t]);

  // Dirty tracking
  const isDirty = useMemo(() => {
    if (!initialFormRef.current) return false;
    const init = initialFormRef.current;
    return (
      form.title !== init.title ||
      form.description !== init.description ||
      form.cycle !== init.cycle ||
      form.subjectCode !== init.subjectCode ||
      JSON.stringify(form.tags) !== JSON.stringify(init.tags) ||
      form.priceType !== init.priceType ||
      form.price !== init.price ||
      form.isPublished !== init.isPublished
    );
  }, [form]);

  // Beforeunload guard
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Eszett check
  const eszettCheck = useMemo(() => {
    const titleCheck = checkForEszett(form.title);
    const descriptionCheck = checkForEszett(form.description);
    return {
      title: titleCheck,
      description: descriptionCheck,
      hasAny: titleCheck.hasEszett || descriptionCheck.hasEszett,
      totalCount: titleCheck.count + descriptionCheck.count,
    };
  }, [form.title, form.description]);

  const handleFixEszett = () => {
    updateField("title", replaceEszett(form.title));
    updateField("description", replaceEszett(form.description));
  };

  // Duplicate title check (debounced)
  useEffect(() => {
    const title = form.title.trim();
    if (title.length < 3) {
      setDuplicateTitle(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/materials/check-title?title=${encodeURIComponent(title)}&excludeId=${materialId}`
        );
        if (res.ok) {
          const data = await res.json();
          setDuplicateTitle(data);
        }
      } catch {
        // Silently ignore
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [form.title, materialId]);

  // Validation
  const titleError = useMemo(() => {
    if (!touched.title) return undefined;
    const len = form.title.trim().length;
    if (len === 0) return tValidation("titleRequired");
    if (len < 3) return tValidation("titleMinLength");
    if (len > 64) return tValidation("titleMaxLength");
    return undefined;
  }, [form.title, touched.title, tValidation]);

  const descriptionError = useMemo(() => {
    if (!touched.description) return undefined;
    const len = form.description.trim().length;
    if (len === 0) return tValidation("descriptionRequired");
    if (len < 10) return tValidation("descriptionMinLength");
    if (len > 5000) return tValidation("descriptionMaxLength");
    return undefined;
  }, [form.description, touched.description, tValidation]);

  // Check ownership
  const isOwner = session?.user?.id && material?.seller?.id === session.user.id;

  // Save handler
  const handleSave = async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    setError(null);

    try {
      const init = initialFormRef.current!;
      const body: Record<string, unknown> = {};

      if (form.title !== init.title) body.title = form.title;
      if (form.description !== init.description) body.description = form.description;
      if (form.isPublished !== init.isPublished) body.is_published = form.isPublished;

      // Curriculum changes
      if (form.subjectCode !== init.subjectCode) {
        body.subjects = [form.subjectCode];
      }
      if (form.cycle !== init.cycle) {
        body.cycles = form.cycle ? [`Zyklus ${form.cycle}`] : [];
      }
      // Tags changes
      if (JSON.stringify(form.tags) !== JSON.stringify(init.tags)) {
        body.tags = form.tags;
      }

      // Price changes (only if not approved)
      if (
        !material?.isApproved &&
        (form.priceType !== init.priceType || form.price !== init.price)
      ) {
        if (form.priceType === "free") {
          body.price = 0;
        } else {
          const val = parseFloat(form.price || "0");
          body.price = Math.round(val * 100);
        }
      }

      const response = await fetch(`/api/materials/${materialId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error === "PRICE_CHANGE_AFTER_APPROVAL") {
          setError(t("errorPriceApproved"));
        } else if (data.error === "VALIDATION_ERROR") {
          setError(t("errorValidation"));
        } else {
          setError(data.error || t("errorSave"));
        }
        return;
      }

      toast(t("successRedirect"), "success");
      router.push(`/materialien/${materialId}`);
    } catch {
      setError(t("errorSave"));
    } finally {
      setSaving(false);
    }
  };

  // --- Render ---

  // Auth loading
  if (sessionStatus === "loading") {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="flex flex-1 items-center justify-center px-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  // Not logged in
  if (sessionStatus === "unauthenticated" || !session) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="mx-auto max-w-md text-center">
            <div className="bg-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
              <Upload className="text-primary h-8 w-8" />
            </div>
            <h1 className="text-text text-2xl font-bold">{t("authRequired")}</h1>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <LoginLink className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors">
                {tCommon("navigation.login")}
              </LoginLink>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Loading material
  if (loading) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
            <p className="text-text-muted mt-4 text-sm">{t("loading")}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Material not found
  if (!material) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="mx-auto max-w-md text-center">
            <h1 className="text-text mb-2 text-2xl font-bold">{t("notFound")}</h1>
            <p className="text-text-muted">{t("notFoundDesc")}</p>
            <Link
              href="/konto/uploads"
              className="bg-primary text-text-on-accent hover:bg-primary-hover mt-6 inline-flex items-center rounded-xl px-6 py-3 text-sm font-semibold transition-colors"
            >
              {t("backToUploads")}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not owner
  if (!isOwner) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="mx-auto max-w-md text-center">
            <h1 className="text-text mb-2 text-2xl font-bold">{t("notOwner")}</h1>
            <p className="text-text-muted">{t("notOwnerDesc")}</p>
            <Link
              href="/konto/uploads"
              className="bg-primary text-text-on-accent hover:bg-primary-hover mt-6 inline-flex items-center rounded-xl px-6 py-3 text-sm font-semibold transition-colors"
            >
              {t("backToUploads")}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumb
            items={[
              { label: tCommon("breadcrumb.materials"), href: "/materialien" },
              {
                label: material.title,
                href: `/materialien/${materialId}`,
              },
              { label: t("breadcrumbEdit") },
            ]}
          />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-text text-2xl font-bold sm:text-3xl">{t("pageTitle")}</h1>
              <p className="text-text-muted mt-1 text-sm">{t("pageSubtitle")}</p>
            </div>
            <Link
              href={`/materialien/${materialId}`}
              className="text-text-muted hover:text-text flex items-center gap-2 text-sm transition-colors"
            >
              <Eye className="h-4 w-4" />
              {tCommon("buttons.view")}
            </Link>
          </div>
        </div>

        {/* Status banners */}
        {material.status === "PENDING" && (
          <div className="border-warning/30 bg-warning/10 mb-6 flex items-center gap-3 rounded-xl border p-4">
            <Info className="text-warning h-5 w-5 flex-shrink-0" />
            <p className="text-text text-sm">{t("statusPending")}</p>
          </div>
        )}
        {material.status === "REJECTED" && (
          <div className="border-error/30 bg-error/10 mb-6 flex items-center gap-3 rounded-xl border p-4">
            <AlertTriangle className="text-error h-5 w-5 flex-shrink-0" />
            <p className="text-text text-sm">{t("statusRejected")}</p>
          </div>
        )}

        {/* Eszett warning */}
        {eszettCheck.hasAny && (
          <div role="alert" className="border-warning/50 bg-warning/10 mb-6 rounded-xl border p-4">
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
                  className="bg-warning text-text-on-accent hover:bg-warning/90 mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  {tEszett("fix")}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* File Info Section (read-only) */}
          <section className="border-border bg-surface rounded-2xl border p-6 shadow-lg shadow-black/5">
            <h2 className="text-text mb-4 text-lg font-semibold">{t("sectionFile")}</h2>
            <div className="flex items-center gap-4">
              {material.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={material.previewUrl}
                  alt={material.title}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="bg-surface-hover flex h-16 w-16 items-center justify-center rounded-lg">
                  <MaterialTypeBadge format={material.fileFormat || "pdf"} />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {material.fileFormat && <MaterialTypeBadge format={material.fileFormat} />}
                </div>
                <p className="text-text-muted mt-1 text-sm">{t("fileReadOnly")}</p>
              </div>
            </div>
          </section>

          {/* Basics Section */}
          <section className="border-border bg-surface rounded-2xl border p-6 shadow-lg shadow-black/5">
            <h2 className="text-text mb-4 text-lg font-semibold">{t("sectionBasics")}</h2>
            <div className="space-y-5">
              <FormField
                label={t("titleLabel")}
                required
                error={titleError}
                touched={!!touched.title}
                hint={t("titleHint")}
              >
                <FormInput
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  onBlur={() => markTouched("title")}
                  hasError={!!touched.title && !!titleError}
                  placeholder={t("titlePlaceholder")}
                  maxLength={64}
                />
              </FormField>

              {/* Duplicate title warning */}
              {duplicateTitle?.exists && duplicateTitle.matchType === "exact" && (
                <div className="border-warning/50 bg-warning/10 -mt-3 rounded-xl border p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="text-warning mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div className="text-sm">
                      <span className="text-warning font-medium">{tFields("duplicateTitle")}</span>
                      {duplicateTitle.existingId && (
                        <Link
                          href={`/materialien/${duplicateTitle.existingId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary ml-2 inline-flex items-center gap-1 text-sm font-medium hover:underline"
                        >
                          {tFields("duplicateTitleLink")}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {duplicateTitle?.exists && duplicateTitle.matchType === "similar" && (
                <div className="border-info/50 bg-info/10 -mt-3 rounded-xl border p-3">
                  <div className="flex items-start gap-2">
                    <Info className="text-info mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div className="text-sm">
                      <span className="text-info font-medium">
                        {tFields("similarTitle", {
                          title: duplicateTitle.existingTitle ?? "",
                        })}
                      </span>
                      {duplicateTitle.existingId && (
                        <Link
                          href={`/materialien/${duplicateTitle.existingId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary ml-2 inline-flex items-center gap-1 text-sm font-medium hover:underline"
                        >
                          {tFields("duplicateTitleLink")}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <FormField
                label={t("descriptionLabel")}
                required
                error={descriptionError}
                touched={!!touched.description}
                hint={t("descriptionHint", {
                  count: form.description.length,
                })}
              >
                <FormTextarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  onBlur={() => markTouched("description")}
                  hasError={!!touched.description && !!descriptionError}
                  placeholder={t("descriptionPlaceholder")}
                  rows={5}
                  maxLength={5000}
                />
              </FormField>
            </div>
          </section>

          {/* Tags Section */}
          <section className="border-border bg-surface rounded-2xl border p-6 shadow-lg shadow-black/5">
            <h2 className="text-text mb-4 text-lg font-semibold">{tFields("tags")}</h2>
            <FormField label={tFields("tags")} hint={tFields("tagsHint")}>
              <TagInput
                tags={form.tags}
                onChange={(tags) => updateField("tags", tags)}
                placeholder={tFields("tagsPlaceholder")}
                maxMessage={tFields("tagMax")}
                duplicateMessage={tFields("tagDuplicate")}
              />
            </FormField>
          </section>

          {/* Curriculum Section */}
          <section className="border-border bg-surface rounded-2xl border p-6 shadow-lg shadow-black/5">
            <h2 className="text-text mb-4 text-lg font-semibold">{t("sectionCurriculum")}</h2>
            <EnhancedCurriculumSelector
              cycle={form.cycle}
              subject={form.subject}
              subjectCode={form.subjectCode}
              canton=""
              competencies={[]}
              onCycleChange={(cycle) => updateField("cycle", cycle)}
              onSubjectChange={(subject, code) => {
                updateField("subject", subject);
                updateField("subjectCode", code || "");
              }}
              onCantonChange={() => {}}
              onCompetenciesChange={() => {}}
              touchedCycle={!!touched.cycle}
              touchedSubject={!!touched.subject}
              onCycleBlur={() => markTouched("cycle")}
              onSubjectBlur={() => markTouched("subject")}
            />
          </section>

          {/* Price Section */}
          <section className="border-border bg-surface rounded-2xl border p-6 shadow-lg shadow-black/5">
            <h2 className="text-text mb-4 text-lg font-semibold">{t("sectionPrice")}</h2>

            {material.isApproved ? (
              <div className="border-border bg-surface-elevated rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <Lock className="text-text-muted h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="text-text font-medium">
                      {t("priceLocked")} &mdash;{" "}
                      {material.price === 0
                        ? tCommon("free")
                        : `CHF ${(material.price / 100).toFixed(2)}`}
                    </p>
                    <p className="text-text-muted mt-1 text-sm">{t("priceLockedDesc")}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div
                  className="grid grid-cols-2 gap-4"
                  role="radiogroup"
                  aria-label={t("sectionPrice")}
                >
                  <RadioOption
                    name="priceType"
                    value="free"
                    checked={form.priceType === "free"}
                    onChange={(val) => updateField("priceType", val as "free" | "paid")}
                    label={t("priceFree")}
                    description={t("priceFreeDesc")}
                  />
                  <RadioOption
                    name="priceType"
                    value="paid"
                    checked={form.priceType === "paid"}
                    onChange={(val) => updateField("priceType", val as "free" | "paid")}
                    label={t("pricePaid")}
                    description={t("pricePaidDesc")}
                  />
                </div>

                {form.priceType === "paid" && (
                  <div>
                    <FormField label={t("priceLabel")} required hint={t("priceHint")}>
                      <div className="relative">
                        <FormInput
                          type="number"
                          value={form.price}
                          onChange={(e) => updateField("price", e.target.value)}
                          onBlur={() => {
                            markTouched("price");
                            const val = parseFloat(form.price);
                            if (!isNaN(val) && val > 0) {
                              updateField("price", roundToNearestHalfFranc(val).toFixed(2));
                            }
                          }}
                          min="0.50"
                          max="50"
                          step="0.50"
                          placeholder={t("pricePlaceholder")}
                          className="pl-14"
                        />
                        <span className="text-text-muted absolute top-1/2 left-4 -translate-y-1/2 font-medium">
                          CHF
                        </span>
                      </div>
                    </FormField>

                    {form.price && parseFloat(form.price) > 0 && (
                      <div className="border-success/30 bg-success/5 mt-4 rounded-xl border p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted text-sm">{t("earningsPerSale")}</span>
                          <span className="text-success text-lg font-bold">
                            CHF{" "}
                            {((parseFloat(form.price) * SELLER_PAYOUT_PERCENT) / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Publish Section */}
          <section className="border-border bg-surface rounded-2xl border p-6 shadow-lg shadow-black/5">
            <h2 className="text-text mb-4 text-lg font-semibold">{t("sectionPublish")}</h2>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => updateField("isPublished", e.target.checked)}
                className="accent-primary h-5 w-5 rounded"
              />
              <div>
                <p className="text-text font-medium">{t("publishedLabel")}</p>
                <p className="text-text-muted text-sm">
                  {form.isPublished ? t("publishedDesc") : t("unpublishedDesc")}
                </p>
              </div>
            </label>
          </section>

          {/* Error */}
          {error && <div className="bg-error/10 text-error rounded-xl p-4 text-sm">{error}</div>}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/konto/uploads"
              className="text-text-muted hover:text-text text-sm font-medium transition-colors"
            >
              {t("backToUploads")}
            </Link>
            <button
              onClick={handleSave}
              disabled={
                saving || !isDirty || !!titleError || !!descriptionError || eszettCheck.hasAny
              }
              className="bg-primary text-text-on-accent shadow-primary/25 hover:bg-primary-hover disabled:bg-text-muted inline-flex items-center gap-2 rounded-xl px-8 py-3 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? t("saving") : !isDirty ? t("noChanges") : t("save")}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
