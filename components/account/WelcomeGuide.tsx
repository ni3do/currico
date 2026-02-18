"use client";

import { useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Library, Upload, Heart, Settings, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

interface WelcomeGuideProps {
  userName?: string | null;
  onNavigate?: (
    tab:
      | "library"
      | "uploads"
      | "wishlist"
      | "settings-profile"
      | "settings-notifications"
      | "settings-account"
  ) => void;
}

const STORAGE_KEY = "currico-welcome-dismissed";

const FEATURE_ICONS = {
  library: Library,
  uploads: Upload,
  wishlist: Heart,
  "settings-profile": Settings,
} as const;

const FEATURE_IDS = ["library", "uploads", "wishlist", "settings-profile"] as const;

// Hook to read localStorage without triggering the setState-in-effect warning
function useLocalStorageValue(key: string) {
  const subscribe = (callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  };
  const getSnapshot = () => localStorage.getItem(key);
  const getServerSnapshot = () => null;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Hook to detect client-side hydration
function useIsClient() {
  const subscribe = () => () => {};
  const getSnapshot = () => true;
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function WelcomeGuide({ userName, onNavigate }: WelcomeGuideProps) {
  const t = useTranslations("accountPage.welcomeGuide");
  const dismissed = useLocalStorageValue(STORAGE_KEY);
  const isClient = useIsClient();
  const [isVisible, setIsVisible] = useState(true);

  const features = FEATURE_IDS.map((id) => {
    const titleKey = `${id === "settings-profile" ? "settings" : id}Title` as const;
    const descKey = `${id === "settings-profile" ? "settings" : id}Desc` as const;
    return {
      id,
      icon: FEATURE_ICONS[id],
      title: t(titleKey),
      description: t(descKey),
    };
  });

  // Hide if dismissed in localStorage
  const shouldShow = isClient && isVisible && !dismissed;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  const handleFeatureClick = (featureId: string) => {
    if (onNavigate) {
      onNavigate(
        featureId as
          | "library"
          | "uploads"
          | "wishlist"
          | "settings-profile"
          | "settings-notifications"
          | "settings-account"
      );
    }
  };

  // Don't render until we've checked localStorage (prevents flash)
  if (!isClient) return null;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="border-border bg-surface relative overflow-hidden rounded-2xl border shadow-sm"
        >
          {/* Decorative gradient accent */}
          <div className="from-primary/20 via-accent/20 absolute inset-x-0 top-0 h-1 bg-gradient-to-r to-transparent" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="text-text-muted hover:text-text hover:bg-surface-hover absolute top-3 right-3 rounded-lg p-1.5 transition-colors"
            aria-label={t("close")}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-6">
            {/* Header */}
            <div className="mb-5 flex items-start gap-3">
              <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl">
                <Sparkles className="text-primary h-5 w-5" />
              </div>
              <div>
                <h2 className="text-text text-lg font-semibold">
                  {userName ? t("welcome", { name: userName }) : t("welcomeGeneric")}
                </h2>
                <p className="text-text-secondary mt-0.5 text-sm">{t("subtitle")}</p>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.button
                    key={feature.id}
                    onClick={() => handleFeatureClick(feature.id)}
                    className="border-border bg-bg hover:border-primary hover:bg-surface-hover group flex flex-col items-center rounded-xl border p-4 text-center transition-all"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ y: -2, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="bg-surface-hover group-hover:bg-primary/10 mb-2 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                      <Icon className="text-text-muted group-hover:text-primary h-5 w-5 transition-colors" />
                    </div>
                    <span className="text-text text-sm font-medium">{feature.title}</span>
                    <span className="text-text-muted mt-0.5 text-xs">{feature.description}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Dismiss CTA */}
            <div className="mt-5 flex justify-end">
              <motion.button
                onClick={handleDismiss}
                className="btn-primary rounded-lg px-4 py-2 text-sm"
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
                }}
                whileTap={{ scale: 0.98 }}
              >
                {t("dismiss")}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default WelcomeGuide;
