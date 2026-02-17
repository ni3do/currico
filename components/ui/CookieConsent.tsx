"use client";

import { useState, useEffect, useSyncExternalStore, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const mountedRef = useRef(false);
  const consentState = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track mounted state via ref to avoid re-render
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Show banner with delay when pending
  useEffect(() => {
    if (consentState !== "pending") return;
    if (isVisible) return;

    timerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setIsVisible(true);
      }
    }, 500);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [consentState, isVisible]);

  const handleAccept = () => {
    setConsent("accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    setConsent("declined");
    setIsVisible(false);
  };

  // Don't render on server (check if window exists)
  if (typeof window === "undefined") {
    return null;
  }

  const showBanner = consentState === "pending" && isVisible;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6"
          role="dialog"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-description"
        >
          <div className="mx-auto max-w-4xl">
            <motion.div
              className="border-border bg-surface rounded-xl border p-4 shadow-lg sm:p-6"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                {/* Icon */}
                <div className="hidden sm:block">
                  <motion.div
                    className="bg-accent-subtle flex h-12 w-12 items-center justify-center rounded-full"
                    initial={{ rotate: -20 }}
                    animate={{ rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <Cookie className="text-primary h-6 w-6" />
                  </motion.div>
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
                      href="/datenschutz"
                      className="text-primary font-medium underline-offset-2 hover:underline"
                    >
                      {t("privacyLink")}
                    </Link>
                  </p>

                  {/* Buttons */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <motion.button
                      onClick={handleAccept}
                      className="bg-primary text-text-on-accent hover:bg-primary-hover focus:ring-primary rounded-lg px-5 py-2.5 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t("acceptAll")}
                    </motion.button>
                    <motion.button
                      onClick={handleDecline}
                      className="border-border bg-bg-secondary text-text-primary hover:bg-bg-tertiary focus:ring-primary rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t("essentialOnly")}
                    </motion.button>
                  </div>
                </div>

                {/* Close button (declines) */}
                <motion.button
                  onClick={handleDecline}
                  className="text-text-muted hover:bg-bg-tertiary hover:text-text-primary absolute top-4 right-4 rounded-full p-1 transition-colors sm:relative sm:top-auto sm:right-auto"
                  aria-label={t("close")}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
