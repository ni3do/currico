"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Plus, Send, Pencil, Trash2, Mail } from "lucide-react";
import type { Newsletter } from "@/lib/types/admin";

export default function AdminNewslettersPage() {
  const t = useTranslations("admin.newsletters");
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchNewsletters = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/newsletters");
      if (res.ok) {
        const data = await res.json();
        setNewsletters(data);
      }
    } catch (error) {
      console.error("Error fetching newsletters:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewsletters();
  }, [fetchNewsletters]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!subject.trim() || !content.trim()) return;
    setSaving(true);

    try {
      if (editingId) {
        const res = await fetch(`/api/admin/newsletters/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, content }),
        });
        if (res.ok) {
          showToast(t("updated"));
        }
      } else {
        const res = await fetch("/api/admin/newsletters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, content }),
        });
        if (res.ok) {
          showToast(t("created"));
        }
      }

      setShowForm(false);
      setEditingId(null);
      setSubject("");
      setContent("");
      fetchNewsletters();
    } catch (error) {
      console.error("Error saving newsletter:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (newsletter: Newsletter) => {
    setEditingId(newsletter.id);
    setSubject(newsletter.subject);
    setContent(newsletter.content);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      const res = await fetch(`/api/admin/newsletters/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(t("deleted"));
        fetchNewsletters();
      }
    } catch (error) {
      console.error("Error deleting newsletter:", error);
    }
  };

  const handleSend = async (id: string) => {
    if (!confirm(t("confirmSend"))) return;

    try {
      const res = await fetch(`/api/admin/newsletters/${id}/send`, {
        method: "POST",
      });
      if (res.ok) {
        showToast(t("sending"));
        fetchNewsletters();
      }
    } catch (error) {
      console.error("Error sending newsletter:", error);
    }
  };

  const statusBadge = (status: Newsletter["status"]) => {
    const styles: Record<Newsletter["status"], string> = {
      DRAFT: "bg-surface-alt text-text-muted",
      SENDING: "bg-warning/20 text-warning",
      SENT: "bg-success/20 text-success",
      FAILED: "bg-error/20 text-error",
    };
    const labels: Record<Newsletter["status"], string> = {
      DRAFT: t("statusDraft"),
      SENDING: t("statusSending"),
      SENT: t("statusSent"),
      FAILED: t("statusFailed"),
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="bg-success/10 text-success border-success/20 fixed top-20 right-4 z-50 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-text text-2xl font-bold sm:text-3xl">{t("title")}</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setSubject("");
            setContent("");
          }}
          className="bg-primary hover:bg-primary-hover text-text-on-accent inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t("create")}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="border-border bg-surface rounded-xl border p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="newsletter-subject"
                className="text-text mb-1 block text-sm font-medium"
              >
                {t("subject")}
              </label>
              <input
                id="newsletter-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="border-border bg-bg text-text focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                placeholder={t("subject")}
              />
            </div>
            <div>
              <label
                htmlFor="newsletter-content"
                className="text-text mb-1 block text-sm font-medium"
              >
                {t("content")}
              </label>
              <textarea
                id="newsletter-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="border-border bg-bg text-text focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                placeholder={t("content")}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving || !subject.trim() || !content.trim()}
                className="bg-primary hover:bg-primary-hover text-text-on-accent rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {t("save")}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setSubject("");
                  setContent("");
                }}
                className="border-border text-text-muted hover:text-text rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter List */}
      {newsletters.length === 0 ? (
        <div className="border-border bg-surface rounded-xl border py-12 text-center">
          <Mail className="text-text-muted mx-auto mb-3 h-12 w-12" />
          <p className="text-text-muted">{t("empty")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {newsletters.map((newsletter) => (
            <div key={newsletter.id} className="border-border bg-surface rounded-xl border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-text truncate font-semibold">{newsletter.subject}</h3>
                    {statusBadge(newsletter.status)}
                  </div>
                  <p className="text-text-muted mb-3 line-clamp-2 text-sm">{newsletter.content}</p>
                  <div className="text-text-muted flex flex-wrap gap-4 text-xs">
                    <span>{new Date(newsletter.created_at).toLocaleDateString("de-CH")}</span>
                    {newsletter.status === "SENT" && newsletter.sent_at && (
                      <span>
                        {t("sentAt")}:{" "}
                        {new Date(newsletter.sent_at).toLocaleDateString("de-CH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                    {(newsletter.status === "SENT" || newsletter.status === "SENDING") && (
                      <span>
                        {t("recipients")}: {newsletter.recipient_count}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {newsletter.status === "DRAFT" && (
                    <>
                      <button
                        onClick={() => handleEdit(newsletter)}
                        className="text-text-muted hover:text-primary rounded-lg p-2 transition-colors"
                        title={t("edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleSend(newsletter.id)}
                        className="text-text-muted hover:text-success rounded-lg p-2 transition-colors"
                        title={t("send")}
                      >
                        <Send className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(newsletter.id)}
                        className="text-text-muted hover:text-error rounded-lg p-2 transition-colors"
                        title={t("delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
