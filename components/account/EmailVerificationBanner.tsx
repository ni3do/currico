"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

interface EmailVerificationBannerProps {
  email: string;
}

const RESEND_COOLDOWN_SECONDS = 60;

export function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const t = useTranslations("emailVerification");

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(cooldownRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);

  const handleResend = useCallback(async () => {
    if (cooldownRemaining > 0 || sending) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t("banner.sendError"));
      }

      setSent(true);
      setCooldownRemaining(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("banner.errorFallback"));
    } finally {
      setSending(false);
    }
  }, [cooldownRemaining, sending, t]);

  if (sent) {
    return (
      <div className="rounded-xl border border-[var(--color-success)]/50 bg-[var(--color-success)]/10 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-success)]/20">
            <svg
              className="h-5 w-5 text-[var(--color-success)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--color-text)]">
              {t("sent.title")}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {t.rich("sent.description", {
                email: () => <strong>{email}</strong>,
              })}
            </p>
            {error && (
              <p className="mt-2 text-sm text-[var(--color-error)]">{error}</p>
            )}
            <button
              onClick={handleResend}
              disabled={sending || cooldownRemaining > 0}
              className="mt-3 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? (
                t("banner.sending")
              ) : cooldownRemaining > 0 ? (
                t("sent.resendIn", { seconds: cooldownRemaining })
              ) : (
                t("sent.resendButton")
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-warning)]/50 bg-[var(--color-warning)]/10 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-warning)]/20">
          <svg
            className="h-5 w-5 text-[var(--color-warning)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-[var(--color-text)]">
            {t("banner.title")}
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {t.rich("banner.description", {
              email: () => <strong>{email}</strong>,
            })}
          </p>
          {error && (
            <p className="mt-2 text-sm text-[var(--color-error)]">{error}</p>
          )}
          <button
            onClick={handleResend}
            disabled={sending}
            className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t("banner.sending")}
              </span>
            ) : (
              t("banner.sendButton")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
