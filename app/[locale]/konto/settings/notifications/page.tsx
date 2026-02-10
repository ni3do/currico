"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Sparkles,
  ShoppingBag,
  Gift,
  FileText,
  Mail,
  Download,
  Tag,
  Megaphone,
  Newspaper,
  Bell,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAccountData } from "@/lib/hooks/useAccountData";

export default function SettingsNotificationsPage() {
  const { userData } = useAccountData();
  const tCommon = useTranslations("common");
  const tNotif = useTranslations("notifications");

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    notify_new_from_followed: true,
    notify_recommendations: true,
    notify_material_updates: true,
    notify_review_reminders: true,
    notify_wishlist_price_drops: true,
    notify_welcome_offers: true,
    notify_sales: true,
    notify_newsletter: false,
    notify_platform_updates: true,
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Initialize notification prefs from user data
  useEffect(() => {
    if (userData) {
      setNotificationPrefs({
        notify_new_from_followed: userData.notify_new_from_followed ?? true,
        notify_recommendations: userData.notify_recommendations ?? true,
        notify_material_updates: userData.notify_material_updates ?? true,
        notify_review_reminders: userData.notify_review_reminders ?? true,
        notify_wishlist_price_drops: userData.notify_wishlist_price_drops ?? true,
        notify_welcome_offers: userData.notify_welcome_offers ?? true,
        notify_sales: userData.notify_sales ?? true,
        notify_newsletter: userData.notify_newsletter ?? false,
        notify_platform_updates: userData.notify_platform_updates ?? true,
      });
    }
  }, [userData]);

  // Handle notification preference toggle
  const handleNotificationToggle = async (key: keyof typeof notificationPrefs) => {
    const newValue = !notificationPrefs[key];
    const previousPrefs = { ...notificationPrefs };

    // Optimistically update UI
    setNotificationPrefs((prev) => ({ ...prev, [key]: newValue }));
    setIsSavingNotifications(true);
    setNotificationMessage(null);

    try {
      const response = await fetch("/api/users/me/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newValue }),
      });

      if (!response.ok) {
        throw new Error(tCommon("errors.saveFailed"));
      }

      setNotificationMessage({ type: "success", text: tNotif("saved") });
      setTimeout(() => setNotificationMessage(null), 2000);
    } catch (error) {
      console.error("Error saving notification preference:", error);
      // Revert on error
      setNotificationPrefs(previousPrefs);
      setNotificationMessage({ type: "error", text: tNotif("error") });
      setTimeout(() => setNotificationMessage(null), 3000);
    } finally {
      setIsSavingNotifications(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-text text-xl font-semibold">Benachrichtigungen</h2>
          <p className="text-text-muted mt-1 text-sm">
            Verwalten Sie, welche Benachrichtigungen Sie erhalten möchten
          </p>
        </div>
        {notificationMessage && (
          <span
            className={`text-sm ${notificationMessage.type === "success" ? "text-success" : "text-error"}`}
          >
            {notificationMessage.text}
          </span>
        )}
      </div>

      {/* Favorite Authors Card */}
      <div className="border-border bg-surface rounded-xl border">
        <div className="border-border border-b p-5">
          <div className="flex items-center gap-3">
            <div className="bg-warning/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Star className="text-warning h-5 w-5" />
            </div>
            <div>
              <h3 className="text-text font-semibold">Lieblings-Autor*innen</h3>
              <p className="text-text-muted text-sm">Updates von Verkäufern, denen Sie folgen</p>
            </div>
          </div>
        </div>
        <div className="divide-border divide-y">
          <label className="hover:bg-bg flex cursor-pointer items-center justify-between p-5 transition-colors">
            <div className="flex items-start gap-4">
              <div className="bg-success/10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                <FileText className="text-success h-4 w-4" />
              </div>
              <div>
                <span className="text-text font-medium">
                  Neue Materialien von Lieblings-Autor*innen
                </span>
                <p className="text-text-muted mt-0.5 text-sm">
                  Benachrichtigung bei neuen Uploads von Verkäufern, denen Sie folgen, passend zu
                  Ihren Fächern
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationToggle("notify_new_from_followed")}
              disabled={isSavingNotifications}
              className="relative ml-4 flex-shrink-0"
              aria-label="Toggle notification"
            >
              <div
                className={`h-6 w-11 rounded-full transition-colors ${notificationPrefs.notify_new_from_followed ? "bg-primary" : "bg-border"}`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationPrefs.notify_new_from_followed ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </div>
            </button>
          </label>
        </div>
      </div>

      {/* Personalized Recommendations Card */}
      <div className="border-border bg-surface rounded-xl border">
        <div className="border-border border-b p-5">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Sparkles className="text-accent h-5 w-5" />
            </div>
            <div>
              <h3 className="text-text font-semibold">Personalisierte Empfehlungen</h3>
              <p className="text-text-muted text-sm">
                Materialvorschläge basierend auf Ihren Downloads
              </p>
            </div>
          </div>
        </div>
        <div className="divide-border divide-y">
          <label className="hover:bg-bg flex cursor-pointer items-center justify-between p-5 transition-colors">
            <div className="flex items-start gap-4">
              <div className="bg-accent/10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                <Mail className="text-accent h-4 w-4" />
              </div>
              <div>
                <span className="text-text font-medium">Material-Empfehlungen per E-Mail</span>
                <p className="text-text-muted mt-0.5 text-sm">
                  Beliebte Materialien, die zu Ihren Downloads passen
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationToggle("notify_recommendations")}
              disabled={isSavingNotifications}
              className="relative ml-4 flex-shrink-0"
              aria-label="Toggle notification"
            >
              <div
                className={`h-6 w-11 rounded-full transition-colors ${notificationPrefs.notify_recommendations ? "bg-primary" : "bg-border"}`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationPrefs.notify_recommendations ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </div>
            </button>
          </label>
        </div>
      </div>

      {/* Purchased Materials Card */}
      <div className="border-border bg-surface rounded-xl border">
        <div className="border-border border-b p-5">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <ShoppingBag className="text-success h-5 w-5" />
            </div>
            <div>
              <h3 className="text-text font-semibold">Erworbene Materialien</h3>
              <p className="text-text-muted text-sm">Updates zu Ihren gekauften Materialien</p>
            </div>
          </div>
        </div>
        <div className="divide-border divide-y">
          <label className="hover:bg-bg flex cursor-pointer items-center justify-between p-5 transition-colors">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                <Download className="text-primary h-4 w-4" />
              </div>
              <div>
                <span className="text-text font-medium">Updates für gekaufte Materialien</span>
                <p className="text-text-muted mt-0.5 text-sm">
                  Benachrichtigung, wenn ein gekauftes Material ein kostenloses Update erhält
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationToggle("notify_material_updates")}
              disabled={isSavingNotifications}
              className="relative ml-4 flex-shrink-0"
              aria-label="Toggle notification"
            >
              <div
                className={`h-6 w-11 rounded-full transition-colors ${notificationPrefs.notify_material_updates ? "bg-primary" : "bg-border"}`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationPrefs.notify_material_updates ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </div>
            </button>
          </label>
          <label className="hover:bg-bg flex cursor-pointer items-center justify-between p-5 transition-colors">
            <div className="flex items-start gap-4">
              <div className="bg-warning/10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                <Star className="text-warning h-4 w-4" />
              </div>
              <div>
                <span className="text-text font-medium">Erinnerungen zur Bewertung</span>
                <p className="text-text-muted mt-0.5 text-sm">
                  Erinnerungen, gekaufte Materialien zu bewerten
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationToggle("notify_review_reminders")}
              disabled={isSavingNotifications}
              className="relative ml-4 flex-shrink-0"
              aria-label="Toggle notification"
            >
              <div
                className={`h-6 w-11 rounded-full transition-colors ${notificationPrefs.notify_review_reminders ? "bg-primary" : "bg-border"}`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationPrefs.notify_review_reminders ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </div>
            </button>
          </label>
          <label className="hover:bg-bg flex cursor-pointer items-center justify-between p-5 transition-colors">
            <div className="flex items-start gap-4">
              <div className="bg-price/10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                <Tag className="text-price h-4 w-4" />
              </div>
              <div>
                <span className="text-text font-medium">Preisänderungen auf der Wunschliste</span>
                <p className="text-text-muted mt-0.5 text-sm">
                  Benachrichtigung bei Preissenkungen von Artikeln auf Ihrer Wunschliste
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationToggle("notify_wishlist_price_drops")}
              disabled={isSavingNotifications}
              className="relative ml-4 flex-shrink-0"
              aria-label="Toggle notification"
            >
              <div
                className={`h-6 w-11 rounded-full transition-colors ${notificationPrefs.notify_wishlist_price_drops ? "bg-primary" : "bg-border"}`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationPrefs.notify_wishlist_price_drops ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </div>
            </button>
          </label>
        </div>
      </div>

      {/* Promotions Card */}
      <div className="border-border bg-surface rounded-xl border">
        <div className="border-border border-b p-5">
          <div className="flex items-center gap-3">
            <div className="bg-error/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Gift className="text-error h-5 w-5" />
            </div>
            <div>
              <h3 className="text-text font-semibold">Rabatt- und Sonderaktionen</h3>
              <p className="text-text-muted text-sm">Angebote und Plattform-Neuigkeiten</p>
            </div>
          </div>
        </div>
        <div className="divide-border divide-y">
          <label className="hover:bg-bg flex cursor-pointer items-center justify-between p-5 transition-colors">
            <div className="flex items-start gap-4">
              <div className="bg-success/10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                <Gift className="text-success h-4 w-4" />
              </div>
              <div>
                <span className="text-text font-medium">Willkommensangebote</span>
                <p className="text-text-muted mt-0.5 text-sm">
                  Willkommens-E-Mails und individuelle Angebote
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationToggle("notify_welcome_offers")}
              disabled={isSavingNotifications}
              className="relative ml-4 flex-shrink-0"
              aria-label="Toggle notification"
            >
              <div
                className={`h-6 w-11 rounded-full transition-colors ${notificationPrefs.notify_welcome_offers ? "bg-primary" : "bg-border"}`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationPrefs.notify_welcome_offers ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </div>
            </button>
          </label>
          <label className="hover:bg-bg flex cursor-pointer items-center justify-between p-5 transition-colors">
            <div className="flex items-start gap-4">
              <div className="bg-error/10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                <Megaphone className="text-error h-4 w-4" />
              </div>
              <div>
                <span className="text-text font-medium">Website-weite Aktionen</span>
                <p className="text-text-muted mt-0.5 text-sm">
                  Benachrichtigungen über plattformweite Rabattaktionen
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationToggle("notify_sales")}
              disabled={isSavingNotifications}
              className="relative ml-4 flex-shrink-0"
              aria-label="Toggle notification"
            >
              <div
                className={`h-6 w-11 rounded-full transition-colors ${notificationPrefs.notify_sales ? "bg-primary" : "bg-border"}`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationPrefs.notify_sales ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </div>
            </button>
          </label>
          <label className="hover:bg-bg flex cursor-pointer items-center justify-between p-5 transition-colors">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                <Newspaper className="text-primary h-4 w-4" />
              </div>
              <div>
                <span className="text-text font-medium">Newsletter abonnieren</span>
                <p className="text-text-muted mt-0.5 text-sm">
                  Wöchentliche Updates mit Tipps, neuen Funktionen und ausgewählten Materialien
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationToggle("notify_newsletter")}
              disabled={isSavingNotifications}
              className="relative ml-4 flex-shrink-0"
              aria-label="Toggle notification"
            >
              <div
                className={`h-6 w-11 rounded-full transition-colors ${notificationPrefs.notify_newsletter ? "bg-primary" : "bg-border"}`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationPrefs.notify_newsletter ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </div>
            </button>
          </label>
          <label className="hover:bg-bg flex cursor-pointer items-center justify-between p-5 transition-colors">
            <div className="flex items-start gap-4">
              <div className="bg-accent/10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                <Bell className="text-accent h-4 w-4" />
              </div>
              <div>
                <span className="text-text font-medium">Plattform-Updates</span>
                <p className="text-text-muted mt-0.5 text-sm">
                  Neuigkeiten über neue Funktionen und Verbesserungen der Plattform
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationToggle("notify_platform_updates")}
              disabled={isSavingNotifications}
              className="relative ml-4 flex-shrink-0"
              aria-label="Toggle notification"
            >
              <div
                className={`h-6 w-11 rounded-full transition-colors ${notificationPrefs.notify_platform_updates ? "bg-primary" : "bg-border"}`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationPrefs.notify_platform_updates ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </div>
            </button>
          </label>
        </div>
      </div>
    </div>
  );
}
