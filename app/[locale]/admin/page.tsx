"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import {
  Users,
  FileText,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  Download,
  DollarSign,
} from "lucide-react";

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
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="border-border bg-surface rounded-xl border p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="from-primary to-primary-hover rounded-lg bg-gradient-to-br p-2.5">
              <Users className="text-text-on-accent h-5 w-5" />
            </div>
            <h3 className="text-text-muted text-sm font-medium">Benutzer</h3>
          </div>
          <div className="text-text text-3xl font-bold">{stats?.totalUsers || 0}</div>
          <p className="text-text-muted mt-1 text-sm">+{stats?.newUsersToday || 0} heute</p>
        </div>

        {/* Pending Documents */}
        <div className="border-border bg-surface rounded-xl border p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="from-warning to-price rounded-lg bg-gradient-to-br p-2.5">
              <Clock className="text-text-on-accent h-5 w-5" />
            </div>
            <h3 className="text-text-muted text-sm font-medium">Ausstehend</h3>
          </div>
          <div className="text-text text-3xl font-bold">{stats?.pendingApproval || 0}</div>
          <p className="text-text-muted mt-1 text-sm">Dokumente zur Prüfung</p>
        </div>

        {/* Open Reports */}
        <div className="border-border bg-surface rounded-xl border p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="from-error to-error rounded-lg bg-gradient-to-br p-2.5">
              <AlertTriangle className="text-text-on-accent h-5 w-5" />
            </div>
            <h3 className="text-text-muted text-sm font-medium">Meldungen</h3>
          </div>
          <div className="text-text text-3xl font-bold">{stats?.openReports || 0}</div>
          <p className="text-text-muted mt-1 text-sm">Offene Meldungen</p>
        </div>

        {/* Total Revenue */}
        <div className="border-border bg-surface rounded-xl border p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="from-success to-accent rounded-lg bg-gradient-to-br p-2.5">
              <DollarSign className="text-text-on-accent h-5 w-5" />
            </div>
            <h3 className="text-text-muted text-sm font-medium">Umsatz</h3>
          </div>
          <div className="text-text text-3xl font-bold">
            CHF {stats?.totalRevenue?.toFixed(2) || "0.00"}
          </div>
          <p className="text-text-muted mt-1 text-sm">
            +CHF {stats?.revenueToday?.toFixed(2) || "0.00"} heute
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/documents"
          className="group border-border bg-surface hover:border-primary rounded-xl border p-6 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-text group-hover:text-primary font-semibold">Dokumente prüfen</h3>
              <p className="text-text-muted mt-1 text-sm">
                {stats?.pendingApproval || 0} ausstehend
              </p>
            </div>
            <ArrowRight className="text-text-muted group-hover:text-primary h-5 w-5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/admin/reports"
          className="group border-border bg-surface hover:border-primary rounded-xl border p-6 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-text group-hover:text-primary font-semibold">
                Meldungen bearbeiten
              </h3>
              <p className="text-text-muted mt-1 text-sm">{stats?.openReports || 0} offen</p>
            </div>
            <ArrowRight className="text-text-muted group-hover:text-primary h-5 w-5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="group border-border bg-surface hover:border-primary rounded-xl border p-6 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-text group-hover:text-primary font-semibold">
                Benutzer verwalten
              </h3>
              <p className="text-text-muted mt-1 text-sm">{stats?.totalUsers || 0} registriert</p>
            </div>
            <ArrowRight className="text-text-muted group-hover:text-primary h-5 w-5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Breakdown */}
        <div className="border-border bg-surface rounded-xl border p-6">
          <h3 className="text-text mb-4 font-semibold">Benutzer nach Rolle</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary h-3 w-3 rounded-full"></div>
                <span className="text-text-muted">Käufer</span>
              </div>
              <span className="text-text font-medium">{stats?.userBreakdown?.buyers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-success h-3 w-3 rounded-full"></div>
                <span className="text-text-muted">Verkäufer</span>
              </div>
              <span className="text-text font-medium">{stats?.userBreakdown?.sellers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-focus h-3 w-3 rounded-full"></div>
                <span className="text-text-muted">Schulen</span>
              </div>
              <span className="text-text font-medium">{stats?.userBreakdown?.schools || 0}</span>
            </div>
          </div>
        </div>

        {/* Resources Overview */}
        <div className="border-border bg-surface rounded-xl border p-6">
          <h3 className="text-text mb-4 font-semibold">Materialien</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="text-text-muted h-4 w-4" />
                <span className="text-text-muted">Total Materialien</span>
              </div>
              <span className="text-text font-medium">{stats?.totalResources || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="text-warning h-4 w-4" />
                <span className="text-text-muted">Ausstehende Prüfungen</span>
              </div>
              <span className="text-warning font-medium">{stats?.pendingApproval || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="text-text-muted h-4 w-4" />
                <span className="text-text-muted">Aktive Schulen</span>
              </div>
              <span className="text-text font-medium">{stats?.activeSchools || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="border-border bg-surface rounded-xl border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-text font-semibold">Umsatz (letzte 7 Tage)</h3>
          <div className="text-success flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4" />
            <span>+12.5%</span>
          </div>
        </div>
        <div className="flex h-40 items-end justify-between gap-2">
          {(stats?.weeklyRevenue || [0, 0, 0, 0, 0, 0, 0]).map((value, index) => {
            const maxValue = Math.max(...(stats?.weeklyRevenue || [1]), 1);
            const height = (value / maxValue) * 100;
            return (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="from-primary/50 to-primary w-full rounded-t-lg bg-gradient-to-t transition-all"
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
                <span className="text-text-muted text-xs">
                  {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"][index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
