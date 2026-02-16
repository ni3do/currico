"use client";

import { useState, useEffect, useMemo } from "react";
import { Bell, BellOff, Info, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAccountData } from "@/lib/hooks/useAccountData";
import { useToast } from "@/components/ui/Toast";

type NotificationKey =
  | "notify_new_from_followed"
  | "notify_recommendations"
  | "notify_material_updates"
  | "notify_review_reminders"
  | "notify_wishlist_price_drops"
  | "notify_welcome_offers"
  | "notify_sales"
  | "notify_newsletter"
  | "notify_platform_updates"
  | "notify_comments"
  | "notify_new_followers";

const ALL_NOTIFICATION_KEYS: NotificationKey[] = [
  "notify_comments",
  "notify_new_followers",
  "notify_new_from_followed",
  "notify_recommendations",
  "notify_material_updates",
  "notify_review_reminders",
  "notify_wishlist_price_drops",
  "notify_welcome_offers",
  "notify_sales",
  "notify_newsletter",
  "notify_platform_updates",
];

function ToggleRow({
  title,
  description,
  checked,
  disabled,
  onToggle,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="hover:bg-bg flex cursor-pointer items-center justify-between gap-4 px-5 py-3.5 transition-colors">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-text text-sm font-medium">{title}</span>
          <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium">
            <Mail className="h-2.5 w-2.5" />
            E-Mail
          </span>
        </div>
        <p className="text-text-muted mt-0.5 text-xs leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="relative flex-shrink-0"
        role="switch"
        aria-checked={checked}
        aria-label={title}
      >
        <div
          className={`h-6 w-11 rounded-full transition-colors ${checked ? "bg-primary" : "bg-border"}`}
        >
          <div
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
          />
        </div>
      </button>
    </label>
  );
}

interface ToggleSection {
  header: string;
  items: { key: NotificationKey; title: string; description: string }[];
}

export default function SettingsNotificationsPage() {
  const { userData } = useAccountData();
  const tCommon = useTranslations("common");
  const tNotif = useTranslations("notifications");
  const t = useTranslations("accountPage.settingsNotifications");

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
    notify_comments: true,
    notify_new_followers: true,
  });
  const { toast } = useToast();
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

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
        notify_comments: userData.notify_comments ?? true,
        notify_new_followers: userData.notify_new_followers ?? true,
      });
    }
  }, [userData]);

  // Check if all notifications are enabled/disabled
  const allEnabled = useMemo(
    () => ALL_NOTIFICATION_KEYS.every((key) => notificationPrefs[key]),
    [notificationPrefs]
  );
  const allDisabled = useMemo(
    () => ALL_NOTIFICATION_KEYS.every((key) => !notificationPrefs[key]),
    [notificationPrefs]
  );

  const handleNotificationToggle = async (key: NotificationKey, name?: string) => {
    const newValue = !notificationPrefs[key];
    const previousPrefs = { ...notificationPrefs };

    setNotificationPrefs((prev) => ({ ...prev, [key]: newValue }));
    setIsSavingNotifications(true);

    try {
      const response = await fetch("/api/users/me/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newValue }),
      });

      if (!response.ok) {
        throw new Error(tCommon("errors.saveFailed"));
      }

      const feedbackText = name
        ? t(newValue ? "toggledOn" : "toggledOff", { name })
        : tNotif("saved");
      toast(feedbackText, "success");
    } catch (error) {
      console.error("Error saving notification preference:", error);
      setNotificationPrefs(previousPrefs);
      toast(tNotif("error"), "error");
    } finally {
      setIsSavingNotifications(false);
    }
  };

  // Toggle all notifications on or off
  const handleToggleAll = async () => {
    const newValue = !allEnabled;
    const previousPrefs = { ...notificationPrefs };
    const update: Record<string, boolean> = {};

    for (const key of ALL_NOTIFICATION_KEYS) {
      update[key] = newValue;
    }

    setNotificationPrefs((prev) => ({ ...prev, ...update }));
    setIsSavingNotifications(true);

    try {
      const response = await fetch("/api/users/me/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });

      if (!response.ok) {
        throw new Error(tCommon("errors.saveFailed"));
      }

      toast(t(newValue ? "allEnabled" : "allDisabled"), "success");
    } catch (error) {
      console.error("Error toggling all notifications:", error);
      setNotificationPrefs(previousPrefs);
      toast(tNotif("error"), "error");
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const sections: ToggleSection[] = [
    {
      header: tNotif("categories.authorActivity.title"),
      items: [
        {
          key: "notify_comments",
          title: tNotif("categories.authorActivity.comments.label"),
          description: tNotif("categories.authorActivity.comments.description"),
        },
        {
          key: "notify_new_followers",
          title: tNotif("categories.authorActivity.newFollowers.label"),
          description: tNotif("categories.authorActivity.newFollowers.description"),
        },
      ],
    },
    {
      header: tNotif("categories.favoriteAuthors.title"),
      items: [
        {
          key: "notify_new_from_followed",
          title: tNotif("categories.favoriteAuthors.newFromFollowed.label"),
          description: tNotif("categories.favoriteAuthors.newFromFollowed.description"),
        },
      ],
    },
    {
      header: tNotif("categories.recommendations.title"),
      items: [
        {
          key: "notify_recommendations",
          title: tNotif("categories.recommendations.materialRecommendations.label"),
          description: tNotif("categories.recommendations.materialRecommendations.description"),
        },
      ],
    },
    {
      header: tNotif("categories.purchased.title"),
      items: [
        {
          key: "notify_material_updates",
          title: tNotif("categories.purchased.materialUpdates.label"),
          description: tNotif("categories.purchased.materialUpdates.description"),
        },
        {
          key: "notify_review_reminders",
          title: tNotif("categories.purchased.reviewReminders.label"),
          description: tNotif("categories.purchased.reviewReminders.description"),
        },
        {
          key: "notify_wishlist_price_drops",
          title: tNotif("categories.purchased.wishlistPriceDrops.label"),
          description: tNotif("categories.purchased.wishlistPriceDrops.description"),
        },
      ],
    },
    {
      header: tNotif("categories.promotions.title"),
      items: [
        {
          key: "notify_welcome_offers",
          title: tNotif("categories.promotions.welcomeOffers.label"),
          description: tNotif("categories.promotions.welcomeOffers.description"),
        },
        {
          key: "notify_sales",
          title: tNotif("categories.promotions.sales.label"),
          description: tNotif("categories.promotions.sales.description"),
        },
        {
          key: "notify_newsletter",
          title: tNotif("categories.promotions.newsletter.label"),
          description: tNotif("categories.promotions.newsletter.description"),
        },
        {
          key: "notify_platform_updates",
          title: tNotif("categories.promotions.platformUpdates.label"),
          description: tNotif("categories.promotions.platformUpdates.description"),
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-text text-xl font-semibold">{t("title")}</h2>
        <p className="text-text-muted mt-1 text-sm">{t("subtitle")}</p>
      </div>

      {/* Email clarification banner */}
      <div className="bg-primary/5 border-primary/20 flex items-start gap-3 rounded-xl border px-4 py-3">
        <Info className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
        <p className="text-text-muted text-sm">{t("emailInfo")}</p>
      </div>

      {/* Batch toggle */}
      <div className="border-border bg-surface flex items-center justify-between rounded-xl border px-5 py-3">
        <div className="flex items-center gap-3">
          {allDisabled ? (
            <BellOff className="text-text-muted h-5 w-5" />
          ) : (
            <Bell className="text-primary h-5 w-5" />
          )}
          <span className="text-text text-sm font-medium">
            {allEnabled ? t("disableAll") : t("enableAll")}
          </span>
        </div>
        <button
          type="button"
          onClick={handleToggleAll}
          disabled={isSavingNotifications}
          className="relative flex-shrink-0"
          role="switch"
          aria-checked={allEnabled}
          aria-label={allEnabled ? t("disableAll") : t("enableAll")}
        >
          <div
            className={`h-6 w-11 rounded-full transition-colors ${allEnabled ? "bg-primary" : "bg-border"}`}
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${allEnabled ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </div>
        </button>
      </div>

      {/* Single card with grouped sections */}
      <div className="border-border bg-surface overflow-hidden rounded-xl border">
        {sections.map((section, sectionIndex) => (
          <div key={section.header}>
            {/* Section header */}
            <div
              className={`flex items-center gap-2.5 px-5 py-3 ${
                sectionIndex === 0 ? "" : "border-border border-t"
              } bg-bg-secondary/50`}
            >
              <Bell className="text-text-muted h-3.5 w-3.5" aria-hidden="true" />
              <h3 className="text-text-muted text-xs font-semibold tracking-wide uppercase">
                {section.header}
              </h3>
            </div>

            {/* Toggle rows */}
            <div className="divide-border divide-y">
              {section.items.map((item) => (
                <ToggleRow
                  key={item.key}
                  title={item.title}
                  description={item.description}
                  checked={notificationPrefs[item.key]}
                  disabled={isSavingNotifications}
                  onToggle={() => handleNotificationToggle(item.key, item.title)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
