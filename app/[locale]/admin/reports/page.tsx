"use client";

import { useState, useEffect, useCallback } from "react";

interface AdminReport {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  resolution: string | null;
  created_at: string;
  handled_at: string | null;
  reporter: {
    id: string;
    display_name: string | null;
    email: string;
  };
  resource: {
    id: string;
    title: string;
  } | null;
  reported_user: {
    id: string;
    display_name: string | null;
    email: string;
  } | null;
  handled_by: {
    id: string;
    display_name: string | null;
  } | null;
}

interface PaginatedResponse {
  reports: AdminReport[];
  total: number;
  page: number;
  totalPages: number;
}

const statusLabels: Record<string, string> = {
  OPEN: "Offen",
  IN_REVIEW: "In Prüfung",
  RESOLVED: "Gelöst",
  DISMISSED: "Abgewiesen",
};

const statusColors: Record<string, string> = {
  OPEN: "bg-[var(--badge-error-bg)] text-[var(--badge-error-text)]",
  IN_REVIEW: "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]",
  RESOLVED: "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]",
  DISMISSED: "bg-[var(--color-bg)] text-[var(--color-text-muted)]",
};

const reasonLabels: Record<string, string> = {
  copyright: "Urheberrecht",
  inappropriate: "Unangemessen",
  spam: "Spam",
  fraud: "Betrug",
  other: "Sonstiges",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [resolution, setResolution] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (statusFilter) params.set("status", statusFilter);

      const response = await fetch(`/api/admin/reports?${params}`);
      if (response.ok) {
        const data: PaginatedResponse = await response.json();
        setReports(data.reports);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const body: Record<string, string> = { status: newStatus };
      if (newStatus === "RESOLVED" || newStatus === "DISMISSED") {
        body.resolution = resolution;
      }

      const response = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reportId, ...body }),
      });

      if (response.ok) {
        fetchReports();
        setShowModal(false);
        setSelectedReport(null);
        setResolution("");
      } else {
        const error = await response.json();
        alert(error.error || "Fehler beim Aktualisieren");
      }
    } catch (error) {
      console.error("Error updating report:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const openReportModal = (report: AdminReport) => {
    setSelectedReport(report);
    setResolution(report.resolution || "");
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
        >
          <option value="">Alle Status</option>
          <option value="OPEN">Offen</option>
          <option value="IN_REVIEW">In Prüfung</option>
          <option value="RESOLVED">Gelöst</option>
          <option value="DISMISSED">Abgewiesen</option>
        </select>
      </div>

      {/* Stats Bar */}
      <div className="text-sm text-[var(--color-text-muted)]">{total} Meldungen gefunden</div>

      {/* Reports Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-bg)]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                  Grund
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                  Gemeldet
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                  Melder
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
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                    Laden...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                    Keine Meldungen gefunden
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="transition-colors hover:bg-[var(--color-bg)]">
                    <td className="px-6 py-4">
                      <span className="font-medium text-[var(--color-text)]">
                        {reasonLabels[report.reason] || report.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {report.resource ? (
                        <div>
                          <div className="text-[var(--color-text)]">{report.resource.title}</div>
                          <div className="text-xs text-[var(--color-text-muted)]">Ressource</div>
                        </div>
                      ) : report.reported_user ? (
                        <div>
                          <div className="text-[var(--color-text)]">
                            {report.reported_user.display_name || report.reported_user.email}
                          </div>
                          <div className="text-xs text-[var(--color-text-muted)]">Benutzer</div>
                        </div>
                      ) : (
                        <span className="text-[var(--color-text-muted)]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">
                      {report.reporter.display_name || report.reporter.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[report.status]}`}
                      >
                        {statusLabels[report.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">
                      {new Date(report.created_at).toLocaleDateString("de-CH")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openReportModal(report)}
                        className="rounded-lg bg-[var(--color-primary)] px-4 py-1.5 text-xs font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--color-primary-hover)]"
                      >
                        Bearbeiten
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Zurück
          </button>
          <span className="text-sm text-[var(--color-text-muted)]">
            Seite {page} von {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Weiter
          </button>
        </div>
      )}

      {/* Report Detail Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-sm">
          <div className="mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[var(--color-text)]">Meldung bearbeiten</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedReport(null);
                }}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Report Details */}
            <div className="mb-6 space-y-4">
              <div className="rounded-lg border border-[var(--color-border)] p-4">
                <div className="mb-1 text-sm text-[var(--color-text-muted)]">Grund</div>
                <div className="font-medium text-[var(--color-text)]">
                  {reasonLabels[selectedReport.reason] || selectedReport.reason}
                </div>
              </div>

              {selectedReport.description && (
                <div className="rounded-lg border border-[var(--color-border)] p-4">
                  <div className="mb-1 text-sm text-[var(--color-text-muted)]">Beschreibung</div>
                  <div className="text-[var(--color-text)]">{selectedReport.description}</div>
                </div>
              )}

              <div className="rounded-lg border border-[var(--color-border)] p-4">
                <div className="mb-1 text-sm text-[var(--color-text-muted)]">Gemeldet</div>
                <div className="text-[var(--color-text)]">
                  {selectedReport.resource ? (
                    <>
                      <span className="font-medium">{selectedReport.resource.title}</span>
                      <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                        (Ressource)
                      </span>
                    </>
                  ) : selectedReport.reported_user ? (
                    <>
                      <span className="font-medium">
                        {selectedReport.reported_user.display_name ||
                          selectedReport.reported_user.email}
                      </span>
                      <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                        (Benutzer)
                      </span>
                    </>
                  ) : (
                    "-"
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-[var(--color-border)] p-4">
                  <div className="mb-1 text-sm text-[var(--color-text-muted)]">Melder</div>
                  <div className="text-[var(--color-text)]">
                    {selectedReport.reporter.display_name || selectedReport.reporter.email}
                  </div>
                </div>
                <div className="rounded-lg border border-[var(--color-border)] p-4">
                  <div className="mb-1 text-sm text-[var(--color-text-muted)]">
                    Aktueller Status
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[selectedReport.status]}`}
                  >
                    {statusLabels[selectedReport.status]}
                  </span>
                </div>
              </div>
            </div>

            {/* Resolution Input */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Lösung / Notizen
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={3}
                className="min-h-[80px] w-full resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none"
                placeholder="Beschreiben Sie die ergriffenen Massnahmen..."
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="mb-2 text-sm font-medium text-[var(--color-text)]">
                Status ändern:
              </div>
              <div className="grid grid-cols-2 gap-3">
                {selectedReport.status !== "IN_REVIEW" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedReport.id, "IN_REVIEW")}
                    disabled={actionLoading}
                    className="rounded-lg bg-[var(--badge-warning-bg)] px-4 py-2.5 text-sm font-medium text-[var(--badge-warning-text)] hover:opacity-90 disabled:opacity-50"
                  >
                    In Prüfung
                  </button>
                )}
                {selectedReport.status !== "RESOLVED" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedReport.id, "RESOLVED")}
                    disabled={actionLoading}
                    className="rounded-lg bg-[var(--badge-success-bg)] px-4 py-2.5 text-sm font-medium text-[var(--badge-success-text)] hover:opacity-90 disabled:opacity-50"
                  >
                    Gelöst
                  </button>
                )}
                {selectedReport.status !== "DISMISSED" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedReport.id, "DISMISSED")}
                    disabled={actionLoading}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-muted)] hover:opacity-90 disabled:opacity-50"
                  >
                    Abweisen
                  </button>
                )}
                {selectedReport.status !== "OPEN" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedReport.id, "OPEN")}
                    disabled={actionLoading}
                    className="rounded-lg bg-[var(--badge-error-bg)] px-4 py-2.5 text-sm font-medium text-[var(--badge-error-text)] hover:opacity-90 disabled:opacity-50"
                  >
                    Wieder öffnen
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--color-border)] pt-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedReport(null);
                }}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
              >
                Schliessen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
