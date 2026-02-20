"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { StarRating } from "@/components/ui/StarRating";
import { motion } from "framer-motion";
import type { UserReview } from "@/lib/types/review";

interface ReviewFormProps {
  materialId: string;
  existingReview?: UserReview;
  onSubmit: () => void;
  onCancel?: () => void;
  className?: string;
}

export function ReviewForm({
  materialId,
  existingReview,
  onSubmit,
  onCancel,
  className = "",
}: ReviewFormProps) {
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [content, setContent] = useState(existingReview?.content || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!existingReview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError(t("ratingRequired"));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/reviews/${existingReview.id}`
        : `/api/materials/${materialId}/reviews`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          title: title.trim() || null,
          content: content.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("saveError"));
      }

      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon("errors.generic"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className={`border-border bg-bg-secondary rounded-xl border p-6 ${className}`}
    >
      <h3 className="text-text mb-4 text-lg font-semibold">
        {isEditing ? t("editReview") : t("writeReview")}
      </h3>

      {/* Rating Selection */}
      <div className="mb-6">
        <label className="text-text mb-2 block text-sm font-medium">{t("ratingLabel")} *</label>
        <div className="flex items-center gap-4">
          <StarRating rating={rating} size="lg" interactive onRatingChange={setRating} />
          {rating > 0 && (
            <span className="text-text-muted text-sm">
              {t(`stars.${rating}` as "stars.1" | "stars.2" | "stars.3" | "stars.4" | "stars.5")}
            </span>
          )}
        </div>
      </div>

      {/* Title (optional) */}
      <div className="mb-4">
        <label htmlFor="review-title" className="text-text mb-2 block text-sm font-medium">
          {t("titleOptional")}
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder={t("titlePlaceholder")}
          className="input"
        />
        <p className="text-text-faint mt-1 text-xs">
          {t("charCount", { count: title.length, max: 100 })}
        </p>
      </div>

      {/* Content (optional) */}
      <div className="mb-6">
        <label htmlFor="review-content" className="text-text mb-2 block text-sm font-medium">
          {t("contentOptional")}
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder={t("contentPlaceholder")}
          className="input min-h-[100px] resize-y"
        />
        <p className="text-text-faint mt-1 text-xs">
          {t("charCount", { count: content.length, max: 2000 })}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="border-error/50 bg-error/10 mb-4 rounded-lg border p-3">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="btn-primary flex-1 px-6 py-3 disabled:opacity-60"
        >
          {submitting ? t("saving") : isEditing ? t("updateReview") : t("submitReview")}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="btn-secondary px-6 py-3 disabled:opacity-60"
          >
            {t("cancel")}
          </button>
        )}
      </div>
    </motion.form>
  );
}

export default ReviewForm;
