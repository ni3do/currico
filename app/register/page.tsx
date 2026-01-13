"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { content } from "@/lib/content";
import { isValidEmail } from "@/lib/validations/common";
import { DecorationBg } from "@/components/ui/DecorationBg";

const { common, registerPage } = content;

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      isValidEmail(formData.email) &&
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword &&
      formData.agreeToTerms
    );
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        if (response.ok) {
          const result = await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });
          if (result?.ok) {
            router.push("/account");
          } else {
            setError("Registrierung erfolgreich. Bitte melden Sie sich an.");
            router.push("/login");
          }
        } else {
          const data = await response.json();
          setError(data.error || "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.");
        }
      } catch {
        setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen geometric-bg relative flex flex-col">
      <DecorationBg />

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
        <div className="w-full max-w-lg">
          {/* Glass-morphic Card */}
          <div className="glass-card p-8 sm:p-10">
            {/* Title */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-[--text-heading]">{registerPage.title}</h1>
              <p className="mt-3 text-[--text-muted]">
                {registerPage.subtitle}
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-[--text-heading]"
                >
                  Vollständiger Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-3.5 text-[--text-heading] placeholder:text-[--text-light] focus:outline-none focus:border-[--primary] focus:ring-[3px] focus:ring-[--primary-light] transition-all"
                  placeholder="Maria Schmidt"
                />
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[--text-heading]"
                >
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className={`w-full rounded-[--radius-md] border bg-white px-4 py-3.5 text-[--text-heading] placeholder:text-[--text-light] focus:outline-none focus:ring-[3px] transition-all ${
                    formData.email && !isValidEmail(formData.email)
                      ? "border-[--error] focus:border-[--error] focus:ring-[--error-light]"
                      : "border-[--border] focus:border-[--primary] focus:ring-[--primary-light]"
                  }`}
                  placeholder="ihre.email@example.com"
                />
                {formData.email && !isValidEmail(formData.email) && (
                  <p className="mt-2 text-sm text-[--error] animate-fade-in">
                    Bitte geben Sie eine gültige E-Mail-Adresse ein
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-[--text-heading]"
                >
                  Passwort
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  className={`w-full rounded-[--radius-md] border bg-white px-4 py-3.5 text-[--text-heading] placeholder:text-[--text-light] focus:outline-none focus:ring-[3px] transition-all ${
                    formData.password && formData.password.length < 8
                      ? "border-[--error] focus:border-[--error] focus:ring-[--error-light]"
                      : "border-[--border] focus:border-[--primary] focus:ring-[--primary-light]"
                  }`}
                  placeholder="Mindestens 8 Zeichen"
                />
                {formData.password && formData.password.length < 8 && (
                  <p className="mt-2 text-sm text-[--error] animate-fade-in">
                    Passwort muss mindestens 8 Zeichen lang sein
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-[--text-heading]"
                >
                  Passwort bestätigen
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  className={`w-full rounded-[--radius-md] border bg-white px-4 py-3.5 text-[--text-heading] placeholder:text-[--text-light] focus:outline-none focus:ring-[3px] transition-all ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? "border-[--error] focus:border-[--error] focus:ring-[--error-light]"
                      : "border-[--border] focus:border-[--primary] focus:ring-[--primary-light]"
                  }`}
                  placeholder="Passwort wiederholen"
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-2 text-sm text-[--error] animate-fade-in">
                    Passwörter stimmen nicht überein
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                  required
                  className="mt-0.5 h-4 w-4 rounded border-[--border] text-[--primary] focus:ring-2 focus:ring-[--primary-light] cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-[--text-muted]">
                  Ich akzeptiere die{" "}
                  <Link href="/coming-soon" className="text-[--primary] hover:text-[--primary-hover] font-medium">
                    Allgemeinen Geschäftsbedingungen
                  </Link>{" "}
                  und die{" "}
                  <Link href="/coming-soon" className="text-[--primary] hover:text-[--primary-hover] font-medium">
                    Datenschutzerklärung
                  </Link>
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
                className="w-full rounded-[--radius-md] bg-[#DC2626] px-6 py-4 font-bold text-white text-center transition-all hover:-translate-y-0.5 hover:bg-[#B91C1C] hover:shadow-[0_8px_25px_rgba(220,38,38,0.35)] mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:hover:bg-[#DC2626]"
              >
                {isLoading ? "Wird registriert..." : "Registrieren"}
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
                    Oder registrieren mit
                  </span>
                </div>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => signIn("google")}
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
                Mit Google registrieren
              </button>

              <button
                type="button"
                onClick={() => signIn("azure-ad")}
                className="flex items-center justify-center gap-3 rounded-[--radius-md] bg-[--gray-100] px-4 py-3.5 text-[--text-heading] font-medium hover:bg-[--gray-200] transition-all"
              >
                <svg className="h-5 w-5" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                Mit Microsoft Office registrieren
              </button>
            </div>

            {/* Login Link */}
            <p className="mt-8 text-center text-[--text-muted]">
              Bereits registriert?{" "}
              <Link
                href="/login"
                className="font-semibold text-[--primary] hover:text-[--primary-hover] transition-colors"
              >
                Anmelden
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
