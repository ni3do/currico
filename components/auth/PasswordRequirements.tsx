"use client";

import { useTranslations } from "next-intl";
import { Check, Circle, AlertTriangle } from "lucide-react";
import {
  checkPasswordRequirements,
  getPasswordStrength,
  isCommonPassword,
} from "@/lib/validations/common";

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const t = useTranslations("passwordRequirements");

  if (!password) return null;

  const requirements = checkPasswordRequirements(password);
  const strength = getPasswordStrength(password);
  const isCommon = isCommonPassword(password);

  const strengthColors = {
    weak: "bg-error",
    medium: "bg-warning",
    strong: "bg-success",
  };

  const strengthTextColors = {
    weak: "text-error",
    medium: "text-warning",
    strong: "text-success",
  };

  return (
    <div className="mt-2.5 space-y-2.5">
      {/* Requirements checklist */}
      <ul className="space-y-1">
        {requirements.map((req) => (
          <li key={req.key} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Check
                className="text-success h-3.5 w-3.5 flex-shrink-0"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            ) : (
              <Circle className="text-text-muted h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            )}
            <span className={req.met ? "text-success" : "text-text-muted"}>{t(req.key)}</span>
          </li>
        ))}
      </ul>

      {/* Common password warning */}
      {isCommon && (
        <p className="text-warning flex items-center gap-1.5 text-xs font-medium">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          {t("commonPassword")}
        </p>
      )}

      {/* Strength meter */}
      <div className="flex items-center gap-2.5">
        <div className="flex flex-1 gap-1">
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors ${strengthColors[strength]}`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              strength === "medium" || strength === "strong"
                ? strengthColors[strength]
                : "bg-border"
            }`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              strength === "strong" ? strengthColors[strength] : "bg-border"
            }`}
          />
        </div>
        <span className={`text-xs font-medium ${strengthTextColors[strength]}`}>
          {t(`strength.${strength}`)}
        </span>
      </div>
    </div>
  );
}
