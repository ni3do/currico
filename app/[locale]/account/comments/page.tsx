"use client";

import { useAccountData } from "@/lib/hooks/useAccountData";
import { SellerCommentsSection } from "@/components/account/SellerCommentsSection";
import { Link } from "@/i18n/navigation";
import { MessageCircle } from "lucide-react";

export default function AccountCommentsPage() {
  const { userData } = useAccountData();

  if (!userData?.isSeller) {
    return (
      <div className="py-12 text-center">
        <MessageCircle className="text-text-faint mx-auto mb-4 h-16 w-16" />
        <h3 className="text-text mb-2 text-lg font-medium">Keine Kommentare</h3>
        <p className="text-text-muted mb-4 text-sm">Kommentare sind nur für Verkäufer verfügbar.</p>
        <Link href="/become-seller" className="text-primary text-sm font-medium hover:underline">
          Verkäufer werden
        </Link>
      </div>
    );
  }

  return (
    <div className="border-border bg-surface rounded-xl border p-6">
      <SellerCommentsSection />
    </div>
  );
}
