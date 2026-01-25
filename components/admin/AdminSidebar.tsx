"use client";

import { Link } from "@/i18n/navigation";
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
} from "lucide-react";

// Navigation items
const NAV_ITEMS = [
  { id: "overview", href: "/admin", label: "Übersicht", icon: Home },
  { id: "users", href: "/admin/users", label: "Benutzer", icon: Users },
  { id: "documents", href: "/admin/documents", label: "Dokumente", icon: FileText },
  { id: "reports", href: "/admin/reports", label: "Meldungen", icon: AlertTriangle },
  { id: "transactions", href: "/admin/transactions", label: "Transaktionen", icon: CreditCard },
  { id: "settings", href: "/admin/settings", label: "Einstellungen", icon: Settings },
] as const;

type TabType = "overview" | "users" | "documents" | "reports" | "transactions" | "settings";

interface AdminStats {
  totalUsers: number;
  newUsersToday: number;
  pendingApproval: number;
  openReports: number;
  totalRevenue: number;
  revenueToday: number;
}

interface AdminSidebarProps {
  activeTab: TabType;
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
  return (
    <aside className={`border-border bg-bg-secondary rounded-xl border shadow-sm ${className}`}>
      <div className="p-5">
        {/* Admin Profile */}
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--ctp-mauve)] to-[var(--ctp-pink)]">
              <Shield className="h-6 w-6 text-white" />
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
                Schnellübersicht
              </h3>
              <div className="border-border bg-bg space-y-3 rounded-lg border p-4">
                {/* Pending Documents */}
                {stats.pendingApproval > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary flex items-center gap-2 text-sm">
                      <Clock className="text-warning h-4 w-4" />
                      Ausstehend
                    </span>
                    <span className="bg-warning/10 text-warning rounded-full px-2 py-0.5 text-xs font-medium">
                      {stats.pendingApproval}
                    </span>
                  </div>
                )}

                {/* Open Reports */}
                {stats.openReports > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary flex items-center gap-2 text-sm">
                      <AlertCircle className="text-error h-4 w-4" />
                      Meldungen
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
                    Neue Benutzer
                  </span>
                  <span className="text-text text-sm font-semibold">
                    +{stats.newUsersToday} heute
                  </span>
                </div>

                {/* Revenue Today */}
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary flex items-center gap-2 text-sm">
                    <TrendingUp className="text-success h-4 w-4" />
                    Umsatz heute
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
        <nav className="mb-5 space-y-1">
          <h3 className="label-meta mb-3">Navigation</h3>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                {item.label}
                {/* Show badge for pending items */}
                {item.id === "documents" && stats?.pendingApproval ? (
                  <span className="bg-warning/10 text-warning ml-auto rounded-full px-2 py-0.5 text-xs font-medium">
                    {stats.pendingApproval}
                  </span>
                ) : item.id === "reports" && stats?.openReports ? (
                  <span className="bg-error/10 text-error ml-auto rounded-full px-2 py-0.5 text-xs font-medium">
                    {stats.openReports}
                  </span>
                ) : isActive ? (
                  <span className="bg-primary ml-auto h-2 w-2 rounded-full" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="divider my-5" />

        {/* Quick Actions */}
        <div className="space-y-2">
          <Link
            href="/admin/documents"
            className="bg-primary text-text-on-accent hover:bg-primary-hover flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            <FileText className="h-4 w-4" />
            Dokumente prüfen
          </Link>
          <Link
            href="/admin/users"
            className="border-border bg-bg text-text-secondary hover:border-primary hover:text-primary flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          >
            <Users className="h-4 w-4" />
            Benutzer verwalten
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
