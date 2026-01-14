"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";

interface Stats {
  netEarnings: string;
  totalDownloads: number;
  followers: number;
}

interface Resource {
  id: string;
  title: string;
  type: string;
  status: string;
  downloads: number;
  netEarnings: string;
}

interface Transaction {
  id: string;
  resource: string;
  date: string;
  gross: string;
  platformFee: string;
  sellerPayout: string;
}

export default function SellerDashboardPage() {
  const [activeView, setActiveView] = useState<"resources" | "transactions">("resources");
  const [stats, setStats] = useState<Stats>({ netEarnings: "CHF 0.00", totalDownloads: 0, followers: 0 });
  const [resources, setResources] = useState<Resource[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/seller/dashboard");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setResources(data.resources);
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <TopBar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Verkäufer-Dashboard</h1>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Verwalten Sie Ihre Ressourcen und überwachen Sie Ihre Verkäufe
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          {/* Net Earnings */}
          <div className="card p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-[var(--color-primary-light)] rounded-lg">
                <svg
                  className="h-5 w-5 text-[var(--color-primary)]"
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
              <h3 className="text-sm font-medium text-[var(--color-text-muted)]">
                Netto-Einnahmen
              </h3>
            </div>
            <div className="text-3xl font-bold text-[var(--color-text)]">
              {stats.netEarnings}
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Nach Plattformgebühr</p>
          </div>

          {/* Total Downloads */}
          <div className="card p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-[var(--color-accent-light)] rounded-lg">
                <svg
                  className="h-5 w-5 text-[var(--color-accent)]"
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
              <h3 className="text-sm font-medium text-[var(--color-text-muted)]">
                Downloads
              </h3>
            </div>
            <div className="text-3xl font-bold text-[var(--color-text)]">
              {stats.totalDownloads}
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Alle Ressourcen</p>
          </div>

          {/* Followers */}
          <div className="card p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-[var(--color-success-light)] rounded-lg">
                <svg
                  className="h-5 w-5 text-[var(--color-success)]"
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
              <h3 className="text-sm font-medium text-[var(--color-text-muted)]">Follower</h3>
            </div>
            <div className="text-3xl font-bold text-[var(--color-text)]">
              {stats.followers}
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Folgen Ihnen</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Link
            href="/upload"
            className="btn-primary px-6 py-3.5"
          >
            + Neue Ressource hochladen
          </Link>
          <Link
            href="/upload/bundle"
            className="btn-secondary px-6 py-3.5"
          >
            + Bundle erstellen
          </Link>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex gap-6 border-b border-[var(--color-border)]">
          <button
            onClick={() => setActiveView("resources")}
            className={`pb-4 text-sm font-semibold transition-colors ${
              activeView === "resources"
                ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            Meine Ressourcen
          </button>
          <button
            onClick={() => setActiveView("transactions")}
            className={`pb-4 text-sm font-semibold transition-colors ${
              activeView === "transactions"
                ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            Transaktionen
          </button>
        </div>

        {/* Resources View */}
        {activeView === "resources" && (
          <div className="card overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-[var(--color-text-muted)]">Laden...</div>
            ) : resources.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-[var(--color-text-muted)] mb-4">Sie haben noch keine Ressourcen hochgeladen</p>
                <Link
                  href="/upload"
                  className="btn-primary px-6 py-3 inline-block"
                >
                  Erste Ressource hochladen
                </Link>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border-subtle)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                      Titel
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                      Typ
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text)]">
                      Downloads
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text)]">
                      Einnahmen
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text)]">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {resources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-[var(--color-bg)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-[var(--color-text)]">{resource.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="pill pill-neutral">
                          {resource.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`pill ${
                            resource.status === "Verified"
                              ? "pill-success"
                              : resource.status === "AI-Checked"
                              ? "pill-accent"
                              : "pill-warning"
                          }`}
                        >
                          {resource.status === "Verified"
                            ? "Verifiziert"
                            : resource.status === "AI-Checked"
                            ? "KI-Geprüft"
                            : "Ausstehend"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-[var(--color-text-secondary)]">
                        {resource.downloads}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-[var(--color-primary)]">
                        {resource.netEarnings}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="btn-ghost px-3 py-1.5 text-sm">
                            Bearbeiten
                          </button>
                          <a
                            href={`/resources/${resource.id}`}
                            className="btn-primary px-3 py-1.5 text-sm"
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
            )}
          </div>
        )}

        {/* Transactions View */}
        {activeView === "transactions" && (
          <div className="card overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-[var(--color-text-muted)]">Laden...</div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-[var(--color-text-muted)]">Noch keine Transaktionen vorhanden</p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border-subtle)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                      Ressource
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                      Datum
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text)]">
                      Bruttopreis
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text)]">
                      Plattformgebühr
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text)]">
                      Ihre Auszahlung
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-[var(--color-bg)] transition-colors">
                      <td className="px-6 py-4 font-medium text-[var(--color-text)]">
                        {transaction.resource}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">
                        {new Date(transaction.date).toLocaleDateString("de-CH")}
                      </td>
                      <td className="px-6 py-4 text-right text-[var(--color-text-secondary)]">
                        {transaction.gross}
                      </td>
                      <td className="px-6 py-4 text-right text-[var(--color-error)]">
                        -{transaction.platformFee}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-[var(--color-success)]">
                        {transaction.sellerPayout}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-[var(--color-text-muted)]">
            <p>2026 EasyLehrer. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
