"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import { Mail, ArrowLeft, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const t = useTranslations("common");
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
        setError(data.error || "Ein Fehler ist aufgetreten");
      }
    } catch {
      setError("Netzwerkfehler. Bitte versuchen Sie es erneut.");
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
                <h1 className="text-text mb-2 text-2xl font-bold">E-Mail gesendet</h1>
                <p className="text-text-muted mb-6">
                  Falls ein Konto mit <strong>{email}</strong> existiert, erhalten Sie in Kürze
                  einen Link zum Zurücksetzen Ihres Passworts.
                </p>
                <Link href="/anmelden" className="btn-primary inline-block px-6 py-3">
                  Zurück zur Anmeldung
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                    <Mail className="text-primary h-6 w-6" />
                  </div>
                  <h1 className="text-text text-2xl font-bold">Passwort vergessen?</h1>
                  <p className="text-text-muted mt-2">
                    Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum
                    Zurücksetzen.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="text-text mb-2 block text-sm font-medium">
                      E-Mail-Adresse
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-border bg-surface text-text placeholder:text-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3.5 transition-all focus:ring-[3px] focus:outline-none"
                      placeholder="ihre@email.ch"
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
                    className="bg-primary text-text-on-accent hover:bg-primary-hover w-full rounded-lg px-6 py-3.5 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? "Wird gesendet..." : "Link senden"}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/anmelden"
                    className="text-text-muted hover:text-primary inline-flex items-center gap-1 text-sm transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Zurück zur Anmeldung
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
