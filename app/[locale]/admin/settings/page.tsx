"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [commissionRate, setCommissionRate] = useState("15");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">Plattform-Einstellungen</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Verwalten Sie globale Einstellungen der Plattform
        </p>
      </div>

      {/* Commission Settings */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <h2 className="mb-6 text-xl font-semibold text-[var(--color-text)]">
          Provisionseinstellungen
        </h2>

        <div className="space-y-6">
          {/* Commission Rate */}
          <div>
            <label
              htmlFor="commissionRate"
              className="mb-2 block text-sm font-medium text-[var(--color-text)]"
            >
              Plattform-Provisionsrate (%)
            </label>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="w-full max-w-xs sm:w-auto sm:flex-1">
                <div className="relative">
                  <input
                    type="number"
                    id="commissionRate"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    min="0"
                    max="100"
                    step="0.5"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 pr-12 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none"
                  />
                  <span className="absolute top-1/2 right-4 -translate-y-1/2 text-[var(--color-text-muted)]">
                    %
                  </span>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full rounded-xl bg-[var(--color-primary)] px-6 py-3 font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50 sm:w-auto"
              >
                {isSaving ? "Wird gespeichert..." : "Provisionsrate aktualisieren"}
              </button>
            </div>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Dieser Prozentsatz wird von jedem Verkauf abgezogen. Der Rest geht an den Verkäufer.
            </p>
          </div>

          {/* Explanation Card */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
            <h3 className="mb-3 font-semibold text-[var(--color-text)]">Wie funktioniert es?</h3>
            <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <p>
                <strong className="text-[var(--color-text)]">Beispiel:</strong> Bei einem
                Verkaufspreis von CHF 20.00 und {commissionRate}% Provision:
              </p>
              <div className="ml-4 space-y-1">
                <p>
                  Plattformgebühr: CHF {((20 * parseFloat(commissionRate)) / 100).toFixed(2)} (
                  {commissionRate}%)
                </p>
                <p>
                  Verkäufer erhält: CHF {(20 - (20 * parseFloat(commissionRate)) / 100).toFixed(2)}{" "}
                  ({100 - parseFloat(commissionRate)}%)
                </p>
              </div>
            </div>
          </div>

          {/* Current Impact */}
          <div className="rounded-xl border border-[var(--ctp-blue)]/30 bg-[var(--ctp-blue)]/10 p-6">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 flex-shrink-0 text-[var(--ctp-blue)]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm">
                <strong className="text-[var(--color-text)]">Hinweis:</strong>
                <p className="mt-1 text-[var(--color-text-muted)]">
                  Änderungen an der Provisionsrate gelten sofort für alle neuen Transaktionen.
                  Bereits abgeschlossene Transaktionen bleiben unverändert.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Account Settings */}
      <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <h2 className="mb-6 text-xl font-semibold text-[var(--color-text)]">Konto-Einstellungen</h2>

        <div className="space-y-6">
          {/* Admin Info */}
          <div className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--ctp-mauve)] to-[var(--ctp-pink)]">
              <span className="text-lg font-bold text-white">
                {(session?.user?.name || "A").charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-[var(--color-text)]">
                {session?.user?.name || "Admin"}
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">{session?.user?.email}</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--ctp-mauve)]/20 px-2 py-0.5 text-xs font-medium text-[var(--ctp-mauve)]">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Administrator
              </span>
            </div>
          </div>

          {/* Appearance Settings */}
          <div>
            <h3 className="mb-3 font-semibold text-[var(--color-text)]">Darstellung</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--color-text-muted)]">Theme:</span>
                <ThemeToggle />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--color-text-muted)]">Sprache:</span>
                <LocaleSwitcher />
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-[var(--color-border)] pt-4">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 rounded-xl border border-[var(--color-error)] px-4 py-2 text-[var(--color-error)] transition-colors hover:bg-[var(--badge-error-bg)]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
