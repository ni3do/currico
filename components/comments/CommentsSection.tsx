"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, AlertCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CommentCard } from "./CommentCard";
import { CommentForm } from "./CommentForm";
import { motion } from "framer-motion";

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

interface CommentsSectionProps {
  resourceId: string;
  className?: string;
}

export function CommentsSection({ resourceId, className = "" }: CommentsSectionProps) {
  const { data: session, status: sessionStatus } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchComments = useCallback(
    async (pageNum: number = 1) => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/resources/${resourceId}/comments?page=${pageNum}&limit=20`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }

        const data = await response.json();
        setComments(data.comments);
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fehler beim Laden der Kommentare");
      } finally {
        setLoading(false);
      }
    },
    [resourceId]
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentSubmitted = (newComment: Comment | Reply) => {
    // The API returns a full Comment object when creating a comment
    setComments([newComment as Comment, ...comments]);
    setTotalCount((prev) => prev + 1);
  };

  const handleCommentDeleted = () => {
    fetchComments(page);
  };

  const handleCommentUpdated = () => {
    fetchComments(page);
  };

  const handleLoginRequired = () => {
    window.location.href = "/login";
  };

  // Loading state
  if (loading && comments.length === 0) {
    return (
      <div className={`${className}`}>
        <h2 className="text-text mb-6 text-2xl font-bold">Kommentare</h2>
        <div className="border-border bg-bg animate-pulse rounded-xl border p-8">
          <div className="bg-surface mb-4 h-6 w-48 rounded" />
          <div className="bg-surface mb-4 h-4 w-full rounded" />
          <div className="bg-surface h-4 w-3/4 rounded" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${className}`}>
        <h2 className="text-text mb-6 text-2xl font-bold">Kommentare</h2>
        <div className="border-error/50 bg-error/10 flex items-center gap-3 rounded-xl border p-6">
          <AlertCircle className="text-error h-5 w-5 flex-shrink-0" />
          <p className="text-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h2 className="text-text mb-6 text-2xl font-bold">
        Kommentare {totalCount > 0 && <span className="text-text-muted">({totalCount})</span>}
      </h2>

      {/* Comment Form */}
      {sessionStatus === "authenticated" ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <CommentForm resourceId={resourceId} onSubmit={handleCommentSubmitted} />
        </motion.div>
      ) : (
        <div className="border-border bg-bg-secondary mb-6 rounded-xl border p-4">
          <p className="text-text-muted text-sm">
            <Link href="/login" className="text-primary hover:underline">
              Melden Sie sich an
            </Link>
            , um einen Kommentar zu schreiben.
          </p>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="border-border bg-bg rounded-xl border p-8 text-center">
          <MessageCircle className="text-text-faint mx-auto mb-3 h-12 w-12" />
          <p className="text-text-muted mb-2">Noch keine Kommentare</p>
          <p className="text-text-faint text-sm">
            Seien Sie der Erste, der einen Kommentar schreibt!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              resourceId={resourceId}
              onReplyAdded={() => fetchComments(page)}
              onCommentDeleted={handleCommentDeleted}
              onCommentUpdated={handleCommentUpdated}
              onLoginRequired={handleLoginRequired}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => fetchComments(page - 1)}
                disabled={page === 1}
                className="btn-secondary px-4 py-2 disabled:opacity-50"
              >
                Zurück
              </button>
              <span className="text-text-muted text-sm">
                Seite {page} von {totalPages}
              </span>
              <button
                onClick={() => fetchComments(page + 1)}
                disabled={page === totalPages}
                className="btn-secondary px-4 py-2 disabled:opacity-50"
              >
                Weiter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CommentsSection;
