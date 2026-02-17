"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { getLoginUrl } from "@/lib/utils/login-redirect";
import type { UserData, UserStats, FollowedSeller } from "@/lib/types/account";

interface AccountDataContextType {
  userData: UserData | null;
  stats: UserStats | null;
  followedSellers: FollowedSeller[];
  unreadNotifications: number;
  loading: boolean;
  refreshUserData: () => Promise<void>;
  setStats: (stats: UserStats | ((prev: UserStats | null) => UserStats | null)) => void;
}

const AccountDataContext = createContext<AccountDataContextType | null>(null);

export { AccountDataContext };

export function useAccountData() {
  const ctx = useContext(AccountDataContext);
  if (!ctx) {
    throw new Error("useAccountData must be used within AccountDataProvider");
  }
  return ctx;
}

export function useAccountDataProvider() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [followedSellers, setFollowedSellers] = useState<FollowedSeller[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);

  const fetchUserStats = useCallback(async () => {
    try {
      const response = await fetch("/api/user/stats");
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  }, []);

  // Handle redirects
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(getLoginUrl());
    } else if (status === "authenticated" && session?.user?.role === "ADMIN") {
      router.push("/admin");
    }
  }, [status, session?.user?.role, router]);

  // Fetch shared data on mount
  useEffect(() => {
    if (status !== "authenticated") return;

    Promise.all([
      fetch("/api/user/stats")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setUserData(data.user);
            setStats(data.stats);
          }
        }),
      fetch("/api/user/following")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setFollowedSellers(data.sellers || []);
        }),
      fetch("/api/users/me/notifications")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setUnreadNotifications(data.unreadCount || 0);
        }),
    ])
      .catch((err) => console.error("Error fetching account data:", err))
      .finally(() => {
        setLoading(false);
        initialLoadDone.current = true;
      });
  }, [status]);

  // Re-fetch user data when navigating between konto subpages (keeps header fresh after edits)
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      if (initialLoadDone.current && status === "authenticated") {
        // Defer to avoid synchronous setState-in-effect lint warning
        const id = requestAnimationFrame(() => fetchUserStats());
        return () => cancelAnimationFrame(id);
      }
    }
  }, [pathname, fetchUserStats, status]);

  return {
    userData,
    stats,
    followedSellers,
    unreadNotifications,
    loading,
    refreshUserData: fetchUserStats,
    setStats,
  };
}
