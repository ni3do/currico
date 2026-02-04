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
  const totalPlatformFee = filteredTransactions.reduce((sum, t) => sum + t.platformFee, 0);
  const totalSellerPayout = filteredTransactions.reduce((sum, t) => sum + t.sellerPayout, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border-border bg-surface rounded-xl border p-5">
          <h3 className="text-text-muted mb-2 text-sm font-medium">Gesamt-Bruttoeinnahmen</h3>
          <div className="text-text text-2xl font-bold">CHF {totalGross.toFixed(2)}</div>
        </div>

        <div className="border-border bg-surface rounded-xl border p-5">
          <h3 className="text-text-muted mb-2 text-sm font-medium">Plattformgebühren (15%)</h3>
          <div className="text-primary text-2xl font-bold">CHF {totalPlatformFee.toFixed(2)}</div>
        </div>

        <div className="border-border bg-surface rounded-xl border p-5">
          <h3 className="text-text-muted mb-2 text-sm font-medium">Verkäufer-Auszahlungen</h3>
          <div className="text-success text-2xl font-bold">CHF {totalSellerPayout.toFixed(2)}</div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="tab-container">
        {[
          { value: "all", label: "Alle" },
          { value: "completed", label: "Abgeschlossen" },
          { value: "pending", label: "Ausstehend" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`tab-button ${filterStatus === tab.value ? "tab-button-active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="border-border bg-surface overflow-hidden rounded-2xl border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg">
              <tr>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">
                  Transaktions-ID
                </th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">Ressource</th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">Käufer</th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">Verkäufer</th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">Datum</th>
                <th className="text-text px-6 py-4 text-right text-sm font-semibold">Brutto</th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="text-text px-6 py-4 text-right text-sm font-semibold">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-bg transition-colors">
                  <td className="text-text px-6 py-4 font-mono text-sm">{transaction.id}</td>
                  <td className="text-text px-6 py-4 font-medium">{transaction.resource}</td>
                  <td className="text-text-muted px-6 py-4">{transaction.buyer}</td>
                  <td className="text-text-muted px-6 py-4">{transaction.seller}</td>
                  <td className="text-text-muted px-6 py-4">
                    {new Date(transaction.date).toLocaleDateString("de-CH")}
                  </td>
                  <td className="text-text px-6 py-4 text-right font-semibold">
                    CHF {transaction.gross.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`pill ${
                        transaction.status === "Completed" ? "pill-success" : "pill-warning"
                      }`}
                    >
                      {transaction.status === "Completed" ? "Abgeschlossen" : "Ausstehend"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedTransaction(transaction.id)}
                      className="btn-primary rounded-lg px-3 py-1.5 text-xs"
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
        <div className="modal-overlay">
          <div className="modal-content modal-lg mx-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-text text-xl font-semibold">Transaktionsdetails</h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-text-muted hover:text-text"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              const transaction = mockTransactions.find((t) => t.id === selectedTransaction);
              if (!transaction) return null;

              return (
                <div className="space-y-6">
                  <div className="border-border bg-bg rounded-xl border p-6">
                    <div className="mb-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <div className="text-text-muted text-sm">Transaktions-ID</div>
                        <div className="text-text font-mono font-medium">{transaction.id}</div>
                      </div>
                      <div>
                        <div className="text-text-muted text-sm">Status</div>
                        <span
                          className={`pill ${
                            transaction.status === "Completed" ? "pill-success" : "pill-warning"
                          }`}
                        >
                          {transaction.status === "Completed" ? "Abgeschlossen" : "Ausstehend"}
                        </span>
                      </div>
                      <div>
                        <div className="text-text-muted text-sm">Ressource</div>
                        <div className="text-text font-medium">{transaction.resource}</div>
                      </div>
                      <div>
                        <div className="text-text-muted text-sm">Datum</div>
                        <div className="text-text font-medium">
                          {new Date(transaction.date).toLocaleDateString("de-CH")}
                        </div>
                      </div>
                      <div>
                        <div className="text-text-muted text-sm">Käufer</div>
                        <div className="text-text font-medium">{transaction.buyer}</div>
                      </div>
                      <div>
                        <div className="text-text-muted text-sm">Verkäufer</div>
                        <div className="text-text font-medium">{transaction.seller}</div>
                      </div>
                    </div>

                    <div className="border-border mt-6 border-t pt-6">
                      <h4 className="text-text mb-4 font-semibold">Finanzübersicht</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">Bruttopreis</span>
                          <span className="text-text font-semibold">
                            CHF {transaction.gross.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">Plattformgebühr (15%)</span>
                          <span className="text-error font-semibold">
                            - CHF {transaction.platformFee.toFixed(2)}
                          </span>
                        </div>
                        <div className="border-border flex items-center justify-between border-t pt-3">
                          <span className="text-text font-semibold">Verkäufer-Auszahlung</span>
                          <span className="text-success text-lg font-bold">
                            CHF {transaction.sellerPayout.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="border-border text-text hover:bg-bg w-full rounded-lg border px-4 py-3 font-medium transition-colors"
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
