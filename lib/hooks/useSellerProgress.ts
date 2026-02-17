"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export interface SellerProgressData {
  points: number;
  level: number;
  levelName: string;
  uploads: number;
  downloads: number;
  reviews: number;
  avgRating: number | null;
  downloadMultiplier: number;
  progressPercent: number;
  pointsNeeded: number;
  nextLevelName: string | null;
  blockers: { key: string; count: number }[];
  requirements: { type: string; current: number; required: number; percent: number }[];
  isVerifiedSeller: boolean;
}

interface UseSellerProgressReturn {
  isLoggedIn: boolean;
  isSeller: boolean;
  data: SellerProgressData | null;
  loading: boolean;
}

export function useSellerProgress(): UseSellerProgressReturn {
  const { data: session, status } = useSession();
  const [data, setData] = useState<SellerProgressData | null>(null);
  const [fetchDone, setFetchDone] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const fetchedRef = useRef(false);

  const isLoggedIn = status === "authenticated";

  useEffect(() => {
    if (status === "loading" || fetchedRef.current) return;
    if (status !== "authenticated" || !session?.user) return;

    fetchedRef.current = true;
    fetch("/api/seller/level")
      .then((res) => {
        if (res.status === 403) {
          setIsSeller(false);
          return null;
        }
        if (!res.ok) return null;
        setIsSeller(true);
        return res.json();
      })
      .then((json) => {
        if (json) setData(json);
      })
      .catch(() => {})
      .finally(() => setFetchDone(true));
  }, [status, session?.user]);

  // Loading is true while session is resolving, or if authenticated but fetch hasn't finished
  const loading = status === "loading" || (isLoggedIn && !fetchDone);

  return { isLoggedIn, isSeller, data, loading };
}
