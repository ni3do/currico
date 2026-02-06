"use client";

import { useState } from "react";
import { StarRating } from "@/components/ui/StarRating";
import { motion } from "framer-motion";

interface ReviewFormProps {
  materialId: string;
  existingReview?: {
    id: string;
    rating: number;
    title: string | null;
    content: string | null;
  };
  onSubmit: () => void;
  onCancel?: () => void;
  className?: string;
}

const RATING_LABELS: { [key: number]: string } = {
  1: "Schlecht",
  2: "Mangelhaft",
  3: "Okay",
  4: "Gut",
  5: "Ausgezeichnet",
};

export function ReviewForm({
  materialId,
  existingReview,
  onSubmit,
  onCancel,
  className = "",
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [content, setContent] = useState(existingReview?.content || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!existingReview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Bitte wählen Sie eine Bewertung");
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
        throw new Error(data.error || "Fehler beim Speichern der Bewertung");
      }

      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
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
        {isEditing ? "Bewertung bearbeiten" : "Bewertung schreiben"}
      </h3>

      {/* Rating Selection */}
      <div className="mb-6">
        <label className="text-text mb-2 block text-sm font-medium">
          Wie bewerten Sie dieses Material? *
        </label>
        <div className="flex items-center gap-4">
          <StarRating rating={rating} size="lg" interactive onRatingChange={setRating} />
          {rating > 0 && <span className="text-text-muted text-sm">{RATING_LABELS[rating]}</span>}
        </div>
      </div>

      {/* Title (optional) */}
      <div className="mb-4">
        <label htmlFor="review-title" className="text-text mb-2 block text-sm font-medium">
          Titel (optional)
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Kurze Zusammenfassung Ihrer Bewertung"
          className="input"
        />
        <p className="text-text-faint mt-1 text-xs">{title.length}/100 Zeichen</p>
      </div>

      {/* Content (optional) */}
      <div className="mb-6">
        <label htmlFor="review-content" className="text-text mb-2 block text-sm font-medium">
          Detaillierte Bewertung (optional)
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Beschreiben Sie Ihre Erfahrung mit diesem Material..."
          className="input min-h-[100px] resize-y"
        />
        <p className="text-text-faint mt-1 text-xs">{content.length}/2000 Zeichen</p>
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
          className="btn-primary flex-1 px-6 py-3 disabled:opacity-50"
        >
          {submitting
            ? "Wird gespeichert..."
            : isEditing
              ? "Bewertung aktualisieren"
              : "Bewertung abgeben"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="btn-secondary px-6 py-3 disabled:opacity-50"
          >
            Abbrechen
          </button>
        )}
      </div>
    </motion.form>
  );
}

export default ReviewForm;
