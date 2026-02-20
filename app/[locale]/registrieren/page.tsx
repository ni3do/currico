"use client";

import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import {
  isValidEmail,
  isCommonPassword,
  checkPasswordRequirements,
} from "@/lib/validations/common";
import { getLoginUrl } from "@/lib/utils/login-redirect";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function RegisterPage() {
  const t = useTranslations("registerPage");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    website: "", // honeypot field — hidden from real users, filled by bots
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  // Post-registration email confirmation state
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  const isFormValid = () => {
    const reqs = checkPasswordRequirements(formData.password);
    const allReqsMet = reqs.every((r) => r.met);
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      isValidEmail(formData.email) &&
      allReqsMet &&
      !isCommonPassword(formData.password) &&
      formData.password === formData.confirmPassword &&
      formData.agreeToTerms
    );
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCapsLock = (e: React.KeyboardEvent) => {
    setCapsLockOn(e.getModifierState("CapsLock"));
  };

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
            website: formData.website,
          }),
        });

        if (response.ok) {
          const result = await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });
          if (result?.ok) {
            // Trigger verification email
            fetch("/api/auth/send-verification", { method: "POST" }).catch(() => {});
            // Show email confirmation screen
            setRegisteredEmail(formData.email);
            setRegistrationComplete(true);
          } else {
            setError(t("errors.registrationSuccess"));
            router.push(getLoginUrl(callbackUrl || undefined));
          }
        } else {
          const data = await response.json();
          setError(data.error || t("errors.registrationFailed"));
        }
      } catch {
        setError(t("errors.generic"));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResendVerification = useCallback(async () => {
    if (resendState === "sending") return;
    setResendState("sending");
    try {
      await fetch("/api/auth/send-verification", { method: "POST" });
      setResendState("sent");
    } catch {
      setResendState("idle");
    }
  }, [resendState]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Post-registration email confirmation screen
  if (registrationComplete) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-lg">
            <div className="glass-card p-8 sm:p-10">
              <div className="text-center">
                {/* Mail icon */}
                <div className="bg-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                  <svg
                    className="text-primary h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <h1 className="text-text text-2xl font-bold sm:text-3xl">{t("emailSent.title")}</h1>
                <h2 className="text-text-muted mt-2 text-lg">{t("emailSent.subtitle")}</h2>

                <p
                  className="text-text-muted mt-4 text-sm"
                  dangerouslySetInnerHTML={{
                    __html: t("emailSent.description", { email: registeredEmail }),
                  }}
                />

                <p className="text-text-muted mt-3 text-xs">{t("emailSent.checkSpam")}</p>

                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => router.push(callbackUrl || "/konto")}
                    className="bg-primary text-text-on-accent hover:bg-primary-hover w-full rounded-lg px-6 py-3.5 font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {t("emailSent.continueButton")}
                  </button>

                  <button
                    onClick={() => router.push("/hochladen")}
                    className="border-border bg-surface text-text hover:bg-surface-elevated w-full rounded-lg border px-6 py-3.5 font-semibold transition-all"
                  >
                    {t("emailSent.uploadButton")}
                  </button>

                  <button
                    onClick={handleResendVerification}
                    disabled={resendState === "sending" || resendState === "sent"}
                    className="text-primary hover:text-primary-hover w-full text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {resendState === "sending"
                      ? t("emailSent.resending")
                      : resendState === "sent"
                        ? t("emailSent.resent")
                        : t("emailSent.resendButton")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      {/* Main Content - Centered Glass Card */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-lg">
          {/* Glass-morphic Card */}
          <div className="glass-card p-8 sm:p-10">
            {/* Title */}
            <div className="mb-8 text-center">
              <h1 className="text-text text-2xl font-bold sm:text-3xl">{t("title")}</h1>
              <p className="text-text-muted mt-3">{t("subtitle")}</p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="text-text mb-2 block text-sm font-medium">
                  {t("form.nameLabel")}
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  autoComplete="name"
                  required
                  className="border-border bg-surface text-text placeholder:text-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3.5 transition-all focus:ring-[3px] focus:outline-none"
                  placeholder={t("form.namePlaceholder")}
                />
              </div>

              {/* Honeypot — invisible to real users, catches bots */}
              <div className="absolute left-[-9999px]" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="text-text mb-2 block text-sm font-medium">
                  {t("form.emailLabel")}
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  autoComplete="email"
                  required
                  className={`bg-surface text-text placeholder:text-text-muted w-full rounded-lg border px-4 py-3.5 transition-all focus:ring-[3px] focus:outline-none ${
                    formData.email && !isValidEmail(formData.email)
                      ? "border-error focus:border-error focus:ring-error/20"
                      : "border-border focus:border-primary focus:ring-primary/20"
                  }`}
                  placeholder={t("form.emailPlaceholder")}
                />
                {formData.email && !isValidEmail(formData.email) && (
                  <p className="animate-fade-in text-error mt-2 text-sm">{t("form.emailError")}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="text-text mb-2 block text-sm font-medium">
                  {t("form.passwordLabel")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onKeyDown={handleCapsLock}
                    onKeyUp={handleCapsLock}
                    autoComplete="new-password"
                    required
                    className={`bg-surface text-text placeholder:text-text-muted w-full rounded-lg border px-4 py-3.5 pr-12 transition-all focus:ring-[3px] focus:outline-none ${
                      formData.password &&
                      formData.password.length > 0 &&
                      formData.password.length < 8
                        ? "border-error focus:border-error focus:ring-error/20"
                        : "border-border focus:border-primary focus:ring-primary/20"
                    }`}
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
                {/* Password requirements + strength meter */}
                <PasswordRequirements password={formData.password} />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-text mb-2 block text-sm font-medium"
                >
                  {t("form.confirmPasswordLabel")}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    onKeyDown={handleCapsLock}
                    onKeyUp={handleCapsLock}
                    autoComplete="new-password"
                    required
                    className={`bg-surface text-text placeholder:text-text-muted w-full rounded-lg border px-4 py-3.5 pr-12 transition-all focus:ring-[3px] focus:outline-none ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? "border-error focus:border-error focus:ring-error/20"
                        : "border-border focus:border-primary focus:ring-primary/20"
                    }`}
                    placeholder={t("form.confirmPasswordPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-text-muted hover:text-text absolute top-1/2 right-3 -translate-y-1/2 p-1 transition-colors"
                    aria-label={
                      showConfirmPassword
                        ? tCommon("buttons.hidePassword")
                        : tCommon("buttons.showPassword")
                    }
                  >
                    {showConfirmPassword ? (
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
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="animate-fade-in text-error mt-2 text-sm">
                    {t("form.confirmPasswordError")}
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
                  className="border-border text-primary focus:ring-primary/20 mt-0.5 h-4 w-4 cursor-pointer rounded focus:ring-2"
                />
                <label htmlFor="terms" className="text-text-muted text-sm">
                  {t("form.termsText")}{" "}
                  <Link href="/agb" className="text-primary hover:text-primary-hover font-medium">
                    {t("form.termsLink")}
                  </Link>{" "}
                  {t("form.termsAnd")}{" "}
                  <Link
                    href="/datenschutz"
                    className="text-primary hover:text-primary-hover font-medium"
                  >
                    {t("form.privacyLink")}
                  </Link>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="animate-fade-in border-error bg-error/10 text-error rounded-lg border px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <MagneticButton className="mt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary text-text-on-accent hover:bg-primary-hover disabled:hover:bg-primary w-full rounded-lg px-6 py-4 text-center font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {isLoading ? t("form.submitting") : t("form.submitButton")}
                </button>
              </MagneticButton>
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

            {/* Login Link */}
            <p className="text-text-muted mt-8 text-center">
              {t("login.prompt")}{" "}
              <Link
                href={getLoginUrl(callbackUrl || undefined)}
                className="text-primary hover:text-primary-hover font-semibold transition-colors"
              >
                {t("login.link")}
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
