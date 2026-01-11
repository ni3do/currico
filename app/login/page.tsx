"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { content } from "@/lib/content";

const { common, loginPage } = content;

export default function LoginPage() {
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
        setError("Ungültige E-Mail-Adresse oder Passwort");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="min-h-screen geometric-bg relative flex flex-col">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[--primary] opacity-[0.03] blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[--accent] opacity-[0.03] blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[--primary] opacity-[0.02] blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-[--primary] rounded-[--radius-md]">
            <span className="text-white font-bold text-lg">{common.brand.logoText}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-[--text-heading] leading-tight">{common.brand.name}</span>
            <span className="text-xs text-[--text-muted] leading-tight">{common.brand.tagline}</span>
          </div>
        </Link>
      </header>

      {/* Main Content - Centered Glass Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          {/* Glass-morphic Card */}
          <div className="glass-card p-8 sm:p-10">
            {/* Title */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-[--text-heading]">{loginPage.title}</h1>
              <p className="mt-3 text-[--text-muted]">
                {loginPage.subtitle}
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[--text-heading]"
                >
                  {loginPage.form.emailLabel}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full rounded-[--radius-md] border bg-white px-4 py-3.5 text-[--text-heading] placeholder:text-[--text-light] focus:outline-none focus:ring-[3px] transition-all ${
                    email && !isValidEmail(email)
                      ? "border-[--error] focus:border-[--error] focus:ring-[--error-light]"
                      : "border-[--border] focus:border-[--primary] focus:ring-[--primary-light]"
                  }`}
                  placeholder={loginPage.form.emailPlaceholder}
                />
                {email && !isValidEmail(email) && (
                  <p className="mt-2 text-sm text-[--error] animate-fade-in">
                    {loginPage.form.emailError}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[--text-heading]"
                  >
                    {loginPage.form.passwordLabel}
                  </label>
                  <a
                    href="#"
                    className="text-sm text-[--primary] hover:text-[--primary-hover] transition-colors font-medium"
                  >
                    {loginPage.form.forgotPassword}
                  </a>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-3.5 text-[--text-heading] placeholder:text-[--text-light] focus:outline-none focus:border-[--primary] focus:ring-[3px] focus:ring-[--primary-light] transition-all"
                  placeholder={loginPage.form.passwordPlaceholder}
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-[--border] text-[--primary] focus:ring-2 focus:ring-[--primary-light] cursor-pointer"
                />
                <label
                  htmlFor="remember"
                  className="ml-2.5 text-sm text-[--text-muted] cursor-pointer"
                >
                  {loginPage.form.rememberMe}
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-[--radius-md] bg-[--error-light] border border-[--error] px-4 py-3 text-sm text-[--error] animate-fade-in">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-[--radius-md] bg-[--primary] px-6 py-3.5 font-semibold text-white hover:bg-[--primary-hover] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,82,204,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isLoading ? "Wird angemeldet..." : loginPage.form.submitButton}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[--border]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white/90 px-4 text-[--text-muted]">
                    {loginPage.divider}
                  </span>
                </div>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid gap-3">
              <button
                className="flex items-center justify-center gap-3 rounded-[--radius-md] bg-[--gray-100] px-4 py-3.5 text-[--text-heading] font-medium hover:bg-[--gray-200] transition-all"
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
                {loginPage.oauth.google}
              </button>

              <button
                className="flex items-center justify-center gap-3 rounded-[--radius-md] bg-[--gray-100] px-4 py-3.5 text-[--text-heading] font-medium hover:bg-[--gray-200] transition-all"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                {loginPage.oauth.github}
              </button>
            </div>

            {/* Register Link */}
            <p className="mt-8 text-center text-[--text-muted]">
              {loginPage.register.prompt}{" "}
              <Link
                href="/register"
                className="font-semibold text-[--primary] hover:text-[--primary-hover] transition-colors"
              >
                {loginPage.register.link}
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-[--text-muted] hover:text-[--primary] transition-colors font-medium"
        >
          <svg className="mr-1.5 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {common.buttons.backToHome}
        </Link>
      </footer>
    </div>
  );
}
