"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
