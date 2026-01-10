"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-[--background]">
      {/* Sticky Header - Clean with soft shadow */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[--primary]" style={{ boxShadow: 'var(--shadow-brand)' }}>
                <span className="text-xl font-bold text-white">EL</span>
              </div>
              <span className="text-xl font-bold text-[--gray-800]">Easy Lehrer</span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="/resources"
                className="text-[--text-muted] hover:text-[--text] transition-colors font-medium"
              >
                Ressourcen
              </a>
              <a
                href="#"
                className="text-[--text-muted] hover:text-[--text] transition-colors font-medium"
              >
                Fur Schulen
              </a>
              <a
                href="#"
                className="text-[--text-muted] hover:text-[--text] transition-colors font-medium"
              >
                Uber uns
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
              <a
                href="/login"
                className="hidden sm:block text-[--text-muted] hover:text-[--text] transition-colors font-medium"
              >
                Anmelden
              </a>
              <a
                href="/register"
                className="rounded-full bg-[--primary] px-6 py-2.5 font-semibold text-white hover:bg-[--primary-hover] transition-all"
                style={{ boxShadow: 'var(--shadow-brand)' }}
              >
                Registrieren
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section with Floating Search */}
        <section className="relative overflow-hidden bg-[--background-alt]">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-[--gray-50] to-[--background-alt]" />

          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-[--gray-800] sm:text-5xl lg:text-6xl">
                Unterrichtsmaterial von{" "}
                <span className="text-[--primary]">
                  Lehrpersonen
                </span>
                <br />
                fur Lehrpersonen
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-[--text-muted] leading-relaxed">
                Entdecken Sie qualitatsgeprüfte Materialien, abgestimmt auf den
                Lehrplan 21. Sparen Sie Zeit bei der Unterrichtsvorbereitung und
                teilen Sie Ihre eigenen Ressourcen.
              </p>

              {/* Floating Search Bar - Hero Element */}
              <div className="mx-auto mt-12 max-w-4xl">
                <div
                  className="flex flex-col gap-2 rounded-[24px] bg-white p-2 sm:flex-row sm:items-center"
                  style={{ boxShadow: 'var(--shadow-xl)' }}
                >
                  <div className="flex-1 px-5 py-3">
                    <label className="text-xs font-semibold text-[--gray-800] uppercase tracking-wide">
                      Fach
                    </label>
                    <input
                      type="text"
                      placeholder="z.B. Mathematik, Deutsch"
                      className="w-full bg-transparent text-[--text] outline-none placeholder:text-[--text-light] text-base mt-1"
                    />
                  </div>
                  <div className="hidden sm:block h-10 w-px bg-[--border]" />
                  <div className="flex-1 px-5 py-3">
                    <label className="text-xs font-semibold text-[--gray-800] uppercase tracking-wide">
                      Zyklus
                    </label>
                    <input
                      type="text"
                      placeholder="1, 2 oder 3"
                      className="w-full bg-transparent text-[--text] outline-none placeholder:text-[--text-light] text-base mt-1"
                    />
                  </div>
                  <div className="hidden sm:block h-10 w-px bg-[--border]" />
                  <div className="flex-1 px-5 py-3">
                    <label className="text-xs font-semibold text-[--gray-800] uppercase tracking-wide">
                      Thema
                    </label>
                    <input
                      type="text"
                      placeholder="Suchen..."
                      className="w-full bg-transparent text-[--text] outline-none placeholder:text-[--text-light] text-base mt-1"
                    />
                  </div>
                  {/* Circular Search Button */}
                  <button
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[--primary] text-white hover:bg-[--primary-hover] transition-all shrink-0 m-1"
                    style={{ boxShadow: 'var(--shadow-brand)' }}
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
                        strokeWidth={2.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Filter Chips - Pill shaped */}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <span className="text-sm text-[--text-muted] font-medium py-2">Beliebt:</span>
                {["Mathematik Zyklus 2", "Deutsch Lesen", "NMG Experimente", "Englisch Vocabulary"].map(
                  (tag) => (
                    <a
                      key={tag}
                      href="#"
                      className="rounded-full bg-[--gray-100] px-4 py-2 text-sm font-medium text-[--text] hover:bg-[--primary] hover:text-white transition-all"
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
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[--gray-800] sm:text-4xl">
                Warum Easy Lehrer?
              </h2>
              <p className="mt-4 text-lg text-[--text-muted]">
                Die Plattform fur Schweizer Lehrpersonen
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature Card 1 */}
              <div
                className="group rounded-[16px] bg-white p-8 transition-all duration-300 hover:-translate-y-1"
                style={{ boxShadow: 'var(--shadow-md)' }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-[--primary]">
                  <svg
                    className="h-7 w-7 text-white"
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
                <h3 className="mt-6 text-xl font-bold text-[--gray-800]">
                  Qualitatsgeprüft
                </h3>
                <p className="mt-3 text-[--text-muted] leading-relaxed">
                  Alle Materialien werden auf Qualitat und Lehrplan-Konformitat
                  geprüft. Nur die besten Ressourcen fur Ihren Unterricht.
                </p>
              </div>

              {/* Feature Card 2 */}
              <div
                className="group rounded-[16px] bg-white p-8 transition-all duration-300 hover:-translate-y-1"
                style={{ boxShadow: 'var(--shadow-md)' }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-[--secondary]">
                  <svg
                    className="h-7 w-7 text-white"
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
                <h3 className="mt-6 text-xl font-bold text-[--gray-800]">
                  Lehrplan 21 konform
                </h3>
                <p className="mt-3 text-[--text-muted] leading-relaxed">
                  Ressourcen sind nach Kompetenzen und Zyklen des Lehrplan 21
                  kategorisiert. Finden Sie genau das Richtige.
                </p>
              </div>

              {/* Feature Card 3 */}
              <div
                className="group rounded-[16px] bg-white p-8 transition-all duration-300 hover:-translate-y-1"
                style={{ boxShadow: 'var(--shadow-md)' }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-[--primary]">
                  <svg
                    className="h-7 w-7 text-white"
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
                <h3 className="mt-6 text-xl font-bold text-[--gray-800]">
                  Schullizenzen
                </h3>
                <p className="mt-3 text-[--text-muted] leading-relaxed">
                  Schulen konnen Team-Lizenzen erwerben und Materialien mit
                  allen Lehrpersonen teilen. Gemeinsam mehr erreichen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-[--background-alt] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-5xl font-extrabold text-[--primary]">
                  500+
                </div>
                <div className="mt-3 text-base text-[--text-muted] font-medium">
                  Qualitatsmaterialien
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-extrabold text-[--secondary]">
                  1000+
                </div>
                <div className="mt-3 text-base text-[--text-muted] font-medium">
                  Aktive Lehrpersonen
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-extrabold text-[--primary]">
                  50+
                </div>
                <div className="mt-3 text-base text-[--text-muted] font-medium">
                  Schulen
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-extrabold text-[--secondary]">
                  98%
                </div>
                <div className="mt-3 text-base text-[--text-muted] font-medium">
                  Zufriedenheit
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-[--gray-800] sm:text-4xl">
              Bereit loszulegen?
            </h2>
            <p className="mt-4 text-lg text-[--text-muted]">
              Treten Sie unserer Community bei und entdecken Sie
              Unterrichtsmaterial, das begeistert.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="rounded-full bg-[--primary] px-8 py-4 font-semibold text-white hover:bg-[--primary-hover] transition-all"
                style={{ boxShadow: 'var(--shadow-brand)' }}
              >
                Kostenlos registrieren
              </a>
              <a
                href="/resources"
                className="rounded-full bg-white px-8 py-4 font-semibold text-[--text] hover:bg-[--gray-50] transition-colors"
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                Ressourcen entdecken
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[--background-alt]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Company */}
            <div>
              <h3 className="font-bold text-[--gray-800]">Easy Lehrer</h3>
              <p className="mt-4 text-sm text-[--text-muted] leading-relaxed">
                Die Plattform fur Unterrichtsmaterial von Lehrpersonen fur
                Lehrpersonen.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-bold text-[--gray-800]">Produkt</h3>
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
                    Fur Schulen
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
              <h3 className="font-bold text-[--gray-800]">Unternehmen</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors"
                  >
                    Uber uns
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
              <h3 className="font-bold text-[--gray-800]">Rechtliches</h3>
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
            <p>&copy; 2026 Easy Lehrer. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
