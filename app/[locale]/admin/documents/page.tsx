"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { FocusTrap } from "@/components/ui/FocusTrap";
import { useToast } from "@/components/ui/Toast";
import type { AdminMaterial, AdminMaterialsResponse } from "@/lib/types/admin";

const statusColors: Record<string, string> = {
  PENDING: "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]",
  VERIFIED: "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]",
  REJECTED: "bg-[var(--badge-error-bg)] text-[var(--badge-error-text)]",
};

export default function AdminDocumentsPage() {
  const t = useTranslations("admin.documents");
  const { toast } = useToast();
  const [materials, setMaterials] = useState<AdminMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState<AdminMaterial | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: t("statusPending"),
      VERIFIED: t("statusVerified"),
      REJECTED: t("statusRejected"),
    };
    return labels[status] || status;
  };

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        status: statusFilter,
      });

      const response = await fetch(`/api/admin/materials?${params}`);
      if (response.ok) {
        const data: AdminMaterialsResponse = await response.json();
        setMaterials(data.materials);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleVerify = async (materialId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/materials/${materialId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "VERIFIED" }),
      });

      if (response.ok) {
        fetchMaterials();
        setShowModal(false);
        setSelectedMaterial(null);
      } else {
        const error = await response.json();
        toast(error.error || t("errorVerifying"), "error");
      }
    } catch (error) {
      console.error("Error verifying resource:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (materialId: string, reason?: string) => {
    setActionLoading(true);
    try {
      const body: Record<string, string> = { status: "REJECTED" };
      if (reason?.trim()) body.rejection_reason = reason.trim();

      const response = await fetch(`/api/admin/materials/${materialId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchMaterials();
        setShowModal(false);
        setShowRejectModal(false);
        setRejectionReason("");
        setSelectedMaterial(null);
      } else {
        const error = await response.json();
        toast(error.error || t("errorRejecting"), "error");
      }
    } catch (error) {
      console.error("Error rejecting resource:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetToPending = async (materialId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/materials/${materialId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PENDING" }),
      });

      if (response.ok) {
        fetchMaterials();
        setShowModal(false);
        setSelectedMaterial(null);
      } else {
        const error = await response.json();
        toast(error.error || t("errorResetting"), "error");
      }
    } catch (error) {
      console.error("Error resetting resource:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const openMaterialModal = (material: AdminMaterial) => {
    setSelectedMaterial(material);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="info-box">
        <div className="info-box-content">
          <svg className="info-box-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="info-box-title">{t("infoTitle")}</p>
            <p className="info-box-text">{t("infoText")}</p>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="tab-container">
        {[
          { value: "all", label: t("all") },
          { value: "pending", label: t("pending") },
          { value: "approved", label: t("verified") },
          { value: "draft", label: t("draft") },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`tab-button ${statusFilter === tab.value ? "tab-button-active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="text-text-muted text-sm">{t("documentsFound", { count: total })}</div>

      {/* Resources Table */}
      <div className="border-border bg-surface overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg">
              <tr>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">
                  {t("title")}
                </th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">
                  {t("seller")}
                </th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">
                  {t("subject")}
                </th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">
                  {t("status")}
                </th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">
                  {t("visibility")}
                </th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">
                  {t("uploaded")}
                </th>
                <th className="text-text px-6 py-4 text-right text-sm font-semibold">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {loading ? (
                <TableSkeleton rows={5} columns={7} />
              ) : materials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-text-muted px-6 py-12 text-center">
                    {t("noDocuments")}
                  </td>
                </tr>
              ) : (
                materials.map((material) => (
                  <tr key={material.id} className="hover:bg-bg transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-text font-medium">{material.title}</div>
                      <div className="text-text-muted text-sm">{material.priceFormatted}</div>
                    </td>
                    <td className="text-text-muted px-6 py-4">
                      {material.seller.display_name || material.seller.email}
                    </td>
                    <td className="text-text-muted px-6 py-4">{material.subjects[0] || "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[material.status] || statusColors.PENDING}`}
                      >
                        {getStatusLabel(material.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {material.is_public ? (
                        <span className="flex items-center gap-1 text-[var(--badge-success-text)]">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                              fillRule="evenodd"
                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {t("public")}
                        </span>
                      ) : (
                        <span className="text-text-muted flex items-center gap-1">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                              clipRule="evenodd"
                            />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                          {t("ownerOnly")}
                        </span>
                      )}
                    </td>
                    <td className="text-text-muted px-6 py-4">
                      {new Date(material.created_at).toLocaleDateString("de-CH")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openMaterialModal(material)}
                        className="btn-primary rounded-lg px-4 py-1.5 text-xs"
                      >
                        {t("review")}
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
            className="border-border bg-surface text-text hover:bg-bg rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("previous")}
          </button>
          <span className="text-text-muted text-sm">{t("pageOf", { page, totalPages })}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="border-border bg-surface text-text hover:bg-bg rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("next")}
          </button>
        </div>
      )}

      {/* Resource Detail Modal */}
      {showModal && selectedMaterial && (
        <div className="modal-overlay">
          <FocusTrap
            onEscape={() => {
              setShowModal(false);
              setSelectedMaterial(null);
            }}
          >
            <div className="modal-content modal-lg mx-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-text text-xl font-semibold">{t("reviewDocument")}</h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedMaterial(null);
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
                  <h4 className="text-text text-lg font-semibold">{selectedMaterial.title}</h4>
                  <p className="text-text-muted mt-1 text-sm">{selectedMaterial.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border-border rounded-lg border p-4">
                    <div className="text-text-muted mb-1 text-sm">{t("seller")}</div>
                    <div className="text-text">
                      {selectedMaterial.seller.display_name || selectedMaterial.seller.email}
                    </div>
                  </div>
                  <div className="border-border rounded-lg border p-4">
                    <div className="text-text-muted mb-1 text-sm">{t("price")}</div>
                    <div className="text-text font-medium">{selectedMaterial.priceFormatted}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border-border rounded-lg border p-4">
                    <div className="text-text-muted mb-1 text-sm">{t("subjects")}</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedMaterial.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="bg-bg text-text rounded-full px-2 py-1 text-xs"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="border-border rounded-lg border p-4">
                    <div className="text-text-muted mb-1 text-sm">{t("cycles")}</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedMaterial.cycles.map((cycle) => (
                        <span
                          key={cycle}
                          className="bg-bg text-text rounded-full px-2 py-1 text-xs"
                        >
                          {cycle}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border-border rounded-lg border p-4">
                    <div className="text-text-muted mb-1 text-sm">{t("currentStatus")}</div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[selectedMaterial.status] || statusColors.PENDING}`}
                    >
                      {getStatusLabel(selectedMaterial.status)}
                    </span>
                  </div>
                  <div className="border-border rounded-lg border p-4">
                    <div className="text-text-muted mb-1 text-sm">{t("visibilityLabel")}</div>
                    <div className="text-text">
                      {selectedMaterial.is_public ? t("public") : t("ownerOnly")}
                    </div>
                  </div>
                </div>

                {/* File Preview Link */}
                {selectedMaterial.file_url && (
                  <div className="border-border rounded-lg border p-4">
                    <div className="text-text-muted mb-2 text-sm">{t("document")}</div>
                    <a
                      href={`/api/materials/${selectedMaterial.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary inline-flex items-center gap-2 hover:underline"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {t("openDocument")}
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-border border-t pt-4">
                <div className="text-text mb-3 text-sm font-medium">{t("chooseAction")}</div>
                <div className="grid grid-cols-3 gap-3">
                  {selectedMaterial.status !== "VERIFIED" && (
                    <button
                      onClick={() => handleVerify(selectedMaterial.id)}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-2 rounded-lg bg-[var(--badge-success-bg)] px-4 py-3 text-sm font-medium text-[var(--badge-success-text)] hover:opacity-90 disabled:opacity-60"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {t("verify")}
                    </button>
                  )}
                  {selectedMaterial.status !== "REJECTED" && (
                    <button
                      onClick={() => {
                        setRejectionReason("");
                        setShowRejectModal(true);
                      }}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-2 rounded-lg bg-[var(--badge-error-bg)] px-4 py-3 text-sm font-medium text-[var(--badge-error-text)] hover:opacity-90 disabled:opacity-60"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      {t("reject")}
                    </button>
                  )}
                  {selectedMaterial.status !== "PENDING" && (
                    <button
                      onClick={() => handleResetToPending(selectedMaterial.id)}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-2 rounded-lg bg-[var(--badge-warning-bg)] px-4 py-3 text-sm font-medium text-[var(--badge-warning-text)] hover:opacity-90 disabled:opacity-60"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      {t("resetToPending")}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedMaterial(null);
                  }}
                  className="border-border bg-surface text-text hover:bg-bg w-full rounded-lg border px-4 py-2.5 text-sm font-medium"
                >
                  {t("close")}
                </button>
              </div>
            </div>
          </FocusTrap>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectModal && selectedMaterial && (
        <div className="modal-overlay">
          <FocusTrap
            onEscape={() => {
              setShowRejectModal(false);
              setRejectionReason("");
            }}
          >
            <div className="modal-content mx-4 max-w-md">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-text text-lg font-semibold">{t("rejectReason.title")}</h3>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                  }}
                  className="text-text-muted hover:text-text"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-text-muted mb-3 text-sm">{t("rejectReason.description")}</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t("rejectReason.placeholder")}
                className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                rows={3}
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                  }}
                  className="border-border bg-surface text-text hover:bg-bg flex-1 rounded-lg border px-4 py-2 text-sm font-medium"
                >
                  {t("close")}
                </button>
                <button
                  onClick={() => handleReject(selectedMaterial.id, rejectionReason)}
                  disabled={actionLoading}
                  className="flex-1 rounded-lg bg-[var(--badge-error-bg)] px-4 py-2 text-sm font-medium text-[var(--badge-error-text)] hover:opacity-90 disabled:opacity-60"
                >
                  {t("rejectReason.confirm")}
                </button>
              </div>
            </div>
          </FocusTrap>
        </div>
      )}
    </div>
  );
}
