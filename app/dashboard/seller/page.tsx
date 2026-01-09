"use client";

import { useState } from "react";

// Mock data
const mockStats = {
  netEarnings: "CHF 1,248.50",
  totalDownloads: 342,
  followers: 28,
};

const mockResources = [
  {
    id: 1,
    title: "Bruchrechnen Übungsblätter",
    type: "Resource",
    status: "Verified",
    downloads: 87,
    netEarnings: "CHF 348.00",
  },
  {
    id: 2,
    title: "Mathematik Spiele Bundle",
    type: "Bundle",
    status: "AI-Checked",
    downloads: 45,
    netEarnings: "CHF 562.50",
  },
  {
    id: 3,
    title: "Geometrie Arbeitsblätter",
    type: "Resource",
    status: "Verified",
    downloads: 103,
    netEarnings: "CHF 206.00",
  },
  {
    id: 4,
    title: "Kopfrechnen Training",
    type: "Resource",
    status: "Pending",
    downloads: 0,
    netEarnings: "CHF 0.00",
  },
];

const mockTransactions = [
  {
    id: 1,
    resource: "Bruchrechnen Übungsblätter",
    date: "2026-01-08",
    gross: "CHF 12.00",
    platformFee: "CHF 1.80",
    sellerPayout: "CHF 10.20",
  },
  {
    id: 2,
    resource: "Mathematik Spiele Bundle",
    date: "2026-01-07",
    gross: "CHF 25.00",
    platformFee: "CHF 3.75",
    sellerPayout: "CHF 21.25",
  },
  {
    id: 3,
    resource: "Geometrie Arbeitsblätter",
    date: "2026-01-06",
    gross: "CHF 8.00",
    platformFee: "CHF 1.20",
    sellerPayout: "CHF 6.80",
  },
];

export default function SellerDashboardPage() {
  const [activeView, setActiveView] = useState<"resources" | "transactions">("resources");

  return (
    <div className="min-h-screen bg-[--background]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[--border] bg-[--surface]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <a href="/" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[--primary] to-[--secondary]">
                  <span className="text-xl font-bold text-[--background]">EL</span>
                </div>
                <span className="text-xl font-bold text-[--text]">Easy Lehrer</span>
              </a>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a
                href="/resources"
                className="text-[--text-muted] hover:text-[--text] transition-colors"
              >
                Ressourcen
              </a>
              <a
                href="/dashboard/seller"
                className="text-[--primary] font-medium transition-colors"
              >
                Dashboard
              </a>
              <a
                href="/profile"
                className="text-[--text-muted] hover:text-[--text] transition-colors"
              >
                Profil
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <a
                href="/profile"
                className="flex items-center gap-2 rounded-full border-2 border-[--primary] px-4 py-2 font-medium text-[--primary] transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] text-xs font-bold text-[--background]">
                  M
                </div>
                <span className="hidden sm:inline">Maria</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[--text]">Verkäufer Dashboard</h1>
          <p className="mt-2 text-[--text-muted]">
            Verwalten Sie Ihre Ressourcen und überwachen Sie Ihre Verkäufe
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          {/* Net Earnings */}
          <div className="rounded-2xl border border-[--border] bg-[--surface] p-6">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-[--primary] to-[--sapphire] p-2">
                <svg
                  className="h-6 w-6 text-[--background]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-[--text-muted]">
                Netto-Einnahmen
              </h3>
            </div>
            <div className="text-3xl font-bold text-[--text]">
              {mockStats.netEarnings}
            </div>
            <p className="mt-1 text-sm text-[--text-muted]">Nach Plattformgebühr</p>
          </div>

          {/* Total Downloads */}
          <div className="rounded-2xl border border-[--border] bg-[--surface] p-6">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-[--secondary] to-[--pink] p-2">
                <svg
                  className="h-6 w-6 text-[--background]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-[--text-muted]">
                Downloads
              </h3>
            </div>
            <div className="text-3xl font-bold text-[--text]">
              {mockStats.totalDownloads}
            </div>
            <p className="mt-1 text-sm text-[--text-muted]">Alle Ressourcen</p>
          </div>

          {/* Followers */}
          <div className="rounded-2xl border border-[--border] bg-[--surface] p-6">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-[--accent] to-[--flamingo] p-2">
                <svg
                  className="h-6 w-6 text-[--background]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-[--text-muted]">Follower</h3>
            </div>
            <div className="text-3xl font-bold text-[--text]">
              {mockStats.followers}
            </div>
            <p className="mt-1 text-sm text-[--text-muted]">Folgen Ihnen</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          <a
            href="/upload"
            className="rounded-xl bg-gradient-to-r from-[--primary] to-[--secondary] px-6 py-3 font-semibold text-[--background] hover:opacity-90 transition-opacity shadow-lg shadow-[--primary]/20"
          >
            + Neue Ressource hochladen
          </a>
          <a
            href="/upload/bundle"
            className="rounded-xl border border-[--border] bg-[--surface] px-6 py-3 font-semibold text-[--text] hover:bg-[--surface1] transition-colors"
          >
            + Bundle erstellen
          </a>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex gap-4 border-b border-[--border]">
          <button
            onClick={() => setActiveView("resources")}
            className={`pb-4 text-sm font-medium transition-colors ${
              activeView === "resources"
                ? "border-b-2 border-[--primary] text-[--primary]"
                : "text-[--text-muted] hover:text-[--text]"
            }`}
          >
            Meine Ressourcen
          </button>
          <button
            onClick={() => setActiveView("transactions")}
            className={`pb-4 text-sm font-medium transition-colors ${
              activeView === "transactions"
                ? "border-b-2 border-[--primary] text-[--primary]"
                : "text-[--text-muted] hover:text-[--text]"
            }`}
          >
            Transaktionen
          </button>
        </div>

        {/* Resources View */}
        {activeView === "resources" && (
          <div className="rounded-2xl border border-[--border] bg-[--surface] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[--background]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text]">
                      Titel
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text]">
                      Typ
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[--text]">
                      Downloads
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[--text]">
                      Einnahmen
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[--text]">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border]">
                  {mockResources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-[--background] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-[--text]">{resource.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-[--background] px-3 py-1 text-xs font-medium text-[--text]">
                          {resource.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            resource.status === "Verified"
                              ? "bg-[--green]/20 text-[--green]"
                              : resource.status === "AI-Checked"
                              ? "bg-[--sapphire]/20 text-[--sapphire]"
                              : "bg-[--yellow]/20 text-[--yellow]"
                          }`}
                        >
                          {resource.status === "Verified"
                            ? "✓ Verifiziert"
                            : resource.status === "AI-Checked"
                            ? "KI-Geprüft"
                            : "Ausstehend"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-[--text]">
                        {resource.downloads}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-[--primary]">
                        {resource.netEarnings}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="rounded-lg border border-[--border] px-3 py-1 text-sm text-[--text] hover:bg-[--surface1] transition-colors">
                            Bearbeiten
                          </button>
                          <a
                            href={`/resources/${resource.id}`}
                            className="rounded-lg border border-[--border] px-3 py-1 text-sm text-[--text] hover:bg-[--surface1] transition-colors"
                          >
                            Ansehen
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions View */}
        {activeView === "transactions" && (
          <div className="rounded-2xl border border-[--border] bg-[--surface] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[--background]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text]">
                      Ressource
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text]">
                      Datum
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[--text]">
                      Bruttopreis
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[--text]">
                      Plattformgebühr
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[--text]">
                      Ihre Auszahlung
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border]">
                  {mockTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-[--background] transition-colors">
                      <td className="px-6 py-4 font-medium text-[--text]">
                        {transaction.resource}
                      </td>
                      <td className="px-6 py-4 text-[--text-muted]">
                        {new Date(transaction.date).toLocaleDateString("de-CH")}
                      </td>
                      <td className="px-6 py-4 text-right text-[--text]">
                        {transaction.gross}
                      </td>
                      <td className="px-6 py-4 text-right text-[--red]">
                        -{transaction.platformFee}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-[--green]">
                        {transaction.sellerPayout}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-[--border] bg-[--surface]/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-[--text-muted]">
            <p>© 2026 Easy Lehrer. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
