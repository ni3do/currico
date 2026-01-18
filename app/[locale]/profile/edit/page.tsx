"use client";

import { useState, useEffect } from "react";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { PayoutForm } from "@/components/profile/PayoutForm";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { SWISS_SUBJECTS, SWISS_CYCLES, SWISS_CANTONS } from "@/lib/validations/user";

interface ProfileFormData {
  display_name: string;
  avatar_url: string | null;
  bio: string;
  subjects: string[];
  cycles: string[];
  cantons: string[];
  email: string;
  legal_first_name: string;
  legal_last_name: string;
  iban: string;
  address_street: string;
  address_city: string;
  address_postal: string;
}

const emptyFormData: ProfileFormData = {
  display_name: "",
  avatar_url: null,
  bio: "",
  subjects: [],
  cycles: [],
  cantons: [],
  email: "",
  legal_first_name: "",
  legal_last_name: "",
  iban: "",
  address_street: "",
  address_city: "",
  address_postal: "",
};

export default function EditProfilePage() {
  const [formData, setFormData] = useState<ProfileFormData>(emptyFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/users/me");
        if (!response.ok) {
          throw new Error("Fehler beim Laden des Profils");
        }
        const data = await response.json();
        setFormData({
          display_name: data.display_name || data.name || "",
          avatar_url: data.image || null,
          bio: data.bio || "",
          subjects: data.subjects || [],
          cycles: data.cycles || [],
          cantons: data.cantons || [],
          email: data.email || "",
          legal_first_name: data.legal_first_name || "",
          legal_last_name: data.legal_last_name || "",
          iban: data.iban_set ? "****" : "",
          address_street: data.address_street || "",
          address_city: data.address_city || "",
          address_postal: data.address_postal || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setErrors({ submit: "Fehler beim Laden des Profils" });
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleChange = (field: string, value: string | string[]) => {
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

    // Public profile validation
    if (!formData.display_name || formData.display_name.length < 2) {
      newErrors.display_name = "Profilname muss mindestens 2 Zeichen haben";
    }
    if (formData.subjects.length === 0) {
      newErrors.subjects = "Mindestens ein Fach auswählen";
    }
    if (formData.cycles.length === 0) {
      newErrors.cycles = "Mindestens einen Zyklus auswählen";
    }

    // Payout info validation (if any payout field is filled, all required fields must be filled)
    // IBAN with asterisks means it's already set on the server
    const ibanIsSet = formData.iban && formData.iban.includes("*");
    const hasNewPayoutInfo =
      formData.legal_first_name || formData.legal_last_name || (formData.iban && !ibanIsSet);

    if (hasNewPayoutInfo) {
      if (!formData.legal_first_name) {
        newErrors.legal_first_name = "Vorname ist erforderlich";
      }
      if (!formData.legal_last_name) {
        newErrors.legal_last_name = "Nachname ist erforderlich";
      }
      if (!formData.iban && !ibanIsSet) {
        newErrors.iban = "IBAN ist erforderlich";
      }
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
      // Build the update payload with only fields that should be sent
      const updatePayload: Record<string, unknown> = {
        display_name: formData.display_name,
        bio: formData.bio || null,
        subjects: formData.subjects,
        cycles: formData.cycles,
        cantons: formData.cantons,
      };

      // Only include payout fields if they have actual values (not masked)
      if (formData.legal_first_name) {
        updatePayload.legal_first_name = formData.legal_first_name;
      }
      if (formData.legal_last_name) {
        updatePayload.legal_last_name = formData.legal_last_name;
      }
      // Only send IBAN if it's not the masked placeholder
      if (formData.iban && !formData.iban.includes("*")) {
        updatePayload.iban = formData.iban;
      }
      if (formData.address_street) {
        updatePayload.address_street = formData.address_street;
      }
      if (formData.address_city) {
        updatePayload.address_city = formData.address_city;
      }
      if (formData.address_postal) {
        updatePayload.address_postal = formData.address_postal;
      }

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
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">Profil bearbeiten</h1>
          <p className="mt-2 text-text-muted">
            Verwalten Sie Ihre öffentlichen Profilinformationen und Auszahlungsdaten
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 rounded-lg border border-success/50 bg-success/10 p-4 text-success">
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
          <div className="mb-6 rounded-lg border border-error/50 bg-error/10 p-4 text-error">
            {errors.submit}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Public Profile Section */}
            <div className="rounded-2xl border border-border bg-surface p-8">
              <h2 className="mb-6 text-xl font-semibold text-text">
                Öffentliches Profil
              </h2>
              <p className="mb-6 text-sm text-text-muted">
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
                    <label className="mb-2 block text-sm font-medium text-text">
                      Profilname <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => handleChange("display_name", e.target.value)}
                      placeholder="z.B. Frau M. oder Maria S."
                      className={`w-full rounded-lg border bg-bg px-4 py-2 text-text focus:ring-2 focus:ring-primary/20 focus:outline-none ${
                        errors.display_name
                          ? "border-error focus:border-error"
                          : "border-border focus:border-primary"
                      }`}
                    />
                    {errors.display_name && (
                      <p className="mt-1 text-sm text-error">
                        {errors.display_name}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-text-muted">
                      Tipp: Verwenden Sie ein Pseudonym für mehr Privatsphäre
                    </p>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text">
                      Über mich
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      placeholder="Erzählen Sie etwas über sich und Ihre Unterrichtserfahrung..."
                      rows={4}
                      maxLength={500}
                      className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                    <p className="mt-1 text-right text-xs text-text-muted">
                      {formData.bio.length}/500 Zeichen
                    </p>
                  </div>

                  {/* Subjects */}
                  <MultiSelect
                    label="Unterrichtsfächer"
                    options={SWISS_SUBJECTS}
                    selected={formData.subjects}
                    onChange={(value) => handleChange("subjects", value)}
                    placeholder="Fächer auswählen..."
                    required
                    error={errors.subjects}
                  />

                  {/* Cycles */}
                  <MultiSelect
                    label="Unterrichtete Zyklen"
                    options={SWISS_CYCLES}
                    selected={formData.cycles}
                    onChange={(value) => handleChange("cycles", value)}
                    placeholder="Zyklen auswählen..."
                    required
                    error={errors.cycles}
                  />

                  {/* Cantons */}
                  <MultiSelect
                    label="Kantone"
                    options={SWISS_CANTONS}
                    selected={formData.cantons}
                    onChange={(value) => handleChange("cantons", value)}
                    placeholder="Kantone auswählen (optional)..."
                  />
                </div>
              </div>
            </div>

            {/* Payout Information Section */}
            <div className="rounded-2xl border border-border bg-surface p-8">
              <h2 className="mb-6 text-xl font-semibold text-text">
                Auszahlungsinformationen
              </h2>
              <p className="mb-6 text-sm text-text-muted">
                Diese Informationen sind <strong>nicht öffentlich</strong> und werden nur für
                Rechnungen und Auszahlungen verwendet
              </p>

              <PayoutForm
                legalFirstName={formData.legal_first_name}
                legalLastName={formData.legal_last_name}
                iban={formData.iban}
                addressStreet={formData.address_street}
                addressCity={formData.address_city}
                addressPostal={formData.address_postal}
                onChange={handleChange}
                errors={errors}
              />
            </div>

            {/* Email Section (Read-only) */}
            <div className="rounded-2xl border border-border bg-surface p-8">
              <h2 className="mb-6 text-xl font-semibold text-text">
                Konto-Einstellungen
              </h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-border bg-surface-elevated px-4 py-2 text-text-muted"
                />
                <p className="mt-1 text-xs text-text-muted">
                  E-Mail kann nicht geändert werden. Kontaktieren Sie den Support bei Problemen.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Link
                href="/profile"
                className="rounded-lg border border-border px-6 py-3 font-medium text-text transition-colors hover:bg-surface-elevated"
              >
                Abbrechen
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-primary px-6 py-3 font-medium text-text-on-accent transition-colors hover:bg-primary-hover disabled:bg-surface disabled:opacity-50"
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
