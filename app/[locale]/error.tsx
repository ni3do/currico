"use client";

import * as Sentry from "@sentry/nextjs";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="bg-bg flex min-h-screen items-center justify-center">
      <div className="p-8 text-center">
        <div className="bg-error/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
          <svg className="text-error h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-text mb-4 text-xl font-semibold">{t("title")}</h2>
        <p className="text-text-muted mb-6">{t("description")}</p>
        <button
          onClick={reset}
          className="bg-primary text-text-on-accent hover:bg-primary-hover rounded-lg px-6 py-2.5 font-medium transition-colors"
        >
          {t("retry")}
        </button>
      </div>
    </div>
  );
}
