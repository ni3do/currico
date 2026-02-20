"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BadgeCheck } from "lucide-react";

interface VerifiedSellerBadgeProps {
  variant?: "compact" | "full";
}

export function VerifiedSellerBadge({ variant = "compact" }: VerifiedSellerBadgeProps) {
  const t = useTranslations("verifiedSeller");

  if (variant === "compact") {
    return (
      <Link
        href="/verifizierter-verkaeufer"
        className="text-success hover:text-success/80 inline-flex items-center transition-colors"
        title={t("badge")}
        onClick={(e) => e.stopPropagation()}
      >
        <BadgeCheck className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <Link
      href="/verifizierter-verkaeufer"
      className="bg-success/20 text-success hover:bg-success/30 mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      <BadgeCheck className="h-3.5 w-3.5" />
      {t("badge")}
    </Link>
  );
}
