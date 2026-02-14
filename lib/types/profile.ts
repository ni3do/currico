/**
 * Shared types for profile pages.
 * Single source of truth — do NOT duplicate in page files.
 */

export interface PublicProfileData {
  id: string;
  name: string | null;
  display_name: string | null;
  image: string | null;
  bio: string | null;
  subjects: string[];
  cycles: string[];
  cantons: string[];
  instagram: string | null;
  pinterest: string | null;
  role: string;
  is_verified_seller: boolean;
  created_at: string;
  is_private: boolean;
  stats: {
    resourceCount: number;
    followerCount: number;
    followingCount: number;
    collectionCount: number;
  };
  isFollowing: boolean;
  isOwnProfile: boolean;
}

export interface ProfileMaterial {
  id: string;
  title: string;
  description: string;
  price: number;
  preview_url: string | null;
  subjects: string[];
  cycles: string[];
  created_at: string;
  downloadCount: number;
  salesCount: number;
}

export interface ProfileCollection {
  id: string;
  name: string;
  description: string | null;
  itemCount: number;
  previewItems: {
    id: string;
    title: string;
    preview_url: string | null;
  }[];
}
