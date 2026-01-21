"use client";

import { useState, useEffect, useSyncExternalStore, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Cookie, X } from "lucide-react";
import { useIsMounted } from "@/components/providers/ThemeProvider";

const COOKIE_CONSENT_KEY = "cookie-consent";

type ConsentState = "pending" | "accepted" | "declined";

// Store for cookie consent using useSyncExternalStore pattern
let listeners: Array<() => void> = [];

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): ConsentState {
  if (typeof window === "undefined") return "pending";
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (stored === "accepted" || stored === "declined") {
    return stored as ConsentState;
  }
  return "pending";
}

function getServerSnapshot(): ConsentState {
  return "pending";
}

function setConsent(value: "accepted" | "declined") {
  localStorage.setItem(COOKIE_CONSENT_KEY, value);
  listeners.forEach((listener) => listener());
}

export default function CookieConsent() {
  const t = useTranslations("cookieConsent");
  const mounted = useIsMounted();
  const consentState = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show banner with delay when pending
  useEffect(() => {
    if (!mounted) return;

    if (consentState === "pending" && !isVisible) {
      timerRef.current = setTimeout(() => setIsVisible(true), 500);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [mounted, consentState, isVisible]);

  const handleAccept = () => {
    setConsent("accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    setConsent("declined");
    setIsVisible(false);
  };

  // Don't render on server or if consent already given
  if (!mounted || consentState !== "pending" || !isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="mx-auto max-w-4xl">
        <div className="border-border rounded-xl border bg-white p-4 shadow-lg sm:p-6 dark:bg-[#1e1e2e]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            {/* Icon */}
            <div className="hidden sm:block">
              <div className="bg-accent-subtle flex h-12 w-12 items-center justify-center rounded-full">
                <Cookie className="text-primary h-6 w-6" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h2
                id="cookie-consent-title"
                className="text-text-primary mb-2 flex items-center gap-2 text-lg font-semibold"
              >
                <Cookie className="text-primary h-5 w-5 sm:hidden" />
                {t("title")}
              </h2>
              <p id="cookie-consent-description" className="text-text-secondary mb-4 text-sm">
                {t("description")}{" "}
                <Link
                  href="/privacy"
                  className="text-primary font-medium underline-offset-2 hover:underline"
                >
                  {t("privacyLink")}
                </Link>
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <button
                  onClick={handleAccept}
                  className="bg-primary text-text-on-accent hover:bg-primary-hover focus:ring-primary rounded-lg px-5 py-2.5 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  {t("acceptAll")}
                </button>
                <button
                  onClick={handleDecline}
                  className="border-border bg-bg-secondary text-text-primary hover:bg-bg-tertiary focus:ring-primary rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  {t("essentialOnly")}
                </button>
              </div>
            </div>

            {/* Close button (declines) */}
            <button
              onClick={handleDecline}
              className="text-text-muted hover:bg-bg-tertiary hover:text-text-primary absolute top-6 right-6 rounded-full p-1 transition-colors sm:relative sm:top-auto sm:right-auto"
              aria-label={t("close")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
