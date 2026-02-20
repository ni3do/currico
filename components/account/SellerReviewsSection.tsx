"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  Star,
  AlertCircle,
  Filter,
  ExternalLink,
  Send,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import type { SellerReview } from "@/lib/types/review";
import { ReviewSectionSkeleton } from "@/components/ui/Skeleton";

interface SellerReviewsSectionProps {
  className?: string;
}

export function SellerReviewsSection({ className = "" }: SellerReviewsSectionProps) {
  const tCommon = useTranslations("common");
  const t = useTranslations("accountPage.comments");
  const { toast } = useToast();
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unreplied">("all");
  const [stats, setStats] = useState({ totalReviews: 0, unrepliedReviews: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const fetchReviews = useCallback(
    async (pageNum: number = 1, filterType: string = filter) => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/user/resource-reviews?page=${pageNum}&limit=10&filter=${filterType}`
        );

        if (!response.ok) {
          throw new Error(tCommon("errors.loadFailed"));
        }

        const data = await response.json();
        setReviews(data.reviews);
        setStats(data.stats);
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("errorLoading"));
      } finally {
        setLoading(false);
      }
    },
    [filter, tCommon, t]
  );

  useEffect(() => {
    fetchReviews(1, filter);
  }, [filter, fetchReviews]);

  const handleFilterChange = (newFilter: "all" | "unreplied") => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyContent.trim()) return;

    setSubmittingReply(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent.trim() }),
      });

      if (!response.ok) {
        throw new Error(tCommon("errors.saveFailed"));
      }

      setReplyContent("");
      setReplyingTo(null);
      fetchReviews(page, filter);
    } catch (err) {
      console.error("Error submitting reply:", err);
      toast(t("errorSending"), "error");
    } finally {
      setSubmittingReply(false);
    }
  };

  const toggleExpanded = (reviewId: string) => {
    setExpandedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-CH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (loading && reviews.length === 0) {
    return <ReviewSectionSkeleton className={className} />;
  }

  // Error state
  if (error) {
    return (
      <div className={`${className}`}>
        <div className="border-error/50 bg-error/10 flex items-center gap-3 rounded-xl border p-6">
          <AlertCircle className="text-error h-5 w-5 flex-shrink-0" />
          <p className="text-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header with stats and filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-text text-xl font-semibold">{t("title")}</h2>
          <p className="text-text-muted mt-1 text-sm">
            {stats.totalReviews} {t("totalComments")}
            {stats.unrepliedReviews > 0 && (
              <span className="text-warning ml-2">
                ({stats.unrepliedReviews} {t("unanswered")})
              </span>
            )}
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="text-text-muted h-4 w-4" />
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value as "all" | "unreplied")}
            className="input rounded-full py-2 text-sm"
          >
            <option value="all">{t("filterAll")}</option>
            <option value="unreplied">{t("filterUnanswered")}</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="border-border bg-bg rounded-xl border p-8 text-center">
          <Star className="text-text-faint mx-auto mb-3 h-12 w-12" />
          <p className="text-text-muted mb-2">{t("empty")}</p>
          <p className="text-text-faint text-sm">{t("emptyDescription")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-border bg-bg rounded-xl border p-5 ${
                !review.hasSellerReply ? "border-l-warning border-l-4" : ""
              }`}
            >
              {/* Resource Link */}
              <Link
                href={`/materialien/${review.resource.id}`}
                className="bg-surface hover:bg-surface-hover mb-4 flex items-center gap-3 rounded-lg p-3 transition-colors"
              >
                {review.resource.previewUrl ? (
                  <Image
                    src={review.resource.previewUrl}
                    alt={review.resource.title}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded object-cover"
                  />
                ) : (
                  <div className="bg-bg-secondary flex h-12 w-12 items-center justify-center rounded">
                    <Star className="text-text-muted h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-text truncate text-sm font-medium">{review.resource.title}</p>
                  <p className="text-text-faint text-xs">{t("viewMaterial")}</p>
                </div>
                <ExternalLink className="text-text-muted h-4 w-4 flex-shrink-0" />
              </Link>

              {/* Review Header with Rating */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {review.user.image ? (
                    <Image
                      src={review.user.image}
                      alt={review.user.displayName}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-surface flex h-9 w-9 items-center justify-center rounded-full">
                      <span className="text-text-muted text-sm font-medium">
                        {review.user.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-text font-medium">{review.user.displayName}</span>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <p className="text-text-faint text-xs">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                {!review.hasSellerReply && (
                  <span className="pill pill-warning text-xs">{t("unansweredBadge")}</span>
                )}
              </div>

              {/* Review Title */}
              {review.title && <h4 className="text-text mb-1 text-sm font-bold">{review.title}</h4>}

              {/* Review Content */}
              {review.content && (
                <p className="text-text-secondary mb-4 leading-relaxed whitespace-pre-wrap">
                  {review.content}
                </p>
              )}

              {/* Existing Replies */}
              {review.replies.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => toggleExpanded(review.id)}
                    className="text-text-muted hover:text-text mb-2 flex items-center gap-1 text-sm"
                  >
                    <span>{t("replies", { count: review.replies.length })}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedReviews.has(review.id) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedReviews.has(review.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-border space-y-2 overflow-hidden border-l-2 pl-4"
                      >
                        {review.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`rounded-lg p-3 ${
                              reply.user.isSeller ? "bg-primary/5" : "bg-surface"
                            }`}
                          >
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-text text-sm font-medium">
                                {reply.user.displayName}
                              </span>
                              {reply.user.isSeller && (
                                <span className="pill pill-primary flex items-center gap-0.5 text-xs">
                                  <ShieldCheck className="h-3 w-3" />
                                  {t("you")}
                                </span>
                              )}
                              <span className="text-text-faint text-xs">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-text-secondary text-sm">{reply.content}</p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === review.id ? (
                <div className="border-border rounded-lg border p-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={t("replyPlaceholder")}
                    maxLength={1000}
                    rows={3}
                    className="input mb-2 min-h-[80px] resize-y"
                    disabled={submittingReply}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-text-faint text-xs">{replyContent.length}/1000</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent("");
                        }}
                        disabled={submittingReply}
                        className="btn-secondary px-4 py-2 text-sm"
                      >
                        {t("cancel")}
                      </button>
                      <button
                        onClick={() => handleSubmitReply(review.id)}
                        disabled={submittingReply || !replyContent.trim()}
                        className="btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-60"
                      >
                        <Send className="h-4 w-4" />
                        {submittingReply ? t("sending") : t("send")}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setReplyingTo(review.id)}
                  className="text-primary hover:text-primary-hover flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <Star className="h-4 w-4" />
                  {t("reply")}
                </button>
              )}
            </motion.div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => fetchReviews(page - 1, filter)}
                disabled={page === 1 || loading}
                className="btn-secondary px-4 py-2 disabled:opacity-60"
              >
                {t("prev")}
              </button>
              <span className="text-text-muted text-sm">
                {t("pageInfo", { page, total: totalPages })}
              </span>
              <button
                onClick={() => fetchReviews(page + 1, filter)}
                disabled={page === totalPages || loading}
                className="btn-secondary px-4 py-2 disabled:opacity-60"
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

export default SellerReviewsSection;
