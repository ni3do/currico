import { describe, it, expect } from "vitest";
import {
  formatPrice,
  formatPriceAdmin,
  getResourceStatus,
  roundToNearestHalfFranc,
} from "@/lib/utils/price";

describe("formatPrice", () => {
  it("formats price in cents to CHF display string", () => {
    expect(formatPrice(500)).toBe("CHF 5.00");
    expect(formatPrice(1299)).toBe("CHF 12.99");
    expect(formatPrice(100)).toBe("CHF 1.00");
  });

  it("returns 'Gratis' for zero price by default", () => {
    expect(formatPrice(0)).toBe("Gratis");
  });

  it("respects custom free label", () => {
    expect(formatPrice(0, { freeLabel: "Free" })).toBe("Free");
  });

  it("shows numeric value for zero when showFreeLabel is false", () => {
    expect(formatPrice(0, { showFreeLabel: false })).toBe("CHF 0.00");
  });

  it("excludes CHF prefix when includePrefix is false", () => {
    expect(formatPrice(500, { includePrefix: false })).toBe("5.00");
    expect(formatPrice(1299, { includePrefix: false })).toBe("12.99");
  });
});

describe("formatPriceAdmin", () => {
  it("formats price without CHF prefix", () => {
    expect(formatPriceAdmin(500)).toBe("5.00");
    expect(formatPriceAdmin(1299)).toBe("12.99");
  });

  it("shows 0.00 for zero price", () => {
    expect(formatPriceAdmin(0)).toBe("0.00");
  });
});

describe("roundToNearestHalfFranc", () => {
  it("returns 0 for zero input", () => {
    expect(roundToNearestHalfFranc(0)).toBe(0);
  });

  it("returns 0 for negative input", () => {
    expect(roundToNearestHalfFranc(-1)).toBe(0);
  });

  it("rounds up small values to minimum 0.50", () => {
    expect(roundToNearestHalfFranc(0.1)).toBe(0.5);
    expect(roundToNearestHalfFranc(0.25)).toBe(0.5);
  });

  it("rounds to nearest 0.50 increment", () => {
    expect(roundToNearestHalfFranc(2.3)).toBe(2.5);
    expect(roundToNearestHalfFranc(2.75)).toBe(3.0);
  });

  it("keeps exact 0.50 increments unchanged", () => {
    expect(roundToNearestHalfFranc(2.5)).toBe(2.5);
    expect(roundToNearestHalfFranc(3.0)).toBe(3.0);
  });
});

describe("getResourceStatus", () => {
  it("returns 'Verified' when approved", () => {
    expect(getResourceStatus(true, true)).toBe("Verified");
    expect(getResourceStatus(false, true)).toBe("Verified");
  });

  it("returns 'Pending' when published but not approved", () => {
    expect(getResourceStatus(true, false)).toBe("Pending");
  });

  it("returns 'Draft' when not published", () => {
    expect(getResourceStatus(false, false)).toBe("Draft");
  });
});
