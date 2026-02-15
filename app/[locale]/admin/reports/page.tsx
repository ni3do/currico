"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { FocusTrap } from "@/components/ui/FocusTrap";
import { useToast } from "@/components/ui/Toast";
import type { AdminReport, AdminReportsResponse } from "@/lib/types/admin";

const statusColors: Record<string, string> = {
  OPEN: "pill-error",
  IN_REVIEW: "pill-warning",
  RESOLVED: "pill-success",
  DISMISSED: "pill-neutral",
};

export default function AdminReportsPage() {
  const t = useTranslations("admin.reports");
  const { toast } = useToast();
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      OPEN: t("statusOpen"),
      IN_REVIEW: t("statusInReview"),
      RESOLVED: t("statusResolved"),
      DISMISSED: t("statusDismissed"),
    };
    return labels[status] || status;
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      copyright: t("reasonCopyright"),
      inappropriate: t("reasonInappropriate"),
      spam: t("reasonSpam"),
      fraud: t("reasonFraud"),
      other: t("reasonOther"),
    };
    return labels[reason] || reason;
  };

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
        const data: AdminReportsResponse = await response.json();
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
        toast(error.error || t("errorUpdating"), "error");
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
      {/* Status Tabs */}
      <div className="tab-container">
        {[
          { value: "", label: t("all") },
          { value: "OPEN", label: t("open") },
          { value: "IN_REVIEW", label: t("inReview") },
          { value: "RESOLVED", label: t("resolved") },
          { value: "DISMISSED", label: t("dismissed") },
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
      <div className="text-text-muted text-sm">{t("reportsFound", { count: total })}</div>

      {/* Reports Table */}
      <div className="border-border bg-surface overflow-hidden rounded-2xl border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg">
              <tr>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">
                  {t("reason")}
                </th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">
                  {t("reported")}
                </th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">
                  {t("reporter")}
                </th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">
                  {t("status")}
                </th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">{t("date")}</th>
                <th className="text-text px-6 py-4 text-right text-sm font-semibold">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {loading ? (
                <TableSkeleton rows={5} columns={6} />
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-text-muted px-6 py-12 text-center">
                    {t("noReports")}
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-bg transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-text font-medium">{getReasonLabel(report.reason)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {report.resource ? (
                        <div>
                          <div className="text-text">{report.resource.title}</div>
                          <div className="text-text-muted text-xs">{t("materialLabel")}</div>
                        </div>
                      ) : report.reported_user ? (
                        <div>
                          <div className="text-text">
                            {report.reported_user.display_name || report.reported_user.email}
                          </div>
                          <div className="text-text-muted text-xs">{t("userLabel")}</div>
                        </div>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="text-text-muted px-6 py-4">
                      {report.reporter.display_name || report.reporter.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`pill ${statusColors[report.status]}`}>
                        {getStatusLabel(report.status)}
                      </span>
                    </td>
                    <td className="text-text-muted px-6 py-4">
                      {new Date(report.created_at).toLocaleDateString("de-CH")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openReportModal(report)}
                        className="btn-primary rounded-lg px-4 py-1.5 text-xs"
                      >
                        {t("process")}
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
            className="border-border bg-surface text-text hover:bg-bg rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("previous")}
          </button>
          <span className="text-text-muted text-sm">{t("pageOf", { page, totalPages })}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="border-border bg-surface text-text hover:bg-bg rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("next")}
          </button>
        </div>
      )}

      {/* Report Detail Modal */}
      {showModal && selectedReport && (
        <div className="modal-overlay">
          <FocusTrap
            onEscape={() => {
              setShowModal(false);
              setSelectedReport(null);
            }}
          >
            <div className="modal-content modal-md mx-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-text text-xl font-semibold">{t("handleReport")}</h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedReport(null);
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

              {/* Report Details */}
              <div className="mb-6 space-y-4">
                <div className="border-border rounded-lg border p-4">
                  <div className="text-text-muted mb-1 text-sm">{t("reason")}</div>
                  <div className="text-text font-medium">
                    {getReasonLabel(selectedReport.reason)}
                  </div>
                </div>

                {selectedReport.description && (
                  <div className="border-border rounded-lg border p-4">
                    <div className="text-text-muted mb-1 text-sm">{t("description")}</div>
                    <div className="text-text">{selectedReport.description}</div>
                  </div>
                )}

                <div className="border-border rounded-lg border p-4">
                  <div className="text-text-muted mb-1 text-sm">{t("reportedItem")}</div>
                  <div className="text-text">
                    {selectedReport.resource ? (
                      <>
                        <span className="font-medium">{selectedReport.resource.title}</span>
                        <span className="text-text-muted ml-2 text-xs">({t("materialLabel")})</span>
                      </>
                    ) : selectedReport.reported_user ? (
                      <>
                        <span className="font-medium">
                          {selectedReport.reported_user.display_name ||
                            selectedReport.reported_user.email}
                        </span>
                        <span className="text-text-muted ml-2 text-xs">({t("userLabel")})</span>
                      </>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border-border rounded-lg border p-4">
                    <div className="text-text-muted mb-1 text-sm">{t("reporter")}</div>
                    <div className="text-text">
                      {selectedReport.reporter.display_name || selectedReport.reporter.email}
                    </div>
                  </div>
                  <div className="border-border rounded-lg border p-4">
                    <div className="text-text-muted mb-1 text-sm">{t("currentStatus")}</div>
                    <span className={`pill ${statusColors[selectedReport.status]}`}>
                      {getStatusLabel(selectedReport.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resolution Input */}
              <div className="mb-6">
                <label className="text-text mb-2 block text-sm font-medium">
                  {t("resolution")}
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={3}
                  className="border-border bg-surface text-text placeholder:text-text-muted focus:border-primary min-h-[80px] w-full resize-y rounded-lg border px-4 py-2.5 focus:outline-none"
                  placeholder={t("resolutionPlaceholder")}
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="text-text mb-2 text-sm font-medium">{t("changeStatus")}</div>
                <div className="grid grid-cols-2 gap-3">
                  {selectedReport.status !== "IN_REVIEW" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedReport.id, "IN_REVIEW")}
                      disabled={actionLoading}
                      className="bg-warning/20 text-warning rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      {t("setInReview")}
                    </button>
                  )}
                  {selectedReport.status !== "RESOLVED" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedReport.id, "RESOLVED")}
                      disabled={actionLoading}
                      className="bg-success/20 text-success rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      {t("setResolved")}
                    </button>
                  )}
                  {selectedReport.status !== "DISMISSED" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedReport.id, "DISMISSED")}
                      disabled={actionLoading}
                      className="btn-tertiary rounded-lg px-4 py-2.5 text-sm disabled:opacity-50"
                    >
                      {t("dismiss")}
                    </button>
                  )}
                  {selectedReport.status !== "OPEN" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedReport.id, "OPEN")}
                      disabled={actionLoading}
                      className="bg-error/20 text-error rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      {t("reopen")}
                    </button>
                  )}
                </div>
              </div>

              <div className="border-border mt-6 border-t pt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedReport(null);
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
    </div>
  );
}
