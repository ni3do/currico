"use client";

import { useState } from "react";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

export default function AdminSettingsPage() {
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
    <div className="min-h-screen bg-[var(--color-bg)]">
      <TopBar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-xs">
                  <div className="relative">
                    <input
                      type="number"
                      id="commissionRate"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(e.target.value)}
                      min="0"
                      max="100"
                      step="0.5"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 pr-12 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                      %
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-success)] px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-[var(--color-primary)]/20 disabled:opacity-50"
                >
                  {isSaving ? "Wird gespeichert..." : "Provisionsrate aktualisieren"}
                </button>
              </div>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Dieser Prozentsatz wird von jedem Verkauf abgezogen. Der Rest geht an
                den Verkäufer.
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
                    • Plattformgebühr: CHF{" "}
                    {((20 * parseFloat(commissionRate)) / 100).toFixed(2)} (
                    {commissionRate}%)
                  </p>
                  <p>
                    • Verkäufer erhält: CHF{" "}
                    {(20 - (20 * parseFloat(commissionRate)) / 100).toFixed(2)} (
                    {100 - parseFloat(commissionRate)}%)
                  </p>
                </div>
              </div>
            </div>

            {/* Current Impact */}
            <div className="rounded-xl border border-[var(--color-info)]/30 bg-[var(--color-info)]/10 p-6">
              <div className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-[var(--color-info)]"
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
                    Änderungen an der Provisionsrate gelten sofort für alle neuen
                    Transaktionen. Bereits abgeschlossene Transaktionen bleiben
                    unverändert.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Settings (Placeholder) */}
        <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
          <h2 className="mb-6 text-xl font-semibold text-[var(--color-text)]">
            Weitere Einstellungen
          </h2>
          <p className="text-[var(--color-text-muted)]">
            Zusätzliche Plattform-Einstellungen werden hier angezeigt.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
