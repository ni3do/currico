"use client";

import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/Toast";
import { translateApiError } from "@/lib/utils/translate-api-error";

/**
 * Hook that wraps translateApiError + toast for convenient API error display.
 *
 * Usage:
 *   const { showApiError } = useApiError();
 *   const res = await fetch("/api/...");
 *   if (!res.ok) {
 *     const data = await res.json();
 *     showApiError(data);
 *   }
 */
export function useApiError() {
  const t = useTranslations("apiErrors");
  const { toast } = useToast();

  function showApiError(
    data: { code?: string; error?: string } | null,
    fallback = "Ein Fehler ist aufgetreten"
  ) {
    const message = translateApiError(data?.code, data?.error || fallback, t);
    toast(message, "error");
  }

  return { showApiError };
}
