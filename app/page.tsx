"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[--background]">
      {/* Top Bar - Institutional accent line */}
      <div className="h-1 bg-[--primary]" />

      {/* Header - Strict Horizontal Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-[--border]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Professional, Institutional */}
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-[--primary] rounded-[--radius-sm]">
                <span className="text-white font-bold text-lg">EL</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-[--gray-800] leading-tight">EasyLehrer</span>
                <span className="text-xs text-[--text-muted] leading-tight">Bildungsplattform Schweiz</span>
              </div>
            </Link>

            {/* Navigation - Strict Horizontal */}
            <nav className="hidden lg:flex items-center">
              <div className="flex items-center border-r border-[--border] pr-6 mr-6">
                <Link href="/resources" className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors">
                  Ressourcen
                </Link>
                <a href="#" className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors">
                  Fur Schulen
                </a>
                <a href="#" className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors">
                  Uber uns
                </a>
                <a href="#" className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors">
                  Kontakt
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/login" className="px-4 py-2 text-[--text-secondary] hover:text-[--primary] font-medium text-sm transition-colors">
                  Anmelden
                </Link>
                <Link
                  href="/register"
                  className="rounded-[--radius-sm] bg-[--primary] px-5 py-2 font-medium text-white text-sm hover:bg-[--primary-hover] transition-colors"
                >
                  Registrieren
                </Link>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 text-[--text-secondary] hover:text-[--primary]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section - Split-Screen Layout */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 py-16 lg:py-24 items-center">
              {/* Left Side - Text Content */}
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[--primary-light] rounded-[--radius-sm] mb-6">
                  <span className="text-[--primary] text-sm font-medium">Offizielle Bildungsplattform</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[--gray-800] leading-tight tracking-tight">
                  Qualitatsgesicherte Unterrichtsmaterialien fur Schweizer Schulen
                </h1>
                <p className="mt-6 text-lg text-[--text-muted] leading-relaxed max-w-xl">
                  Entdecken Sie professionelle Lehrmittel, entwickelt von Lehrpersonen
                  und abgestimmt auf den Lehrplan 21. Vertrauenswurdig, gepruft, sofort einsetzbar.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/resources"
                    className="inline-flex items-center justify-center rounded-[--radius-sm] bg-[--primary] px-6 py-3 font-medium text-white hover:bg-[--primary-hover] transition-colors"
                  >
                    Materialien durchsuchen
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <a
                    href="#features"
                    className="inline-flex items-center justify-center rounded-[--radius-sm] bg-white px-6 py-3 font-medium text-[--text-secondary] border border-[--border] hover:border-[--primary] hover:text-[--primary] transition-colors"
                  >
                    Mehr erfahren
                  </a>
                </div>
                <div className="mt-10 pt-8 border-t border-[--border]">
                  <p className="text-sm text-[--text-muted] mb-3">Vertraut von Bildungsinstitutionen</p>
                  <div className="flex items-center gap-6 text-[--text-light]">
                    <span className="text-sm font-medium">Lehrplan 21 konform</span>
                    <span className="text-[--border]">|</span>
                    <span className="text-sm font-medium">Qualitatsgepruft</span>
                    <span className="text-[--border]">|</span>
                    <span className="text-sm font-medium">Schweizer Standard</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Hero Image */}
              <div className="order-1 lg:order-2">
                <div
                  className="w-full h-[320px] sm:h-[400px] lg:h-[480px] rounded-[--radius-lg] bg-[--gray-100]"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category Navigation - Clean Horizontal */}
        <section className="bg-[--background-alt] border-y border-[--border]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 py-4 overflow-x-auto">
              <a href="#" className="px-4 py-2 rounded-[--radius-sm] bg-[--primary] text-white font-medium text-sm whitespace-nowrap">
                Alle Facher
              </a>
              <a href="#" className="px-4 py-2 rounded-[--radius-sm] text-[--text-secondary] font-medium text-sm whitespace-nowrap hover:bg-[--gray-100] transition-colors">
                Naturwissenschaften
              </a>
              <a href="#" className="px-4 py-2 rounded-[--radius-sm] text-[--text-secondary] font-medium text-sm whitespace-nowrap hover:bg-[--gray-100] transition-colors">
                Sprachen
              </a>
              <a href="#" className="px-4 py-2 rounded-[--radius-sm] text-[--text-secondary] font-medium text-sm whitespace-nowrap hover:bg-[--gray-100] transition-colors">
                Mathematik
              </a>
              <a href="#" className="px-4 py-2 rounded-[--radius-sm] text-[--text-secondary] font-medium text-sm whitespace-nowrap hover:bg-[--gray-100] transition-colors">
                Gestalten
              </a>
              <a href="#" className="px-4 py-2 rounded-[--radius-sm] text-[--text-secondary] font-medium text-sm whitespace-nowrap hover:bg-[--gray-100] transition-colors">
                Geschichte
              </a>
              <a href="#" className="px-4 py-2 rounded-[--radius-sm] text-[--text-secondary] font-medium text-sm whitespace-nowrap hover:bg-[--gray-100] transition-colors">
                Musik
              </a>
            </div>
          </div>
        </section>

        {/* Featured Resources - Clean Card Grid */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-[--gray-800]">Empfohlene Materialien</h2>
                <p className="mt-2 text-[--text-muted]">Von Experten ausgewahlt und qualitatsgepruft</p>
              </div>
              <Link href="/resources" className="hidden sm:flex items-center text-[--primary] font-medium text-sm hover:underline">
                Alle anzeigen
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Card 1 */}
              <article className="group bg-white border border-[--border] rounded-[--radius-lg] overflow-hidden hover:border-[--primary] hover:shadow-[var(--shadow-md)] transition-all">
                <div
                  className="w-full h-[180px] bg-[--gray-100]"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-[--accent-light] text-[--accent] text-xs font-medium rounded-[--radius-xs]">
                      Naturwissenschaften
                    </span>
                    <span className="px-2 py-1 bg-[--gray-100] text-[--text-muted] text-xs font-medium rounded-[--radius-xs]">
                      Zyklus 2
                    </span>
                  </div>
                  <h3 className="font-semibold text-[--gray-800] group-hover:text-[--primary] transition-colors">
                    Naturkunde Experimente
                  </h3>
                  <p className="mt-2 text-sm text-[--text-muted] line-clamp-2">
                    Praxisnahe Experimente und Arbeitsblatter fur den naturwissenschaftlichen Unterricht.
                  </p>
                  <div className="mt-4 pt-4 border-t border-[--border] flex items-center justify-between">
                    <span className="text-sm text-[--text-muted]">12 Dokumente</span>
                    <div className="flex items-center gap-1 text-sm font-medium text-[--text-secondary]">
                      <svg className="w-4 h-4 text-[--warning]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      4.9
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 2 */}
              <article className="group bg-white border border-[--border] rounded-[--radius-lg] overflow-hidden hover:border-[--primary] hover:shadow-[var(--shadow-md)] transition-all">
                <div
                  className="w-full h-[180px] bg-[--gray-100]"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-[--secondary-light] text-[--secondary] text-xs font-medium rounded-[--radius-xs]">
                      Sprachen
                    </span>
                    <span className="px-2 py-1 bg-[--gray-100] text-[--text-muted] text-xs font-medium rounded-[--radius-xs]">
                      Zyklus 1-2
                    </span>
                  </div>
                  <h3 className="font-semibold text-[--gray-800] group-hover:text-[--primary] transition-colors">
                    Deutsch Lesetraining
                  </h3>
                  <p className="mt-2 text-sm text-[--text-muted] line-clamp-2">
                    Strukturierte Lesetexte mit differenzierten Aufgaben fur verschiedene Niveaus.
                  </p>
                  <div className="mt-4 pt-4 border-t border-[--border] flex items-center justify-between">
                    <span className="text-sm text-[--text-muted]">8 Dokumente</span>
                    <div className="flex items-center gap-1 text-sm font-medium text-[--text-secondary]">
                      <svg className="w-4 h-4 text-[--warning]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      4.8
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 3 */}
              <article className="group bg-white border border-[--border] rounded-[--radius-lg] overflow-hidden hover:border-[--primary] hover:shadow-[var(--shadow-md)] transition-all">
                <div
                  className="w-full h-[180px] bg-[--gray-100]"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-[--primary-light] text-[--primary] text-xs font-medium rounded-[--radius-xs]">
                      Mathematik
                    </span>
                    <span className="px-2 py-1 bg-[--gray-100] text-[--text-muted] text-xs font-medium rounded-[--radius-xs]">
                      Zyklus 1
                    </span>
                  </div>
                  <h3 className="font-semibold text-[--gray-800] group-hover:text-[--primary] transition-colors">
                    Mathematik Grundlagen
                  </h3>
                  <p className="mt-2 text-sm text-[--text-muted] line-clamp-2">
                    Systematische Ubungsblatter fur den Aufbau mathematischer Grundkompetenzen.
                  </p>
                  <div className="mt-4 pt-4 border-t border-[--border] flex items-center justify-between">
                    <span className="text-sm text-[--text-muted]">15 Dokumente</span>
                    <div className="flex items-center gap-1 text-sm font-medium text-[--text-secondary]">
                      <svg className="w-4 h-4 text-[--warning]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      4.7
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/resources" className="inline-flex items-center text-[--primary] font-medium text-sm hover:underline">
                Alle Materialien anzeigen
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section - Clean Grid */}
        <section id="features" className="bg-[--background-alt] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-semibold text-[--gray-800]">
                Warum EasyLehrer?
              </h2>
              <p className="mt-4 text-lg text-[--text-muted]">
                Eine Plattform, die den Anspruchen von Schweizer Bildungsinstitutionen gerecht wird.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-white rounded-[--radius-lg] p-8 border border-[--border]">
                <div className="flex items-center justify-center w-12 h-12 bg-[--primary-light] rounded-[--radius-md] mb-6">
                  <svg className="w-6 h-6 text-[--primary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[--gray-800]">
                  Qualitatsgepruft
                </h3>
                <p className="mt-3 text-[--text-muted] leading-relaxed">
                  Jedes Material wird von Fachexperten auf padagogische Qualitat und Lehrplan-Konformitat gepruft.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-[--radius-lg] p-8 border border-[--border]">
                <div className="flex items-center justify-center w-12 h-12 bg-[--accent-light] rounded-[--radius-md] mb-6">
                  <svg className="w-6 h-6 text-[--accent]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[--gray-800]">
                  Lehrplan 21 konform
                </h3>
                <p className="mt-3 text-[--text-muted] leading-relaxed">
                  Alle Ressourcen sind nach Kompetenzbereichen und Zyklen des Lehrplan 21 kategorisiert.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-[--radius-lg] p-8 border border-[--border]">
                <div className="flex items-center justify-center w-12 h-12 bg-[--secondary-light] rounded-[--radius-md] mb-6">
                  <svg className="w-6 h-6 text-[--secondary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[--gray-800]">
                  Schullizenzen
                </h3>
                <p className="mt-3 text-[--text-muted] leading-relaxed">
                  Institutionelle Lizenzen ermoglichen die gemeinsame Nutzung von Materialien im gesamten Kollegium.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Clean numbers */}
        <section className="bg-white py-16 border-y border-[--border]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-[--primary]">500+</div>
                <div className="mt-2 text-sm text-[--text-muted] font-medium">Geprufte Materialien</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[--accent]">1&apos;000+</div>
                <div className="mt-2 text-sm text-[--text-muted] font-medium">Aktive Lehrpersonen</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[--secondary]">50+</div>
                <div className="mt-2 text-sm text-[--text-muted] font-medium">Partnerschulen</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[--primary]">98%</div>
                <div className="mt-2 text-sm text-[--text-muted] font-medium">Zufriedenheitsrate</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[--primary] py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">
              Bereit, Ihren Unterricht zu bereichern?
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Registrieren Sie sich kostenlos und erhalten Sie Zugang zu hochwertigen Unterrichtsmaterialien.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-[--radius-sm] bg-white px-6 py-3 font-medium text-[--primary] hover:bg-[--gray-100] transition-colors"
              >
                Kostenlos registrieren
              </Link>
              <Link
                href="/resources"
                className="inline-flex items-center justify-center rounded-[--radius-sm] bg-transparent px-6 py-3 font-medium text-white border border-white/30 hover:bg-white/10 transition-colors"
              >
                Ressourcen durchsuchen
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Clean Institutional */}
      <footer className="bg-[--gray-800]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-white rounded-[--radius-xs]">
                  <span className="text-[--primary] font-bold text-sm">EL</span>
                </div>
                <span className="text-lg font-semibold text-white">EasyLehrer</span>
              </div>
              <p className="text-sm text-[--gray-400] leading-relaxed">
                Die offizielle Plattform fur Unterrichtsmaterial von Schweizer Lehrpersonen.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Plattform</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/resources" className="text-sm text-[--gray-400] hover:text-white transition-colors">Ressourcen</Link></li>
                <li><a href="#" className="text-sm text-[--gray-400] hover:text-white transition-colors">Fur Schulen</a></li>
                <li><a href="#" className="text-sm text-[--gray-400] hover:text-white transition-colors">Preise</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Information</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm text-[--gray-400] hover:text-white transition-colors">Uber uns</a></li>
                <li><a href="#" className="text-sm text-[--gray-400] hover:text-white transition-colors">Kontakt</a></li>
                <li><a href="#" className="text-sm text-[--gray-400] hover:text-white transition-colors">Hilfe</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Rechtliches</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm text-[--gray-400] hover:text-white transition-colors">Datenschutz</a></li>
                <li><a href="#" className="text-sm text-[--gray-400] hover:text-white transition-colors">AGB</a></li>
                <li><a href="#" className="text-sm text-[--gray-400] hover:text-white transition-colors">Impressum</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[--gray-700] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[--gray-400]">
              2026 EasyLehrer. Alle Rechte vorbehalten.
            </p>
            <p className="text-sm text-[--gray-500]">
              Eine Initiative fur Schweizer Bildung
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
