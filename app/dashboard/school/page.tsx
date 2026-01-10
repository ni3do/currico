"use client";

import { useState } from "react";
import Link from "next/link";

// Mock data
const mockSchoolInfo = {
  name: "Primarschule Musterstadt",
  canton: "Zürich",
  email: "admin@primarschule-musterstadt.ch",
  memberCount: 15,
};

const mockMembers = [
  { id: 1, name: "Maria Schmidt", email: "maria.schmidt@example.com", role: "Lehrperson", status: "Active" },
  { id: 2, name: "Peter Müller", email: "peter.mueller@example.com", role: "Lehrperson", status: "Active" },
  { id: 3, name: "Anna Weber", email: "anna.weber@example.com", role: "Lehrperson", status: "Active" },
  { id: 4, name: "Thomas Fischer", email: "thomas.fischer@example.com", role: "Lehrperson", status: "Pending" },
];

const mockLicenses = [
  { id: 1, title: "Bruchrechnen Übungsblätter", type: "Resource", purchaseDate: "2026-01-05", usedBy: 8 },
  { id: 2, title: "Mathematik Spiele Bundle", type: "Bundle", purchaseDate: "2026-01-03", usedBy: 12 },
  { id: 3, title: "Leseverstehen: Kurzgeschichten", type: "Resource", purchaseDate: "2025-12-28", usedBy: 6 },
];

export default function SchoolDashboardPage() {
  const [activeSection, setActiveSection] = useState<"members" | "licenses" | "billing">("members");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const handleInvite = () => {
    console.log("Inviting:", inviteEmail);
    setShowInviteModal(false);
    setInviteEmail("");
  };

  return (
    <div className="min-h-screen bg-[--background]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[--border] bg-[--surface]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[--primary] to-[--secondary]">
                  <span className="text-xl font-bold text-[--background]">EL</span>
                </div>
                <span className="text-xl font-bold text-[--text]">Easy Lehrer</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/resources"
                className="text-[--text-muted] hover:text-[--text] transition-colors"
              >
                Ressourcen
              </Link>
              <Link
                href="/dashboard/school"
                className="text-[--primary] font-medium transition-colors"
              >
                School Dashboard
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full border-2 border-[--primary] px-4 py-2 font-medium text-[--primary] transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] text-xs font-bold text-[--background]">
                  A
                </div>
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[--text]">{mockSchoolInfo.name}</h1>
          <p className="mt-2 text-[--text-muted]">
            Verwalten Sie Ihre Schule und Team-Lizenzen
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Section Navigation */}
            <div className="flex gap-4 border-b border-[--border]">
              <button
                onClick={() => setActiveSection("members")}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeSection === "members"
                    ? "border-b-2 border-[--primary] text-[--primary]"
                    : "text-[--text-muted] hover:text-[--text]"
                }`}
              >
                Team-Mitglieder
              </button>
              <button
                onClick={() => setActiveSection("licenses")}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeSection === "licenses"
                    ? "border-b-2 border-[--primary] text-[--primary]"
                    : "text-[--text-muted] hover:text-[--text]"
                }`}
              >
                Lizenzen
              </button>
              <button
                onClick={() => setActiveSection("billing")}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeSection === "billing"
                    ? "border-b-2 border-[--primary] text-[--primary]"
                    : "text-[--text-muted] hover:text-[--text]"
                }`}
              >
                Abrechnung
              </button>
            </div>

            {/* Members Section */}
            {activeSection === "members" && (
              <div className="rounded-2xl border border-[--border] bg-[--surface] p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[--text]">Team-Mitglieder</h2>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="rounded-lg bg-gradient-to-r from-[--primary] to-[--secondary] px-4 py-2 text-sm font-medium text-[--background] hover:opacity-90 transition-opacity"
                  >
                    + Mitglied einladen
                  </button>
                </div>

                <div className="space-y-3">
                  {mockMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-xl border border-[--border] bg-[--background] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] text-sm font-bold text-[--background]">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-[--text]">{member.name}</div>
                          <div className="text-sm text-[--text-muted]">{member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            member.status === "Active"
                              ? "bg-[--green]/20 text-[--green]"
                              : "bg-[--yellow]/20 text-[--yellow]"
                          }`}
                        >
                          {member.status === "Active" ? "Aktiv" : "Ausstehend"}
                        </span>
                        <button className="rounded-lg border border-[--border] px-3 py-1 text-sm text-[--text] hover:bg-[--surface1] transition-colors">
                          Entfernen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Licenses Section */}
            {activeSection === "licenses" && (
              <div className="rounded-2xl border border-[--border] bg-[--surface] p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[--text]">School Library</h2>
                  <Link
                    href="/resources"
                    className="rounded-lg border border-[--border] px-4 py-2 text-sm font-medium text-[--text] hover:bg-[--surface1] transition-colors"
                  >
                    Ressourcen kaufen
                  </Link>
                </div>

                <div className="space-y-3">
                  {mockLicenses.map((license) => (
                    <div
                      key={license.id}
                      className="flex items-center justify-between rounded-xl border border-[--border] bg-[--background] p-4"
                    >
                      <div>
                        <div className="font-medium text-[--text]">{license.title}</div>
                        <div className="mt-1 flex items-center gap-3 text-sm text-[--text-muted]">
                          <span className="rounded-full bg-[--surface] px-2 py-0.5 text-xs">
                            {license.type}
                          </span>
                          <span>
                            Gekauft: {new Date(license.purchaseDate).toLocaleDateString("de-CH")}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[--text-muted]">Verwendet von</div>
                        <div className="text-lg font-semibold text-[--primary]">
                          {license.usedBy} Lehrpersonen
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Billing Section */}
            {activeSection === "billing" && (
              <div className="rounded-2xl border border-[--border] bg-[--surface] p-8">
                <h2 className="mb-6 text-xl font-semibold text-[--text]">Abrechnung</h2>

                <div className="space-y-6">
                  <div className="rounded-xl border border-[--border] bg-[--background] p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold text-[--text]">Zahlungsmethode</h3>
                      <button className="text-sm text-[--primary] hover:text-[--primary-hover]">
                        Bearbeiten
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-16 items-center justify-center rounded-lg border border-[--border] bg-[--surface]">
                        <svg className="h-8 w-8 text-[--text]" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                          <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-[--text]">•••• •••• •••• 4242</div>
                        <div className="text-sm text-[--text-muted]">Läuft ab 12/2027</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[--border] bg-[--background] p-6">
                    <h3 className="mb-4 font-semibold text-[--text]">Letzte Transaktionen</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-[--text]">Mathematik Spiele Bundle</div>
                          <div className="text-xs text-[--text-muted]">03.01.2026</div>
                        </div>
                        <div className="font-semibold text-[--text]">CHF 25.00</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-[--text]">Bruchrechnen Übungsblätter</div>
                          <div className="text-xs text-[--text-muted]">05.01.2026</div>
                        </div>
                        <div className="font-semibold text-[--text]">CHF 12.00</div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full rounded-lg border border-[--border] px-4 py-3 text-sm font-medium text-[--text] hover:bg-[--surface1] transition-colors">
                    Alle Transaktionen anzeigen
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* School Info */}
            <div className="rounded-2xl border border-[--border] bg-[--surface] p-6">
              <h3 className="mb-4 font-semibold text-[--text]">Schul-Informationen</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-[--text-muted]">Name</div>
                  <div className="font-medium text-[--text]">{mockSchoolInfo.name}</div>
                </div>
                <div>
                  <div className="text-sm text-[--text-muted]">Kanton</div>
                  <div className="font-medium text-[--text]">{mockSchoolInfo.canton}</div>
                </div>
                <div>
                  <div className="text-sm text-[--text-muted]">E-Mail</div>
                  <div className="font-medium text-[--text]">{mockSchoolInfo.email}</div>
                </div>
              </div>
              <button className="mt-4 w-full rounded-lg border border-[--border] px-4 py-2 text-sm font-medium text-[--text] hover:bg-[--surface1] transition-colors">
                Details bearbeiten
              </button>
            </div>

            {/* Stats */}
            <div className="rounded-2xl border border-[--border] bg-[--surface] p-6">
              <h3 className="mb-4 font-semibold text-[--text]">Statistiken</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-[--primary]">
                    {mockSchoolInfo.memberCount}
                  </div>
                  <div className="text-sm text-[--text-muted]">Team-Mitglieder</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[--secondary]">
                    {mockLicenses.length}
                  </div>
                  <div className="text-sm text-[--text-muted]">Aktive Lizenzen</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[--background]/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-[--border] bg-[--surface] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[--text]">
                Lehrperson einladen
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
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
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-lg border border-[--border] bg-[--background] px-4 py-2 text-[--text] placeholder:text-[--text-muted] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20"
                  placeholder="lehrperson@example.com"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleInvite}
                  className="flex-1 rounded-lg bg-gradient-to-r from-[--primary] to-[--secondary] px-4 py-3 font-medium text-[--background] hover:opacity-90 transition-opacity"
                >
                  Einladung senden
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
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
