"use client";

import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";

// Redirect /edit to /bearbeiten (the full editor)
export default function EditRedirect() {
  const params = useParams();
  const router = useRouter();
  const materialId = params.id as string;

  useEffect(() => {
    router.replace(`/materialien/${materialId}/bearbeiten`);
  }, [router, materialId]);

  return null;
}
