"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import { Lock, Check, AlertTriangle } from "lucide-react";

function ResetPasswordForm() {
  const t = useTranslations("resetPasswordPage");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const passwordValid = password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid || !passwordsMatch) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || t("genericError"));
      }
    } catch {
      setError(t("networkError"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <AlertTriangle className="text-warning mx-auto mb-4 h-12 w-12" />
        <h1 className="text-text mb-2 text-2xl font-bold">{t("invalidTitle")}</h1>
        <p className="text-text-muted mb-6">{t("invalidMessage")}</p>
        <Link href="/passwort-vergessen" className="btn-primary inline-block px-6 py-3">
          {t("requestNew")}
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 sm:p-10">
      {success ? (
        <div className="text-center">
          <div className="bg-success/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Check className="text-success h-6 w-6" />
          </div>
          <h1 className="text-text mb-2 text-2xl font-bold">{t("successTitle")}</h1>
          <p className="text-text-muted mb-6">{t("successMessage")}</p>
          <Link href="/anmelden" className="btn-primary inline-block px-6 py-3">
            {t("loginNow")}
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8 text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Lock className="text-primary h-6 w-6" />
            </div>
            <h1 className="text-text text-2xl font-bold">{t("title")}</h1>
            <p className="text-text-muted mt-2">{t("subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="text-text mb-2 block text-sm font-medium">
                {t("passwordLabel")}
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="border-border bg-surface text-text placeholder:text-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3.5 transition-all focus:ring-[3px] focus:outline-none"
                placeholder={t("passwordPlaceholder")}
              />
              {password && !passwordValid && (
                <p className="text-warning mt-1 text-xs">{t("requirements")}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirm" className="text-text mb-2 block text-sm font-medium">
                {t("confirmLabel")}
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-border bg-surface text-text placeholder:text-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3.5 transition-all focus:ring-[3px] focus:outline-none"
                placeholder={t("confirmPlaceholder")}
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-error mt-1 text-xs">{t("mismatch")}</p>
              )}
            </div>

            <label className="text-text-muted flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="accent-primary"
              />
              {t("showPassword")}
            </label>

            {error && (
              <div className="border-error bg-error/10 text-error rounded-lg border px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !passwordValid || !passwordsMatch}
              className="bg-primary text-text-on-accent hover:bg-primary-hover w-full rounded-lg px-6 py-3.5 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? t("submitting") : t("submit")}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Suspense
            fallback={
              <div className="glass-card flex items-center justify-center p-8">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
