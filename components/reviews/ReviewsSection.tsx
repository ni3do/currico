"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Star, AlertCircle, RefreshCw } from "lucide-react";
import { LoginLink } from "@/components/ui/LoginLink";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { RatingSummary, RatingDistribution } from "@/components/ui/StarRating";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewUser {
  id: string;
  displayName: string;
  image: string | null;
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  isVerifiedPurchase: boolean;
  user: ReviewUser;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

interface UserReview {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
}

interface ReviewsSectionProps {
  materialId: string;
  className?: string;
}

export function ReviewsSection({ materialId, className = "" }: ReviewsSectionProps) {
  const { data: session, status: sessionStatus } = useSession();
  const tCommon = useTranslations("common");
  const t = useTranslations("reviews");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ averageRating: 0, totalReviews: 0 });
  const [userReview, setUserReview] = useState<UserReview | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<UserReview | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const formRef = useRef<HTMLDivElement>(null);

  const fetchReviews = useCallback(
    async (pageNum: number = 1) => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/materials/${materialId}/reviews?page=${pageNum}&limit=10`
        );

        if (!response.ok) {
          throw new Error(tCommon("errors.loadFailed"));
        }

        const data = await response.json();
        setReviews(data.reviews);
        setStats(data.stats);
        setUserReview(data.userReview);
        setCanReview(data.canReview);
        setIsOwner(data.isOwner ?? false);
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : tCommon("errors.generic"));
      } finally {
        setLoading(false);
      }
    },
    [materialId, tCommon]
  );

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReviewSubmitted = () => {
    setShowForm(false);
    setEditingReview(null);
    fetchReviews();
  };

  const handleEditReview = () => {
    if (userReview) {
      setEditingReview(userReview);
      setShowForm(true);
      setTimeout(
        () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
        100
      );
    }
  };

  const handleDeleteReview = () => {
    fetchReviews();
  };

  // Calculate rating distribution
  const distribution = reviews.reduce(
    (acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    },
    {} as { [key: number]: number }
  );

  // Loading state
  if (loading && reviews.length === 0) {
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
          <p className="text-error flex-1">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchReviews();
            }}
            className="text-error hover:bg-error/10 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            {tCommon("errors.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h2 className="text-text mb-6 text-2xl font-bold">{t("title")}</h2>

      {/* Stats Summary */}
      {stats.totalReviews > 0 && (
        <div className="border-border bg-bg mb-6 rounded-xl border p-4">
          <div className="flex items-center gap-6">
            {/* Average Rating — compact */}
            <div className="flex items-center gap-2">
              <span className="text-text text-3xl font-bold">{stats.averageRating.toFixed(1)}</span>
              <div>
                <RatingSummary
                  averageRating={stats.averageRating}
                  totalReviews={stats.totalReviews}
                  size="sm"
                />
              </div>
            </div>

            {/* Rating Distribution — compact */}
            <div className="flex-1">
              <RatingDistribution distribution={distribution} totalReviews={stats.totalReviews} />
            </div>
          </div>
        </div>
      )}

      {/* Write Review Button / Form */}
      {sessionStatus === "authenticated" && (
        <div className="mb-6" ref={formRef}>
          <AnimatePresence mode="wait">
            {showForm ? (
              <ReviewForm
                key="form"
                materialId={materialId}
                existingReview={editingReview || undefined}
                onSubmit={handleReviewSubmitted}
                onCancel={() => {
                  setShowForm(false);
                  setEditingReview(null);
                }}
              />
            ) : userReview ? (
              <motion.div
                key="your-review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-primary/30 bg-primary/5 rounded-xl border p-4"
              >
                <p className="text-text mb-2 text-sm font-medium">{t("yourReview")}</p>
                <ReviewCard
                  review={{
                    ...userReview,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isVerifiedPurchase: true,
                    user: {
                      id: session.user.id,
                      displayName: session.user.name || "Sie",
                      image: session.user.image || null,
                    },
                  }}
                  onEdit={handleEditReview}
                  onDelete={handleDeleteReview}
                />
              </motion.div>
            ) : canReview ? (
              <motion.button
                key="write-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => {
                  setShowForm(true);
                  setTimeout(
                    () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
                    100
                  );
                }}
                className="btn-primary w-full px-6 py-3 sm:w-auto"
              >
                <Star className="mr-2 h-5 w-5" />
                {t("writeReview")}
              </motion.button>
            ) : isOwner ? (
              <motion.div
                key="owner-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-border bg-bg-secondary rounded-xl border p-4"
              >
                <p className="text-text-muted text-sm">{t("cannotReviewOwn")}</p>
              </motion.div>
            ) : (
              <motion.div
                key="info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-border bg-bg-secondary rounded-xl border p-4"
              >
                <p className="text-text-muted text-sm">{t("mustPurchase")}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {sessionStatus === "unauthenticated" && (
        <div className="border-border bg-bg-secondary mb-6 rounded-xl border p-4">
          <p className="text-text-muted text-sm">
            <LoginLink className="text-primary hover:underline">{t("loginPrompt")}</LoginLink>
            {t("loginSuffix")}
          </p>
        </div>
      )}

      {/* Reviews List */}
      {stats.totalReviews === 0 ? (
        <div className="text-text-muted flex items-center gap-3 py-4">
          <Star className="text-text-faint h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{t("noReviewsBeFirst")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews
            .filter((r) => r.user.id !== session?.user?.id) // Don't show user's review here (shown above)
            .map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => fetchReviews(page - 1)}
                disabled={page === 1}
                className="btn-secondary px-4 py-2 disabled:opacity-50"
              >
                {t("previous")}
              </button>
              <span className="text-text-muted text-sm">{t("pageOf", { page, totalPages })}</span>
              <button
                onClick={() => fetchReviews(page + 1)}
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

export default ReviewsSection;
