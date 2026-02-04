"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Phone, ExternalLink } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface PaginatedResponse {
  messages: ContactMessage[];
  total: number;
  page: number;
  totalPages: number;
}

const statusLabels: Record<string, string> = {
  NEW: "Neu",
  READ: "Gelesen",
  REPLIED: "Beantwortet",
  ARCHIVED: "Archiviert",
};

const statusColors: Record<string, string> = {
  NEW: "bg-accent/10 text-accent",
  READ: "bg-primary/10 text-primary",
  REPLIED: "bg-success/10 text-success",
  ARCHIVED: "bg-bg text-text-muted",
};

const subjectLabels: Record<string, string> = {
  general: "Allgemeine Anfrage",
  feedback: "Feedback",
  partnership: "Partnerschaft",
  support: "Support",
  sales: "Vertrieb",
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
        const data: PaginatedResponse = await response.json();
        setMessages(data.messages);
        setTotalPages(data.totalPages);
        setTotal(data.total);
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
      const response = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: messageId, status: newStatus }),
      });

      if (response.ok) {
        fetchMessages();
        if (selectedMessage?.id === messageId) {
          setSelectedMessage({ ...selectedMessage, status: newStatus });
        }
      } else {
        const error = await response.json();
        alert(error.error || "Fehler beim Aktualisieren");
      }
    } catch (error) {
      console.error("Error updating message:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm("Möchten Sie diese Nachricht wirklich löschen?")) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: messageId }),
      });

      if (response.ok) {
        fetchMessages();
        setShowModal(false);
        setSelectedMessage(null);
      } else {
        const error = await response.json();
        alert(error.error || "Fehler beim Löschen");
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
          { value: "", label: "Alle" },
          { value: "NEW", label: "Neu" },
          { value: "READ", label: "Gelesen" },
          { value: "REPLIED", label: "Beantwortet" },
          { value: "ARCHIVED", label: "Archiviert" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              statusFilter === tab.value
                ? "bg-accent text-white shadow-sm"
                : "text-text-secondary hover:bg-surface hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="text-text-muted text-sm">{total} Nachrichten gefunden</div>

      {/* Messages Table */}
      <div className="border-border bg-surface overflow-hidden rounded-2xl border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg">
              <tr>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">Absender</th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">Betreff</th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">Nachricht</th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">Datum</th>
                <th className="text-text px-6 py-4 text-right text-sm font-semibold">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-text-muted px-6 py-12 text-center">
                    Laden...
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-text-muted px-6 py-12 text-center">
                    Keine Nachrichten gefunden
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
                      <span className="text-text">
                        {subjectLabels[message.subject] || message.subject}
                      </span>
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
                        {statusLabels[message.status]}
                      </span>
                    </td>
                    <td className="text-text-muted px-6 py-4">
                      {new Date(message.created_at).toLocaleDateString("de-CH")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openMessageModal(message)}
                        className="bg-accent rounded-lg px-4 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
                      >
                        Ansehen
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
            Zurück
          </button>
          <span className="text-text-muted text-sm">
            Seite {page} von {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="border-border bg-surface text-text hover:bg-bg rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            Weiter
          </button>
        </div>
      )}

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <div className="bg-bg/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="border-border bg-surface mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-text text-xl font-semibold">Nachricht</h3>
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
                    {statusLabels[selectedMessage.status]}
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
                <div className="text-text-muted mb-1 text-sm">Betreff</div>
                <div className="text-text font-medium">
                  {subjectLabels[selectedMessage.subject] || selectedMessage.subject}
                </div>
              </div>

              {/* Message Content */}
              <div className="border-border rounded-lg border p-4">
                <div className="text-text-muted mb-1 text-sm">Nachricht</div>
                <div className="text-text whitespace-pre-wrap">{selectedMessage.message}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="text-text mb-2 text-sm font-medium">Status ändern:</div>
              <div className="grid grid-cols-2 gap-3">
                {selectedMessage.status !== "READ" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedMessage.id, "READ")}
                    disabled={actionLoading}
                    className="bg-primary/10 text-primary rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    Gelesen
                  </button>
                )}
                {selectedMessage.status !== "REPLIED" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedMessage.id, "REPLIED")}
                    disabled={actionLoading}
                    className="rounded-lg bg-[var(--badge-success-bg)] px-4 py-2.5 text-sm font-medium text-[var(--badge-success-text)] hover:opacity-90 disabled:opacity-50"
                  >
                    Beantwortet
                  </button>
                )}
                {selectedMessage.status !== "ARCHIVED" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedMessage.id, "ARCHIVED")}
                    disabled={actionLoading}
                    className="border-border bg-bg text-text-muted rounded-lg border px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    Archivieren
                  </button>
                )}
                {selectedMessage.status !== "NEW" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedMessage.id, "NEW")}
                    disabled={actionLoading}
                    className="bg-accent/10 text-accent rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    Als neu markieren
                  </button>
                )}
              </div>
            </div>

            {/* Reply & Delete Buttons */}
            <div className="border-border mt-6 flex gap-3 border-t pt-4">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${subjectLabels[selectedMessage.subject] || selectedMessage.subject}`}
                className="bg-accent flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-medium text-white hover:opacity-90"
              >
                Antworten
              </a>
              <button
                onClick={() => handleDelete(selectedMessage.id)}
                disabled={actionLoading}
                className="border-error bg-error/10 text-error hover:bg-error/20 rounded-lg border px-4 py-2.5 text-sm font-medium disabled:opacity-50"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
