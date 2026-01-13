"use client";

import { useState } from "react";
import Link from "next/link";
import TopBar from "@/components/ui/TopBar";

// Mock data
const mockSchoolInfo = {
  name: "Primarschule Musterstadt",
  canton: "Zurich",
  email: "admin@primarschule-musterstadt.ch",
  memberCount: 15,
};

const mockMembers = [
  { id: 1, name: "Maria Schmidt", email: "maria.schmidt@example.com", role: "Lehrperson", status: "Active" },
  { id: 2, name: "Peter Muller", email: "peter.mueller@example.com", role: "Lehrperson", status: "Active" },
  { id: 3, name: "Anna Weber", email: "anna.weber@example.com", role: "Lehrperson", status: "Active" },
  { id: 4, name: "Thomas Fischer", email: "thomas.fischer@example.com", role: "Lehrperson", status: "Pending" },
];

const mockLicenses = [
  { id: 1, title: "Bruchrechnen Ubungsblatter", type: "Resource", purchaseDate: "2026-01-05", usedBy: 8 },
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
    <div className="min-h-screen bg-[--background-alt]">
      <TopBar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[--text-heading]">{mockSchoolInfo.name}</h1>
          <p className="mt-2 text-[--text-muted]">
            Verwalten Sie Ihre Schule und Team-Lizenzen
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Section Navigation */}
            <div className="flex gap-6 border-b border-[--border]">
              <button
                onClick={() => setActiveSection("members")}
                className={`pb-4 text-sm font-semibold transition-colors ${
                  activeSection === "members"
                    ? "border-b-2 border-[--primary] text-[--primary]"
                    : "text-[--text-muted] hover:text-[--text-heading]"
                }`}
              >
                Team-Mitglieder
              </button>
              <button
                onClick={() => setActiveSection("licenses")}
                className={`pb-4 text-sm font-semibold transition-colors ${
                  activeSection === "licenses"
                    ? "border-b-2 border-[--primary] text-[--primary]"
                    : "text-[--text-muted] hover:text-[--text-heading]"
                }`}
              >
                Lizenzen
              </button>
              <button
                onClick={() => setActiveSection("billing")}
                className={`pb-4 text-sm font-semibold transition-colors ${
                  activeSection === "billing"
                    ? "border-b-2 border-[--primary] text-[--primary]"
                    : "text-[--text-muted] hover:text-[--text-heading]"
                }`}
              >
                Abrechnung
              </button>
            </div>

            {/* Members Section */}
            {activeSection === "members" && (
              <div
                className="bg-white rounded-[--radius-lg] p-6"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[--text-heading]">Team-Mitglieder</h2>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="rounded-[--radius-md] bg-[--primary] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[--primary-hover] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,82,204,0.25)]"
                  >
                    + Mitglied einladen
                  </button>
                </div>

                <div className="space-y-3">
                  {mockMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-[--radius-lg] border border-[--gray-100] bg-[--gray-50] p-4 hover:border-[--gray-200] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[--primary] text-sm font-bold text-white">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-[--text-heading]">{member.name}</div>
                          <div className="text-sm text-[--text-muted]">{member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            member.status === "Active"
                              ? "bg-[--success-light] text-[--success]"
                              : "bg-[--warning-light] text-[--warning]"
                          }`}
                        >
                          {member.status === "Active" ? "Aktiv" : "Ausstehend"}
                        </span>
                        <button className="rounded-[--radius-md] border border-[--border] px-3 py-1.5 text-sm font-medium text-[--text-body] hover:border-[--error] hover:text-[--error] transition-colors">
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
              <div
                className="bg-white rounded-[--radius-lg] p-6"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[--text-heading]">School Library</h2>
                  <Link
                    href="/resources"
                    className="rounded-[--radius-md] border border-[--border] bg-white px-4 py-2 text-sm font-semibold text-[--text-heading] hover:border-[--primary] hover:text-[--primary] transition-colors"
                  >
                    Ressourcen kaufen
                  </Link>
                </div>

                <div className="space-y-3">
                  {mockLicenses.map((license) => (
                    <div
                      key={license.id}
                      className="flex items-center justify-between rounded-[--radius-lg] border border-[--gray-100] bg-[--gray-50] p-4 hover:border-[--gray-200] transition-colors"
                    >
                      <div>
                        <div className="font-medium text-[--text-heading]">{license.title}</div>
                        <div className="mt-1 flex items-center gap-3 text-sm text-[--text-muted]">
                          <span className="px-2 py-0.5 bg-[--gray-100] text-[--text-muted] text-xs font-medium rounded-full">
                            {license.type}
                          </span>
                          <span>
                            Gekauft: {new Date(license.purchaseDate).toLocaleDateString("de-CH")}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[--text-muted]">Verwendet von</div>
                        <div className="text-lg font-bold text-[--primary]">
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
              <div
                className="bg-white rounded-[--radius-lg] p-6"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <h2 className="mb-6 text-xl font-bold text-[--text-heading]">Abrechnung</h2>

                <div className="space-y-6">
                  <div className="rounded-[--radius-lg] border border-[--gray-100] bg-[--gray-50] p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold text-[--text-heading]">Zahlungsmethode</h3>
                      <button className="text-sm font-medium text-[--primary] hover:text-[--primary-hover] transition-colors">
                        Bearbeiten
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-16 items-center justify-center rounded-[--radius-md] border border-[--gray-200] bg-white">
                        <svg className="h-8 w-8 text-[--text-muted]" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                          <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-[--text-heading]">---- ---- ---- 4242</div>
                        <div className="text-sm text-[--text-muted]">Lauft ab 12/2027</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[--radius-lg] border border-[--gray-100] bg-[--gray-50] p-6">
                    <h3 className="mb-4 font-semibold text-[--text-heading]">Letzte Transaktionen</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-[--gray-100]">
                        <div>
                          <div className="text-sm font-medium text-[--text-heading]">Mathematik Spiele Bundle</div>
                          <div className="text-xs text-[--text-muted]">03.01.2026</div>
                        </div>
                        <div className="font-bold text-[--text-heading]">CHF 25.00</div>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <div className="text-sm font-medium text-[--text-heading]">Bruchrechnen Ubungsblatter</div>
                          <div className="text-xs text-[--text-muted]">05.01.2026</div>
                        </div>
                        <div className="font-bold text-[--text-heading]">CHF 12.00</div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-3 text-sm font-semibold text-[--text-heading] hover:border-[--primary] hover:text-[--primary] transition-colors">
                    Alle Transaktionen anzeigen
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* School Info */}
            <div
              className="bg-white rounded-[--radius-lg] p-6"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <h3 className="mb-4 font-bold text-[--text-heading]">Schul-Informationen</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-[--text-muted]">Name</div>
                  <div className="font-medium text-[--text-heading]">{mockSchoolInfo.name}</div>
                </div>
                <div>
                  <div className="text-sm text-[--text-muted]">Kanton</div>
                  <div className="font-medium text-[--text-heading]">{mockSchoolInfo.canton}</div>
                </div>
                <div>
                  <div className="text-sm text-[--text-muted]">E-Mail</div>
                  <div className="font-medium text-[--text-heading]">{mockSchoolInfo.email}</div>
                </div>
              </div>
              <button className="mt-6 w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-2.5 text-sm font-semibold text-[--text-heading] hover:border-[--primary] hover:text-[--primary] transition-colors">
                Details bearbeiten
              </button>
            </div>

            {/* Stats */}
            <div
              className="bg-white rounded-[--radius-lg] p-6"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <h3 className="mb-4 font-bold text-[--text-heading]">Statistiken</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-[--radius-md] bg-[--primary-light]">
                  <div className="text-sm font-medium text-[--text-body]">Team-Mitglieder</div>
                  <div className="text-2xl font-bold text-[--primary]">
                    {mockSchoolInfo.memberCount}
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-[--radius-md] bg-[--accent-light]">
                  <div className="text-sm font-medium text-[--text-body]">Aktive Lizenzen</div>
                  <div className="text-2xl font-bold text-[--accent]">
                    {mockLicenses.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="mx-4 w-full max-w-md bg-white rounded-[--radius-xl] p-6"
            style={{ boxShadow: 'var(--shadow-xl)' }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[--text-heading]">
                Lehrperson einladen
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-[--text-muted] hover:text-[--text-heading] transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[--text-heading]">
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-3.5 text-[--text-heading] placeholder:text-[--text-light] focus:outline-none focus:border-[--primary] focus:ring-[3px] focus:ring-[--primary-light] transition-all"
                  placeholder="lehrperson@example.com"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleInvite}
                  className="flex-1 rounded-[--radius-md] bg-[--primary] px-4 py-3 font-semibold text-white hover:bg-[--primary-hover] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,82,204,0.25)]"
                >
                  Einladung senden
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-[--radius-md] bg-[--gray-100] px-6 py-3 font-semibold text-[--text-heading] hover:bg-[--gray-200] transition-all"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
