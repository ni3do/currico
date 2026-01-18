"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";

interface AdminStats {
  totalUsers: number;
  newUsersToday: number;
  totalResources: number;
  pendingApproval: number;
  totalRevenue: number;
  revenueToday: number;
  activeSchools: number;
  openReports: number;
  userBreakdown: {
    buyers: number;
    sellers: number;
    schools: number;
  };
  weeklyRevenue: number[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-text-muted">Laden...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-[var(--ctp-blue)] to-[var(--ctp-sapphire)] p-2.5">
              <svg
                className="h-5 w-5 text-text-on-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-text-muted">Benutzer</h3>
          </div>
          <div className="text-3xl font-bold text-text">
            {stats?.totalUsers || 0}
          </div>
          <p className="mt-1 text-sm text-text-muted">
            +{stats?.newUsersToday || 0} heute
          </p>
        </div>

        {/* Pending Documents */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-[var(--ctp-yellow)] to-[var(--ctp-peach)] p-2.5">
              <svg
                className="h-5 w-5 text-[var(--ctp-crust)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-text-muted">Ausstehend</h3>
          </div>
          <div className="text-3xl font-bold text-text">
            {stats?.pendingApproval || 0}
          </div>
          <p className="mt-1 text-sm text-text-muted">Dokumente zur Prüfung</p>
        </div>

        {/* Open Reports */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-[var(--ctp-red)] to-[var(--ctp-maroon)] p-2.5">
              <svg
                className="h-5 w-5 text-text-on-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-text-muted">Meldungen</h3>
          </div>
          <div className="text-3xl font-bold text-text">
            {stats?.openReports || 0}
          </div>
          <p className="mt-1 text-sm text-text-muted">Offene Meldungen</p>
        </div>

        {/* Total Revenue */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-[var(--ctp-green)] to-[var(--ctp-teal)] p-2.5">
              <svg
                className="h-5 w-5 text-[var(--ctp-crust)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-text-muted">Umsatz</h3>
          </div>
          <div className="text-3xl font-bold text-text">
            CHF {stats?.totalRevenue?.toFixed(2) || "0.00"}
          </div>
          <p className="mt-1 text-sm text-text-muted">
            +CHF {stats?.revenueToday?.toFixed(2) || "0.00"} heute
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/documents"
          className="group rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text group-hover:text-primary">
                Dokumente prüfen
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                {stats?.pendingApproval || 0} ausstehend
              </p>
            </div>
            <svg
              className="h-6 w-6 text-text-muted group-hover:text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link
          href="/admin/reports"
          className="group rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text group-hover:text-primary">
                Meldungen bearbeiten
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                {stats?.openReports || 0} offen
              </p>
            </div>
            <svg
              className="h-6 w-6 text-text-muted group-hover:text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="group rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text group-hover:text-primary">
                Benutzer verwalten
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                {stats?.totalUsers || 0} registriert
              </p>
            </div>
            <svg
              className="h-6 w-6 text-text-muted group-hover:text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* User Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="mb-4 font-semibold text-text">Benutzer nach Rolle</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-[var(--ctp-blue)]"></div>
                <span className="text-text-muted">Käufer</span>
              </div>
              <span className="font-medium text-text">
                {stats?.userBreakdown?.buyers || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-[var(--ctp-green)]"></div>
                <span className="text-text-muted">Verkäufer</span>
              </div>
              <span className="font-medium text-text">
                {stats?.userBreakdown?.sellers || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-[var(--ctp-mauve)]"></div>
                <span className="text-text-muted">Schulen</span>
              </div>
              <span className="font-medium text-text">
                {stats?.userBreakdown?.schools || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="mb-4 font-semibold text-text">Ressourcen</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Total Ressourcen</span>
              <span className="font-medium text-text">
                {stats?.totalResources || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Ausstehende Prüfungen</span>
              <span className="font-medium text-[var(--ctp-yellow)]">
                {stats?.pendingApproval || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Aktive Schulen</span>
              <span className="font-medium text-text">
                {stats?.activeSchools || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
