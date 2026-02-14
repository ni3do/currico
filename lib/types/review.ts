/**
 * Shared types for reviews.
 * Single source of truth — do NOT duplicate in component files.
 */

export interface ReviewUser {
  id: string;
  displayName: string;
  image: string | null;
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
