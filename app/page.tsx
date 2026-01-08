export default function Home() {
  return (
    <div className="min-h-screen bg-[--background]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-[--border] bg-[--surface]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[--primary] to-[--secondary]">
                <span className="text-xl font-bold text-[--background]">EL</span>
              </div>
              <span className="text-xl font-bold text-[--text]">Easy Lehrer</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#"
                className="text-[--text-muted] hover:text-[--text] transition-colors"
              >
                Ressourcen
              </a>
              <a
                href="#"
                className="text-[--text-muted] hover:text-[--text] transition-colors"
              >
                Für Schulen
              </a>
              <a
                href="#"
                className="text-[--text-muted] hover:text-[--text] transition-colors"
              >
                Über uns
              </a>
            </nav>

            {/* CTA Button */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="hidden sm:block text-[--text-muted] hover:text-[--text] transition-colors"
              >
                Anmelden
              </a>
              <a
                href="#"
                className="rounded-full bg-gradient-to-r from-[--primary] to-[--secondary] px-6 py-2.5 font-medium text-[--background] hover:opacity-90 transition-opacity shadow-lg shadow-[--primary]/20"
              >
                Registrieren
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section with Search */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[--surface] via-[--background] to-[--background]" />

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-[--text] sm:text-5xl lg:text-6xl">
                Unterrichtsmaterial von{" "}
                <span className="bg-gradient-to-r from-[--primary] to-[--secondary] bg-clip-text text-transparent">
                  Lehrpersonen
                </span>
                <br />
                für Lehrpersonen
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-[--text-muted]">
                Entdecken Sie qualitätsgeprüfte Materialien, abgestimmt auf den
                Lehrplan 21. Sparen Sie Zeit bei der Unterrichtsvorbereitung und
                teilen Sie Ihre eigenen Ressourcen.
              </p>

              {/* Search Bar - Airbnb style */}
              <div className="mx-auto mt-10 max-w-4xl">
                <div className="flex flex-col gap-4 rounded-2xl bg-[--surface] p-2 shadow-2xl shadow-[--primary]/10 sm:flex-row">
                  <div className="flex-1 px-4 py-3">
                    <label className="text-xs font-semibold text-[--text-muted]">
                      Fach
                    </label>
                    <input
                      type="text"
                      placeholder="z.B. Mathematik, Deutsch"
                      className="w-full bg-transparent text-[--text] outline-none placeholder:text-[--overlay1]"
                    />
                  </div>
                  <div className="hidden sm:block h-12 w-px self-center bg-[--border]" />
                  <div className="flex-1 px-4 py-3">
                    <label className="text-xs font-semibold text-[--text-muted]">
                      Zyklus
                    </label>
                    <input
                      type="text"
                      placeholder="1, 2 oder 3"
                      className="w-full bg-transparent text-[--text] outline-none placeholder:text-[--overlay1]"
                    />
                  </div>
                  <div className="hidden sm:block h-12 w-px self-center bg-[--border]" />
                  <div className="flex-1 px-4 py-3">
                    <label className="text-xs font-semibold text-[--text-muted]">
                      Thema
                    </label>
                    <input
                      type="text"
                      placeholder="Suchen..."
                      className="w-full bg-transparent text-[--text] outline-none placeholder:text-[--overlay1]"
                    />
                  </div>
                  <button className="rounded-xl bg-gradient-to-r from-[--primary] to-[--secondary] px-8 py-3 font-semibold text-[--background] hover:opacity-90 transition-opacity">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <span className="text-sm text-[--text-muted]">Beliebt:</span>
                {["Mathematik Zyklus 2", "Deutsch Lesen", "NMG Experimente", "Englisch Vocabulary"].map(
                  (tag) => (
                    <a
                      key={tag}
                      href="#"
                      className="rounded-full border border-[--border] bg-[--surface] px-4 py-1.5 text-sm text-[--text] hover:border-[--primary] hover:bg-[--surface1] transition-all"
                    >
                      {tag}
                    </a>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="border-t border-[--border] bg-[--surface]/30">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[--text]">
                Warum Easy Lehrer?
              </h2>
              <p className="mt-4 text-lg text-[--text-muted]">
                Die Plattform für Schweizer Lehrpersonen
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature Card 1 */}
              <div className="group rounded-2xl bg-[--surface] p-8 shadow-lg hover:shadow-2xl hover:shadow-[--primary]/10 transition-all duration-300 hover:-translate-y-1 border border-[--border] hover:border-[--primary]/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[--primary] to-[--sapphire]">
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
                <h3 className="mt-6 text-xl font-semibold text-[--text]">
                  Qualitätsgeprüft
                </h3>
                <p className="mt-3 text-[--text-muted] leading-relaxed">
                  Alle Materialien werden auf Qualität und Lehrplan-Konformität
                  geprüft. Nur die besten Ressourcen für Ihren Unterricht.
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="group rounded-2xl bg-[--surface] p-8 shadow-lg hover:shadow-2xl hover:shadow-[--secondary]/10 transition-all duration-300 hover:-translate-y-1 border border-[--border] hover:border-[--secondary]/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[--secondary] to-[--pink]">
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-[--text]">
                  Lehrplan 21 konform
                </h3>
                <p className="mt-3 text-[--text-muted] leading-relaxed">
                  Ressourcen sind nach Kompetenzen und Zyklen des Lehrplan 21
                  kategorisiert. Finden Sie genau das Richtige.
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="group rounded-2xl bg-[--surface] p-8 shadow-lg hover:shadow-2xl hover:shadow-[--accent]/10 transition-all duration-300 hover:-translate-y-1 border border-[--border] hover:border-[--accent]/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[--accent] to-[--flamingo]">
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
                <h3 className="mt-6 text-xl font-semibold text-[--text]">
                  Schullizenzen
                </h3>
                <p className="mt-3 text-[--text-muted] leading-relaxed">
                  Schulen können Team-Lizenzen erwerben und Materialien mit
                  allen Lehrpersonen teilen. Gemeinsam mehr erreichen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-t border-[--border]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-[--primary] to-[--secondary] bg-clip-text text-transparent">
                  500+
                </div>
                <div className="mt-2 text-sm text-[--text-muted]">
                  Qualitätsmaterialien
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-[--secondary] to-[--pink] bg-clip-text text-transparent">
                  1000+
                </div>
                <div className="mt-2 text-sm text-[--text-muted]">
                  Aktive Lehrpersonen
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-[--accent] to-[--flamingo] bg-clip-text text-transparent">
                  50+
                </div>
                <div className="mt-2 text-sm text-[--text-muted]">Schulen</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-[--teal] to-[--green] bg-clip-text text-transparent">
                  98%
                </div>
                <div className="mt-2 text-sm text-[--text-muted]">
                  Zufriedenheit
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-[--border] bg-gradient-to-br from-[--surface] to-[--background]">
          <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-[--text] sm:text-4xl">
              Bereit loszulegen?
            </h2>
            <p className="mt-4 text-lg text-[--text-muted]">
              Treten Sie unserer Community bei und entdecken Sie
              Unterrichtsmaterial, das begeistert.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#"
                className="rounded-full bg-gradient-to-r from-[--primary] to-[--secondary] px-8 py-4 font-semibold text-[--background] hover:opacity-90 transition-opacity shadow-lg shadow-[--primary]/20"
              >
                Kostenlos registrieren
              </a>
              <a
                href="#"
                className="rounded-full border border-[--border] bg-[--surface] px-8 py-4 font-semibold text-[--text] hover:bg-[--surface1] transition-colors"
              >
                Mehr erfahren
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[--border] bg-[--surface]/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Company */}
            <div>
              <h3 className="font-semibold text-[--text]">Easy Lehrer</h3>
              <p className="mt-4 text-sm text-[--text-muted]">
                Die Plattform für Unterrichtsmaterial von Lehrpersonen für
                Lehrpersonen.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-[--text]">Produkt</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors"
                  >
                    Ressourcen
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors"
                  >
                    Für Schulen
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors"
                  >
                    Preise
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-[--text]">Unternehmen</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors"
                  >
                    Über uns
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors"
                  >
                    Kontakt
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-[--text]">Rechtliches</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors"
                  >
                    Datenschutz
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors"
                  >
                    AGB
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors"
                  >
                    Impressum
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-[--border] pt-8 text-center text-sm text-[--text-muted]">
            <p>© 2026 Easy Lehrer. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
