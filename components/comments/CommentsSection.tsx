"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { MessageCircle, AlertCircle } from "lucide-react";
import { getLoginUrl } from "@/lib/utils/login-redirect";
import { LoginLink } from "@/components/ui/LoginLink";
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
  materialId: string;
  className?: string;
}

export function CommentsSection({ materialId, className = "" }: CommentsSectionProps) {
  const { data: session, status: sessionStatus } = useSession();
  const tCommon = useTranslations("common");
  const t = useTranslations("comments");
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
          `/api/materials/${materialId}/comments?page=${pageNum}&limit=20`
        );

        if (!response.ok) {
          throw new Error(tCommon("errors.loadFailed"));
        }

        const data = await response.json();
        setComments(data.comments);
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : tCommon("errors.generic"));
      } finally {
        setLoading(false);
      }
    },
    [materialId, tCommon]
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentSubmitted = (newComment: Comment | Reply) => {
    // The API returns a full Comment object when creating a comment
    // Ensure it has all Comment fields before adding
    const comment: Comment =
      "replyCount" in newComment
        ? newComment
        : { ...newComment, likeCount: 0, isLiked: false, replies: [], replyCount: 0 };
    setComments([comment, ...comments]);
    setTotalCount((prev) => prev + 1);
  };

  const handleCommentDeleted = (commentId: string) => {
    // Optimistic: remove from UI immediately
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setTotalCount((prev) => Math.max(0, prev - 1));
  };

  const handleCommentUpdated = () => {
    fetchComments(page);
  };

  const handleLoginRequired = () => {
    window.location.href = getLoginUrl(window.location.pathname);
  };

  // Loading state
  if (loading && comments.length === 0) {
    return (
      <div className={`${className}`}>
        <h2 className="text-text mb-6 text-2xl font-bold">{t("title")}</h2>
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
        <h2 className="text-text mb-6 text-2xl font-bold">{t("title")}</h2>
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
        {t("title")} {totalCount > 0 && <span className="text-text-muted">({totalCount})</span>}
      </h2>

      {/* Comment Form */}
      {sessionStatus === "authenticated" ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <CommentForm materialId={materialId} onSubmit={handleCommentSubmitted} />
        </motion.div>
      ) : (
        <div className="border-border bg-bg-secondary mb-6 rounded-xl border p-4">
          <p className="text-text-muted text-sm">
            <LoginLink className="text-primary hover:underline">{t("loginPrompt")}</LoginLink>
            {t("loginSuffix")}
          </p>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="border-border bg-bg rounded-xl border p-8 text-center">
          <MessageCircle className="text-text-faint mx-auto mb-3 h-12 w-12" />
          <p className="text-text-muted mb-2">{t("noComments")}</p>
          <p className="text-text-faint text-sm">{t("beFirst")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              materialId={materialId}
              onReplyAdded={() => fetchComments(page)}
              onCommentDeleted={(id) => handleCommentDeleted(id)}
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
                {t("previous")}
              </button>
              <span className="text-text-muted text-sm">{t("pageOf", { page, totalPages })}</span>
              <button
                onClick={() => fetchComments(page + 1)}
                disabled={page === totalPages}
                className="btn-secondary px-4 py-2 disabled:opacity-50"
              >
                {t("next")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CommentsSection;
