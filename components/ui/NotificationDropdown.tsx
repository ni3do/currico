"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, BellOff } from "lucide-react";
import type { Notification } from "@/lib/types/account";
import { TYPE_ICON, TYPE_COLOR, timeAgo } from "@/lib/utils/notification-display";

interface NotificationDropdownProps {
  unreadCount: number;
  onCountChange: (count: number) => void;
}

export default function NotificationDropdown({
  unreadCount,
  onCountChange,
}: NotificationDropdownProps) {
  const t = useTranslations("accountPage.notificationDropdown");
  const tTime = useTranslations("accountPage.notifications");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/me/notifications?limit=5");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        onCountChange(data.unreadCount ?? 0);
      }
    } catch {
      // Silently ignore — dropdown is non-critical
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  // Fetch when opening
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Close on click outside or Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  const markAsRead = async (id: string, link: string | null) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
    onCountChange(Math.max(0, unreadCount - 1));

    fetch("/api/users/me/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    }).catch(() => {});

    setIsOpen(false);
    if (link) {
      router.push(link as Parameters<typeof router.push>[0]);
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
    onCountChange(0);

    fetch("/api/users/me/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    }).catch(() => {});
  };

  return (
    <div className="relative hidden lg:block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-text-secondary hover:text-primary relative p-2 transition-colors"
        aria-label={t("title")}
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="bg-error text-text-on-accent absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="border-border bg-surface absolute right-0 z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-xl border shadow-lg"
          >
            {/* Header */}
            <div className="border-border flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-text text-sm font-semibold">{t("title")}</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-primary hover:text-primary-hover flex items-center gap-1 text-xs font-medium transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  {t("markAllRead")}
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="space-y-1 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse rounded-lg p-3">
                      <div className="flex items-start gap-2.5">
                        <div className="bg-border h-8 w-8 flex-shrink-0 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                          <div className="bg-border h-3.5 w-3/4 rounded" />
                          <div className="bg-border h-3 w-1/2 rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <BellOff className="text-text-faint mx-auto mb-2 h-8 w-8" />
                  <p className="text-text-muted text-sm">{t("empty")}</p>
                </div>
              ) : (
                <div className="p-1">
                  {notifications.map((n) => {
                    const Icon = TYPE_ICON[n.type];
                    const colorClass = TYPE_COLOR[n.type];
                    const isUnread = !n.read_at;

                    return (
                      <button
                        key={n.id}
                        onClick={() => markAsRead(n.id, n.link)}
                        className={`relative flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors ${
                          isUnread ? "bg-primary/[0.03] hover:bg-primary/[0.06]" : "hover:bg-bg"
                        }`}
                      >
                        {isUnread && (
                          <span className="bg-primary absolute top-3 left-1 h-1.5 w-1.5 rounded-full" />
                        )}
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm ${isUnread ? "text-text font-semibold" : "text-text font-medium"}`}
                          >
                            {n.title}
                          </p>
                          <p className="text-text-faint mt-0.5 text-xs">
                            {timeAgo(n.created_at, tTime)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-border border-t px-4 py-2.5">
              <Link
                href="/konto/notifications"
                onClick={() => setIsOpen(false)}
                className="text-primary hover:text-primary-hover block text-center text-sm font-medium transition-colors"
              >
                {t("viewAll")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
