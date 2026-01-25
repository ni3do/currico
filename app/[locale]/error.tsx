'use client';

import * as Sentry from '@sentry/nextjs';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-text mb-4">
          {t('title')}
        </h2>
        <p className="text-subtext0 mb-6">
          {t('description')}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-opacity-90"
        >
          {t('retry')}
        </button>
      </div>
    </div>
  );
}
