"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, X } from "lucide-react";

interface ProfileCompletionBannerProps {
  missingFields: string[];
  onComplete: () => void;
}

export function ProfileCompletionBanner({
  missingFields,
  onComplete,
}: ProfileCompletionBannerProps) {
  const t = useTranslations("profileCompletion");

  if (missingFields.length === 0) return null;

  return (
    <div className="border-warning/50 bg-warning/10 rounded-xl border p-6">
      <div className="flex items-start gap-4">
        <div className="bg-warning/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
          <AlertTriangle className="text-warning h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="text-text font-semibold">{t("title")}</h3>
          <p className="text-text-muted mt-1 text-sm">{t("description")}</p>
          <ul className="mt-3 space-y-1">
            {missingFields.map((field) => (
              <li key={field} className="text-error flex items-center gap-2 text-sm">
                <X className="h-4 w-4" aria-hidden="true" />
                {field}
              </li>
            ))}
          </ul>
          <button
            onClick={onComplete}
            className="bg-primary text-text-on-accent hover:bg-primary-hover mt-4 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            {t("button")}
          </button>
        </div>
      </div>
    </div>
  );
}
