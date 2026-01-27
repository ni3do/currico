'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

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
        <div className="min-h-screen flex items-center justify-center bg-base">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-text mb-4">
              Ein Fehler ist aufgetreten
            </h2>
            <p className="text-subtext0 mb-6">
              Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-opacity-90"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
