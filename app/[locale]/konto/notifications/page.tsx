"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  Bell,
  Receipt,
  RefreshCw,
  UserPlus,
  Star,
  Info,
  CheckCheck,
  BellOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  created_at: string;
  read_at: string | null;
  type: "SALE" | "FOLLOW" | "REVIEW" | "SYSTEM";
  title: string;
  body: string | null;
  link: string | null;
}

const TYPE_ICON: Record<Notification["type"], typeof Receipt> = {
  SALE: Receipt,
  FOLLOW: UserPlus,
  REVIEW: Star,
  SYSTEM: Info,
};

const TYPE_COLOR: Record<Notification["type"], string> = {
  SALE: "bg-success/10 text-success",
  FOLLOW: "bg-primary/10 text-primary",
  REVIEW: "bg-warning/10 text-warning",
  SYSTEM: "bg-accent/10 text-accent",
};

function timeAgo(dateStr: string, t: ReturnType<typeof useTranslations>) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return t("justNow");
  if (minutes < 60) return t("minutesAgo", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("hoursAgo", { count: hours });
  const days = Math.floor(hours / 24);
  return t("daysAgo", { count: days });
}

export default function NotificationsPage() {
  const t = useTranslations("accountPage.notifications");
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/users/me/notifications");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string, link: string | null) => {
    // Optimistically mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    await fetch("/api/users/me/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });

    if (link) {
      router.push(link as any);
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
    setUnreadCount(0);

    await fetch("/api/users/me/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-border bg-surface animate-pulse rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <div className="bg-border h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="bg-border h-4 w-48 rounded" />
                <div className="bg-border h-3 w-32 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="text-primary h-5 w-5" />
          <h2 className="text-text text-lg font-bold">{t("title")}</h2>
          {unreadCount > 0 && (
            <span className="bg-error text-text-on-accent rounded-full px-2 py-0.5 text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-primary hover:text-primary-hover flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            {t("markAllRead")}
          </button>
        )}
      </div>

      {/* List */}
      {error ? (
        <div className="border-border bg-surface rounded-xl border py-12 text-center">
          <AlertCircle className="text-error mx-auto mb-3 h-10 w-10" aria-hidden="true" />
          <p className="text-text mb-1 font-medium">{t("errorLoading")}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchNotifications();
            }}
            className="text-primary hover:text-primary-hover mt-2 inline-flex items-center gap-1.5 text-sm font-medium"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t("retry")}
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="border-border bg-surface rounded-xl border border-dashed py-16 text-center">
          <BellOff className="text-text-faint mx-auto mb-3 h-10 w-10" />
          <p className="text-text font-medium">{t("empty")}</p>
          <p className="text-text-muted mt-1 text-sm">{t("emptyDescription")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {notifications.map((n, index) => {
              const Icon = TYPE_ICON[n.type];
              const colorClass = TYPE_COLOR[n.type];
              const isUnread = !n.read_at;

              return (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => markAsRead(n.id, n.link)}
                  className={`border-border relative flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                    isUnread
                      ? "bg-primary/[0.03] hover:bg-primary/[0.06]"
                      : "bg-surface hover:bg-surface-hover"
                  }`}
                >
                  {/* Unread dot */}
                  {isUnread && (
                    <span className="bg-primary absolute top-4 left-2 h-2 w-2 rounded-full" />
                  )}

                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm ${isUnread ? "text-text font-semibold" : "text-text font-medium"}`}
                    >
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-text-muted mt-0.5 line-clamp-2 text-sm">{n.body}</p>
                    )}
                    <p className="text-text-faint mt-1 text-xs">{timeAgo(n.created_at, t)}</p>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
