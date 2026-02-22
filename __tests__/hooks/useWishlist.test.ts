import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useWishlist } from "@/lib/hooks/useWishlist";
import * as Sentry from "@sentry/nextjs";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockToast = vi.fn();
const mockT = vi.fn((key: string) => key);

describe("useWishlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it("does not fetch when unauthenticated", () => {
    renderHook(() =>
      useWishlist({
        isAuthenticated: false,
        toast: mockToast,
        t: mockT,
      })
    );

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("fetches wishlist on mount when authenticated", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: [{ id: "m1" }, { id: "m2" }] }),
    });

    const { result } = renderHook(() =>
      useWishlist({
        isAuthenticated: true,
        toast: mockToast,
        t: mockT,
      })
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/user/wishlist");
    });

    await waitFor(() => {
      expect(result.current.wishlistedIds.has("m1")).toBe(true);
      expect(result.current.wishlistedIds.has("m2")).toBe(true);
    });
  });

  it("handles fetch error with Sentry", async () => {
    const error = new Error("Network error");
    mockFetch.mockRejectedValueOnce(error);

    renderHook(() =>
      useWishlist({
        isAuthenticated: true,
        toast: mockToast,
        t: mockT,
      })
    );

    await waitFor(() => {
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });
  });

  it("shows login toast when toggling while unauthenticated", async () => {
    const { result } = renderHook(() =>
      useWishlist({
        isAuthenticated: false,
        toast: mockToast,
        t: mockT,
      })
    );

    let toggleResult: boolean = true;
    await act(async () => {
      toggleResult = await result.current.handleWishlistToggle("m1", false);
    });

    expect(toggleResult).toBe(false);
    expect(mockToast).toHaveBeenCalledWith("toast.loginRequired", "info");
  });

  it("adds to wishlist (POST + state update + toast)", async () => {
    // Initial fetch returns empty wishlist
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: [] }),
    });

    const { result } = renderHook(() =>
      useWishlist({
        isAuthenticated: true,
        toast: mockToast,
        t: mockT,
      })
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Mock POST response
    mockFetch.mockResolvedValueOnce({ ok: true });

    let toggleResult: boolean = false;
    await act(async () => {
      toggleResult = await result.current.handleWishlistToggle("m1", false);
    });

    expect(toggleResult).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith("/api/user/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId: "m1" }),
    });
    expect(result.current.wishlistedIds.has("m1")).toBe(true);
    expect(mockToast).toHaveBeenCalledWith("toast.addedToWishlist", "success");
  });

  it("removes from wishlist (DELETE + state update + toast)", async () => {
    // Initial fetch returns wishlisted item
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: [{ id: "m1" }] }),
    });

    const { result } = renderHook(() =>
      useWishlist({
        isAuthenticated: true,
        toast: mockToast,
        t: mockT,
      })
    );

    await waitFor(() => {
      expect(result.current.wishlistedIds.has("m1")).toBe(true);
    });

    // Mock DELETE response
    mockFetch.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      await result.current.handleWishlistToggle("m1", true);
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/user/wishlist?resourceId=m1", {
      method: "DELETE",
    });
    expect(result.current.wishlistedIds.has("m1")).toBe(false);
    expect(mockToast).toHaveBeenCalledWith("toast.removedFromWishlist", "success");
  });

  it("shows error toast on API failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: [] }),
    });

    const { result } = renderHook(() =>
      useWishlist({
        isAuthenticated: true,
        toast: mockToast,
        t: mockT,
      })
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Mock failed POST
    mockFetch.mockRejectedValueOnce(new Error("API error"));

    await act(async () => {
      await result.current.handleWishlistToggle("m1", false);
    });

    expect(mockToast).toHaveBeenCalledWith("toast.error", "error");
  });

  it("captures exception on toggle API error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: [] }),
    });

    const { result } = renderHook(() =>
      useWishlist({
        isAuthenticated: true,
        toast: mockToast,
        t: mockT,
      })
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const apiError = new Error("API error");
    mockFetch.mockRejectedValueOnce(apiError);

    await act(async () => {
      await result.current.handleWishlistToggle("m1", false);
    });

    expect(Sentry.captureException).toHaveBeenCalledWith(apiError);
  });
});
