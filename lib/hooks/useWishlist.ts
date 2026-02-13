"use client";

import { useState, useEffect, useCallback } from "react";

interface UseWishlistOptions {
  isAuthenticated: boolean;
  toast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
  t: (key: string) => string;
}

export function useWishlist({ isAuthenticated, toast, t }: UseWishlistOptions) {
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());

  // Fetch user's wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await fetch("/api/user/wishlist");
        if (response.ok) {
          const data = await response.json();
          const ids = new Set<string>(data.items.map((item: { id: string }) => item.id));
          setWishlistedIds(ids);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };
    fetchWishlist();
  }, [isAuthenticated]);

  // Handle wishlist toggle
  const handleWishlistToggle = useCallback(
    async (materialId: string, currentState: boolean): Promise<boolean> => {
      if (!isAuthenticated) {
        toast(t("toast.loginRequired"), "info");
        return false;
      }

      try {
        if (currentState) {
          // Remove from wishlist
          const response = await fetch(`/api/user/wishlist?resourceId=${materialId}`, {
            method: "DELETE",
          });
          if (response.ok) {
            setWishlistedIds((prev) => {
              const next = new Set(prev);
              next.delete(materialId);
              return next;
            });
            toast(t("toast.removedFromWishlist"), "success");
            return true;
          }
        } else {
          // Add to wishlist
          const response = await fetch("/api/user/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resourceId: materialId }),
          });
          if (response.ok) {
            setWishlistedIds((prev) => new Set(prev).add(materialId));
            toast(t("toast.addedToWishlist"), "success");
            return true;
          }
        }
      } catch (error) {
        console.error("Error toggling wishlist:", error);
        toast(t("toast.error"), "error");
      }
      return false;
    },
    [isAuthenticated, t, toast]
  );

  return { wishlistedIds, handleWishlistToggle };
}
