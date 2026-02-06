"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { MoreVertical, Pencil, Trash2, MessageCircle, ChevronDown, BadgeCheck } from "lucide-react";
import { CommentLikeButton } from "@/components/ui/LikeButton";
import { CommentForm } from "./CommentForm";
import { motion, AnimatePresence } from "framer-motion";

interface CommentUser {
  id: string;
  displayName: string;
  image: string | null;
  isSeller?: boolean;
}

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
  likeCount: number;
  isLiked: boolean;
  replies: Reply[];
  replyCount: number;
}

interface CommentCardProps {
  comment: Comment;
  materialId: string;
  onReplyAdded?: () => void;
  onCommentDeleted?: () => void;
  onCommentUpdated?: () => void;
  onLoginRequired?: () => void;
  className?: string;
}

export function CommentCard({
  comment,
  materialId,
  onReplyAdded,
  onCommentDeleted,
  onCommentUpdated,
  onLoginRequired,
  className = "",
}: CommentCardProps) {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localReplies, setLocalReplies] = useState(comment.replies);

  const isOwner = session?.user?.id === comment.user.id;
  const formattedDate = new Date(comment.createdAt).toLocaleDateString("de-CH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleDelete = async () => {
    if (!confirm("Möchten Sie diesen Kommentar wirklich löschen?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      onCommentDeleted?.();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Fehler beim Löschen des Kommentars");
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to update comment");
      }

      setIsEditing(false);
      onCommentUpdated?.();
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Fehler beim Aktualisieren des Kommentars");
    } finally {
      setSaving(false);
    }
  };

  const handleReplySubmitted = (newReply: Reply | Comment) => {
    // The API returns a Reply object when creating a reply
    setLocalReplies([...localReplies, newReply as Reply]);
    setShowReplyForm(false);
    setShowReplies(true);
    onReplyAdded?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-border bg-bg rounded-xl border p-5 ${className}`}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {comment.user.image ? (
            <Image
              src={comment.user.image}
              alt={comment.user.displayName}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="bg-surface flex h-10 w-10 items-center justify-center rounded-full">
              <span className="text-text-muted text-sm font-medium">
                {comment.user.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-text font-medium">{comment.user.displayName}</span>
              {comment.user.isSeller && (
                <span className="pill pill-primary flex items-center gap-1 text-xs">
                  <BadgeCheck className="h-3 w-3" />
                  Verkäufer
                </span>
              )}
            </div>
            <div className="text-text-muted text-sm">{formattedDate}</div>
          </div>
        </div>

        {/* Menu for owner */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-text-muted hover:text-text hover:bg-surface rounded-lg p-1.5 transition-colors"
              aria-label="Optionen"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="border-border bg-bg absolute right-0 z-20 mt-1 w-40 rounded-lg border shadow-lg"
                  >
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setIsEditing(true);
                      }}
                      className="text-text hover:bg-surface flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm"
                    >
                      <Pencil className="h-4 w-4" />
                      Bearbeiten
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-error hover:bg-error/10 flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deleting ? "Löschen..." : "Löschen"}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={2000}
            rows={3}
            className="input mb-2 min-h-[80px] resize-y"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={saving || !editContent.trim()}
              className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
            >
              {saving ? "Speichern..." : "Speichern"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(comment.content);
              }}
              disabled={saving}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        <p className="text-text-secondary mb-4 leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
      )}

      {/* Edited indicator */}
      {!isEditing && comment.createdAt !== comment.updatedAt && (
        <p className="text-text-faint mb-3 text-xs">(bearbeitet)</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <CommentLikeButton
          commentId={comment.id}
          initialLiked={comment.isLiked}
          initialCount={comment.likeCount}
          size="sm"
          onLoginRequired={onLoginRequired}
        />

        {session && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-text-muted hover:text-primary flex items-center gap-1.5 text-sm transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Antworten
          </button>
        )}

        {localReplies.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-text-muted hover:text-text ml-auto flex items-center gap-1 text-sm transition-colors"
          >
            <span>{localReplies.length} Antworten</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showReplies ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Reply Form */}
      <AnimatePresence>
        {showReplyForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <CommentForm
              commentId={comment.id}
              isReply
              onSubmit={handleReplySubmitted}
              onCancel={() => setShowReplyForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replies */}
      <AnimatePresence>
        {showReplies && localReplies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-border mt-4 space-y-3 overflow-hidden border-l-2 pl-4"
          >
            {localReplies.map((reply) => (
              <ReplyCard key={reply.id} reply={reply} materialId={materialId} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Reply Card (simplified version of CommentCard)
interface ReplyCardProps {
  reply: Reply;
  materialId: string;
  onDeleted?: () => void;
}

function ReplyCard({ reply, onDeleted }: ReplyCardProps) {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const isOwner = session?.user?.id === reply.user.id;
  const formattedDate = new Date(reply.createdAt).toLocaleDateString("de-CH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleDelete = async () => {
    if (!confirm("Möchten Sie diese Antwort wirklich löschen?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/replies/${reply.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete reply");
      }

      onDeleted?.();
    } catch (error) {
      console.error("Error deleting reply:", error);
      alert("Fehler beim Löschen der Antwort");
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/replies/${reply.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reply");
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating reply:", error);
      alert("Fehler beim Aktualisieren der Antwort");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-bg-secondary rounded-lg p-4">
      {/* Header */}
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {reply.user.image ? (
            <Image
              src={reply.user.image}
              alt={reply.user.displayName}
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <div className="bg-surface flex h-7 w-7 items-center justify-center rounded-full">
              <span className="text-text-muted text-xs font-medium">
                {reply.user.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-text text-sm font-medium">{reply.user.displayName}</span>
          {reply.user.isSeller && <span className="pill pill-primary text-xs">Verkäufer</span>}
          <span className="text-text-faint text-xs">· {formattedDate}</span>
        </div>

        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-text-muted hover:text-text hover:bg-surface rounded p-1 transition-colors"
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
                    className="border-border bg-bg absolute right-0 z-20 mt-1 w-36 rounded-lg border shadow-lg"
                  >
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setIsEditing(true);
                      }}
                      className="text-text hover:bg-surface flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Bearbeiten
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-error hover:bg-error/10 flex w-full items-center gap-2 px-3 py-2 text-left text-sm disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deleting ? "..." : "Löschen"}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={1000}
            rows={2}
            className="input mb-2 min-h-[60px] resize-y text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={saving || !editContent.trim()}
              className="btn-primary px-3 py-1.5 text-xs disabled:opacity-50"
            >
              {saving ? "..." : "Speichern"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(reply.content);
              }}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
          {reply.content}
        </p>
      )}

      {!isEditing && reply.createdAt !== reply.updatedAt && (
        <p className="text-text-faint mt-1 text-xs">(bearbeitet)</p>
      )}
    </div>
  );
}

export default CommentCard;
