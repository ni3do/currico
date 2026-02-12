"use client";

import { motion } from "framer-motion";
import { Check, ChevronRight, PartyPopper } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProfileData {
  name?: string | null;
  displayName?: string | null;
  image?: string | null;
  bio?: string | null;
  subjects?: string[];
  cycles?: string[];
  cantons?: string[];
  emailVerified?: string | null;
}

interface ProfileCompletionProgressProps {
  profile: ProfileData;
  onNavigateToSettings?: () => void;
  className?: string;
}

interface CompletionItem {
  id: string;
  label: string;
  isComplete: boolean;
  priority: "required" | "recommended" | "optional";
}

function getCompletionItems(profile: ProfileData, t: (key: string) => string): CompletionItem[] {
  return [
    {
      id: "email",
      label: t("fields.emailVerified"),
      isComplete: !!profile.emailVerified,
      priority: "recommended",
    },
    {
      id: "displayName",
      label: t("fields.displayName"),
      isComplete: !!(profile.displayName || profile.name),
      priority: "required",
    },
    {
      id: "avatar",
      label: t("fields.profileImage"),
      isComplete: !!profile.image,
      priority: "recommended",
    },
    {
      id: "subjects",
      label: t("fields.subjects"),
      isComplete: (profile.subjects?.length ?? 0) > 0,
      priority: "recommended",
    },
    {
      id: "cycles",
      label: t("fields.cycles"),
      isComplete: (profile.cycles?.length ?? 0) > 0,
      priority: "recommended",
    },
    {
      id: "cantons",
      label: t("fields.canton"),
      isComplete: (profile.cantons?.length ?? 0) > 0,
      priority: "optional",
    },
  ];
}

export function ProfileCompletionProgress({
  profile,
  onNavigateToSettings,
  className = "",
}: ProfileCompletionProgressProps) {
  const t = useTranslations("accountPage.profile");
  const items = getCompletionItems(profile, t);
  const completedCount = items.filter((item) => item.isComplete).length;
  const totalCount = items.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  // Show success state when profile is complete
  if (percentage === 100) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-success/30 bg-success/5 relative overflow-hidden rounded-2xl border p-5 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="bg-success/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
            <PartyPopper className="text-success h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-text text-sm font-semibold">{t("profileComplete")}</p>
            <p className="text-text-muted mt-0.5 text-xs">{t("profileCompleteDescription")}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Sort: incomplete required first, then incomplete recommended, then completed
  const sortedItems = [...items].sort((a, b) => {
    if (a.isComplete !== b.isComplete) {
      return a.isComplete ? 1 : -1;
    }
    const priorityOrder = { required: 0, recommended: 1, optional: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-border bg-surface relative overflow-hidden rounded-2xl border p-5 ${className}`}
    >
      {/* Subtle gradient accent */}
      <div className="from-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent" />

      <div className="relative">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text text-sm font-semibold">{t("completeProfile")}</p>
            <p className="text-text-muted mt-0.5 text-xs">
              {t("completionCount", { completed: completedCount, total: totalCount })}
            </p>
          </div>
          {onNavigateToSettings && (
            <button
              onClick={onNavigateToSettings}
              className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors"
            >
              {t("editProfile")}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-4 flex items-center gap-3">
          <div
            className="bg-surface-hover h-2 flex-1 overflow-hidden rounded-full"
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t("completionCount", { completed: completedCount, total: totalCount })}
          >
            <motion.div
              className="bg-primary h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
          <span className="text-text-muted text-xs font-medium tabular-nums">{percentage}%</span>
        </div>

        {/* Checklist in grid */}
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
          {sortedItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              {item.isComplete ? (
                <div className="bg-success/10 flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded-full">
                  <Check className="text-success h-2.5 w-2.5" strokeWidth={3} />
                </div>
              ) : (
                <div className="border-border h-4.5 w-4.5 flex-shrink-0 rounded-full border-[1.5px]" />
              )}
              <span
                className={`text-xs ${
                  item.isComplete ? "text-text-muted line-through" : "text-text-secondary"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default ProfileCompletionProgress;
