"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  Mail,
  GraduationCap,
  Globe,
  Shield,
  Check,
  X,
  Building2,
  Clock,
  Languages,
  Link2,
  Eye,
  EyeOff,
  CircleCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccountData } from "@/lib/hooks/useAccountData";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { ProfileCompletionProgress } from "@/components/account/ProfileCompletionProgress";
import { CYCLES } from "@/lib/types/account";
import { SWISS_CANTONS } from "@/lib/validations/user";

// Teaching experience options
const TEACHING_EXPERIENCE_OPTIONS = [
  { value: "0-2", label: "0-2 Jahre" },
  { value: "3-5", label: "3-5 Jahre" },
  { value: "6-10", label: "6-10 Jahre" },
  { value: "11-20", label: "11-20 Jahre" },
  { value: "20+", label: "Über 20 Jahre" },
];

export default function SettingsProfilePage() {
  const { userData, refreshUserData } = useAccountData();

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Profile editing state
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState<{
    display_name: string;
    bio: string;
    subjects: string[];
    cycles: string[];
    cantons: string[];
    website: string;
    school: string;
    teaching_experience: string;
    preferred_language: string;
    instagram: string;
    pinterest: string;
    is_private: boolean;
  }>({
    display_name: "",
    bio: "",
    subjects: [],
    cycles: [],
    cantons: [],
    website: "",
    school: "",
    teaching_experience: "",
    preferred_language: "de",
    instagram: "",
    pinterest: "",
    is_private: false,
  });
  const [initialProfileData, setInitialProfileData] = useState<typeof profileFormData | null>(null);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Subject options from database
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);

  // Fetch curriculum data for subject options
  const fetchCurriculum = useCallback(async () => {
    try {
      const response = await fetch("/api/curriculum?curriculum=LP21");
      if (response.ok) {
        const data = await response.json();
        const subjects = data.subjects?.map((s: { name_de: string }) => s.name_de) || [];
        setSubjectOptions(subjects);
      }
    } catch (error) {
      console.error("Error fetching curriculum:", error);
    }
  }, []);

  // Initialize form data from userData
  useEffect(() => {
    if (userData) {
      setAvatarUrl(userData.image || null);
      const formData = {
        display_name: userData.name || userData.displayName || "",
        bio: userData.bio || "",
        subjects: userData.subjects || [],
        cycles: userData.cycles || [],
        cantons: userData.cantons || [],
        website: userData.website || "",
        school: userData.school || "",
        teaching_experience: userData.teaching_experience || "",
        preferred_language: userData.preferred_language || "de",
        instagram: userData.instagram || "",
        pinterest: userData.pinterest || "",
        is_private: userData.is_private || false,
      };
      setProfileFormData(formData);
      setInitialProfileData(formData);
    }
  }, [userData]);

  // Fetch curriculum on mount
  useEffect(() => {
    fetchCurriculum();
  }, [fetchCurriculum]);

  // Check if profile has unsaved changes
  const hasProfileChanges = useCallback(() => {
    if (!initialProfileData) return false;
    return (
      profileFormData.display_name !== initialProfileData.display_name ||
      profileFormData.bio !== initialProfileData.bio ||
      JSON.stringify(profileFormData.subjects) !== JSON.stringify(initialProfileData.subjects) ||
      JSON.stringify(profileFormData.cycles) !== JSON.stringify(initialProfileData.cycles) ||
      JSON.stringify(profileFormData.cantons) !== JSON.stringify(initialProfileData.cantons) ||
      profileFormData.website !== initialProfileData.website ||
      profileFormData.school !== initialProfileData.school ||
      profileFormData.teaching_experience !== initialProfileData.teaching_experience ||
      profileFormData.preferred_language !== initialProfileData.preferred_language ||
      profileFormData.instagram !== initialProfileData.instagram ||
      profileFormData.pinterest !== initialProfileData.pinterest ||
      profileFormData.is_private !== initialProfileData.is_private
    );
  }, [profileFormData, initialProfileData]);

  // Cancel editing - reset to initial values
  const handleCancelEditing = () => {
    if (initialProfileData) {
      setProfileFormData(initialProfileData);
    }
    setProfileErrors({});
    setProfileMessage(null);
  };

  // Handle profile form field change
  const handleProfileFieldChange = (field: string, value: string | string[] | boolean) => {
    setProfileFormData((prev) => ({ ...prev, [field]: value }));
    if (profileErrors[field]) {
      setProfileErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Save all profile fields
  const handleSaveProfile = async () => {
    const errors: Record<string, string> = {};

    // Validate display name
    if (!profileFormData.display_name || profileFormData.display_name.length < 2) {
      errors.display_name = "Name muss mindestens 2 Zeichen haben";
    }
    // Validate website URL if provided
    if (profileFormData.website) {
      try {
        new URL(profileFormData.website);
      } catch {
        errors.website = "Ungültige URL (z.B. https://example.com)";
      }
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setIsSavingProfile(true);
    setProfileMessage(null);

    try {
      const updatePayload = {
        display_name: profileFormData.display_name,
        bio: profileFormData.bio || null,
        subjects: profileFormData.subjects,
        cycles: profileFormData.cycles,
        cantons: profileFormData.cantons,
        website: profileFormData.website || null,
        school: profileFormData.school || null,
        teaching_experience: profileFormData.teaching_experience || null,
        preferred_language: profileFormData.preferred_language,
        instagram: profileFormData.instagram || null,
        pinterest: profileFormData.pinterest || null,
        is_private: profileFormData.is_private,
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

      // Update initial data to match saved data
      setInitialProfileData(profileFormData);
      setProfileMessage({ type: "success", text: "Änderungen gespeichert!" });
      setTimeout(() => setProfileMessage(null), 3000);

      // Refresh shared user data
      await refreshUserData();
    } catch (error) {
      console.error("Error saving profile:", error);
      setProfileMessage({
        type: "error",
        text: "Fehler beim Speichern. Bitte versuchen Sie es erneut.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    setAvatarMessage(null);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch("/api/users/me/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Fehler beim Hochladen");
      }

      const data = await response.json();
      setAvatarUrl(data.url);
      setAvatarMessage({ type: "success", text: "Profilbild erfolgreich hochgeladen!" });
      setTimeout(() => setAvatarMessage(null), 3000);

      // Refresh shared user data
      await refreshUserData();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setAvatarMessage({
        type: "error",
        text: "Fehler beim Hochladen. Bitte versuchen Sie es erneut.",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle avatar deletion
  const handleAvatarDelete = async () => {
    if (isDeletingAvatar) return;

    setIsDeletingAvatar(true);
    setAvatarMessage(null);

    try {
      const response = await fetch("/api/users/me/avatar", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Fehler beim Löschen");
      }

      setAvatarUrl(null);
      setAvatarMessage({ type: "success", text: "Profilbild erfolgreich entfernt!" });
      setTimeout(() => setAvatarMessage(null), 3000);

      // Refresh shared user data
      await refreshUserData();
    } catch (error) {
      console.error("Error deleting avatar:", error);
      setAvatarMessage({
        type: "error",
        text: "Fehler beim Löschen. Bitte versuchen Sie es erneut.",
      });
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  // Calculate profile completion
  const getProfileCompletion = () => {
    const items = [
      { done: !!userData?.emailVerified, label: "E-Mail verifizieren" },
      { done: !!(userData?.displayName || userData?.name), label: "Anzeigename" },
      { done: !!userData?.image, label: "Profilbild" },
      { done: userData?.subjects && userData.subjects.length > 0, label: "Fächer" },
      { done: userData?.cycles && userData.cycles.length > 0, label: "Zyklen" },
      { done: userData?.cantons && userData.cantons.length > 0, label: "Kanton" },
    ];
    const completed = items.filter((i) => i.done).length;
    const missing = items.filter((i) => !i.done).map((i) => i.label);
    return {
      percentage: Math.round((completed / items.length) * 100),
      missing,
      completed,
      total: items.length,
    };
  };

  const displayName = userData?.name || userData?.displayName || "Benutzer";

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Completion Progress */}
      {(() => {
        const completion = getProfileCompletion();
        return completion.percentage < 100 ? (
          <div className="border-border bg-surface rounded-xl border p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <CircleCheck className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-text font-semibold">Profil vervollständigen</h3>
                  <p className="text-text-muted text-sm">
                    {completion.completed} von {completion.total} Feldern ausgefüllt
                  </p>
                </div>
              </div>
              <span className="text-primary text-lg font-bold">{completion.percentage}%</span>
            </div>
            <div className="bg-border h-2 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${completion.percentage}%` }}
              />
            </div>
            {completion.missing.length > 0 && (
              <p className="text-text-muted mt-2 text-xs">
                Fehlend: {completion.missing.slice(0, 3).join(", ")}
                {completion.missing.length > 3 && ` und ${completion.missing.length - 3} weitere`}
              </p>
            )}
          </div>
        ) : null;
      })()}

      {/* Success/Error Toast */}
      <AnimatePresence>
        {(profileMessage || avatarMessage) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-3 rounded-xl border p-4 ${
              (profileMessage?.type || avatarMessage?.type) === "success"
                ? "border-success/30 bg-success/5"
                : "border-error/30 bg-error/5"
            }`}
          >
            {(profileMessage?.type || avatarMessage?.type) === "success" ? (
              <Check className="text-success h-5 w-5" />
            ) : (
              <X className="text-error h-5 w-5" />
            )}
            <span
              className={`text-sm font-medium ${
                (profileMessage?.type || avatarMessage?.type) === "success"
                  ? "text-success"
                  : "text-error"
              }`}
            >
              {profileMessage?.text || avatarMessage?.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Profile Card */}
      <div className="border-border bg-surface overflow-hidden rounded-xl border">
        {/* Avatar Section */}
        <div className="border-border border-b p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <AvatarUploader
                currentAvatarUrl={avatarUrl}
                displayName={displayName}
                onUpload={handleAvatarUpload}
              />
              {isUploadingAvatar && (
                <div className="bg-bg/80 absolute inset-0 flex items-center justify-center rounded-full">
                  <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-text font-medium">Profilbild</p>
              <p className="text-text-muted text-sm">Klicken Sie auf das Bild, um es zu ändern</p>
              {avatarUrl && (
                <button
                  onClick={handleAvatarDelete}
                  disabled={isDeletingAvatar}
                  className="text-error text-left text-sm font-medium hover:underline disabled:opacity-50"
                >
                  {isDeletingAvatar ? "Wird entfernt..." : "Bild entfernen"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="space-y-5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <User className="text-primary h-5 w-5" />
            <h3 className="text-text font-semibold">Grundinformationen</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-text mb-1.5 block text-sm font-medium">
                Anzeigename <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={profileFormData.display_name}
                onChange={(e) => handleProfileFieldChange("display_name", e.target.value)}
                placeholder="z.B. Frau M. oder Maria S."
                className={`input w-full ${profileErrors.display_name ? "border-error" : ""}`}
              />
              {profileErrors.display_name && (
                <p className="text-error mt-1 text-xs">{profileErrors.display_name}</p>
              )}
            </div>
            <div>
              <label className="text-text mb-1.5 block text-sm font-medium">E-Mail</label>
              <div className="relative">
                <Mail className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  type="email"
                  value={userData?.email || ""}
                  disabled
                  className="input bg-bg-secondary text-text-muted w-full cursor-not-allowed pl-10"
                />
              </div>
              <p className="text-text-muted mt-1 text-xs">
                Kontaktieren Sie uns, um Ihre E-Mail zu ändern
              </p>
            </div>
          </div>

          <div>
            <label className="text-text mb-1.5 block text-sm font-medium">Über mich</label>
            <textarea
              value={profileFormData.bio}
              onChange={(e) => handleProfileFieldChange("bio", e.target.value)}
              placeholder="Erzählen Sie etwas über sich und Ihren Unterricht..."
              rows={3}
              maxLength={500}
              className="input w-full resize-none"
            />
            <p className="text-text-muted mt-1 text-right text-xs">
              {profileFormData.bio.length}/500
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-border border-t" />

        {/* Teaching Profile Section */}
        <div className="space-y-5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <GraduationCap className="text-success h-5 w-5" />
            <h3 className="text-text font-semibold">Unterrichtsprofil</h3>
          </div>

          <MultiSelect
            label="Fächer"
            options={subjectOptions}
            selected={profileFormData.subjects}
            onChange={(value) => handleProfileFieldChange("subjects", value)}
            placeholder="Fächer auswählen..."
          />
          <MultiSelect
            label="Zyklen"
            options={CYCLES}
            selected={profileFormData.cycles}
            onChange={(value) => handleProfileFieldChange("cycles", value)}
            placeholder="Zyklen auswählen..."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-text mb-1.5 block text-sm font-medium">
                Schule / Institution
              </label>
              <div className="relative">
                <Building2 className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  value={profileFormData.school}
                  onChange={(e) => handleProfileFieldChange("school", e.target.value)}
                  placeholder="z.B. Primarschule Muster"
                  className="input w-full pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-text mb-1.5 block text-sm font-medium">
                Unterrichtserfahrung
              </label>
              <div className="relative">
                <Clock className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <select
                  value={profileFormData.teaching_experience}
                  onChange={(e) => handleProfileFieldChange("teaching_experience", e.target.value)}
                  className="input w-full appearance-none rounded-full pl-10"
                >
                  <option value="">Bitte auswählen</option>
                  {TEACHING_EXPERIENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-border border-t" />

        {/* Contact & Social Section */}
        <div className="space-y-5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="text-accent h-5 w-5" />
            <h3 className="text-text font-semibold">Kontakt & Social Media</h3>
          </div>

          <MultiSelect
            label="Kantone"
            options={[...SWISS_CANTONS]}
            selected={profileFormData.cantons}
            onChange={(value) => handleProfileFieldChange("cantons", value)}
            placeholder="Kantone auswählen..."
          />
          <div>
            <label className="text-text mb-1.5 block text-sm font-medium">
              Website / Portfolio
            </label>
            <div className="relative">
              <Link2 className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="url"
                value={profileFormData.website}
                onChange={(e) => handleProfileFieldChange("website", e.target.value)}
                placeholder="https://meine-website.ch"
                className={`input w-full pl-10 ${profileErrors.website ? "border-error" : ""}`}
              />
            </div>
            {profileErrors.website && (
              <p className="text-error mt-1 text-xs">{profileErrors.website}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-text mb-1.5 block text-sm font-medium">Instagram</label>
              <div className="relative">
                <span className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={profileFormData.instagram}
                  onChange={(e) => handleProfileFieldChange("instagram", e.target.value)}
                  placeholder="benutzername"
                  className="input w-full pl-8"
                />
              </div>
            </div>
            <div>
              <label className="text-text mb-1.5 block text-sm font-medium">Pinterest</label>
              <div className="relative">
                <span className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={profileFormData.pinterest}
                  onChange={(e) => handleProfileFieldChange("pinterest", e.target.value)}
                  placeholder="benutzername"
                  className="input w-full pl-8"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-border border-t" />

        {/* Privacy & Language Section */}
        <div className="space-y-5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="text-warning h-5 w-5" />
            <h3 className="text-text font-semibold">Privatsphäre & Sprache</h3>
          </div>

          <div className="space-y-4">
            {/* Profile Visibility */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                {profileFormData.is_private ? (
                  <EyeOff className="text-text-muted h-5 w-5" />
                ) : (
                  <Eye className="text-text-muted h-5 w-5" />
                )}
                <div>
                  <p className="text-text font-medium">Privates Profil</p>
                  <p className="text-text-muted text-sm">
                    {profileFormData.is_private
                      ? "Nur Sie können Ihr Profil sehen"
                      : "Ihr Profil ist für andere sichtbar"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleProfileFieldChange("is_private", !profileFormData.is_private)}
                className="relative"
              >
                <div
                  className={`h-6 w-11 rounded-full transition-colors ${profileFormData.is_private ? "bg-primary" : "bg-border"}`}
                >
                  <div
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${profileFormData.is_private ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </div>
              </button>
            </div>

            {/* Language removed — locale is handled by URL */}
          </div>
        </div>
      </div>

      {/* Floating Save Bar */}
      <AnimatePresence>
        {hasProfileChanges() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="border-border bg-surface/95 fixed right-0 bottom-0 left-0 z-50 border-t shadow-lg backdrop-blur-sm"
          >
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
              <p className="text-text-muted text-sm">Sie haben ungespeicherte Änderungen</p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelEditing}
                  disabled={isSavingProfile}
                  className="btn-secondary"
                >
                  Verwerfen
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="btn-primary"
                >
                  {isSavingProfile ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Speichern...
                    </span>
                  ) : (
                    "Änderungen speichern"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
