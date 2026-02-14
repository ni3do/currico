"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
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
        className={`btn-action flex items-center justify-center gap-2 py-4 text-lg font-semibold shadow-md transition-all hover:shadow-lg disabled:opacity-50 ${className}`}
      >
        {loading ? (
          <>
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {t("processing")}
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {t("buyNow")} - {priceFormatted}
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <p className="text-error bg-error/10 rounded-lg px-3 py-2 text-center text-sm">{error}</p>
      )}
    </div>
  );
}
