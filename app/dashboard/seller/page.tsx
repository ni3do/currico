"use client";

import { useState } from "react";
import Link from "next/link";

// Mock data
const mockStats = {
  netEarnings: "CHF 1,248.50",
  totalDownloads: 342,
  followers: 28,
};

const mockResources = [
  {
    id: 1,
    title: "Bruchrechnen Ubungsblatter",
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
    title: "Geometrie Arbeitsblatter",
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
    resource: "Bruchrechnen Ubungsblatter",
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
    resource: "Geometrie Arbeitsblatter",
    date: "2026-01-06",
    gross: "CHF 8.00",
    platformFee: "CHF 1.20",
    sellerPayout: "CHF 6.80",
  },
];

export default function SellerDashboardPage() {
  const [activeView, setActiveView] = useState<"resources" | "transactions">("resources");

  return (
    <div className="min-h-screen bg-[--background-alt]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)' }}>
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-[--primary] rounded-[--radius-md]">
                <span className="text-white font-bold text-lg">EL</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-[--text-heading] leading-tight">EasyLehrer</span>
                <span className="text-xs text-[--text-muted] leading-tight">Bildungsplattform Schweiz</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/resources"
                className="px-4 py-2 text-[--text-body] hover:text-[--primary] font-medium text-sm transition-colors rounded-[--radius-md] hover:bg-[--gray-50]"
              >
                Ressourcen
              </Link>
              <Link
                href="/dashboard/seller"
                className="px-4 py-2 text-[--primary] font-medium text-sm bg-[--primary-light] rounded-[--radius-md]"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="px-4 py-2 text-[--text-body] hover:text-[--primary] font-medium text-sm transition-colors rounded-[--radius-md] hover:bg-[--gray-50]"
              >
                Profil
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[--border] hover:border-[--primary] transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[--primary] text-xs font-bold text-white">
                  M
                </div>
                <span className="hidden sm:inline text-sm font-medium text-[--text-heading]">Maria</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[--text-heading]">Verkaufer Dashboard</h1>
          <p className="mt-2 text-[--text-muted]">
            Verwalten Sie Ihre Ressourcen und uberwachen Sie Ihre Verkaufe
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          {/* Net Earnings */}
          <div
            className="bg-white rounded-[--radius-lg] p-6"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-[--primary-light] rounded-[--radius-md]">
                <svg
                  className="h-5 w-5 text-[--primary]"
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
            <div className="text-3xl font-bold text-[--text-heading]">
              {mockStats.netEarnings}
            </div>
            <p className="mt-1 text-sm text-[--text-muted]">Nach Plattformgebuhr</p>
          </div>

          {/* Total Downloads */}
          <div
            className="bg-white rounded-[--radius-lg] p-6"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-[--accent-light] rounded-[--radius-md]">
                <svg
                  className="h-5 w-5 text-[--accent]"
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
            <div className="text-3xl font-bold text-[--text-heading]">
              {mockStats.totalDownloads}
            </div>
            <p className="mt-1 text-sm text-[--text-muted]">Alle Ressourcen</p>
          </div>

          {/* Followers */}
          <div
            className="bg-white rounded-[--radius-lg] p-6"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-[--secondary-light] rounded-[--radius-md]">
                <svg
                  className="h-5 w-5 text-[--secondary]"
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
            <div className="text-3xl font-bold text-[--text-heading]">
              {mockStats.followers}
            </div>
            <p className="mt-1 text-sm text-[--text-muted]">Folgen Ihnen</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Link
            href="/upload"
            className="rounded-[--radius-md] bg-[--primary] px-6 py-3.5 font-semibold text-white hover:bg-[--primary-hover] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,82,204,0.25)]"
          >
            + Neue Ressource hochladen
          </Link>
          <Link
            href="/upload/bundle"
            className="rounded-[--radius-md] bg-[--gray-100] px-6 py-3.5 font-semibold text-[--text-heading] hover:bg-[--gray-200] transition-all"
          >
            + Bundle erstellen
          </Link>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex gap-6 border-b border-[--border]">
          <button
            onClick={() => setActiveView("resources")}
            className={`pb-4 text-sm font-semibold transition-colors ${
              activeView === "resources"
                ? "border-b-2 border-[--primary] text-[--primary]"
                : "text-[--text-muted] hover:text-[--text-heading]"
            }`}
          >
            Meine Ressourcen
          </button>
          <button
            onClick={() => setActiveView("transactions")}
            className={`pb-4 text-sm font-semibold transition-colors ${
              activeView === "transactions"
                ? "border-b-2 border-[--primary] text-[--primary]"
                : "text-[--text-muted] hover:text-[--text-heading]"
            }`}
          >
            Transaktionen
          </button>
        </div>

        {/* Resources View */}
        {activeView === "resources" && (
          <div
            className="bg-white rounded-[--radius-lg] overflow-hidden"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[--gray-50] border-b border-[--gray-100]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text-heading]">
                      Titel
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text-heading]">
                      Typ
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text-heading]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[--text-heading]">
                      Downloads
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[--text-heading]">
                      Einnahmen
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[--text-heading]">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--gray-100]">
                  {mockResources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-[--gray-50] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-[--text-heading]">{resource.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-[--gray-100] text-[--text-muted] text-xs font-medium rounded-full">
                          {resource.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            resource.status === "Verified"
                              ? "bg-[--success-light] text-[--success]"
                              : resource.status === "AI-Checked"
                              ? "bg-[--accent-light] text-[--accent]"
                              : "bg-[--warning-light] text-[--warning]"
                          }`}
                        >
                          {resource.status === "Verified"
                            ? "Verifiziert"
                            : resource.status === "AI-Checked"
                            ? "KI-Gepruft"
                            : "Ausstehend"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-[--text-body]">
                        {resource.downloads}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-[--primary]">
                        {resource.netEarnings}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="rounded-[--radius-md] border border-[--border] px-3 py-1.5 text-sm font-medium text-[--text-body] hover:border-[--primary] hover:text-[--primary] transition-colors">
                            Bearbeiten
                          </button>
                          <a
                            href={`/resources/${resource.id}`}
                            className="rounded-[--radius-md] bg-[--primary] px-3 py-1.5 text-sm font-medium text-white hover:bg-[--primary-hover] transition-colors"
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
          <div
            className="bg-white rounded-[--radius-lg] overflow-hidden"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[--gray-50] border-b border-[--gray-100]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text-heading]">
                      Ressource
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text-heading]">
                      Datum
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[--text-heading]">
                      Bruttopreis
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[--text-heading]">
                      Plattformgebuhr
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[--text-heading]">
                      Ihre Auszahlung
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--gray-100]">
                  {mockTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-[--gray-50] transition-colors">
                      <td className="px-6 py-4 font-medium text-[--text-heading]">
                        {transaction.resource}
                      </td>
                      <td className="px-6 py-4 text-[--text-muted]">
                        {new Date(transaction.date).toLocaleDateString("de-CH")}
                      </td>
                      <td className="px-6 py-4 text-right text-[--text-body]">
                        {transaction.gross}
                      </td>
                      <td className="px-6 py-4 text-right text-[--error]">
                        -{transaction.platformFee}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-[--success]">
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
      <footer className="mt-20 bg-[--sidebar-bg] border-t border-[--border]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-[--text-muted]">
            <p>2026 EasyLehrer. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
