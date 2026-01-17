"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

interface CheckoutButtonProps {
  resourceId: string;
  price: number;
  priceFormatted: string;
  className?: string;
  disabled?: boolean;
}

export function CheckoutButton({
  resourceId,
  price,
  priceFormatted,
  className = "",
  disabled = false,
}: CheckoutButtonProps) {
  const t = useTranslations("checkout");
  const { status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    // Redirect to login if not authenticated
    if (sessionStatus !== "authenticated") {
      window.location.href = "/login";
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
        body: JSON.stringify({ resourceId }),
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
    <div className="flex flex-col gap-2">
      <button
        onClick={handleCheckout}
        disabled={disabled || loading}
        className={`btn-primary flex items-center justify-center gap-2 px-8 py-4 disabled:opacity-50 ${className}`}
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
            {t("buyNow")} - {priceFormatted}
          </>
        )}
      </button>
      {error && (
        <p className="text-center text-sm text-[var(--color-error)]">{error}</p>
      )}
    </div>
  );
}
