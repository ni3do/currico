"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  BadgeCheck,
  MoreVertical,
  Pencil,
  Trash2,
  MessageCircle,
  ChevronDown,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { StarRating } from "@/components/ui/StarRating";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";
import type { Review, ReviewReply } from "@/lib/types/review";

interface ReviewCardProps {
  review: Review;
  materialId?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onReplyAdded?: () => void;
  className?: string;
}

export function ReviewCard({
  review,
  materialId,
  onEdit,
  onDelete,
  onReplyAdded,
  className = "",
}: ReviewCardProps) {
  const { data: session } = useSession();
  const t = useTranslations("reviews");
  const { toast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Reply state
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replies, setReplies] = useState<ReviewReply[]>(review.replies || []);

  // Reply editing state
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  const [showDeleteReplyDialog, setShowDeleteReplyDialog] = useState(false);

  const isOwner = session?.user?.id === review.user.id;
  const isLoggedIn = !!session?.user;
  const formattedDate = new Date(review.createdAt).toLocaleDateString("de-CH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    setDeleting(true);
    try {
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      onDelete?.();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast(t("deleteError"), "error");
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;

    setSubmittingReply(true);
    try {
      const response = await fetch(`/api/reviews/${review.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to create reply");
      }

      const data = await response.json();
      setReplies((prev) => [...prev, data.reply]);
      setReplyContent("");
      setShowReplyForm(false);
      setShowReplies(true);
      onReplyAdded?.();
    } catch (error) {
      console.error("Error creating reply:", error);
      toast(t("replyError"), "error");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEditReply = async (replyId: string) => {
    if (!editReplyContent.trim()) return;

    try {
      const response = await fetch(`/api/review-replies/${replyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editReplyContent.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reply");
      }

      const data = await response.json();
      setReplies((prev) => prev.map((r) => (r.id === replyId ? { ...r, ...data.reply } : r)));
      setEditingReplyId(null);
      setEditReplyContent("");
    } catch (error) {
      console.error("Error updating reply:", error);
      toast(t("replyError"), "error");
    }
  };

  const handleDeleteReply = async () => {
    if (!deletingReplyId) return;
    setShowDeleteReplyDialog(false);

    try {
      const response = await fetch(`/api/review-replies/${deletingReplyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete reply");
      }

      setReplies((prev) => prev.filter((r) => r.id !== deletingReplyId));
      setDeletingReplyId(null);
      onReplyAdded?.();
    } catch (error) {
      console.error("Error deleting reply:", error);
      toast(t("replyError"), "error");
    }
  };

  const formatReplyDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-CH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-border bg-bg rounded-xl border p-4 ${className}`}
      >
        {/* Rating + Verified badge */}
        <div className="mb-2 flex items-center gap-2">
          <StarRating rating={review.rating} size="lg" />
          {review.isVerifiedPurchase && (
            <span className="pill pill-success flex items-center gap-1 text-xs">
              <BadgeCheck className="h-3 w-3" />
              {t("verifiedPurchase")}
            </span>
          )}
        </div>

        {/* Title */}
        {review.title && <h4 className="text-text mb-1.5 text-base font-bold">{review.title}</h4>}

        {/* Content */}
        {review.content && (
          <p className="text-text-secondary mb-3 text-sm leading-relaxed whitespace-pre-wrap">
            {review.content}
          </p>
        )}

        {/* Footer: User info + menu */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={`/profil/${review.user.id}`} className="shrink-0">
              {review.user.image ? (
                <Image
                  src={review.user.image}
                  alt={review.user.displayName}
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="bg-surface flex h-7 w-7 items-center justify-center rounded-full">
                  <span className="text-text-muted text-xs font-medium">
                    {review.user.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </Link>
            <Link
              href={`/profil/${review.user.id}`}
              className="text-text hover:text-primary text-sm font-medium transition-colors"
            >
              {review.user.displayName}
            </Link>
            <span className="text-text-faint text-xs">· {formattedDate}</span>
            {review.createdAt !== review.updatedAt && (
              <span className="text-text-faint text-xs">({t("edited")})</span>
            )}
          </div>

          {/* Menu for owner */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-text-muted hover:text-text hover:bg-surface rounded-lg p-1.5 transition-colors"
                aria-label={t("options")}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="border-border bg-bg absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border shadow-lg"
                    >
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onEdit?.();
                        }}
                        className="text-text hover:bg-surface flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm"
                      >
                        <Pencil className="h-4 w-4" />
                        {t("edit")}
                      </button>
                      <div className="border-border mx-2 border-t" />
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowDeleteDialog(true);
                        }}
                        disabled={deleting}
                        className="text-error hover:bg-error/10 flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deleting ? t("deleting") : t("delete")}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Reply section */}
        <div className="border-border/50 mt-3 border-t pt-3">
          {/* Show replies toggle + reply button */}
          <div className="flex items-center gap-4">
            {replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-text-muted hover:text-text flex items-center gap-1 text-sm transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>
                  {showReplies ? t("hideReplies") : t("showReplies", { count: replies.length })}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${showReplies ? "rotate-180" : ""}`}
                />
              </button>
            )}
            {isLoggedIn && (
              <button
                onClick={() => {
                  setShowReplyForm(!showReplyForm);
                  if (!showReplyForm) setShowReplies(true);
                }}
                className="text-primary hover:text-primary-hover flex items-center gap-1 text-sm font-medium transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {t("reply")}
              </button>
            )}
          </div>

          {/* Replies list */}
          <AnimatePresence>
            {showReplies && replies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-border mt-3 space-y-2 overflow-hidden border-l-2 pl-4"
              >
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`rounded-lg p-3 ${
                      reply.user.isSeller ? "bg-primary/5" : "bg-surface"
                    }`}
                  >
                    {editingReplyId === reply.id ? (
                      /* Edit mode */
                      <div>
                        <textarea
                          value={editReplyContent}
                          onChange={(e) => setEditReplyContent(e.target.value)}
                          maxLength={1000}
                          rows={3}
                          className="input mb-2 min-h-[60px] resize-y text-sm"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-text-faint text-xs">{editReplyContent.length}/1000</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingReplyId(null);
                                setEditReplyContent("");
                              }}
                              className="btn-secondary px-3 py-1.5 text-xs"
                            >
                              {t("cancel")}
                            </button>
                            <button
                              onClick={() => handleEditReply(reply.id)}
                              disabled={!editReplyContent.trim()}
                              className="btn-primary px-3 py-1.5 text-xs disabled:opacity-50"
                            >
                              {t("save")}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Display mode */
                      <>
                        <div className="mb-1 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {reply.user.image ? (
                              <Image
                                src={reply.user.image}
                                alt={reply.user.displayName}
                                width={20}
                                height={20}
                                className="h-5 w-5 rounded-full object-cover"
                              />
                            ) : (
                              <div className="bg-bg flex h-5 w-5 items-center justify-center rounded-full">
                                <span className="text-text-muted text-[10px] font-medium">
                                  {reply.user.displayName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="text-text text-sm font-medium">
                              {reply.user.displayName}
                            </span>
                            {reply.user.isSeller && (
                              <span className="pill pill-primary flex items-center gap-0.5 text-xs">
                                <ShieldCheck className="h-3 w-3" />
                                {t("seller")}
                              </span>
                            )}
                            <span className="text-text-faint text-xs">
                              {formatReplyDate(reply.createdAt)}
                            </span>
                            {reply.createdAt !== reply.updatedAt && (
                              <span className="text-text-faint text-xs">({t("edited")})</span>
                            )}
                          </div>

                          {/* Reply actions for owner */}
                          {session?.user?.id === reply.user.id && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingReplyId(reply.id);
                                  setEditReplyContent(reply.content);
                                }}
                                className="text-text-muted hover:text-text rounded p-1 transition-colors"
                                aria-label={t("edit")}
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingReplyId(reply.id);
                                  setShowDeleteReplyDialog(true);
                                }}
                                className="text-text-muted hover:text-error rounded p-1 transition-colors"
                                aria-label={t("delete")}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-text-secondary text-sm whitespace-pre-wrap">
                          {reply.content}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reply form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="border-border rounded-lg border p-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={t("replyPlaceholder")}
                    maxLength={1000}
                    rows={3}
                    className="input mb-2 min-h-[60px] resize-y text-sm"
                    disabled={submittingReply}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-text-faint text-xs">{replyContent.length}/1000</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowReplyForm(false);
                          setReplyContent("");
                        }}
                        disabled={submittingReply}
                        className="btn-secondary px-3 py-1.5 text-sm"
                      >
                        {t("cancel")}
                      </button>
                      <button
                        onClick={handleSubmitReply}
                        disabled={submittingReply || !replyContent.trim()}
                        className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-sm disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {submittingReply ? t("replySending") : t("replySubmit")}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <ConfirmDialog
        open={showDeleteDialog}
        title={t("deleteReview")}
        message={t("confirmDelete")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />

      <ConfirmDialog
        open={showDeleteReplyDialog}
        title={t("deleteReply")}
        message={t("confirmDeleteReply")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        variant="danger"
        onConfirm={handleDeleteReply}
        onCancel={() => {
          setShowDeleteReplyDialog(false);
          setDeletingReplyId(null);
        }}
      />
    </>
  );
}

export default ReviewCard;
