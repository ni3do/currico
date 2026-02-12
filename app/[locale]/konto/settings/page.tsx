"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  Mail,
  GraduationCap,
  Globe,
  Shield,
  X,
  Building2,
  Clock,
  Link2,
  Eye,
  EyeOff,
  CircleCheck,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAccountData } from "@/lib/hooks/useAccountData";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { CYCLES } from "@/lib/types/account";
import { SWISS_CANTONS } from "@/lib/validations/user";
import { getSubjectPillClass } from "@/lib/constants/subject-colors";

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
  const tSettings = useTranslations("accountPage.settingsProfile");

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
  const [showSavedState, setShowSavedState] = useState(false);
  const [profileFormData, setProfileFormData] = useState<{
    display_name: string;
    bio: string;
    subjects: string[];
    cycles: string[];
    cantons: string[];
    website: string;
    school: string;
    teaching_experience: string;
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

    if (!profileFormData.display_name || profileFormData.display_name.length < 2) {
      errors.display_name = "Name muss mindestens 2 Zeichen haben";
    } else if (profileFormData.display_name.length > 32) {
      errors.display_name = "Name darf maximal 32 Zeichen haben";
    }
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

      setInitialProfileData(profileFormData);
      setProfileMessage({ type: "success", text: "Änderungen gespeichert!" });

      setShowSavedState(true);
      setTimeout(() => setShowSavedState(false), 1500);

      setTimeout(() => setProfileMessage(null), 3000);

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
    <div className="space-y-5 pb-20">
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
            className={`relative overflow-hidden rounded-xl border p-4 ${
              (profileMessage?.type || avatarMessage?.type) === "success"
                ? "border-success/30 bg-success/5"
                : "border-error/30 bg-error/5"
            }`}
          >
            <div className="flex items-center gap-3">
              {(profileMessage?.type || avatarMessage?.type) === "success" ? (
                <div className="bg-success/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <motion.svg
                    className="text-success h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <motion.path
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </motion.svg>
                </div>
              ) : (
                <div className="bg-error/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <X className="text-error h-5 w-5" />
                </div>
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
            </div>
            <motion.div
              className={`absolute right-0 bottom-0 left-0 h-0.5 ${
                (profileMessage?.type || avatarMessage?.type) === "success"
                  ? "bg-success/40"
                  : "bg-error/40"
              }`}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 3, ease: "linear" }}
              style={{ transformOrigin: "left" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Card — Hero-style centered */}
      <div className="border-border bg-surface rounded-xl border p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="relative">
            <AvatarUploader
              currentAvatarUrl={avatarUrl}
              displayName={displayName}
              onUpload={handleAvatarUpload}
              errorInvalidType={tSettings("avatar.errorInvalidType")}
              errorTooLarge={tSettings("avatar.errorTooLarge")}
              errorUploadFailed={tSettings("avatar.errorUploadFailed")}
              uploadLabel={tSettings("avatar.uploadLabel")}
            />
            {isUploadingAvatar && (
              <div className="bg-bg/80 absolute inset-0 flex items-center justify-center rounded-full">
                <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <p className="text-text font-semibold">{displayName}</p>
            <p className="text-text-muted text-sm">Klicken Sie auf das Bild, um es zu ändern</p>
            <p className="text-text-faint text-xs">JPG, PNG oder WebP. Max 2MB.</p>
            {avatarUrl && (
              <button
                onClick={handleAvatarDelete}
                disabled={isDeletingAvatar}
                className="text-error mt-1 text-sm font-medium hover:underline disabled:opacity-50"
              >
                {isDeletingAvatar ? "Wird entfernt..." : "Bild entfernen"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Basic Info Card */}
      <div className="border-border bg-surface rounded-xl border">
        <div className="border-border border-b p-5">
          <div className="flex items-center gap-2.5">
            <User className="text-primary h-5 w-5" />
            <div>
              <h3 className="text-text font-semibold">Grundinformationen</h3>
              <p className="text-text-faint text-xs">Name, E-Mail und persönliche Beschreibung</p>
            </div>
          </div>
        </div>
        <div className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-text mb-1.5 block text-sm font-medium">
                Anzeigename <span className="text-error">*</span>
              </label>
              <div className="relative">
                <User className="text-text-muted absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  value={profileFormData.display_name}
                  onChange={(e) => handleProfileFieldChange("display_name", e.target.value)}
                  placeholder="z.B. Frau M. oder Maria S."
                  maxLength={32}
                  className={`input w-full pl-11 ${profileErrors.display_name ? "border-error" : ""}`}
                />
              </div>
              <div className="mt-1 flex items-center justify-between">
                {profileErrors.display_name ? (
                  <p className="text-error text-xs">{profileErrors.display_name}</p>
                ) : (
                  <span />
                )}
                <p className="text-text-muted text-xs">{profileFormData.display_name.length}/32</p>
              </div>
            </div>
            <div>
              <label className="text-text mb-1.5 block text-sm font-medium">E-Mail</label>
              <div className="relative">
                <Mail className="text-text-muted absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
                <input
                  type="email"
                  value={userData?.email || ""}
                  disabled
                  className="input bg-bg-secondary text-text-muted w-full cursor-not-allowed pl-11"
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
      </div>

      {/* Teaching Profile Card */}
      <div className="border-border bg-surface rounded-xl border">
        <div className="border-border border-b p-5">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="text-success h-5 w-5" />
            <div>
              <h3 className="text-text font-semibold">Unterrichtsprofil</h3>
              <p className="text-text-faint text-xs">Fächer, Zyklen, Erfahrung und Schule</p>
            </div>
          </div>
        </div>
        <div className="space-y-5 p-5">
          <MultiSelect
            label="Fächer"
            options={subjectOptions}
            selected={profileFormData.subjects}
            onChange={(value) => handleProfileFieldChange("subjects", value)}
            placeholder="Fächer auswählen..."
            getTagClassName={getSubjectPillClass}
            searchPlaceholder={tSettings("multiSelect.search")}
            noResultsText={tSettings("multiSelect.noResults")}
          />
          <MultiSelect
            label="Zyklen"
            options={CYCLES}
            selected={profileFormData.cycles}
            onChange={(value) => handleProfileFieldChange("cycles", value)}
            placeholder="Zyklen auswählen..."
            searchPlaceholder={tSettings("multiSelect.search")}
            noResultsText={tSettings("multiSelect.noResults")}
          />
          <MultiSelect
            label="Kantone"
            options={[...SWISS_CANTONS]}
            selected={profileFormData.cantons}
            onChange={(value) => handleProfileFieldChange("cantons", value)}
            placeholder="Kantone auswählen..."
            searchPlaceholder={tSettings("multiSelect.search")}
            noResultsText={tSettings("multiSelect.noResults")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-text mb-1.5 block text-sm font-medium">
                Schule / Institution
              </label>
              <div className="relative">
                <Building2 className="text-text-muted absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  value={profileFormData.school}
                  onChange={(e) => handleProfileFieldChange("school", e.target.value)}
                  placeholder="z.B. Primarschule Muster"
                  className="input w-full pl-11"
                />
              </div>
            </div>
            <div>
              <label className="text-text mb-1.5 block text-sm font-medium">
                Unterrichtserfahrung
              </label>
              <div className="relative">
                <Clock className="text-text-muted absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
                <select
                  value={profileFormData.teaching_experience}
                  onChange={(e) => handleProfileFieldChange("teaching_experience", e.target.value)}
                  className="input w-full appearance-none pr-10 pl-11"
                >
                  <option value="">Bitte auswählen</option>
                  {TEACHING_EXPERIENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="text-text-muted pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Social Card */}
      <div className="border-border bg-surface rounded-xl border">
        <div className="border-border border-b p-5">
          <div className="flex items-center gap-2.5">
            <Globe className="text-accent h-5 w-5" />
            <div>
              <h3 className="text-text font-semibold">Kontakt & Social Media</h3>
              <p className="text-text-faint text-xs">Website, Instagram und Pinterest</p>
            </div>
          </div>
        </div>
        <div className="space-y-5 p-5">
          <div>
            <label className="text-text mb-1.5 block text-sm font-medium">
              Website / Portfolio
            </label>
            <div className="relative">
              <Link2 className="text-text-muted absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
              <input
                type="url"
                value={profileFormData.website}
                onChange={(e) => handleProfileFieldChange("website", e.target.value)}
                placeholder="https://meine-website.ch"
                className={`input w-full pl-11 ${profileErrors.website ? "border-error" : ""}`}
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
                <span className="text-text-muted absolute top-1/2 left-4 -translate-y-1/2 text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={profileFormData.instagram}
                  onChange={(e) => handleProfileFieldChange("instagram", e.target.value)}
                  placeholder="benutzername"
                  className="input w-full pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-text mb-1.5 block text-sm font-medium">Pinterest</label>
              <div className="relative">
                <span className="text-text-muted absolute top-1/2 left-4 -translate-y-1/2 text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={profileFormData.pinterest}
                  onChange={(e) => handleProfileFieldChange("pinterest", e.target.value)}
                  placeholder="benutzername"
                  className="input w-full pl-9"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Card */}
      <div className="border-border bg-surface rounded-xl border">
        <div className="border-border border-b p-5">
          <div className="flex items-center gap-2.5">
            <Shield className="text-warning h-5 w-5" />
            <div>
              <h3 className="text-text font-semibold">Privatsphäre</h3>
              <p className="text-text-faint text-xs">Sichtbarkeit Ihres Profils steuern</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between py-1">
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
              role="switch"
              aria-checked={profileFormData.is_private}
            >
              <div
                className={`h-6 w-11 rounded-full transition-colors ${profileFormData.is_private ? "bg-primary" : "bg-border"}`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${profileFormData.is_private ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </div>
            </button>
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
                  disabled={isSavingProfile || showSavedState}
                  className={`btn-primary transition-all ${showSavedState ? "!bg-success !border-success" : ""}`}
                >
                  <AnimatePresence mode="wait">
                    {showSavedState ? (
                      <motion.span
                        key="saved"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.svg
                          className="h-4 w-4 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <motion.path
                            d="M5 13l4 4L19 7"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          />
                        </motion.svg>
                        Gespeichert!
                      </motion.span>
                    ) : isSavingProfile ? (
                      <motion.span
                        key="saving"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Speichern...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="default"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Änderungen speichern
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
