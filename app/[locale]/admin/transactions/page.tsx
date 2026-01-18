"use client";

import { useState } from "react";

// Mock transaction data
const mockTransactions = [
  {
    id: "TXN-001",
    resource: "Bruchrechnen Übungsblätter",
    buyer: "Thomas Fischer",
    seller: "Maria Schmidt",
    date: "2026-01-08",
    gross: 12.0,
    platformFee: 1.8,
    sellerPayout: 10.2,
    status: "Completed",
  },
  {
    id: "TXN-002",
    resource: "Mathematik Spiele Bundle",
    buyer: "Lisa Meier",
    seller: "Peter Müller",
    date: "2026-01-07",
    gross: 25.0,
    platformFee: 3.75,
    sellerPayout: 21.25,
    status: "Completed",
  },
  {
    id: "TXN-003",
    resource: "Leseverstehen: Kurzgeschichten",
    buyer: "Hans Keller",
    seller: "Anna Weber",
    date: "2026-01-07",
    gross: 18.0,
    platformFee: 2.7,
    sellerPayout: 15.3,
    status: "Completed",
  },
  {
    id: "TXN-004",
    resource: "NMG Experimente",
    buyer: "Sandra Zimmermann",
    seller: "Maria Schmidt",
    date: "2026-01-06",
    gross: 15.0,
    platformFee: 2.25,
    sellerPayout: 12.75,
    status: "Completed",
  },
  {
    id: "TXN-005",
    resource: "Englisch Vokabeltraining",
    buyer: "Martin Huber",
    seller: "Peter Müller",
    date: "2026-01-06",
    gross: 10.0,
    platformFee: 1.5,
    sellerPayout: 8.5,
    status: "Pending",
  },
];

export default function AdminTransactionsPage() {
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredTransactions = mockTransactions.filter(
    (t) => filterStatus === "all" || t.status.toLowerCase() === filterStatus
  );

  const totalGross = filteredTransactions.reduce((sum, t) => sum + t.gross, 0);
  const totalPlatformFee = filteredTransactions.reduce(
    (sum, t) => sum + t.platformFee,
    0
  );
  const totalSellerPayout = filteredTransactions.reduce(
    (sum, t) => sum + t.sellerPayout,
    0
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">Transaktionen</h1>
        <p className="mt-2 text-text-muted">
          Übersicht aller Plattform-Transaktionen
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="mb-2 text-sm font-medium text-text-muted">
            Gesamt-Bruttoeinnahmen
          </h3>
          <div className="text-3xl font-bold text-text">
            CHF {totalGross.toFixed(2)}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="mb-2 text-sm font-medium text-text-muted">
            Plattformgebühren
          </h3>
          <div className="text-3xl font-bold text-primary">
            CHF {totalPlatformFee.toFixed(2)}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="mb-2 text-sm font-medium text-text-muted">
            Verkäufer-Auszahlungen
          </h3>
          <div className="text-3xl font-bold text-[var(--ctp-green)]">
            CHF {totalSellerPayout.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-text">Status:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Alle</option>
          <option value="completed">Abgeschlossen</option>
          <option value="pending">Ausstehend</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                  Transaktions-ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                  Ressource
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                  Käufer
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                  Verkäufer
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                  Datum
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-text">
                  Brutto
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-text">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-bg transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-sm text-text">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-text">
                    {transaction.resource}
                  </td>
                  <td className="px-6 py-4 text-text-muted">
                    {transaction.buyer}
                  </td>
                  <td className="px-6 py-4 text-text-muted">
                    {transaction.seller}
                  </td>
                  <td className="px-6 py-4 text-text-muted">
                    {new Date(transaction.date).toLocaleDateString("de-CH")}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-text">
                    CHF {transaction.gross.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        transaction.status === "Completed"
                          ? "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]"
                          : "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]"
                      }`}
                    >
                      {transaction.status === "Completed"
                        ? "Abgeschlossen"
                        : "Ausstehend"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedTransaction(transaction.id)}
                      className="text-sm text-primary hover:text-primary-hover transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-2xl rounded-2xl border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-text">
                Transaktionsdetails
              </h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-text-muted hover:text-text"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {(() => {
              const transaction = mockTransactions.find(
                (t) => t.id === selectedTransaction
              );
              if (!transaction) return null;

              return (
                <div className="space-y-6">
                  <div className="rounded-xl border border-border bg-bg p-6">
                    <div className="mb-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <div className="text-sm text-text-muted">
                          Transaktions-ID
                        </div>
                        <div className="font-mono font-medium text-text">
                          {transaction.id}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-text-muted">Status</div>
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            transaction.status === "Completed"
                              ? "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]"
                              : "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]"
                          }`}
                        >
                          {transaction.status === "Completed"
                            ? "Abgeschlossen"
                            : "Ausstehend"}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm text-text-muted">Ressource</div>
                        <div className="font-medium text-text">
                          {transaction.resource}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-text-muted">Datum</div>
                        <div className="font-medium text-text">
                          {new Date(transaction.date).toLocaleDateString("de-CH")}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-text-muted">Käufer</div>
                        <div className="font-medium text-text">
                          {transaction.buyer}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-text-muted">Verkäufer</div>
                        <div className="font-medium text-text">
                          {transaction.seller}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-border pt-6">
                      <h4 className="mb-4 font-semibold text-text">
                        Finanzübersicht
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">Bruttopreis</span>
                          <span className="font-semibold text-text">
                            CHF {transaction.gross.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">
                            Plattformgebühr (15%)
                          </span>
                          <span className="font-semibold text-error">
                            - CHF {transaction.platformFee.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-border pt-3">
                          <span className="font-semibold text-text">
                            Verkäufer-Auszahlung
                          </span>
                          <span className="text-lg font-bold text-[var(--ctp-green)]">
                            CHF {transaction.sellerPayout.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="w-full rounded-lg border border-border px-4 py-3 font-medium text-text hover:bg-bg transition-colors"
                  >
                    Schliessen
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
