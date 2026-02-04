"use client";

import { useTranslations } from "next-intl";
import { BadgeCheck, GraduationCap } from "lucide-react";

interface VerifiedTeacherBadgeProps {
  /** Size variant of the badge */
  size?: "sm" | "md" | "lg";
  /** Show only icon without text */
  iconOnly?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * VerifiedTeacherBadge - Displays a badge indicating verified teacher status
 *
 * Teachers are verified either through:
 * - Swiss education email domain (automatic)
 * - Manual admin verification
 * - edu-ID authentication
 */
export function VerifiedTeacherBadge({
  size = "md",
  iconOnly = false,
  className = "",
}: VerifiedTeacherBadgeProps) {
  const t = useTranslations("teacherVerification");

  const sizeClasses = {
    sm: {
      container: "px-1.5 py-0.5 text-xs gap-1",
      icon: "h-3 w-3",
    },
    md: {
      container: "px-2 py-1 text-xs gap-1.5",
      icon: "h-3.5 w-3.5",
    },
    lg: {
      container: "px-3 py-1.5 text-sm gap-2",
      icon: "h-4 w-4",
    },
  };

  const sizes = sizeClasses[size];

  if (iconOnly) {
    return (
      <span
        className={`bg-teal/15 text-teal inline-flex items-center justify-center rounded-full ${className}`}
        title={t("badge")}
      >
        <BadgeCheck className={sizes.icon} />
      </span>
    );
  }

  return (
    <span
      className={`bg-teal/15 text-teal inline-flex items-center rounded-full font-medium ${sizes.container} ${className}`}
      title={t("badgeTooltip")}
    >
      <BadgeCheck className={sizes.icon} />
      <span>{t("badge")}</span>
    </span>
  );
}

/**
 * VerifiedTeacherIcon - Just the verification checkmark icon
 *
 * Use this for compact displays where space is limited
 */
export function VerifiedTeacherIcon({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const t = useTranslations("teacherVerification");

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span title={t("badge")}>
      <BadgeCheck className={`text-teal ${sizeClasses[size]} ${className}`} />
    </span>
  );
}

/**
 * TeacherVerificationInfo - Detailed verification status with explanation
 *
 * Use this in profile pages or account settings to show verification details
 */
export function TeacherVerificationInfo({
  isVerified,
  verificationMethod,
  verifiedAt,
  className = "",
}: {
  isVerified: boolean;
  verificationMethod?: string | null;
  verifiedAt?: Date | string | null;
  className?: string;
}) {
  const t = useTranslations("teacherVerification");

  if (!isVerified) {
    return (
      <div className={`border-border bg-surface/50 rounded-lg border p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="bg-text-muted/10 rounded-full p-2">
            <GraduationCap className="text-text-muted h-5 w-5" />
          </div>
          <div>
            <h4 className="text-text font-medium">{t("notVerified")}</h4>
            <p className="text-text-secondary mt-1 text-sm">{t("notVerifiedDescription")}</p>
          </div>
        </div>
      </div>
    );
  }

  // Format the verification method
  const methodLabels: Record<string, string> = {
    email_domain: t("methodEmailDomain"),
    manual: t("methodManual"),
    eduid: t("methodEduId"),
  };

  const methodLabel = verificationMethod
    ? methodLabels[verificationMethod] || verificationMethod
    : null;

  // Format verification date
  const formattedDate = verifiedAt
    ? new Date(verifiedAt).toLocaleDateString("de-CH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className={`border-teal/30 bg-teal/5 rounded-lg border p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="bg-teal/15 rounded-full p-2">
          <BadgeCheck className="text-teal h-5 w-5" />
        </div>
        <div>
          <h4 className="text-teal font-medium">{t("verified")}</h4>
          <p className="text-text-secondary mt-1 text-sm">{t("verifiedDescription")}</p>
          {(methodLabel || formattedDate) && (
            <div className="text-text-muted mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {methodLabel && (
                <span>
                  {t("verificationMethod")}: {methodLabel}
                </span>
              )}
              {formattedDate && (
                <span>
                  {t("verifiedSince")}: {formattedDate}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifiedTeacherBadge;
