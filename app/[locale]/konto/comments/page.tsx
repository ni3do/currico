"use client";

import { useTranslations } from "next-intl";
import { useAccountData } from "@/lib/hooks/useAccountData";
import { SellerReviewsSection } from "@/components/account/SellerReviewsSection";
import { Link } from "@/i18n/navigation";
import { Star } from "lucide-react";

export default function AccountCommentsPage() {
  const { userData } = useAccountData();
  const t = useTranslations("accountPage.comments");

  if (!userData?.isSeller) {
    return (
      <div className="py-12 text-center">
        <Star className="text-text-faint mx-auto mb-4 h-16 w-16" />
        <h3 className="text-text mb-2 text-lg font-medium">{t("empty")}</h3>
        <p className="text-text-muted mb-4 text-sm">{t("notSeller")}</p>
        <Link
          href="/verkaeufer-werden"
          className="text-primary text-sm font-medium hover:underline"
        >
          {t("becomeSeller")}
        </Link>
      </div>
    );
  }

  return (
    <div className="border-border bg-surface rounded-xl border p-6">
      <SellerReviewsSection />
    </div>
  );
}
