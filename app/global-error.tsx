"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="bg-bg flex min-h-screen items-center justify-center">
          <div className="p-8 text-center">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: "rgba(210, 15, 57, 0.1)" }}
            >
              <svg
                className="h-8 w-8"
                style={{ color: "#d20f39" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-text mb-4 text-2xl font-bold">
              An error occurred / Ein Fehler ist aufgetreten
            </h2>
            <p className="text-text-muted mb-6">
              Please try again or contact support. / Bitte versuchen Sie es erneut.
            </p>
            <button
              onClick={reset}
              className="bg-primary text-text-on-accent hover:bg-primary-hover rounded-lg px-6 py-2.5 font-medium transition-colors"
            >
              Try again / Erneut versuchen
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
