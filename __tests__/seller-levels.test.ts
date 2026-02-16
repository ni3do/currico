import { describe, it, expect } from "vitest";
import {
  SELLER_LEVELS,
  POINTS_PER_UPLOAD,
  POINTS_PER_DOWNLOAD_BASE,
  POINTS_PER_DOWNLOAD_GOOD,
  POINTS_PER_DOWNLOAD_GREAT,
  POINTS_PER_REVIEW,
  VERIFIED_SELLER_BONUS,
  getDownloadMultiplier,
  calculatePoints,
  getCurrentLevel,
  getProgressToNextLevel,
} from "@/lib/utils/seller-levels";

describe("SELLER_LEVELS", () => {
  it("has exactly 5 levels with correct names", () => {
    expect(SELLER_LEVELS).toHaveLength(5);
    expect(SELLER_LEVELS.map((l) => l.name)).toEqual([
      "bronze",
      "silber",
      "gold",
      "platin",
      "diamant",
    ]);
  });

  it("has strictly increasing point thresholds", () => {
    for (let i = 1; i < SELLER_LEVELS.length; i++) {
      expect(SELLER_LEVELS[i].minPoints).toBeGreaterThan(SELLER_LEVELS[i - 1].minPoints);
    }
  });

  it("has correct threshold values", () => {
    expect(SELLER_LEVELS[0].minPoints).toBe(0);
    expect(SELLER_LEVELS[1].minPoints).toBe(50);
    expect(SELLER_LEVELS[2].minPoints).toBe(250);
    expect(SELLER_LEVELS[3].minPoints).toBe(750);
    expect(SELLER_LEVELS[4].minPoints).toBe(2500);
  });

  it("has non-decreasing upload requirements", () => {
    for (let i = 1; i < SELLER_LEVELS.length; i++) {
      expect(SELLER_LEVELS[i].minUploads).toBeGreaterThanOrEqual(SELLER_LEVELS[i - 1].minUploads);
    }
  });

  it("has non-decreasing download requirements", () => {
    for (let i = 1; i < SELLER_LEVELS.length; i++) {
      expect(SELLER_LEVELS[i].minDownloads).toBeGreaterThanOrEqual(
        SELLER_LEVELS[i - 1].minDownloads
      );
    }
  });
});

describe("point constants", () => {
  it("has updated point values", () => {
    expect(POINTS_PER_UPLOAD).toBe(10);
    expect(POINTS_PER_DOWNLOAD_BASE).toBe(2);
    expect(POINTS_PER_DOWNLOAD_GOOD).toBe(4);
    expect(POINTS_PER_DOWNLOAD_GREAT).toBe(6);
    expect(POINTS_PER_REVIEW).toBe(5);
    expect(VERIFIED_SELLER_BONUS).toBe(100);
  });
});

describe("getDownloadMultiplier", () => {
  it("returns base for null rating", () => {
    expect(getDownloadMultiplier(null)).toBe(2);
  });

  it("returns base for low rating", () => {
    expect(getDownloadMultiplier(3.5)).toBe(2);
  });

  it("returns GOOD for rating >= 4.0", () => {
    expect(getDownloadMultiplier(4.0)).toBe(4);
    expect(getDownloadMultiplier(4.3)).toBe(4);
  });

  it("returns GREAT for rating >= 4.5", () => {
    expect(getDownloadMultiplier(4.5)).toBe(6);
    expect(getDownloadMultiplier(5.0)).toBe(6);
  });
});

describe("calculatePoints", () => {
  it("calculates basic points without bonuses", () => {
    const points = calculatePoints({
      uploads: 5,
      downloads: 10,
      reviews: 3,
      avgRating: null,
    });
    // 5*10 + 10*2 + 3*5 = 50 + 20 + 15 = 85
    expect(points).toBe(85);
  });

  it("applies download multiplier for good rating", () => {
    const points = calculatePoints({
      uploads: 5,
      downloads: 10,
      reviews: 3,
      avgRating: 4.2,
    });
    // 5*10 + 10*4 + 3*5 = 50 + 40 + 15 = 105
    expect(points).toBe(105);
  });

  it("applies download multiplier for great rating", () => {
    const points = calculatePoints({
      uploads: 5,
      downloads: 10,
      reviews: 3,
      avgRating: 4.7,
    });
    // 5*10 + 10*6 + 3*5 = 50 + 60 + 15 = 125
    expect(points).toBe(125);
  });

  it("includes verified seller bonus", () => {
    const points = calculatePoints({
      uploads: 5,
      downloads: 10,
      reviews: 3,
      avgRating: null,
      isVerifiedSeller: true,
    });
    // 85 + 100 = 185
    expect(points).toBe(185);
  });
});

describe("getCurrentLevel", () => {
  it("returns bronze at 0 points", () => {
    expect(getCurrentLevel(0).name).toBe("bronze");
  });

  it("returns silber when points and stats meet requirements", () => {
    expect(getCurrentLevel(50, { uploads: 3, downloads: 5 }).name).toBe("silber");
  });

  it("falls back to bronze when upload gate not met for silber", () => {
    expect(getCurrentLevel(50, { uploads: 1, downloads: 5 }).name).toBe("bronze");
  });

  it("falls back to bronze when download gate not met for silber", () => {
    expect(getCurrentLevel(50, { uploads: 3, downloads: 2 }).name).toBe("bronze");
  });

  it("returns gold when all requirements met", () => {
    expect(getCurrentLevel(250, { uploads: 8, downloads: 25 }).name).toBe("gold");
  });

  it("returns platin when all requirements met", () => {
    expect(getCurrentLevel(750, { uploads: 15, downloads: 75 }).name).toBe("platin");
  });

  it("returns diamant when all requirements met", () => {
    expect(getCurrentLevel(2500, { uploads: 30, downloads: 200 }).name).toBe("diamant");
  });

  it("returns lower level when points are enough but stats are not", () => {
    // Has enough points for diamant but not enough uploads
    expect(getCurrentLevel(2500, { uploads: 20, downloads: 200 }).name).toBe("platin");
  });
});

describe("getProgressToNextLevel", () => {
  it("returns 100% progress at max level", () => {
    const progress = getProgressToNextLevel(2500, { uploads: 30, downloads: 200 });
    expect(progress.current.name).toBe("diamant");
    expect(progress.next).toBeNull();
    expect(progress.progressPercent).toBe(100);
    expect(progress.pointsNeeded).toBe(0);
    expect(progress.blockers).toHaveLength(0);
  });

  it("calculates progress between levels", () => {
    const progress = getProgressToNextLevel(150, { uploads: 5, downloads: 15 });
    expect(progress.current.name).toBe("silber");
    expect(progress.next?.name).toBe("gold");
    expect(progress.pointsNeeded).toBe(100); // 250 - 150
    expect(progress.progressPercent).toBe(50); // 100/200 = 50%
  });

  it("includes blockers for missing uploads", () => {
    const progress = getProgressToNextLevel(250, { uploads: 5, downloads: 25 });
    // Has points for gold but not enough uploads
    // Falls to silber, next is gold
    expect(progress.current.name).toBe("silber");
    expect(progress.blockers.some((b) => b.key === "needMoreUploads")).toBe(true);
  });
});
