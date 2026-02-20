"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SWISS_CANTONS } from "@/lib/validations/user";

// Cycles are stable, can be hardcoded
const CYCLES = ["Zyklus 1", "Zyklus 2", "Zyklus 3"];

interface ProfileFormData {
  display_name: string;
  avatar_url: string | null;
  bio: string;
  subjects: string[];
  cycles: string[];
  cantons: string[];
  email: string;
  instagram: string;
  pinterest: string;
  is_private: boolean;
}

const emptyFormData: ProfileFormData = {
  display_name: "",
  avatar_url: null,
  bio: "",
  subjects: [],
  cycles: [],
  cantons: [],
  email: "",
  instagram: "",
  pinterest: "",
  is_private: false,
};

export default function EditProfilePage() {
  const t = useTranslations("settingsProfile");
  const [formData, setFormData] = useState<ProfileFormData>(emptyFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch profile and curriculum data in parallel
        const [profileRes, curriculumRes] = await Promise.all([
          fetch("/api/users/me"),
          fetch("/api/curriculum?curriculum=LP21"),
        ]);

        if (!profileRes.ok) {
          throw new Error("Fehler beim Laden des Profils");
        }
        const profileData = await profileRes.json();
        setFormData({
          display_name: profileData.display_name || profileData.name || "",
          avatar_url: profileData.image || null,
          bio: profileData.bio || "",
          subjects: profileData.subjects || [],
          cycles: profileData.cycles || [],
          cantons: profileData.cantons || [],
          email: profileData.email || "",
          instagram: profileData.instagram || "",
          pinterest: profileData.pinterest || "",
          is_private: profileData.is_private || false,
        });

        if (curriculumRes.ok) {
          const curriculumData = await curriculumRes.json();
          // Extract subject names from curriculum data
          const subjects =
            curriculumData.subjects?.map((s: { name_de: string }) => s.name_de) || [];
          setSubjectOptions(subjects);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setErrors({ submit: "Fehler beim Laden des Profils" });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleChange = (field: string, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const uploadFormData = new FormData();
    uploadFormData.append("avatar", file);

    try {
      const response = await fetch("/api/users/me/avatar", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Fehler beim Hochladen");
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, avatar_url: data.url }));
      setSuccessMessage("Avatar erfolgreich hochgeladen!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setErrors({ avatar: "Fehler beim Hochladen des Avatars" });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.display_name || formData.display_name.length < 2) {
      newErrors.display_name = "Profilname muss mindestens 2 Zeichen haben";
    }
    if (formData.subjects.length === 0) {
      newErrors.subjects = "Mindestens ein Fach auswählen";
    }
    if (formData.cycles.length === 0) {
      newErrors.cycles = "Mindestens einen Zyklus auswählen";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setSuccessMessage("");

    try {
      const updatePayload = {
        display_name: formData.display_name,
        bio: formData.bio || null,
        subjects: formData.subjects,
        cycles: formData.cycles,
        cantons: formData.cantons,
        instagram: formData.instagram || null,
        pinterest: formData.pinterest || null,
        is_private: formData.is_private,
      };

      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Fehler beim Speichern");
      }

      setSuccessMessage("Profil erfolgreich gespeichert!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrors({ submit: "Fehler beim Speichern. Bitte versuchen Sie es erneut." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: "Profil bearbeiten" }]} />
          <h1 className="text-text text-2xl font-bold sm:text-3xl">Profil bearbeiten</h1>
          <p className="text-text-muted mt-1">
            Verwalten Sie Ihre öffentlichen Profilinformationen und Auszahlungsdaten
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="border-success/50 bg-success/10 text-success mb-6 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {successMessage}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="border-error/50 bg-error/10 text-error mb-6 rounded-lg border p-4">
            {errors.submit}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Public Profile Section */}
            <div className="border-border bg-surface rounded-2xl border p-8">
              <h2 className="text-text mb-6 text-xl font-semibold">Öffentliches Profil</h2>
              <p className="text-text-muted mb-6 text-sm">
                Diese Informationen sind für alle sichtbar
              </p>

              <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
                {/* Avatar */}
                <div className="flex justify-center lg:justify-start">
                  <AvatarUploader
                    currentAvatarUrl={formData.avatar_url}
                    displayName={formData.display_name}
                    onUpload={handleAvatarUpload}
                  />
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  {/* Display Name */}
                  <div>
                    <label className="text-text mb-2 block text-sm font-medium">
                      Profilname <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => handleChange("display_name", e.target.value)}
                      placeholder="z.B. Frau M. oder Maria S."
                      className={`bg-bg text-text focus:ring-primary/20 w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none ${
                        errors.display_name
                          ? "border-error focus:border-error"
                          : "border-border focus:border-primary"
                      }`}
                    />
                    {errors.display_name && (
                      <p className="text-error mt-1 text-sm">{errors.display_name}</p>
                    )}
                    <p className="text-text-muted mt-1 text-xs">
                      Tipp: Verwenden Sie ein Pseudonym für mehr Privatsphäre
                    </p>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="text-text mb-2 block text-sm font-medium">Über mich</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      placeholder="Erzählen Sie etwas über sich und Ihre Unterrichtserfahrung..."
                      rows={4}
                      maxLength={500}
                      className="border-border bg-bg text-text focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                    />
                    <p className="text-text-muted mt-1 text-right text-xs">
                      {formData.bio.length}/500 Zeichen
                    </p>
                  </div>

                  {/* Subjects */}
                  <MultiSelect
                    label={t("subjects")}
                    options={subjectOptions}
                    selected={formData.subjects}
                    onChange={(value) => handleChange("subjects", value)}
                    placeholder={t("subjectsPlaceholder")}
                    required
                    error={errors.subjects}
                  />

                  {/* Cycles */}
                  <MultiSelect
                    label={t("cycles")}
                    options={CYCLES}
                    selected={formData.cycles}
                    onChange={(value) => handleChange("cycles", value)}
                    placeholder={t("cyclesPlaceholder")}
                    required
                    error={errors.cycles}
                  />

                  {/* Cantons */}
                  <MultiSelect
                    label={t("cantons")}
                    options={SWISS_CANTONS}
                    selected={formData.cantons}
                    onChange={(value) => handleChange("cantons", value)}
                    placeholder={t("cantonsPlaceholder")}
                  />

                  {/* Social Media */}
                  <div className="border-border border-t pt-6">
                    <h3 className="text-text mb-4 text-lg font-medium">Social Media</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Instagram */}
                      <div>
                        <label className="text-text mb-2 block text-sm font-medium">
                          Instagram
                        </label>
                        <div className="relative">
                          <span className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                            @
                          </span>
                          <input
                            type="text"
                            value={formData.instagram}
                            onChange={(e) => handleChange("instagram", e.target.value)}
                            placeholder="deinname"
                            className="border-border bg-bg text-text focus:border-primary focus:ring-primary/20 w-full rounded-lg border py-2 pr-4 pl-8 focus:ring-2 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Pinterest */}
                      <div>
                        <label className="text-text mb-2 block text-sm font-medium">
                          Pinterest
                        </label>
                        <div className="relative">
                          <span className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                            @
                          </span>
                          <input
                            type="text"
                            value={formData.pinterest}
                            onChange={(e) => handleChange("pinterest", e.target.value)}
                            placeholder="deinname"
                            className="border-border bg-bg text-text focus:border-primary focus:ring-primary/20 w-full rounded-lg border py-2 pr-4 pl-8 focus:ring-2 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Settings Section */}
            <div className="border-border bg-surface rounded-2xl border p-8">
              <h2 className="text-text mb-6 text-xl font-semibold">Privatsphäre-Einstellungen</h2>

              <label className="flex cursor-pointer items-center gap-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.is_private}
                    onChange={(e) => handleChange("is_private", e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="border-border peer-checked:border-primary peer-checked:bg-primary flex h-5 w-5 items-center justify-center rounded border-2 transition-colors">
                    {formData.is_private && (
                      <svg
                        className="text-text-on-accent h-3 w-3"
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
                    )}
                  </div>
                </div>
                <span className="text-text text-sm font-medium">
                  Mein Profil soll privat bleiben
                </span>
                <div className="group relative">
                  <svg
                    className="text-text-muted h-4 w-4 cursor-help"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path strokeWidth="2" d="M12 16v-4M12 8h.01" />
                  </svg>
                  <div className="bg-surface-elevated border-border text-text invisible absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-lg border p-3 text-xs opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                    Wenn aktiviert, werden nur Ihr Name und Avatar auf Ihrem öffentlichen Profil
                    angezeigt. Ihre Bio, Fächer, Zyklen, Kantone, Statistiken und Social-Media-Links
                    bleiben verborgen.
                  </div>
                </div>
              </label>
            </div>

            {/* Email Section (Read-only) */}
            <div className="border-border bg-surface rounded-2xl border p-8">
              <h2 className="text-text mb-6 text-xl font-semibold">Konto-Einstellungen</h2>

              <div>
                <label className="text-text mb-2 block text-sm font-medium">E-Mail-Adresse</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="border-border bg-surface-elevated text-text-muted w-full cursor-not-allowed rounded-lg border px-4 py-2"
                />
                <p className="text-text-muted mt-1 text-xs">
                  E-Mail kann nicht geändert werden. Kontaktieren Sie den Support bei Problemen.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Link
                href="/konto/settings"
                className="border-border text-text hover:bg-surface-elevated rounded-lg border px-6 py-3 font-medium transition-colors"
              >
                Abbrechen
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary text-text-on-accent hover:bg-primary-hover disabled:bg-surface rounded-lg px-6 py-3 font-medium transition-colors disabled:opacity-60"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Speichern...
                  </span>
                ) : (
                  "Änderungen speichern"
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
