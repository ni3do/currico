"use client";

import { motion } from "framer-motion";
import { Check, Circle, ChevronRight } from "lucide-react";

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

function getCompletionItems(profile: ProfileData): CompletionItem[] {
  return [
    {
      id: "email",
      label: "E-Mail verifiziert",
      isComplete: !!profile.emailVerified,
      priority: "recommended",
    },
    {
      id: "displayName",
      label: "Anzeigename",
      isComplete: !!(profile.displayName || profile.name),
      priority: "required",
    },
    {
      id: "avatar",
      label: "Profilbild",
      isComplete: !!profile.image,
      priority: "recommended",
    },
    {
      id: "subjects",
      label: "Fächer auswählen",
      isComplete: (profile.subjects?.length ?? 0) > 0,
      priority: "recommended",
    },
    {
      id: "cycles",
      label: "Stufen auswählen",
      isComplete: (profile.cycles?.length ?? 0) > 0,
      priority: "recommended",
    },
    {
      id: "cantons",
      label: "Kantone auswählen",
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
  const items = getCompletionItems(profile);
  const completedCount = items.filter((item) => item.isComplete).length;
  const totalCount = items.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  // Don't show if profile is complete
  if (percentage === 100) {
    return null;
  }

  // Sort: incomplete required first, then incomplete recommended, then completed
  const sortedItems = [...items].sort((a, b) => {
    if (a.isComplete !== b.isComplete) {
      return a.isComplete ? 1 : -1;
    }
    const priorityOrder = { required: 0, recommended: 1, optional: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Show only first 4 items (prioritize incomplete ones)
  const visibleItems = sortedItems.slice(0, 4);
  const hasMore = items.filter((i) => !i.isComplete).length > 4;

  return (
    <div className={`border-border bg-bg rounded-xl border p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-text text-sm font-semibold">Profil vervollständigen</h3>
        <span className="text-text-muted text-xs font-medium">{percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="bg-surface-hover mb-4 h-2 overflow-hidden rounded-full">
        <motion.div
          className="bg-primary h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>

      {/* Checklist */}
      <ul className="space-y-2">
        {visibleItems.map((item, index) => (
          <motion.li
            key={item.id}
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {item.isComplete ? (
              <div className="bg-success/10 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                <Check className="text-success h-3 w-3" />
              </div>
            ) : (
              <div className="border-border flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2">
                <Circle className="text-text-faint h-2 w-2" />
              </div>
            )}
            <span
              className={`text-sm ${
                item.isComplete ? "text-text-muted line-through" : "text-text-secondary"
              }`}
            >
              {item.label}
            </span>
            {!item.isComplete && item.priority === "required" && (
              <span className="bg-warning/10 text-warning rounded px-1.5 py-0.5 text-[10px] font-medium">
                Wichtig
              </span>
            )}
          </motion.li>
        ))}
      </ul>

      {/* CTA Button */}
      {(hasMore || completedCount < totalCount) && onNavigateToSettings && (
        <motion.button
          onClick={onNavigateToSettings}
          className="text-primary hover:bg-primary/5 mt-4 flex w-full items-center justify-center gap-1 rounded-lg py-2 text-sm font-medium transition-colors"
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          Profil vervollständigen
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      )}
    </div>
  );
}

export default ProfileCompletionProgress;
