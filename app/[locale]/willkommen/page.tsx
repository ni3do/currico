"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { SWISS_CANTONS } from "@/lib/validations/user";

const CYCLES = ["Zyklus 1", "Zyklus 2", "Zyklus 3"] as const;

export default function WelcomePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const t = useTranslations("welcomePage");

  const [editedName, setEditedName] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [cycles, setCycles] = useState<string[]>([]);
  const [cantons, setCantons] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/anmelden");
    }
  }, [status, router]);

  // Redirect if already onboarded
  useEffect(() => {
    if (status === "authenticated" && session?.user && !session.user.needsOnboarding) {
      router.replace("/konto");
    }
  }, [status, session, router]);

  const displayName = editedName ?? session?.user?.name ?? "";

  // Fetch subjects from curriculum API
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await fetch("/api/curriculum?curriculum=LP21");
        if (res.ok) {
          const data = await res.json();
          setAvailableSubjects((data.subjects || []).map((s: { name_de: string }) => s.name_de));
        }
      } catch {
        // Subjects will remain empty — user can still submit
      }
    }
    fetchSubjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (displayName.length < 2 || displayName.length > 32) {
      setError(t("errors.displayNameLength"));
      setIsSubmitting(false);
      return;
    }

    if (subjects.length === 0) {
      setError(t("errors.subjectsRequired"));
      setIsSubmitting(false);
      return;
    }

    if (cycles.length === 0) {
      setError(t("errors.cyclesRequired"));
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          subjects,
          cycles,
          cantons: cantons.length > 0 ? cantons : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("errors.generic"));
        setIsSubmitting(false);
        return;
      }

      // Refresh session to clear needsOnboarding flag
      await update();
      router.push("/konto");
    } catch {
      setError(t("errors.generic"));
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="bg-bg flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
      </div>
    );
  }

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-lg">
          <div className="glass-card p-8 sm:p-10">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h1 className="text-text text-2xl font-bold sm:text-3xl">
                {t("title", { name: session?.user?.name || "" })}
              </h1>
              <p className="text-text-muted mt-3">{t("subtitle")}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Display Name */}
              <div>
                <label htmlFor="displayName" className="text-text mb-2 block text-sm font-medium">
                  {t("fields.displayName")} <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setEditedName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={32}
                  className="border-border bg-surface text-text placeholder:text-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 transition-all focus:ring-[3px] focus:outline-none"
                  placeholder={t("fields.displayNamePlaceholder")}
                />
                <p className="text-text-muted mt-1 text-xs">{t("fields.displayNameHint")}</p>
              </div>

              {/* Subjects */}
              <MultiSelect
                label={t("fields.subjects")}
                options={availableSubjects}
                selected={subjects}
                onChange={setSubjects}
                placeholder={t("fields.subjectsPlaceholder")}
                required
              />

              {/* Cycles */}
              <MultiSelect
                label={t("fields.cycles")}
                options={CYCLES}
                selected={cycles}
                onChange={setCycles}
                placeholder={t("fields.cyclesPlaceholder")}
                required
              />

              {/* Cantons (optional) */}
              <MultiSelect
                label={t("fields.cantons")}
                options={SWISS_CANTONS}
                selected={cantons}
                onChange={setCantons}
                placeholder={t("fields.cantonsPlaceholder")}
              />

              {/* Error */}
              {error && (
                <div className="border-error bg-error/10 text-error rounded-lg border px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-text-on-accent hover:bg-primary-hover disabled:hover:bg-primary w-full rounded-lg px-6 py-3.5 font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isSubmitting ? t("submitting") : t("submit")}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
