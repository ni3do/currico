"use client";

import { useState } from "react";

// Mock data
const mockResources = [
  {
    id: 1,
    title: "Bruchrechnen Übungsblätter",
    seller: "Maria Schmidt",
    status: "Pending",
    uploadDate: "2026-01-08",
    subject: "Mathematik",
  },
  {
    id: 2,
    title: "Leseverstehen: Kurzgeschichten",
    seller: "Peter Müller",
    status: "AI-Checked",
    uploadDate: "2026-01-07",
    subject: "Deutsch",
  },
  {
    id: 3,
    title: "NMG Experimente mit Wasser",
    seller: "Anna Weber",
    status: "Verified",
    uploadDate: "2026-01-05",
    subject: "NMG",
  },
];

const mockReports = [
  {
    id: 1,
    resource: "Grammatik Übungen",
    reporter: "Thomas Fischer",
    reason: "Qualitätsprobleme",
    date: "2026-01-08",
    status: "Open",
  },
  {
    id: 2,
    resource: "Mathe Arbeitsblätter",
    reporter: "Lisa Meier",
    reason: "Urheberrechtsverletzung",
    date: "2026-01-07",
    status: "In Review",
  },
  {
    id: 3,
    resource: "Englisch Vokabeln",
    reporter: "Hans Keller",
    reason: "Falsches Fach/Zyklus",
    date: "2026-01-06",
    status: "Resolved",
  },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"quality" | "reports">("quality");
  const [selectedResource, setSelectedResource] = useState<number | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const handleStatusChange = () => {
    console.log("Changing status:", { selectedResource, newStatus, adminNote });
    setShowStatusModal(false);
    setSelectedResource(null);
    setNewStatus("");
    setAdminNote("");
  };

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
                href="/admin"
                className="text-[--primary] font-medium transition-colors"
              >
                Admin Dashboard
              </a>
              <a
                href="/resources"
                className="text-[--text-muted] hover:text-[--text] transition-colors"
              >
                Ressourcen
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <span className="rounded-full bg-[--red]/20 px-3 py-1 text-xs font-medium text-[--red]">
                Admin
              </span>
              <a
                href="/profile"
                className="flex items-center gap-2 rounded-full border-2 border-[--primary] px-4 py-2 font-medium text-[--primary] transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] text-xs font-bold text-[--background]">
                  A
                </div>
                <span className="hidden sm:inline">Admin</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[--text]">Admin Dashboard</h1>
          <p className="mt-2 text-[--text-muted]">
            Verwalten Sie Qualitätsstatus und Meldungen
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-[--border] bg-[--surface] p-6">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-[--yellow] to-[--peach] p-2">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-[--text-muted]">
                Ausstehende Prüfungen
              </h3>
            </div>
            <div className="text-3xl font-bold text-[--text]">12</div>
          </div>

          <div className="rounded-2xl border border-[--border] bg-[--surface] p-6">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-[--red] to-[--maroon] p-2">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-[--text-muted]">
                Offene Meldungen
              </h3>
            </div>
            <div className="text-3xl font-bold text-[--text]">3</div>
          </div>

          <div className="rounded-2xl border border-[--border] bg-[--surface] p-6">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-[--green] to-[--teal] p-2">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-[--text-muted]">
                Diese Woche verifiziert
              </h3>
            </div>
            <div className="text-3xl font-bold text-[--text]">45</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-[--border]">
          <button
            onClick={() => setActiveTab("quality")}
            className={`pb-4 text-sm font-medium transition-colors ${
              activeTab === "quality"
                ? "border-b-2 border-[--primary] text-[--primary]"
                : "text-[--text-muted] hover:text-[--text]"
            }`}
          >
            Qualitätsstatus
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`pb-4 text-sm font-medium transition-colors ${
              activeTab === "reports"
                ? "border-b-2 border-[--primary] text-[--primary]"
                : "text-[--text-muted] hover:text-[--text]"
            }`}
          >
            Meldungen
          </button>
        </div>

        {/* Quality Status Management */}
        {activeTab === "quality" && (
          <div className="rounded-2xl border border-[--border] bg-[--surface] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[--background]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text]">
                      Titel
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text]">
                      Verkäufer
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text]">
                      Fach
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text]">
                      Hochgeladen
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[--text]">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border]">
                  {mockResources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-[--background] transition-colors">
                      <td className="px-6 py-4 font-medium text-[--text]">
                        {resource.title}
                      </td>
                      <td className="px-6 py-4 text-[--text-muted]">{resource.seller}</td>
                      <td className="px-6 py-4 text-[--text-muted]">{resource.subject}</td>
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
                            ? "Verifiziert"
                            : resource.status === "AI-Checked"
                            ? "KI-Geprüft"
                            : "Ausstehend"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[--text-muted]">
                        {new Date(resource.uploadDate).toLocaleDateString("de-CH")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedResource(resource.id);
                            setNewStatus(resource.status);
                            setShowStatusModal(true);
                          }}
                          className="rounded-lg bg-gradient-to-r from-[--primary] to-[--secondary] px-4 py-2 text-sm font-medium text-[--background] hover:opacity-90 transition-opacity"
                        >
                          Status ändern
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Management */}
        {activeTab === "reports" && (
          <div className="rounded-2xl border border-[--border] bg-[--surface] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[--background]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text]">
                      Ressource
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text]">
                      Melder
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text]">
                      Grund
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[--text]">
                      Datum
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[--text]">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border]">
                  {mockReports.map((report) => (
                    <tr key={report.id} className="hover:bg-[--background] transition-colors">
                      <td className="px-6 py-4 font-medium text-[--text]">
                        {report.resource}
                      </td>
                      <td className="px-6 py-4 text-[--text-muted]">{report.reporter}</td>
                      <td className="px-6 py-4 text-[--text-muted]">{report.reason}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            report.status === "Open"
                              ? "bg-[--red]/20 text-[--red]"
                              : report.status === "In Review"
                              ? "bg-[--yellow]/20 text-[--yellow]"
                              : "bg-[--green]/20 text-[--green]"
                          }`}
                        >
                          {report.status === "Open"
                            ? "Offen"
                            : report.status === "In Review"
                            ? "In Prüfung"
                            : "Gelöst"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[--text-muted]">
                        {new Date(report.date).toLocaleDateString("de-CH")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="rounded-lg border border-[--border] px-4 py-2 text-sm font-medium text-[--text] hover:bg-[--surface1] transition-colors">
                          Prüfen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[--background]/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-[--border] bg-[--surface] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[--text]">
                Status ändern
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-[--text-muted] hover:text-[--text]"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[--text]">
                  Neuer Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-lg border border-[--border] bg-[--background] px-4 py-2 text-[--text] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20"
                >
                  <option value="Pending">Ausstehend</option>
                  <option value="AI-Checked">KI-Geprüft</option>
                  <option value="Verified">Verifiziert</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[--text]">
                  Interne Notiz (optional)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[--border] bg-[--background] px-4 py-2 text-[--text] placeholder:text-[--text-muted] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20"
                  placeholder="Notizen zur Statusänderung..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleStatusChange}
                  className="flex-1 rounded-lg bg-gradient-to-r from-[--primary] to-[--secondary] px-4 py-3 font-medium text-[--background] hover:opacity-90 transition-opacity"
                >
                  Status aktualisieren
                </button>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="rounded-lg border border-[--border] px-6 py-3 font-medium text-[--text] hover:bg-[--surface1] transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
