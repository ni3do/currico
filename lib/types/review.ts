/**
 * Shared types for reviews.
 * Single source of truth — do NOT duplicate in component files.
 */

export interface ReviewUser {
  id: string;
  displayName: string;
  image: string | null;
}

export interface ReviewReplyUser extends ReviewUser {
  isSeller: boolean;
}

export interface ReviewReply {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: ReviewReplyUser;
}

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  isVerifiedPurchase: boolean;
  user: ReviewUser;
  replies: ReviewReply[];
  replyCount: number;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export interface UserReview {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
}

export interface SellerReview {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
  resource: {
    id: string;
    title: string;
    previewUrl: string | null;
  };
  replies: ReviewReply[];
  replyCount: number;
  hasSellerReply: boolean;
}
