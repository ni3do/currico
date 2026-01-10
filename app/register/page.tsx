"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<"teacher" | "school">("teacher");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    canton: "",
    subjects: [] as string[],
    cycles: [] as string[],
    schoolName: "",
    agreeToTerms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Register:", { accountType, ...formData });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[--background]">
      {/* Top Bar - Institutional accent line */}
      <div className="h-1 bg-[--primary]" />

      {/* Header */}
      <header className="bg-white border-b border-[--border]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-[--primary] rounded-[--radius-sm]">
                <span className="text-white font-bold text-lg">EL</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-[--gray-800] leading-tight">EasyLehrer</span>
                <span className="text-xs text-[--text-muted] leading-tight">Bildungsplattform Schweiz</span>
              </div>
            </Link>

            <Link
              href="/login"
              className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors"
            >
              Bereits registriert? <span className="font-medium text-[--primary]">Anmelden</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[--gray-800]">Konto erstellen</h1>
          <p className="mt-2 text-[--text-muted]">
            Werden Sie Teil der EasyLehrer Plattform
          </p>
        </div>

        {/* Account Type Selector */}
        <div className="mb-8 rounded-[--radius-md] bg-[--gray-100] p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setAccountType("teacher")}
              className={`rounded-[--radius-sm] px-6 py-2.5 font-medium text-sm transition-all ${
                accountType === "teacher"
                  ? "bg-[--primary] text-white"
                  : "text-[--text-muted] hover:text-[--text]"
              }`}
            >
              Lehrperson
            </button>
            <button
              onClick={() => setAccountType("school")}
              className={`rounded-[--radius-sm] px-6 py-2.5 font-medium text-sm transition-all ${
                accountType === "school"
                  ? "bg-[--primary] text-white"
                  : "text-[--text-muted] hover:text-[--text]"
              }`}
            >
              Schule / Institution
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <div className="rounded-[--radius-lg] bg-white p-8 border border-[--border]" style={{ boxShadow: 'var(--shadow-md)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-[--gray-700]"
              >
                {accountType === "teacher" ? "Vollstandiger Name" : "Name der Institution"}
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-3 text-[--text] placeholder:text-[--text-light] focus:outline-none focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary]"
                placeholder={
                  accountType === "teacher" ? "Maria Schmidt" : "Primarschule Musterstadt"
                }
              />
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[--gray-700]"
              >
                E-Mail-Adresse
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-3 text-[--text] placeholder:text-[--text-light] focus:outline-none focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary]"
                placeholder="ihre.email@example.com"
              />
            </div>

            {/* Canton Field */}
            <div>
              <label
                htmlFor="canton"
                className="mb-2 block text-sm font-medium text-[--gray-700]"
              >
                Kanton
              </label>
              <select
                id="canton"
                value={formData.canton}
                onChange={(e) => handleInputChange("canton", e.target.value)}
                required
                className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-3 text-[--text] focus:outline-none focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] appearance-none cursor-pointer"
              >
                <option value="">Kanton wahlen</option>
                <option value="ZH">Zurich</option>
                <option value="BE">Bern</option>
                <option value="LU">Luzern</option>
                <option value="UR">Uri</option>
                <option value="SZ">Schwyz</option>
                <option value="OW">Obwalden</option>
                <option value="NW">Nidwalden</option>
                <option value="GL">Glarus</option>
                <option value="ZG">Zug</option>
                <option value="FR">Freiburg</option>
                <option value="SO">Solothurn</option>
                <option value="BS">Basel-Stadt</option>
                <option value="BL">Basel-Landschaft</option>
                <option value="SH">Schaffhausen</option>
                <option value="AR">Appenzell Ausserrhoden</option>
                <option value="AI">Appenzell Innerrhoden</option>
                <option value="SG">St. Gallen</option>
                <option value="GR">Graubunden</option>
                <option value="AG">Aargau</option>
                <option value="TG">Thurgau</option>
                <option value="TI">Tessin</option>
                <option value="VD">Waadt</option>
                <option value="VS">Wallis</option>
                <option value="NE">Neuenburg</option>
                <option value="GE">Genf</option>
                <option value="JU">Jura</option>
              </select>
            </div>

            {/* Teacher-specific fields */}
            {accountType === "teacher" && (
              <>
                {/* Subjects */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-[--gray-700]">
                    Unterrichtsfacher
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      "Mathematik",
                      "Deutsch",
                      "Englisch",
                      "Franzosisch",
                      "NMG",
                      "BG",
                      "Musik",
                      "Sport",
                    ].map((subject) => (
                      <label
                        key={subject}
                        className={`flex items-center justify-center rounded-[--radius-sm] px-3 py-2 cursor-pointer transition-all text-sm font-medium border ${
                          formData.subjects.includes(subject)
                            ? "bg-[--primary] text-white border-[--primary]"
                            : "bg-white text-[--text-secondary] border-[--border] hover:border-[--primary]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={formData.subjects.includes(subject)}
                          onChange={(e) => {
                            const newSubjects = e.target.checked
                              ? [...formData.subjects, subject]
                              : formData.subjects.filter((s) => s !== subject);
                            handleInputChange("subjects", newSubjects);
                          }}
                        />
                        {subject}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cycles */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-[--gray-700]">
                    Unterrichtete Zyklen
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Zyklus 1", "Zyklus 2", "Zyklus 3"].map((cycle) => (
                      <label
                        key={cycle}
                        className={`flex items-center justify-center rounded-[--radius-sm] px-3 py-2 cursor-pointer transition-all text-sm font-medium border ${
                          formData.cycles.includes(cycle)
                            ? "bg-[--primary] text-white border-[--primary]"
                            : "bg-white text-[--text-secondary] border-[--border] hover:border-[--primary]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={formData.cycles.includes(cycle)}
                          onChange={(e) => {
                            const newCycles = e.target.checked
                              ? [...formData.cycles, cycle]
                              : formData.cycles.filter((c) => c !== cycle);
                            handleInputChange("cycles", newCycles);
                          }}
                        />
                        {cycle}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[--gray-700]"
              >
                Passwort
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-3 text-[--text] placeholder:text-[--text-light] focus:outline-none focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary]"
                placeholder="Mindestens 8 Zeichen"
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-[--gray-700]"
              >
                Passwort bestatigen
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
                className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-3 text-[--text] placeholder:text-[--text-light] focus:outline-none focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary]"
                placeholder="Passwort wiederholen"
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                required
                className="mt-0.5 h-4 w-4 rounded-[--radius-xs] border-[--border] text-[--primary] focus:ring-2 focus:ring-[--primary]/20"
              />
              <label htmlFor="terms" className="text-sm text-[--text-muted]">
                Ich akzeptiere die{" "}
                <a href="#" className="text-[--primary] hover:text-[--primary-hover] font-medium">
                  Allgemeinen Geschaftsbedingungen
                </a>{" "}
                und die{" "}
                <a href="#" className="text-[--primary] hover:text-[--primary-hover] font-medium">
                  Datenschutzerklarung
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-[--radius-sm] bg-[--primary] px-6 py-3 font-medium text-white hover:bg-[--primary-hover] transition-colors mt-2"
            >
              Konto erstellen
            </button>
          </form>
        </div>

        {/* Alternative Registration */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[--border]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[--background] px-4 text-[--text-muted]">
                Oder registrieren mit
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <button
              className="flex items-center justify-center gap-3 rounded-[--radius-sm] bg-white px-4 py-3 text-[--text-secondary] font-medium border border-[--border] hover:bg-[--gray-50] hover:border-[--gray-400] transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Mit Google registrieren
            </button>

            <button
              className="flex items-center justify-center gap-3 rounded-[--radius-sm] bg-white px-4 py-3 text-[--text-secondary] font-medium border border-[--border] hover:bg-[--gray-50] hover:border-[--gray-400] transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Mit GitHub registrieren
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-[--text-muted] hover:text-[--primary] transition-colors font-medium"
          >
            <svg className="mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zuruck zur Startseite
          </Link>
        </div>
      </main>
    </div>
  );
}
