"use client";

import { useState, useEffect, useCallback } from "react";

interface UseFollowingOptions {
  isAuthenticated: boolean;
  toast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
  t: (key: string) => string;
  onUnauthenticated: () => void;
}

export function useFollowing({
  isAuthenticated,
  toast,
  t,
  onUnauthenticated,
}: UseFollowingOptions) {
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  // Fetch user's following list
  useEffect(() => {
    const fetchFollowing = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await fetch("/api/user/following");
        if (response.ok) {
          const data = await response.json();
          const ids = new Set<string>(data.sellers.map((item: { id: string }) => item.id));
          setFollowingIds(ids);
        }
      } catch (error) {
        console.error("Error fetching following:", error);
      }
    };
    fetchFollowing();
  }, [isAuthenticated]);

  // Handle follow toggle
  const handleFollowToggle = useCallback(
    async (profileId: string, currentState: boolean): Promise<boolean> => {
      if (!isAuthenticated) {
        onUnauthenticated();
        return false;
      }

      try {
        if (currentState) {
          // Unfollow
          const response = await fetch(`/api/users/${profileId}/follow`, {
            method: "DELETE",
          });
          if (response.ok) {
            setFollowingIds((prev) => {
              const next = new Set(prev);
              next.delete(profileId);
              return next;
            });
            toast(t("toast.unfollowed"), "success");
            return true;
          }
        } else {
          // Follow
          const response = await fetch(`/api/users/${profileId}/follow`, {
            method: "POST",
          });
          if (response.ok) {
            setFollowingIds((prev) => new Set(prev).add(profileId));
            toast(t("toast.followed"), "success");
            return true;
          }
        }
      } catch (error) {
        console.error("Error toggling follow:", error);
        toast(t("toast.error"), "error");
      }
      return false;
    },
    [isAuthenticated, onUnauthenticated, t, toast]
  );

  return { followingIds, handleFollowToggle };
}
