// Seller Reward Level System
// Points = (uploads × 10) + (downloads × multiplier) + (reviews × 5)
// Download multiplier increases with higher average ratings:
//   avg < 4.0  → 2 pts per download
//   avg >= 4.0 → 3 pts per download
//   avg >= 4.5 → 4 pts per download
// Levels based on cumulative point thresholds

import type { LucideIcon } from "lucide-react";
import { Sprout, PenTool, Award, Star, Crown } from "lucide-react";

export interface SellerLevel {
  level: number;
  name: string; // i18n key suffix
  icon: LucideIcon;
  color: string; // Tailwind semantic color
  bgClass: string;
  textClass: string;
  badgeBg: string;
  minPoints: number;
  minUploads: number;
  minDownloads: number;
}

export const SELLER_LEVELS: SellerLevel[] = [
  {
    level: 0,
    name: "newcomer",
    icon: Sprout,
    color: "text-muted",
    bgClass: "bg-surface",
    textClass: "text-text-muted",
    badgeBg: "bg-surface-hover",
    minPoints: 0,
    minUploads: 0,
    minDownloads: 0,
  },
  {
    level: 1,
    name: "contributor",
    icon: PenTool,
    color: "primary",
    bgClass: "bg-primary/10",
    textClass: "text-primary",
    badgeBg: "bg-primary/15",
    minPoints: 30,
    minUploads: 1,
    minDownloads: 0,
  },
  {
    level: 2,
    name: "expert",
    icon: Award,
    color: "accent",
    bgClass: "bg-accent/10",
    textClass: "text-accent",
    badgeBg: "bg-accent/15",
    minPoints: 150,
    minUploads: 3,
    minDownloads: 5,
  },
  {
    level: 3,
    name: "star",
    icon: Star,
    color: "warning",
    bgClass: "bg-warning/10",
    textClass: "text-warning",
    badgeBg: "bg-warning/15",
    minPoints: 450,
    minUploads: 5,
    minDownloads: 20,
  },
  {
    level: 4,
    name: "legend",
    icon: Crown,
    color: "success",
    bgClass: "bg-success/10",
    textClass: "text-success",
    badgeBg: "bg-success/15",
    minPoints: 1500,
    minUploads: 10,
    minDownloads: 50,
  },
];

export const POINTS_PER_UPLOAD = 10;
export const POINTS_PER_DOWNLOAD_BASE = 2;
export const POINTS_PER_DOWNLOAD_GOOD = 3; // avg rating >= 4.0
export const POINTS_PER_DOWNLOAD_GREAT = 4; // avg rating >= 4.5
export const POINTS_PER_REVIEW = 5;
export const VERIFIED_SELLER_BONUS = 50;

export function getDownloadMultiplier(avgRating: number | null): number {
  if (avgRating !== null && avgRating >= 4.5) return POINTS_PER_DOWNLOAD_GREAT;
  if (avgRating !== null && avgRating >= 4.0) return POINTS_PER_DOWNLOAD_GOOD;
  return POINTS_PER_DOWNLOAD_BASE;
}

export interface PointsInput {
  uploads: number;
  downloads: number;
  reviews: number;
  avgRating: number | null;
  isVerifiedSeller?: boolean;
}

export function calculatePoints(input: PointsInput): number {
  const downloadPts = getDownloadMultiplier(input.avgRating);
  return (
    input.uploads * POINTS_PER_UPLOAD +
    input.downloads * downloadPts +
    input.reviews * POINTS_PER_REVIEW +
    (input.isVerifiedSeller ? VERIFIED_SELLER_BONUS : 0)
  );
}

export interface SellerStats {
  uploads: number;
  downloads: number;
}

export function getCurrentLevel(points: number, stats?: SellerStats): SellerLevel {
  for (let i = SELLER_LEVELS.length - 1; i >= 0; i--) {
    const lvl = SELLER_LEVELS[i];
    if (points >= lvl.minPoints) {
      if (stats && (stats.uploads < lvl.minUploads || stats.downloads < lvl.minDownloads)) {
        continue; // Points met but activity minimums not reached
      }
      return lvl;
    }
  }
  return SELLER_LEVELS[0];
}

export function getNextLevel(points: number, stats?: SellerStats): SellerLevel | null {
  const current = getCurrentLevel(points, stats);
  const nextIndex = current.level + 1;
  if (nextIndex >= SELLER_LEVELS.length) return null;
  return SELLER_LEVELS[nextIndex];
}

export function getProgressToNextLevel(
  points: number,
  stats?: SellerStats
): {
  current: SellerLevel;
  next: SellerLevel | null;
  progressPercent: number;
  pointsNeeded: number;
  pointsIntoLevel: number;
} {
  const current = getCurrentLevel(points, stats);
  const next = getNextLevel(points, stats);

  if (!next) {
    return {
      current,
      next: null,
      progressPercent: 100,
      pointsNeeded: 0,
      pointsIntoLevel: 0,
    };
  }

  const levelRange = next.minPoints - current.minPoints;
  const pointsIntoLevel = points - current.minPoints;
  const progressPercent = Math.min(100, Math.round((pointsIntoLevel / levelRange) * 100));
  const pointsNeeded = next.minPoints - points;

  return {
    current,
    next,
    progressPercent,
    pointsNeeded,
    pointsIntoLevel,
  };
}
