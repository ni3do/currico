"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

/**
 * /profil now redirects to /konto (the full account dashboard).
 * The old profile page was a legacy duplicate with hardcoded strings and mock data.
 */
export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/konto");
  }, [router]);

  return null;
}
