// Seller Reward Level System
// Points = (uploads × 10) + (downloads × multiplier) + (reviews × 5)
// Download multiplier increases with higher average ratings:
//   avg < 4.0  → 2 pts per download
//   avg >= 4.0 → 4 pts per download
//   avg >= 4.5 → 6 pts per download
// Levels based on cumulative point thresholds

import type { LucideIcon } from "lucide-react";
import { Shield, Medal, Award, Star, Crown } from "lucide-react";

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
    name: "bronze",
    icon: Shield,
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
    name: "silber",
    icon: Medal,
    color: "primary",
    bgClass: "bg-primary/10",
    textClass: "text-primary",
    badgeBg: "bg-primary/15",
    minPoints: 50,
    minUploads: 3,
    minDownloads: 5,
  },
  {
    level: 2,
    name: "gold",
    icon: Award,
    color: "accent",
    bgClass: "bg-accent/10",
    textClass: "text-accent",
    badgeBg: "bg-accent/15",
    minPoints: 250,
    minUploads: 8,
    minDownloads: 25,
  },
  {
    level: 3,
    name: "platin",
    icon: Star,
    color: "warning",
    bgClass: "bg-warning/10",
    textClass: "text-warning",
    badgeBg: "bg-warning/15",
    minPoints: 750,
    minUploads: 15,
    minDownloads: 75,
  },
  {
    level: 4,
    name: "diamant",
    icon: Crown,
    color: "success",
    bgClass: "bg-success/10",
    textClass: "text-success",
    badgeBg: "bg-success/15",
    minPoints: 2500,
    minUploads: 30,
    minDownloads: 200,
  },
];

export const POINTS_PER_UPLOAD = 10;
export const POINTS_PER_DOWNLOAD_BASE = 2;
export const POINTS_PER_DOWNLOAD_GOOD = 4; // avg rating >= 4.0
export const POINTS_PER_DOWNLOAD_GREAT = 6; // avg rating >= 4.5
export const POINTS_PER_REVIEW = 5;
export const VERIFIED_SELLER_BONUS = 100;

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

export interface DetailedProgress {
  current: SellerLevel;
  next: SellerLevel | null;
  progressPercent: number;
  pointsNeeded: number;
  pointsIntoLevel: number;
  /** Human-readable blockers preventing advancement (i18n keys + params) */
  blockers: Blocker[];
  /** Per-requirement progress toward the next level */
  requirements: RequirementProgress[];
}

export interface Blocker {
  key: "needMorePoints" | "needMoreUploads" | "needMoreDownloads";
  count: number;
}

export interface RequirementProgress {
  type: "points" | "uploads" | "downloads";
  current: number;
  required: number;
  percent: number;
}

export function getProgressToNextLevel(points: number, stats?: SellerStats): DetailedProgress {
  const current = getCurrentLevel(points, stats);
  const next = getNextLevel(points, stats);

  if (!next) {
    return {
      current,
      next: null,
      progressPercent: 100,
      pointsNeeded: 0,
      pointsIntoLevel: 0,
      blockers: [],
      requirements: [],
    };
  }

  const levelRange = next.minPoints - current.minPoints;
  const pointsIntoLevel = points - current.minPoints;
  const progressPercent = Math.min(100, Math.round((pointsIntoLevel / levelRange) * 100));
  const pointsNeeded = Math.max(0, next.minPoints - points);

  // Compute blockers and per-requirement progress
  const blockers: Blocker[] = [];
  const requirements: RequirementProgress[] = [];

  // Points requirement
  requirements.push({
    type: "points",
    current: points,
    required: next.minPoints,
    percent: Math.min(100, Math.round((points / next.minPoints) * 100)),
  });
  if (pointsNeeded > 0) {
    blockers.push({ key: "needMorePoints", count: pointsNeeded });
  }

  // Upload requirement
  if (next.minUploads > 0) {
    const currentUploads = stats?.uploads ?? 0;
    requirements.push({
      type: "uploads",
      current: currentUploads,
      required: next.minUploads,
      percent: Math.min(100, Math.round((currentUploads / next.minUploads) * 100)),
    });
    const gap = next.minUploads - currentUploads;
    if (gap > 0) {
      blockers.push({ key: "needMoreUploads", count: gap });
    }
  }

  // Download requirement
  if (next.minDownloads > 0) {
    const currentDownloads = stats?.downloads ?? 0;
    requirements.push({
      type: "downloads",
      current: currentDownloads,
      required: next.minDownloads,
      percent: Math.min(100, Math.round((currentDownloads / next.minDownloads) * 100)),
    });
    const gap = next.minDownloads - currentDownloads;
    if (gap > 0) {
      blockers.push({ key: "needMoreDownloads", count: gap });
    }
  }

  return {
    current,
    next,
    progressPercent,
    pointsNeeded,
    pointsIntoLevel,
    blockers,
    requirements,
  };
}
