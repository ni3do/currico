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
        className={`border-border bg-bg rounded-xl border p-5 ${className}`}
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/profil/${review.user.id}`} className="shrink-0">
              {review.user.image ? (
                <Image
                  src={review.user.image}
                  alt={review.user.displayName}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="bg-surface flex h-10 w-10 items-center justify-center rounded-full">
                  <span className="text-text-muted text-sm font-medium">
                    {review.user.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/profil/${review.user.id}`}
                  className="text-text hover:text-primary font-medium transition-colors"
                >
                  {review.user.displayName}
                </Link>
                {review.isVerifiedPurchase && (
                  <span className="pill pill-success flex items-center gap-1 text-xs">
                    <BadgeCheck className="h-3 w-3" />
                    {t("verifiedPurchase")}
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
                aria-label={t("options")}
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
                          onEdit?.();
                        }}
                        className="text-text hover:bg-surface flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm"
                      >
                        <Pencil className="h-4 w-4" />
                        {t("edit")}
                      </button>
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

        {/* Rating */}
        <div className="mb-3">
          <StarRating rating={review.rating} size="md" />
        </div>

        {/* Title */}
        {review.title && <h4 className="text-text mb-2 font-semibold">{review.title}</h4>}

        {/* Content */}
        {review.content && (
          <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
            {review.content}
          </p>
        )}

        {/* Edited indicator */}
        {review.createdAt !== review.updatedAt && (
          <p className="text-text-faint mt-3 text-xs">({t("edited")})</p>
        )}
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
