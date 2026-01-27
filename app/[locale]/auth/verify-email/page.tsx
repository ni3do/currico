"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";

type VerificationStatus = "loading" | "success" | "already-verified" | "error";

export default function VerifyEmailPage() {
  const t = useTranslations("verifyEmailPage");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setStatus("error");
        setErrorMessage(t("errors.missingToken"));
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          if (data.alreadyVerified) {
            setStatus("already-verified");
          } else {
            setStatus("success");
          }
        } else {
          setStatus("error");
          switch (data.code) {
            case "INVALID_TOKEN":
              setErrorMessage(t("errors.invalidToken"));
              break;
            case "TOKEN_EXPIRED":
              setErrorMessage(t("errors.tokenExpired"));
              break;
            default:
              setErrorMessage(t("errors.generic"));
          }
        }
      } catch {
        setStatus("error");
        setErrorMessage(t("errors.generic"));
      }
    }

    verifyEmail();
  }, [token, t]);

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 sm:p-10">
            {status === "loading" && (
              <div className="text-center">
                <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
                <h1 className="text-text text-2xl font-bold">{t("loading.title")}</h1>
                <p className="text-text-muted mt-2">{t("loading.message")}</p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center">
                <div className="bg-success/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <svg
                    className="text-success h-8 w-8"
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
                <h1 className="text-text text-2xl font-bold">{t("success.title")}</h1>
                <p className="text-text-muted mt-2">{t("success.message")}</p>
                <Link
                  href="/account"
                  className="bg-primary text-text-on-accent hover:bg-primary-hover mt-6 inline-block w-full rounded-lg px-6 py-3 font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {t("success.dashboardButton")}
                </Link>
              </div>
            )}

            {status === "already-verified" && (
              <div className="text-center">
                <div className="bg-primary/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <svg
                    className="text-primary h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-text text-2xl font-bold">{t("alreadyVerified.title")}</h1>
                <p className="text-text-muted mt-2">{t("alreadyVerified.message")}</p>
                <Link
                  href="/account"
                  className="bg-primary text-text-on-accent hover:bg-primary-hover mt-6 inline-block w-full rounded-lg px-6 py-3 font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {t("alreadyVerified.dashboardButton")}
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="text-center">
                <div className="bg-error/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <svg
                    className="text-error h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h1 className="text-text text-2xl font-bold">{t("error.title")}</h1>
                <p className="text-text-muted mt-2">{errorMessage}</p>
                <Link
                  href="/login"
                  className="bg-primary text-text-on-accent hover:bg-primary-hover mt-6 inline-block w-full rounded-lg px-6 py-3 font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {t("error.loginButton")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 px-6 py-6 sm:px-8">
        <Link
          href="/"
          className="text-text-muted hover:text-primary inline-flex items-center text-sm font-medium transition-colors"
        >
          <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {tCommon("buttons.backToHome")}
        </Link>
      </footer>
    </div>
  );
}
