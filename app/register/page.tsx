"use client";

import { useState } from "react";
import Link from "next/link";
import { content } from "@/lib/content";

const { common, registerPage } = content;

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

  const handleInputChange = (field: string, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="min-h-screen geometric-bg relative flex flex-col">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-[--primary] opacity-[0.03] blur-3xl"></div>
        <div className="absolute bottom-40 left-20 w-80 h-80 rounded-full bg-[--accent] opacity-[0.03] blur-3xl"></div>
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] rounded-full bg-[--secondary] opacity-[0.02] blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-[--primary] rounded-[--radius-md]">
            <span className="text-white font-bold text-lg">{common.brand.logoText}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-[--text-heading] leading-tight">{common.brand.name}</span>
            <span className="text-xs text-[--text-muted] leading-tight">{common.brand.tagline}</span>
          </div>
        </Link>
      </header>

      {/* Main Content - Centered Glass Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-lg">
          {/* Glass-morphic Card */}
          <div className="glass-card p-8 sm:p-10">
            {/* Title */}
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-[--text-heading]">{registerPage.title}</h1>
              <p className="mt-3 text-[--text-muted]">
                {registerPage.subtitle}
              </p>
            </div>

            {/* Account Type Selector */}
            <div className="mb-6 rounded-[--radius-lg] bg-[--gray-100] p-1">
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setAccountType("teacher")}
                  className={`rounded-[--radius-md] px-6 py-3 font-semibold text-sm transition-all ${
                    accountType === "teacher"
                      ? "bg-[--primary] text-white shadow-sm"
                      : "text-[--text-muted] hover:text-[--text-heading]"
                  }`}
                >
                  {registerPage.accountTypes.teacher}
                </button>
                <button
                  onClick={() => setAccountType("school")}
                  className={`rounded-[--radius-md] px-6 py-3 font-semibold text-sm transition-all ${
                    accountType === "school"
                      ? "bg-[--primary] text-white shadow-sm"
                      : "text-[--text-muted] hover:text-[--text-heading]"
                  }`}
                >
                  {registerPage.accountTypes.school}
                </button>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-[--text-heading]"
                >
                  {accountType === "teacher" ? "Vollstandiger Name" : "Name der Institution"}
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-3.5 text-[--text-heading] placeholder:text-[--text-light] focus:outline-none focus:border-[--primary] focus:ring-[3px] focus:ring-[--primary-light] transition-all"
                  placeholder={
                    accountType === "teacher" ? "Maria Schmidt" : "Primarschule Musterstadt"
                  }
                />
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[--text-heading]"
                >
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className={`w-full rounded-[--radius-md] border bg-white px-4 py-3.5 text-[--text-heading] placeholder:text-[--text-light] focus:outline-none focus:ring-[3px] transition-all ${
                    formData.email && !isValidEmail(formData.email)
                      ? "border-[--error] focus:border-[--error] focus:ring-[--error-light]"
                      : "border-[--border] focus:border-[--primary] focus:ring-[--primary-light]"
                  }`}
                  placeholder="ihre.email@example.com"
                />
                {formData.email && !isValidEmail(formData.email) && (
                  <p className="mt-2 text-sm text-[--error] animate-fade-in">
                    Bitte geben Sie eine gultige E-Mail-Adresse ein
                  </p>
                )}
              </div>

              {/* Canton Field */}
              <div>
                <label
                  htmlFor="canton"
                  className="mb-2 block text-sm font-medium text-[--text-heading]"
                >
                  Kanton
                </label>
                <select
                  id="canton"
                  value={formData.canton}
                  onChange={(e) => handleInputChange("canton", e.target.value)}
                  required
                  className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-3.5 text-[--text-heading] focus:outline-none focus:border-[--primary] focus:ring-[3px] focus:ring-[--primary-light] appearance-none cursor-pointer transition-all"
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
                    <label className="mb-3 block text-sm font-medium text-[--text-heading]">
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
                          className={`flex items-center justify-center rounded-full px-3 py-2 cursor-pointer transition-all text-sm font-medium ${
                            formData.subjects.includes(subject)
                              ? "bg-[--primary] text-white"
                              : "bg-[--gray-100] text-[--text-body] hover:bg-[--gray-200]"
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
                    <label className="mb-3 block text-sm font-medium text-[--text-heading]">
                      Unterrichtete Zyklen
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Zyklus 1", "Zyklus 2", "Zyklus 3"].map((cycle) => (
                        <label
                          key={cycle}
                          className={`flex items-center justify-center rounded-full px-3 py-2.5 cursor-pointer transition-all text-sm font-medium ${
                            formData.cycles.includes(cycle)
                              ? "bg-[--primary] text-white"
                              : "bg-[--gray-100] text-[--text-body] hover:bg-[--gray-200]"
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
                  className="mb-2 block text-sm font-medium text-[--text-heading]"
                >
                  Passwort
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  className={`w-full rounded-[--radius-md] border bg-white px-4 py-3.5 text-[--text-heading] placeholder:text-[--text-light] focus:outline-none focus:ring-[3px] transition-all ${
                    formData.password && formData.password.length < 8
                      ? "border-[--error] focus:border-[--error] focus:ring-[--error-light]"
                      : "border-[--border] focus:border-[--primary] focus:ring-[--primary-light]"
                  }`}
                  placeholder="Mindestens 8 Zeichen"
                />
                {formData.password && formData.password.length < 8 && (
                  <p className="mt-2 text-sm text-[--error] animate-fade-in">
                    Passwort muss mindestens 8 Zeichen lang sein
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-[--text-heading]"
                >
                  Passwort bestatigen
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  className={`w-full rounded-[--radius-md] border bg-white px-4 py-3.5 text-[--text-heading] placeholder:text-[--text-light] focus:outline-none focus:ring-[3px] transition-all ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? "border-[--error] focus:border-[--error] focus:ring-[--error-light]"
                      : "border-[--border] focus:border-[--primary] focus:ring-[--primary-light]"
                  }`}
                  placeholder="Passwort wiederholen"
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-2 text-sm text-[--error] animate-fade-in">
                    Passworter stimmen nicht uberein
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                  required
                  className="mt-0.5 h-4 w-4 rounded border-[--border] text-[--primary] focus:ring-2 focus:ring-[--primary-light] cursor-pointer"
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

              {/* Submit Button - Only visible when all validations pass */}
              {formData.name && formData.email && isValidEmail(formData.email) && formData.canton && formData.password && formData.password.length >= 8 && formData.confirmPassword && formData.password === formData.confirmPassword && formData.agreeToTerms && (
                <button
                  type="submit"
                  className="w-full rounded-[--radius-md] bg-[--primary] px-6 py-3.5 font-semibold text-white hover:bg-[--primary-hover] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,82,204,0.25)] mt-2 animate-fade-in"
                >
                  Konto erstellen
                </button>
              )}
            </form>

            {/* Divider */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[--border]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white/90 px-4 text-[--text-muted]">
                    Oder registrieren mit
                  </span>
                </div>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid gap-3">
              <button
                className="flex items-center justify-center gap-3 rounded-[--radius-md] bg-[--gray-100] px-4 py-3.5 text-[--text-heading] font-medium hover:bg-[--gray-200] transition-all"
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
                className="flex items-center justify-center gap-3 rounded-[--radius-md] bg-[--gray-100] px-4 py-3.5 text-[--text-heading] font-medium hover:bg-[--gray-200] transition-all"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                Mit GitHub registrieren
              </button>
            </div>

            {/* Login Link */}
            <p className="mt-6 text-center text-[--text-muted]">
              Bereits registriert?{" "}
              <Link
                href="/login"
                className="font-semibold text-[--primary] hover:text-[--primary-hover] transition-colors"
              >
                Anmelden
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-[--text-muted] hover:text-[--primary] transition-colors font-medium"
        >
          <svg className="mr-1.5 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {common.buttons.backToHome}
        </Link>
      </footer>
    </div>
  );
}
