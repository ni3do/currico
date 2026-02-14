"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { BadgeCheck, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { StarRating } from "@/components/ui/StarRating";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";
import type { Review } from "@/lib/types/review";

interface ReviewCardProps {
  review: Review;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function ReviewCard({ review, onEdit, onDelete, className = "" }: ReviewCardProps) {
  const { data: session } = useSession();
  const t = useTranslations("reviews");
  const { toast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOwner = session?.user?.id === review.user.id;
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
    </>
  );
}

export default ReviewCard;
