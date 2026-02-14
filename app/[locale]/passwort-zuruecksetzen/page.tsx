"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import { Lock, Check, AlertTriangle } from "lucide-react";

export default function ResetPasswordPage() {
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
        setError(data.error || "Ein Fehler ist aufgetreten");
      }
    } catch {
      setError("Netzwerkfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <AlertTriangle className="text-warning mx-auto mb-4 h-12 w-12" />
            <h1 className="text-text mb-2 text-2xl font-bold">Ungültiger Link</h1>
            <p className="text-text-muted mb-6">Dieser Link ist ungültig oder abgelaufen.</p>
            <Link href="/passwort-vergessen" className="btn-primary inline-block px-6 py-3">
              Neuen Link anfordern
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 sm:p-10">
            {success ? (
              <div className="text-center">
                <div className="bg-success/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <Check className="text-success h-6 w-6" />
                </div>
                <h1 className="text-text mb-2 text-2xl font-bold">Passwort geändert</h1>
                <p className="text-text-muted mb-6">
                  Ihr Passwort wurde erfolgreich zurückgesetzt.
                </p>
                <Link href="/anmelden" className="btn-primary inline-block px-6 py-3">
                  Jetzt anmelden
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                    <Lock className="text-primary h-6 w-6" />
                  </div>
                  <h1 className="text-text text-2xl font-bold">Neues Passwort setzen</h1>
                  <p className="text-text-muted mt-2">
                    Wählen Sie ein sicheres Passwort für Ihr Konto.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="password" className="text-text mb-2 block text-sm font-medium">
                      Neues Passwort
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="border-border bg-surface text-text placeholder:text-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3.5 transition-all focus:ring-[3px] focus:outline-none"
                      placeholder="Mindestens 8 Zeichen"
                    />
                    {password && !passwordValid && (
                      <p className="text-warning mt-1 text-xs">
                        Gross-, Kleinbuchstaben und Zahlen erforderlich
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirm" className="text-text mb-2 block text-sm font-medium">
                      Passwort bestätigen
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirm"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="border-border bg-surface text-text placeholder:text-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3.5 transition-all focus:ring-[3px] focus:outline-none"
                      placeholder="Passwort wiederholen"
                    />
                    {confirmPassword && !passwordsMatch && (
                      <p className="text-error mt-1 text-xs">Passwörter stimmen nicht überein</p>
                    )}
                  </div>

                  <label className="text-text-muted flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="accent-primary"
                    />
                    Passwort anzeigen
                  </label>

                  {error && (
                    <div className="border-error bg-error/10 text-error rounded-lg border px-4 py-3 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !passwordValid || !passwordsMatch}
                    className="bg-primary text-text-on-accent hover:bg-primary-hover w-full rounded-lg px-6 py-3.5 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? "Wird gespeichert..." : "Passwort ändern"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
