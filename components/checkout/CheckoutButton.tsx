"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Loader2, ShoppingCart } from "lucide-react";
import { getLoginUrl } from "@/lib/utils/login-redirect";

interface CheckoutButtonProps {
  materialId: string;
  price: number;
  priceFormatted: string;
  className?: string;
  disabled?: boolean;
}

export function CheckoutButton({
  materialId,
  price,
  priceFormatted,
  className = "",
  disabled = false,
}: CheckoutButtonProps) {
  const t = useTranslations("checkout");
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [digitalConsent, setDigitalConsent] = useState(false);

  const handleCheckout = async () => {
    // Redirect to login if not authenticated
    if (sessionStatus !== "authenticated") {
      window.location.href = getLoginUrl(window.location.pathname);
      return;
    }

    // Require digital consent checkbox
    if (!digitalConsent) {
      setError(t("digitalConsent.required"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ materialId }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (data.error === "You already own this resource") {
          setError(t("errors.alreadyOwned"));
        } else if (data.error === "Cannot purchase your own resource") {
          setError(t("errors.ownResource"));
        } else if (data.error === "Seller cannot receive payments at this time") {
          setError(t("errors.sellerNotReady"));
        } else if (data.error === "Resource is not available for purchase") {
          setError(t("errors.notAvailable"));
        } else {
          setError(t("errors.generic"));
        }
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(t("errors.generic"));
        setLoading(false);
      }
    } catch {
      setError(t("errors.generic"));
      setLoading(false);
    }
  };

  // Free resources should not use this button
  if (price === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Digital Content Consent Checkbox (Swiss/EU legal requirement) */}
      <label className="bg-surface/50 border-border flex cursor-pointer items-start gap-3 rounded-lg border p-3">
        <input
          type="checkbox"
          checked={digitalConsent}
          onChange={(e) => {
            setDigitalConsent(e.target.checked);
            if (e.target.checked && error === t("digitalConsent.required")) {
              setError(null);
            }
          }}
          className="border-border text-primary focus:ring-primary mt-0.5 h-5 w-5 flex-shrink-0 rounded focus:ring-offset-0"
        />
        <span className="text-text-muted text-xs leading-relaxed sm:text-sm">
          {t("digitalConsent.label")}
        </span>
      </label>

      {/* Primary CTA Button */}
      <button
        onClick={handleCheckout}
        disabled={disabled || loading}
        className={`btn-action flex items-center justify-center gap-2 py-4 text-lg font-semibold shadow-md transition-all hover:shadow-lg disabled:opacity-60 ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            {t("processing")}
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {t("buyNow")} - {priceFormatted}
          </>
        )}
      </button>

      {/* Accepted Payment Methods */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex items-center gap-1.5" aria-label={t("acceptedMethods")}>
          {/* TWINT */}
          <span className="bg-text text-bg inline-flex h-5 items-center rounded px-1.5 text-[10px] leading-none font-bold">
            TWINT
          </span>
          {/* Visa */}
          <span className="inline-flex h-5 items-center rounded border border-[#1a1f71] bg-white px-1.5 text-[10px] leading-none font-bold text-[#1a1f71]">
            VISA
          </span>
          {/* Mastercard */}
          <span className="inline-flex h-5 items-center gap-0.5 rounded bg-[#252525] px-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#eb001b] opacity-90" />
            <span className="-ml-1 h-2.5 w-2.5 rounded-full bg-[#f79e1b] opacity-90" />
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-error bg-error/10 rounded-lg px-3 py-2 text-center text-sm">{error}</p>
      )}
    </div>
  );
}
