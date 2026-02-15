"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Home,
  Users,
  FileText,
  AlertTriangle,
  CreditCard,
  Settings,
  Shield,
  TrendingUp,
  Clock,
  AlertCircle,
  ShieldCheck,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import type { AdminStats, AdminTabType } from "@/lib/types/admin";

// Color classes for each tab (active state) - using semantic tokens where available
const TAB_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  overview: {
    bg: "bg-error/10",
    text: "text-error",
    dot: "bg-error",
  },
  documents: {
    bg: "bg-primary/10",
    text: "text-primary",
    dot: "bg-primary",
  },
  messages: {
    bg: "bg-accent/10",
    text: "text-accent",
    dot: "bg-accent",
  },
  reports: {
    bg: "bg-error/10",
    text: "text-error",
    dot: "bg-error",
  },
  users: {
    bg: "bg-info/10",
    text: "text-info",
    dot: "bg-info",
  },
  transactions: {
    bg: "bg-price/10",
    text: "text-price",
    dot: "bg-price",
  },
  settings: {
    bg: "bg-focus/10",
    text: "text-focus",
    dot: "bg-focus",
  },
};

// Navigation sections with grouped items
const NAV_SECTIONS = [
  {
    id: "main",
    label: null,
    icon: null,
    items: [{ id: "overview", href: "/admin", label: "layout.overview", icon: Home }],
  },
  {
    id: "moderation",
    label: "sidebar.moderation",
    icon: ShieldCheck,
    items: [
      { id: "documents", href: "/admin/documents", label: "layout.documents", icon: FileText },
      { id: "messages", href: "/admin/messages", label: "layout.messages", icon: MessageSquare },
      { id: "reports", href: "/admin/reports", label: "layout.reports", icon: AlertTriangle },
    ],
  },
  {
    id: "management",
    label: "sidebar.management",
    icon: Briefcase,
    items: [
      { id: "users", href: "/admin/users", label: "layout.users", icon: Users },
      {
        id: "transactions",
        href: "/admin/transactions",
        label: "layout.transactions",
        icon: CreditCard,
      },
      { id: "settings", href: "/admin/settings", label: "layout.settings", icon: Settings },
    ],
  },
] as const;

interface AdminSidebarProps {
  activeTab: AdminTabType;
  stats?: AdminStats | null;
  adminName?: string;
  adminEmail?: string;
  className?: string;
}

export function AdminSidebar({
  activeTab,
  stats,
  adminName,
  adminEmail,
  className = "",
}: AdminSidebarProps) {
  const t = useTranslations("admin");

  return (
    <aside
      className={`border-border bg-bg-secondary relative overflow-hidden rounded-xl border shadow-sm ${className}`}
    >
      <div className="p-5">
        {/* Admin Profile */}
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-error absolute -inset-1 rounded-full opacity-20 blur-sm"></div>
              <div className="bg-error relative flex h-12 w-12 items-center justify-center rounded-full">
                <Shield className="text-text-on-accent h-6 w-6" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-text truncate text-sm font-semibold">
                {adminName || "Administrator"}
              </h2>
              <p className="text-text-muted truncate text-xs">{adminEmail}</p>
            </div>
          </div>
        </div>

        <div className="divider my-5" />

        {/* Quick Stats */}
        {stats && (
          <>
            <div className="mb-5">
              <h3 className="label-meta mb-3 flex items-center gap-2">
                <TrendingUp className="text-text-muted h-4 w-4" />
                {t("sidebar.quickOverview")}
              </h3>
              <div className="border-border bg-bg space-y-3 rounded-lg border p-4">
                {/* Pending Documents */}
                {stats.pendingApproval > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary flex items-center gap-2 text-sm">
                      <Clock className="text-warning h-4 w-4" />
                      {t("sidebar.pending")}
                    </span>
                    <span className="bg-warning/10 text-warning rounded-full px-2 py-0.5 text-xs font-medium">
                      {stats.pendingApproval}
                    </span>
                  </div>
                )}

                {/* New Messages */}
                {stats.newMessages > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary flex items-center gap-2 text-sm">
                      <MessageSquare className="text-accent h-4 w-4" />
                      {t("sidebar.messages")}
                    </span>
                    <span className="bg-accent/10 text-accent rounded-full px-2 py-0.5 text-xs font-medium">
                      {stats.newMessages}
                    </span>
                  </div>
                )}

                {/* Open Reports */}
                {stats.openReports > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary flex items-center gap-2 text-sm">
                      <AlertCircle className="text-error h-4 w-4" />
                      {t("sidebar.reports")}
                    </span>
                    <span className="bg-error/10 text-error rounded-full px-2 py-0.5 text-xs font-medium">
                      {stats.openReports}
                    </span>
                  </div>
                )}

                {/* Users Today */}
                <div className="border-border flex items-center justify-between border-t pt-3">
                  <span className="text-text-secondary flex items-center gap-2 text-sm">
                    <Users className="text-primary h-4 w-4" />
                    {t("sidebar.newUsers")}
                  </span>
                  <span className="text-text text-sm font-semibold">
                    +{stats.newUsersToday} {t("sidebar.today")}
                  </span>
                </div>

                {/* Revenue Today */}
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary flex items-center gap-2 text-sm">
                    <TrendingUp className="text-success h-4 w-4" />
                    {t("sidebar.revenueToday")}
                  </span>
                  <span className="text-success text-sm font-semibold">
                    CHF {stats.revenueToday?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
            </div>

            <div className="divider my-5" />
          </>
        )}

        {/* Navigation */}
        <nav className="mb-5 space-y-4">
          {NAV_SECTIONS.map((section) => {
            const SectionIcon = section.icon;
            return (
              <div key={section.id}>
                {section.label && (
                  <h3 className="label-meta mb-2 flex items-center gap-2">
                    {SectionIcon && <SectionIcon className="text-error h-3.5 w-3.5" />}
                    {t(section.label)}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const styles = TAB_STYLES[item.id] || TAB_STYLES.overview;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                          isActive
                            ? `${styles.bg} ${styles.text}`
                            : "text-text-secondary hover:bg-surface-hover hover:text-text"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isActive ? styles.text : ""}`} />
                        {t(item.label)}
                        {/* Show badge for pending items */}
                        {item.id === "documents" && stats?.pendingApproval ? (
                          <span className="bg-warning/10 text-warning ml-auto rounded-full px-2 py-0.5 text-xs font-medium">
                            {stats.pendingApproval}
                          </span>
                        ) : item.id === "messages" && stats?.newMessages ? (
                          <span className="bg-accent/10 text-accent ml-auto rounded-full px-2 py-0.5 text-xs font-medium">
                            {stats.newMessages}
                          </span>
                        ) : item.id === "reports" && stats?.openReports ? (
                          <span className="bg-error/10 text-error ml-auto rounded-full px-2 py-0.5 text-xs font-medium">
                            {stats.openReports}
                          </span>
                        ) : isActive ? (
                          <span className={`ml-auto h-2 w-2 rounded-full ${styles.dot}`} />
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export default AdminSidebar;
