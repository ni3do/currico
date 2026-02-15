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
  MessageSquare,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { NotificationType, Notification } from "@/lib/types/account";

const TYPE_ICON: Record<NotificationType, typeof Receipt> = {
  SALE: Receipt,
  FOLLOW: UserPlus,
  REVIEW: Star,
  COMMENT: MessageSquare,
  SYSTEM: Info,
};

const TYPE_COLOR: Record<NotificationType, string> = {
  SALE: "bg-success/10 text-success",
  FOLLOW: "bg-primary/10 text-primary",
  REVIEW: "bg-warning/10 text-warning",
  COMMENT: "bg-blue/10 text-blue",
  SYSTEM: "bg-accent/10 text-accent",
};

type FilterType = "ALL" | NotificationType;

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchNotifications = useCallback(
    async (cursor?: string) => {
      if (!cursor) setError(false);
      try {
        const params = new URLSearchParams();
        if (activeFilter !== "ALL") params.set("type", activeFilter);
        if (cursor) params.set("cursor", cursor);
        params.set("limit", "20");

        const res = await fetch(`/api/users/me/notifications?${params.toString()}`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        if (cursor) {
          setNotifications((prev) => [...prev, ...data.notifications]);
        } else {
          setNotifications(data.notifications);
        }
        setUnreadCount(data.unreadCount);
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeFilter]
  );

  useEffect(() => {
    setLoading(true);
    setNotifications([]);
    setNextCursor(null);
    fetchNotifications();
  }, [fetchNotifications]);

  const loadMore = () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    fetchNotifications(nextCursor);
  };

  const markAsRead = async (id: string, link: string | null) => {
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
      router.push(link as Parameters<typeof router.push>[0]);
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

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "ALL", label: t("filterAll") },
    { key: "SALE", label: t("filterSales") },
    { key: "REVIEW", label: t("filterReviews") },
    { key: "COMMENT", label: t("filterComments") },
    { key: "FOLLOW", label: t("filterFollows") },
    { key: "SYSTEM", label: t("filterSystem") },
  ];

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

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === tab.key
                ? "bg-primary text-text-on-accent"
                : "bg-surface-hover text-text-muted hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
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

          {/* Load More */}
          {hasMore && (
            <div className="pt-2 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="text-primary hover:text-primary-hover inline-flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("loadMore")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
