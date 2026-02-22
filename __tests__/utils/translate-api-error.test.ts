import { describe, it, expect, vi } from "vitest";
import { translateApiError } from "@/lib/utils/translate-api-error";

// Mock translate function that returns the key prefixed with "translated:"
const mockT = vi.fn((key: string) => `translated:${key}`);

describe("translateApiError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns fallback when code is undefined", () => {
    expect(translateApiError(undefined, "Some error", mockT)).toBe("Some error");
    expect(mockT).not.toHaveBeenCalled();
  });

  it("translates UNAUTHORIZED code", () => {
    expect(translateApiError("UNAUTHORIZED", "fallback", mockT)).toBe("translated:unauthorized");
  });

  it("translates checkout codes", () => {
    expect(translateApiError("ALREADY_OWNED", "fallback", mockT)).toBe("translated:alreadyOwned");
    expect(translateApiError("CANNOT_BUY_OWN", "fallback", mockT)).toBe("translated:cannotBuyOwn");
    expect(translateApiError("SELLER_PAYMENTS_DISABLED", "fallback", mockT)).toBe(
      "translated:sellerPaymentsDisabled"
    );
  });

  it("translates review codes", () => {
    expect(translateApiError("CANNOT_REVIEW_OWN", "fallback", mockT)).toBe(
      "translated:cannotReviewOwn"
    );
    expect(translateApiError("MUST_PURCHASE_TO_REVIEW", "fallback", mockT)).toBe(
      "translated:mustPurchaseToReview"
    );
    expect(translateApiError("ALREADY_REVIEWED", "fallback", mockT)).toBe(
      "translated:alreadyReviewed"
    );
  });

  it("translates download codes", () => {
    expect(translateApiError("TOKEN_EXPIRED", "fallback", mockT)).toBe("translated:tokenExpired");
    expect(translateApiError("MAX_DOWNLOADS_REACHED", "fallback", mockT)).toBe(
      "translated:maxDownloadsReached"
    );
    expect(translateApiError("FILE_NOT_FOUND", "fallback", mockT)).toBe("translated:fileNotFound");
  });

  it("translates bundle codes", () => {
    expect(translateApiError("BUNDLE_NOT_FOUND", "fallback", mockT)).toBe(
      "translated:bundleNotFound"
    );
  });

  it("returns fallback for unknown code", () => {
    expect(translateApiError("UNKNOWN_CODE_XYZ", "My fallback", mockT)).toBe("My fallback");
  });

  it("returns fallback when translation function throws", () => {
    const throwingT = vi.fn(() => {
      throw new Error("Missing translation");
    });

    expect(translateApiError("UNAUTHORIZED", "fallback text", throwingT)).toBe("fallback text");
  });
});
