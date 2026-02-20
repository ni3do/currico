"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Mail, ArrowLeft, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPasswordPage");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSent(true);
      } else {
        const data = await response.json();
        setError(data.error || t("genericError"));
      }
    } catch {
      setError(t("networkError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 sm:p-10">
            {sent ? (
              <div className="text-center">
                <div className="bg-success/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <Check className="text-success h-6 w-6" />
                </div>
                <h1 className="text-text mb-2 text-2xl font-bold">{t("successTitle")}</h1>
                <p className="text-text-muted mb-6">
                  {t.rich("successMessage", {
                    email,
                    b: (chunks) => <strong>{chunks}</strong>,
                  })}
                </p>
                <Link href="/anmelden" className="btn-primary inline-block px-6 py-3">
                  {t("backToLogin")}
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                    <Mail className="text-primary h-6 w-6" />
                  </div>
                  <h1 className="text-text text-2xl font-bold">{t("title")}</h1>
                  <p className="text-text-muted mt-2">{t("subtitle")}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="text-text mb-2 block text-sm font-medium">
                      {t("emailLabel")}
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-border bg-surface text-text placeholder:text-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3.5 transition-all focus:ring-[3px] focus:outline-none"
                      placeholder={t("emailPlaceholder")}
                    />
                  </div>

                  {error && (
                    <div className="border-error bg-error/10 text-error rounded-lg border px-4 py-3 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="bg-primary text-text-on-accent hover:bg-primary-hover w-full rounded-lg px-6 py-3.5 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? t("submitting") : t("submit")}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/anmelden"
                    className="text-text-muted hover:text-primary inline-flex items-center gap-1 text-sm transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t("backToLogin")}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
