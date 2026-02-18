"use client";

import { useCallback } from "react";

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void;
  }
}

export function usePlausible() {
  const trackEvent = useCallback(
    (name: string, props?: Record<string, string | number | boolean>) => {
      window.plausible?.(name, props ? { props } : undefined);
    },
    []
  );

  return { trackEvent };
}
