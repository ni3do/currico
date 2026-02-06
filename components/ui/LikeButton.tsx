"use client";

import { useState } from "react";
import { Heart, ThumbsUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LikeButtonProps {
  liked: boolean;
  likeCount?: number;
  onToggle: () => Promise<void>;
  variant?: "heart" | "thumbs";
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  disabled?: boolean;
  className?: string;
}

export function LikeButton({
  liked,
  likeCount = 0,
  onToggle,
  variant = "heart",
  size = "md",
  showCount = true,
  disabled = false,
  className = "",
}: LikeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const buttonSizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const handleClick = async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);
    setAnimating(true);

    try {
      await onToggle();
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setAnimating(false), 300);
    }
  };

  const Icon = variant === "heart" ? Heart : ThumbsUp;
  const activeColor = variant === "heart" ? "text-error" : "text-primary";
  const activeBg = variant === "heart" ? "bg-error/10" : "bg-primary/10";
  const hoverColor = variant === "heart" ? "hover:text-error" : "hover:text-primary";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`group inline-flex items-center gap-1.5 rounded-lg border-2 transition-all ${buttonSizeClasses[size]} ${
        liked
          ? `${activeColor} ${activeBg} border-current`
          : `text-text-muted border-border bg-bg ${hoverColor} hover:border-current`
      } ${disabled || isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`}
      title={liked ? "Gefällt mir nicht mehr" : "Gefällt mir"}
      aria-label={liked ? "Like entfernen" : "Liken"}
      aria-pressed={liked}
    >
      <motion.div
        animate={animating ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Icon
          className={`${sizeClasses[size]} transition-transform ${
            liked ? "" : "group-hover:scale-110"
          }`}
          fill={liked ? "currentColor" : "none"}
          strokeWidth={liked ? 0 : 2}
        />
      </motion.div>
      {showCount && (
        <AnimatePresence mode="wait">
          <motion.span
            key={likeCount}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className={`${textClasses[size]} font-medium`}
          >
            {likeCount}
          </motion.span>
        </AnimatePresence>
      )}
    </button>
  );
}

// Material like button - uses heart variant
interface MaterialLikeButtonProps {
  materialId: string;
  initialLiked?: boolean;
  initialCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  onLoginRequired?: () => void;
  className?: string;
}

export function MaterialLikeButton({
  materialId,
  initialLiked = false,
  initialCount = 0,
  size = "md",
  showCount = true,
  onLoginRequired,
  className = "",
}: MaterialLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);

  const handleToggle = async () => {
    try {
      const response = await fetch(`/api/materials/${materialId}/like`, {
        method: "POST",
      });

      if (response.status === 401) {
        onLoginRequired?.();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      const data = await response.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error("Error toggling material like:", error);
      throw error;
    }
  };

  return (
    <LikeButton
      liked={liked}
      likeCount={likeCount}
      onToggle={handleToggle}
      variant="heart"
      size={size}
      showCount={showCount}
      className={className}
    />
  );
}

// Comment like button - uses thumbs variant
interface CommentLikeButtonProps {
  commentId: string;
  initialLiked?: boolean;
  initialCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  onLoginRequired?: () => void;
  className?: string;
}

export function CommentLikeButton({
  commentId,
  initialLiked = false,
  initialCount = 0,
  size = "sm",
  showCount = true,
  onLoginRequired,
  className = "",
}: CommentLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);

  const handleToggle = async () => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });

      if (response.status === 401) {
        onLoginRequired?.();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      const data = await response.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error("Error toggling comment like:", error);
      throw error;
    }
  };

  return (
    <LikeButton
      liked={liked}
      likeCount={likeCount}
      onToggle={handleToggle}
      variant="thumbs"
      size={size}
      showCount={showCount}
      className={className}
    />
  );
}

export default LikeButton;
