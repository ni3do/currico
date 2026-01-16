"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { isValidEmail } from "@/lib/validations/common";
import TopBar from "@/components/ui/TopBar";

export default function LoginPage() {
  const t = useTranslations("loginPage");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(t("errors.invalidCredentials"));
      } else {
        // Fetch user role to determine redirect
        const userResponse = await fetch("/api/user/me");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.role === "ADMIN") {
            router.push("/admin");
          } else {
            router.push("/account");
          }
        } else {
          router.push("/account");
        }
      }
    } catch {
      setError(t("errors.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      {/* Main Content - Centered Glass Card */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          {/* Glass-morphic Card */}
          <div className="glass-card p-8 sm:p-10">
            {/* Title */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-[var(--color-text)]">{t("title")}</h1>
              <p className="mt-3 text-[var(--color-text-muted)]">{t("subtitle")}</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                >
                  {t("form.emailLabel")}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full rounded-lg border bg-[var(--color-surface)] px-4 py-3.5 text-[var(--color-text)] transition-all placeholder:text-[var(--color-text-muted)] focus:ring-[3px] focus:outline-none ${
                    email && !isValidEmail(email)
                      ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20"
                      : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20"
                  }`}
                  placeholder={t("form.emailPlaceholder")}
                />
                {email && !isValidEmail(email) && (
                  <p className="animate-fade-in mt-2 text-sm text-[var(--color-error)]">
                    {t("form.emailError")}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[var(--color-text)]"
                  >
                    {t("form.passwordLabel")}
                  </label>
                  <Link
                    href="/coming-soon"
                    className="text-sm font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-hover)]"
                  >
                    {t("form.forgotPassword")}
                  </Link>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-[var(--color-text)] transition-all placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary)]/20 focus:outline-none"
                  placeholder={t("form.passwordPlaceholder")}
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 cursor-pointer rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
                <label
                  htmlFor="remember"
                  className="ml-2.5 cursor-pointer text-sm text-[var(--color-text-muted)]"
                >
                  {t("form.rememberMe")}
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="animate-fade-in rounded-lg border border-[var(--color-error)] bg-[var(--badge-error-bg)] px-4 py-3 text-sm text-[var(--color-error)]">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-[var(--color-primary)] px-6 py-3.5 text-center font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--color-primary-hover)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-[var(--color-primary)] disabled:hover:shadow-none"
              >
                {isLoading ? t("form.submitting") : t("form.submitButton")}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--color-border)]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[var(--color-surface)]/90 px-4 text-[var(--color-text-muted)]">
                    {t("divider")}
                  </span>
                </div>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => signIn("google")}
                className="flex items-center justify-center gap-3 rounded-lg bg-[var(--color-surface)] px-4 py-3.5 font-medium text-[var(--color-text)] transition-all hover:bg-[var(--color-surface-elevated)]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t("oauth.google")}
              </button>
            </div>

            {/* Register Link */}
            <p className="mt-8 text-center text-[var(--color-text-muted)]">
              {t("register.prompt")}{" "}
              <Link
                href="/register"
                className="font-semibold text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-hover)]"
              >
                {t("register.link")}
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
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
