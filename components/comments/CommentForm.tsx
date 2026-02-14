"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import type { Comment, Reply } from "@/lib/types/comments";

type CommentFormData = Comment | Reply;

interface CommentFormProps {
  materialId?: string;
  commentId?: string;
  isReply?: boolean;
  onSubmit: (data: CommentFormData) => void;
  onCancel?: () => void;
  className?: string;
}

export function CommentForm({
  materialId,
  commentId,
  isReply = false,
  onSubmit,
  onCancel,
  className = "",
}: CommentFormProps) {
  const t = useTranslations("commentForm");
  const tCommon = useTranslations("common");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxLength = isReply ? 1000 : 2000;
  const placeholder = isReply ? t("replyPlaceholder") : t("commentPlaceholder");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError(isReply ? t("replyEmpty") : t("commentEmpty"));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const url = isReply
        ? `/api/comments/${commentId}/replies`
        : `/api/materials/${materialId}/comments`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || tCommon("errors.saveFailed"));
      }

      const result = isReply ? data.reply : data.comment;
      setContent("");
      onSubmit(result);
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
      className={`${className}`}
    >
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError(null);
          }}
          maxLength={maxLength}
          rows={isReply ? 2 : 3}
          placeholder={placeholder}
          className={`input ${isReply ? "min-h-[60px] pr-12" : "min-h-[80px] pr-14"} resize-y`}
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className={`bg-primary text-text-on-accent hover:bg-primary-hover absolute ${
            isReply ? "right-2 bottom-2" : "right-3 bottom-3"
          } flex items-center justify-center rounded-lg p-2 transition-colors disabled:opacity-50`}
          title={isReply ? t("sendReply") : t("sendComment")}
        >
          <Send className={isReply ? "h-4 w-4" : "h-5 w-5"} />
        </button>
      </div>

      {/* Character count and error */}
      <div className="mt-2 flex items-center justify-between">
        <p className="text-text-faint text-xs">
          {t("charCount", { count: content.length, max: maxLength })}
        </p>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="text-text-muted hover:text-text text-xs transition-colors disabled:opacity-50"
          >
            {tCommon("buttons.cancel")}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="border-error/50 bg-error/10 mt-2 rounded-lg border p-2">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}
    </motion.form>
  );
}

export default CommentForm;
