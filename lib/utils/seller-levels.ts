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
  },
];

export const POINTS_PER_UPLOAD = 10;
export const POINTS_PER_DOWNLOAD_BASE = 2;
export const POINTS_PER_DOWNLOAD_GOOD = 3; // avg rating >= 4.0
export const POINTS_PER_DOWNLOAD_GREAT = 4; // avg rating >= 4.5
export const POINTS_PER_REVIEW = 5;

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
}

export function calculatePoints(input: PointsInput): number {
  const downloadPts = getDownloadMultiplier(input.avgRating);
  return (
    input.uploads * POINTS_PER_UPLOAD +
    input.downloads * downloadPts +
    input.reviews * POINTS_PER_REVIEW
  );
}

export function getCurrentLevel(points: number): SellerLevel {
  for (let i = SELLER_LEVELS.length - 1; i >= 0; i--) {
    if (points >= SELLER_LEVELS[i].minPoints) {
      return SELLER_LEVELS[i];
    }
  }
  return SELLER_LEVELS[0];
}

export function getNextLevel(points: number): SellerLevel | null {
  const current = getCurrentLevel(points);
  const nextIndex = current.level + 1;
  if (nextIndex >= SELLER_LEVELS.length) return null;
  return SELLER_LEVELS[nextIndex];
}

export function getProgressToNextLevel(points: number): {
  current: SellerLevel;
  next: SellerLevel | null;
  progressPercent: number;
  pointsNeeded: number;
  pointsIntoLevel: number;
} {
  const current = getCurrentLevel(points);
  const next = getNextLevel(points);

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
