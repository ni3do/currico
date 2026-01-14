"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TopBar from "@/components/ui/TopBar";

interface AdminResource {
  id: string;
  title: string;
  status: string;
  subjects: string[];
  created_at: string;
  seller: {
    id: string;
    display_name: string | null;
    email: string;
  };
}

interface AdminReport {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  reporter: {
    id: string;
    display_name: string | null;
    email: string;
  };
  resource: {
    id: string;
    title: string;
  } | null;
}

interface AdminStats {
  pendingApproval: number;
  openReports: number;
  totalResources: number;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"quality" | "reports">("quality");
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [stats, setStats] = useState<AdminStats>({ pendingApproval: 0, openReports: 0, totalResources: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [resourcesRes, reportsRes, statsRes] = await Promise.all([
        fetch("/api/admin/resources?status=pending"),
        fetch("/api/admin/reports"),
        fetch("/api/admin/stats"),
      ]);

      if (resourcesRes.ok) {
        const data = await resourcesRes.json();
        setResources(data.resources);
      }
      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setReports(data.reports);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats({
          pendingApproval: data.pendingApproval,
          openReports: data.openReports,
          totalResources: data.totalResources,
        });
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedResource) return;

    try {
      const response = await fetch("/api/admin/resources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedResource,
          is_approved: newStatus === "Verified",
        }),
      });

      if (response.ok) {
        fetchAdminData(); // Refresh the data
      }
    } catch (error) {
      console.error("Error updating resource:", error);
    }

    setShowStatusModal(false);
    setSelectedResource(null);
    setNewStatus("");
    setAdminNote("");
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <TopBar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Admin Dashboard</h1>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Verwalten Sie Qualitätsstatus und Meldungen
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-[var(--ctp-yellow)] to-[var(--ctp-peach)] p-2">
                <svg
                  className="h-6 w-6 text-[var(--ctp-crust)]"
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
              <h3 className="text-sm font-medium text-[var(--color-text-muted)]">
                Ausstehende Prüfungen
              </h3>
            </div>
            <div className="text-3xl font-bold text-[var(--color-text)]">{stats.pendingApproval}</div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-[var(--ctp-red)] to-[var(--ctp-maroon)] p-2">
                <svg
                  className="h-6 w-6 text-[var(--ctp-crust)]"
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
              <h3 className="text-sm font-medium text-[var(--color-text-muted)]">
                Offene Meldungen
              </h3>
            </div>
            <div className="text-3xl font-bold text-[var(--color-text)]">{stats.openReports}</div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-[var(--ctp-green)] to-[var(--ctp-teal)] p-2">
                <svg
                  className="h-6 w-6 text-[var(--ctp-crust)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-[var(--color-text-muted)]">
                Gesamt Ressourcen
              </h3>
            </div>
            <div className="text-3xl font-bold text-[var(--color-text)]">{stats.totalResources}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab("quality")}
            className={`pb-4 text-sm font-medium transition-colors ${
              activeTab === "quality"
                ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            Qualitätsstatus
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`pb-4 text-sm font-medium transition-colors ${
              activeTab === "reports"
                ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            Meldungen
          </button>
        </div>

        {/* Quality Status Management */}
        {activeTab === "quality" && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-bg)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                      Titel
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                      Verkäufer
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                      Fach
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                      Hochgeladen
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text)]">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">Laden...</td>
                    </tr>
                  ) : resources.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">Keine ausstehenden Ressourcen</td>
                    </tr>
                  ) : resources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-[var(--color-bg)] transition-colors">
                      <td className="px-6 py-4 font-medium text-[var(--color-text)]">
                        {resource.title}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">{resource.seller.display_name || resource.seller.email}</td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">{resource.subjects[0] || "-"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            resource.status === "Verified"
                              ? "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]"
                              : resource.status === "AI-Checked"
                              ? "bg-[var(--badge-info-bg)] text-[var(--badge-info-text)]"
                              : "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]"
                          }`}
                        >
                          {resource.status === "Verified"
                            ? "Verifiziert"
                            : resource.status === "AI-Checked"
                            ? "KI-Geprüft"
                            : "Ausstehend"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">
                        {new Date(resource.created_at).toLocaleDateString("de-CH")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedResource(resource.id);
                            setNewStatus(resource.status);
                            setShowStatusModal(true);
                          }}
                          className="btn-primary px-4 py-2 text-sm"
                        >
                          Status ändern
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Management */}
        {activeTab === "reports" && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-bg)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                      Ressource
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                      Melder
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                      Grund
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                      Datum
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text)]">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">Laden...</td>
                    </tr>
                  ) : reports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">Keine Meldungen vorhanden</td>
                    </tr>
                  ) : reports.map((report) => (
                    <tr key={report.id} className="hover:bg-[var(--color-bg)] transition-colors">
                      <td className="px-6 py-4 font-medium text-[var(--color-text)]">
                        {report.resource?.title || "-"}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">{report.reporter.display_name || report.reporter.email}</td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">{report.reason}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            report.status === "OPEN"
                              ? "bg-[var(--badge-error-bg)] text-[var(--badge-error-text)]"
                              : report.status === "IN_REVIEW"
                              ? "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]"
                              : "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]"
                          }`}
                        >
                          {report.status === "OPEN"
                            ? "Offen"
                            : report.status === "IN_REVIEW"
                            ? "In Prüfung"
                            : "Gelöst"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">
                        {new Date(report.created_at).toLocaleDateString("de-CH")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="btn-secondary px-4 py-2 text-sm">
                          Prüfen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[var(--color-text)]">
                Status ändern
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Neuer Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input"
                >
                  <option value="Pending">Ausstehend</option>
                  <option value="AI-Checked">KI-Geprüft</option>
                  <option value="Verified">Verifiziert</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Interne Notiz (optional)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  className="input min-h-[80px] resize-y"
                  placeholder="Notizen zur Statusänderung..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleStatusChange}
                  className="btn-primary flex-1 px-4 py-3"
                >
                  Status aktualisieren
                </button>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="btn-secondary px-6 py-3"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-[var(--color-text-muted)]">
            <p>© 2026 Easy Lehrer. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
