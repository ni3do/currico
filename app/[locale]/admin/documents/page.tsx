"use client";

import { useState, useEffect, useCallback } from "react";

interface AdminResource {
  id: string;
  title: string;
  description: string;
  price: number;
  priceFormatted: string;
  subjects: string[];
  cycles: string[];
  is_published: boolean;
  is_approved: boolean;
  status: string;
  is_public: boolean;
  file_url: string;
  preview_url: string | null;
  created_at: string;
  updated_at: string;
  seller: {
    id: string;
    display_name: string | null;
    email: string;
  };
  salesCount: number;
}

interface PaginatedResponse {
  resources: AdminResource[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const statusLabels: Record<string, string> = {
  PENDING: "Ausstehend",
  VERIFIED: "Verifiziert",
  REJECTED: "Abgelehnt",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]",
  VERIFIED: "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]",
  REJECTED: "bg-[var(--badge-error-bg)] text-[var(--badge-error-text)]",
};

export default function AdminDocumentsPage() {
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedResource, setSelectedResource] = useState<AdminResource | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        status: statusFilter,
      });

      const response = await fetch(`/api/admin/resources?${params}`);
      if (response.ok) {
        const data: PaginatedResponse = await response.json();
        setResources(data.resources);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleVerify = async (resourceId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/resources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resourceId, status: "VERIFIED" }),
      });

      if (response.ok) {
        fetchResources();
        setShowModal(false);
        setSelectedResource(null);
      } else {
        const error = await response.json();
        alert(error.error || "Fehler beim Verifizieren");
      }
    } catch (error) {
      console.error("Error verifying resource:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (resourceId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/resources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resourceId, status: "REJECTED" }),
      });

      if (response.ok) {
        fetchResources();
        setShowModal(false);
        setSelectedResource(null);
      } else {
        const error = await response.json();
        alert(error.error || "Fehler beim Ablehnen");
      }
    } catch (error) {
      console.error("Error rejecting resource:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetToPending = async (resourceId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/resources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resourceId, status: "PENDING" }),
      });

      if (response.ok) {
        fetchResources();
        setShowModal(false);
        setSelectedResource(null);
      } else {
        const error = await response.json();
        alert(error.error || "Fehler beim Zurücksetzen");
      }
    } catch (error) {
      console.error("Error resetting resource:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const openResourceModal = (resource: AdminResource) => {
    setSelectedResource(resource);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="rounded-xl border border-[var(--ctp-blue)]/30 bg-[var(--ctp-blue)]/10 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 text-[var(--ctp-blue)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-[var(--ctp-blue)]">Verifizierungsworkflow</p>
            <p className="mt-1 text-sm text-text-muted">
              Neue Uploads haben den Status &quot;Ausstehend&quot; und sind nur für den Besitzer
              sichtbar. Nach der Verifizierung werden Dokumente öffentlich und für alle Benutzer
              zugänglich.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-surface px-4 py-2.5 text-text focus:border-primary focus:outline-none"
        >
          <option value="all">Alle Status</option>
          <option value="pending">Ausstehend</option>
          <option value="approved">Verifiziert</option>
          <option value="draft">Entwurf</option>
        </select>
      </div>

      {/* Stats Bar */}
      <div className="text-sm text-text-muted">{total} Dokumente gefunden</div>

      {/* Resources Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                  Titel
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                  Verkäufer
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                  Fach
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                  Sichtbarkeit
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                  Hochgeladen
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-text">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                    Laden...
                  </td>
                </tr>
              ) : resources.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                    Keine Dokumente gefunden
                  </td>
                </tr>
              ) : (
                resources.map((resource) => (
                  <tr key={resource.id} className="transition-colors hover:bg-bg">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text">{resource.title}</div>
                      <div className="text-sm text-text-muted">
                        {resource.priceFormatted}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-muted">
                      {resource.seller.display_name || resource.seller.email}
                    </td>
                    <td className="px-6 py-4 text-text-muted">
                      {resource.subjects[0] || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[resource.status] || statusColors.PENDING}`}
                      >
                        {statusLabels[resource.status] || resource.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {resource.is_public ? (
                        <span className="flex items-center gap-1 text-[var(--badge-success-text)]">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                              fillRule="evenodd"
                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Öffentlich
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-text-muted">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                              clipRule="evenodd"
                            />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                          Privat
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-muted">
                      {new Date(resource.created_at).toLocaleDateString("de-CH")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openResourceModal(resource)}
                        className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-text-on-accent transition-colors hover:bg-primary-hover"
                      >
                        Prüfen
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
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50"
          >
            Zurück
          </button>
          <span className="text-sm text-text-muted">
            Seite {page} von {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50"
          >
            Weiter
          </button>
        </div>
      )}

      {/* Resource Detail Modal */}
      {showModal && selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm">
          <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-text">Dokument prüfen</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedResource(null);
                }}
                className="text-text-muted hover:text-text"
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

            {/* Resource Details */}
            <div className="mb-6 space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-text">
                  {selectedResource.title}
                </h4>
                <p className="mt-1 text-sm text-text-muted">
                  {selectedResource.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-4">
                  <div className="mb-1 text-sm text-text-muted">Verkäufer</div>
                  <div className="text-text">
                    {selectedResource.seller.display_name || selectedResource.seller.email}
                  </div>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="mb-1 text-sm text-text-muted">Preis</div>
                  <div className="font-medium text-text">
                    {selectedResource.priceFormatted}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-4">
                  <div className="mb-1 text-sm text-text-muted">Fächer</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedResource.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="rounded-full bg-bg px-2 py-1 text-xs text-text"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="mb-1 text-sm text-text-muted">Zyklen</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedResource.cycles.map((cycle) => (
                      <span
                        key={cycle}
                        className="rounded-full bg-bg px-2 py-1 text-xs text-text"
                      >
                        {cycle}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-4">
                  <div className="mb-1 text-sm text-text-muted">
                    Aktueller Status
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[selectedResource.status] || statusColors.PENDING}`}
                  >
                    {statusLabels[selectedResource.status] || selectedResource.status}
                  </span>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="mb-1 text-sm text-text-muted">Sichtbarkeit</div>
                  <div className="text-text">
                    {selectedResource.is_public ? "Öffentlich" : "Nur für Besitzer"}
                  </div>
                </div>
              </div>

              {/* File Preview Link */}
              {selectedResource.file_url && (
                <div className="rounded-lg border border-border p-4">
                  <div className="mb-2 text-sm text-text-muted">Dokument</div>
                  <a
                    href={selectedResource.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Dokument öffnen
                  </a>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="border-t border-border pt-4">
              <div className="mb-3 text-sm font-medium text-text">
                Aktion wählen:
              </div>
              <div className="grid grid-cols-3 gap-3">
                {selectedResource.status !== "VERIFIED" && (
                  <button
                    onClick={() => handleVerify(selectedResource.id)}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[var(--badge-success-bg)] px-4 py-3 text-sm font-medium text-[var(--badge-success-text)] hover:opacity-90 disabled:opacity-50"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Verifizieren
                  </button>
                )}
                {selectedResource.status !== "REJECTED" && (
                  <button
                    onClick={() => handleReject(selectedResource.id)}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[var(--badge-error-bg)] px-4 py-3 text-sm font-medium text-[var(--badge-error-text)] hover:opacity-90 disabled:opacity-50"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Ablehnen
                  </button>
                )}
                {selectedResource.status !== "PENDING" && (
                  <button
                    onClick={() => handleResetToPending(selectedResource.id)}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[var(--badge-warning-bg)] px-4 py-3 text-sm font-medium text-[var(--badge-warning-text)] hover:opacity-90 disabled:opacity-50"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Zurücksetzen
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedResource(null);
                }}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text hover:bg-bg"
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
