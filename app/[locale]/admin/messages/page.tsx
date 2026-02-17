"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Mail, Phone, ExternalLink } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { FocusTrap } from "@/components/ui/FocusTrap";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { ContactMessage, AdminMessagesResponse } from "@/lib/types/admin";

const statusColors: Record<string, string> = {
  NEW: "bg-accent/10 text-accent",
  READ: "bg-primary/10 text-primary",
  REPLIED: "bg-success/10 text-success",
  ARCHIVED: "bg-bg text-text-muted",
};

export default function AdminMessagesPage() {
  const t = useTranslations("admin.messages");
  const tCommon = useTranslations("common");
  const { toast } = useToast();

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      NEW: t("statusNew"),
      READ: t("statusRead"),
      REPLIED: t("statusReplied"),
      ARCHIVED: t("statusArchived"),
    };
    return labels[status] || status;
  };

  const getSubjectLabel = (subject: string) => {
    const labels: Record<string, string> = {
      general: t("subjectGeneral"),
      feedback: t("subjectFeedback"),
      partnership: t("subjectPartnership"),
      support: t("subjectSupport"),
      sales: t("subjectSales"),
    };
    return labels[subject] || subject;
  };
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (statusFilter) params.set("status", statusFilter);

      const response = await fetch(`/api/admin/messages?${params}`);
      if (response.ok) {
        const data: AdminMessagesResponse = await response.json();
        setMessages(data.messages);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleStatusUpdate = async (messageId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchMessages();
        if (selectedMessage?.id === messageId) {
          setSelectedMessage({ ...selectedMessage, status: newStatus });
        }
      } else {
        const error = await response.json();
        toast(error.error || t("errorUpdating"), "error");
      }
    } catch (error) {
      console.error("Error updating message:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchMessages();
        setShowModal(false);
        setSelectedMessage(null);
        setDeleteMessageId(null);
      } else {
        const error = await response.json();
        toast(error.error || t("errorDeleting"), "error");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const openMessageModal = (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowModal(true);
    // Mark as read if it's new
    if (message.status === "NEW") {
      handleStatusUpdate(message.id, "READ");
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Tabs */}
      <div className="border-border bg-bg-secondary flex flex-wrap gap-2 rounded-xl border p-1.5">
        {[
          { value: "", label: t("all") },
          { value: "NEW", label: t("new") },
          { value: "READ", label: t("read") },
          { value: "REPLIED", label: t("replied") },
          { value: "ARCHIVED", label: t("archived") },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              statusFilter === tab.value
                ? "bg-accent text-text-on-accent shadow-sm"
                : "text-text-secondary hover:bg-surface hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="text-text-muted text-sm">{t("messagesFound", { count: total })}</div>

      {/* Messages Table */}
      <div className="border-border bg-surface overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg">
              <tr>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">
                  {t("sender")}
                </th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">
                  {t("subject")}
                </th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">
                  {t("message")}
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
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-text-muted px-6 py-12 text-center">
                    {t("noMessages")}
                  </td>
                </tr>
              ) : (
                messages.map((message) => (
                  <tr
                    key={message.id}
                    className={`hover:bg-bg transition-colors ${message.status === "NEW" ? "bg-accent/5" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-text font-medium">{message.name}</div>
                        <div className="text-text-muted text-xs">{message.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text">{getSubjectLabel(message.subject)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-muted line-clamp-2 max-w-xs">
                        {message.message}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[message.status]}`}
                      >
                        {getStatusLabel(message.status)}
                      </span>
                    </td>
                    <td className="text-text-muted px-6 py-4">
                      {new Date(message.created_at).toLocaleDateString("de-CH")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openMessageModal(message)}
                        className="bg-accent text-text-on-accent rounded-lg px-4 py-1.5 text-xs font-medium transition-colors hover:opacity-90"
                      >
                        {t("view")}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteMessageId}
        title={t("confirmDeleteTitle")}
        message={t("confirmDelete")}
        confirmLabel={tCommon("buttons.delete")}
        cancelLabel={tCommon("buttons.cancel")}
        variant="danger"
        onConfirm={() => {
          if (deleteMessageId) handleDelete(deleteMessageId);
        }}
        onCancel={() => setDeleteMessageId(null)}
      />

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <div className="bg-bg/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <FocusTrap
            onEscape={() => {
              setShowModal(false);
              setSelectedMessage(null);
            }}
          >
            <div className="border-border bg-surface mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-text text-xl font-semibold">{t("messageDetail")}</h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedMessage(null);
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

              {/* Message Details */}
              <div className="mb-6 space-y-4">
                {/* Sender Info */}
                <div className="border-border rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="text-text font-semibold">{selectedMessage.name}</div>
                      <div className="text-text-muted text-sm">
                        {new Date(selectedMessage.created_at).toLocaleString("de-CH")}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[selectedMessage.status]}`}
                    >
                      {getStatusLabel(selectedMessage.status)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-accent flex items-center gap-2 text-sm hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {selectedMessage.email}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {selectedMessage.phone && (
                      <a
                        href={`tel:${selectedMessage.phone}`}
                        className="text-accent flex items-center gap-2 text-sm hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {selectedMessage.phone}
                      </a>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div className="border-border rounded-lg border p-4">
                  <div className="text-text-muted mb-1 text-sm">{t("subjectLabel")}</div>
                  <div className="text-text font-medium">
                    {getSubjectLabel(selectedMessage.subject)}
                  </div>
                </div>

                {/* Message Content */}
                <div className="border-border rounded-lg border p-4">
                  <div className="text-text-muted mb-1 text-sm">{t("messageLabel")}</div>
                  <div className="text-text whitespace-pre-wrap">{selectedMessage.message}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="text-text mb-2 text-sm font-medium">{t("changeStatus")}</div>
                <div className="grid grid-cols-2 gap-3">
                  {selectedMessage.status !== "READ" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedMessage.id, "READ")}
                      disabled={actionLoading}
                      className="bg-primary/10 text-primary rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      {t("markRead")}
                    </button>
                  )}
                  {selectedMessage.status !== "REPLIED" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedMessage.id, "REPLIED")}
                      disabled={actionLoading}
                      className="rounded-lg bg-[var(--badge-success-bg)] px-4 py-2.5 text-sm font-medium text-[var(--badge-success-text)] hover:opacity-90 disabled:opacity-50"
                    >
                      {t("markReplied")}
                    </button>
                  )}
                  {selectedMessage.status !== "ARCHIVED" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedMessage.id, "ARCHIVED")}
                      disabled={actionLoading}
                      className="border-border bg-bg text-text-muted rounded-lg border px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      {t("archive")}
                    </button>
                  )}
                  {selectedMessage.status !== "NEW" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedMessage.id, "NEW")}
                      disabled={actionLoading}
                      className="bg-accent/10 text-accent rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      {t("markNew")}
                    </button>
                  )}
                </div>
              </div>

              {/* Reply & Delete Buttons */}
              <div className="border-border mt-6 flex gap-3 border-t pt-4">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${getSubjectLabel(selectedMessage.subject)}`}
                  className="bg-accent text-text-on-accent flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-medium hover:opacity-90"
                >
                  {t("reply")}
                </a>
                <button
                  onClick={() => setDeleteMessageId(selectedMessage.id)}
                  disabled={actionLoading}
                  className="border-error bg-error/10 text-error hover:bg-error/20 rounded-lg border px-4 py-2.5 text-sm font-medium disabled:opacity-50"
                >
                  {t("deleteMessage")}
                </button>
              </div>
            </div>
          </FocusTrap>
        </div>
      )}
    </div>
  );
}
