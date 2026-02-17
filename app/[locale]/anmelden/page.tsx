"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { isValidEmail } from "@/lib/validations/common";
import { isValidCallbackUrl } from "@/lib/utils/login-redirect";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

const REMEMBER_EMAIL_KEY = "currico_remember_email";

function LoginPageContent() {
  const t = useTranslations("loginPage");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const oauthError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [capsLockOn, setCapsLockOn] = useState(false);

  // Restore remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Show OAuth-specific error messages
  useEffect(() => {
    if (!oauthError) return;
    const errorMap: Record<string, string> = {
      OAuthAccountNotLinked: t("errors.accountExistsWithDifferentProvider"),
      AccessDenied: t("errors.accessDenied"),
      OAuthCallback: t("errors.oauthError"),
      OAuthSignin: t("errors.oauthError"),
      OAuthCreateAccount: t("errors.oauthError"),
    };
    setError(errorMap[oauthError] || t("errors.oauthError"));
  }, [oauthError, t]);

  const handleCapsLock = (e: React.KeyboardEvent) => {
    setCapsLockOn(e.getModifierState("CapsLock"));
  };

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
        // Check for rate limit (429) — NextAuth returns a generic error,
        // but we can check the status code
        if (result.status === 429) {
          setError(t("errors.tooManyAttempts"));
        } else {
          setError(t("errors.invalidCredentials"));
        }
      } else {
        // Save or clear remembered email
        if (rememberMe) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, email);
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }

        // Fetch user role to determine redirect
        const validCallback = callbackUrl && isValidCallbackUrl(callbackUrl) ? callbackUrl : null;
        const userResponse = await fetch("/api/user/me");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.role === "ADMIN" && !validCallback) {
            router.push("/admin");
          } else {
            router.push(validCallback || "/konto");
          }
        } else {
          router.push(validCallback || "/konto");
        }
      }
    } catch {
      setError(t("errors.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      {/* Main Content - Centered Glass Card */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <Link
            href="/"
            className="text-text-muted hover:text-primary mb-4 inline-flex items-center text-sm font-medium transition-colors"
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

          {/* Glass-morphic Card */}
          <div className="glass-card p-8 sm:p-10">
            {/* Title */}
            <div className="mb-8 text-center">
              <h1 className="text-text text-2xl font-bold sm:text-3xl">{t("title")}</h1>
              <p className="text-text-muted mt-3">{t("subtitle")}</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="text-text mb-2 block text-sm font-medium">
                  {t("form.emailLabel")}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className={`bg-surface text-text placeholder:text-text-muted w-full rounded-lg border px-4 py-3.5 transition-all focus:ring-[3px] focus:outline-none ${
                    email && !isValidEmail(email)
                      ? "border-error focus:border-error focus:ring-error/20"
                      : "border-border focus:border-primary focus:ring-primary/20"
                  }`}
                  placeholder={t("form.emailPlaceholder")}
                />
                {email && !isValidEmail(email) && (
                  <p className="animate-fade-in text-error mt-2 text-sm">{t("form.emailError")}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="text-text text-sm font-medium">
                    {t("form.passwordLabel")}
                  </label>
                  <Link
                    href="/passwort-vergessen"
                    className="text-primary hover:text-primary-hover text-sm font-medium transition-colors"
                  >
                    {t("form.forgotPassword")}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleCapsLock}
                    onKeyUp={handleCapsLock}
                    autoComplete="current-password"
                    required
                    className="border-border bg-surface text-text placeholder:text-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3.5 pr-12 transition-all focus:ring-[3px] focus:outline-none"
                    placeholder={t("form.passwordPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-text-muted hover:text-text absolute top-1/2 right-3 -translate-y-1/2 p-1 transition-colors"
                    aria-label={
                      showPassword
                        ? tCommon("buttons.hidePassword")
                        : tCommon("buttons.showPassword")
                    }
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {/* CapsLock Warning */}
                {capsLockOn && (
                  <p className="animate-fade-in text-warning mt-2 flex items-center gap-1.5 text-sm">
                    <svg
                      className="h-4 w-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    {t("form.capsLockWarning")}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="border-border text-primary focus:ring-primary/20 h-4 w-4 cursor-pointer rounded focus:ring-2"
                />
                <label htmlFor="remember" className="text-text-muted ml-2.5 cursor-pointer text-sm">
                  {t("form.rememberMe")}
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="animate-fade-in border-error bg-error/10 text-error rounded-lg border px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-text-on-accent hover:bg-primary-hover disabled:hover:bg-primary w-full rounded-lg px-6 py-3.5 text-center font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isLoading ? t("form.submitting") : t("form.submitButton")}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="border-border w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-surface/90 text-text-muted px-4">{t("divider")}</span>
                </div>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: callbackUrl || "/konto" })}
                className="bg-surface text-text hover:bg-surface-elevated flex items-center justify-center gap-3 rounded-lg px-4 py-3.5 font-medium transition-all"
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
            <p className="text-text-muted mt-8 text-center">
              {t("register.prompt")}{" "}
              <Link
                href="/registrieren"
                className="text-primary hover:text-primary-hover font-semibold transition-colors"
              >
                {t("register.link")}
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
