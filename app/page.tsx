export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold text-gray-900">Easy Lehrer</div>
          <nav className="flex items-center gap-6">
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Ressourcen
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Für Schulen
            </a>
            <a
              href="#"
              className="rounded-lg bg-[--primary] px-4 py-2 text-white hover:bg-[--primary-hover]"
            >
              Anmelden
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Unterrichtsmaterial von Lehrpersonen für Lehrpersonen
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Entdecken Sie qualitätsgeprüfte Materialien, abgestimmt auf den
              Lehrplan 21. Sparen Sie Zeit bei der Unterrichtsvorbereitung.
            </p>
            <div className="mt-10 flex gap-4">
              <a
                href="#"
                className="rounded-lg bg-[--primary] px-6 py-3 font-medium text-white hover:bg-[--primary-hover]"
              >
                Ressourcen entdecken
              </a>
              <a
                href="#"
                className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                Mehr erfahren
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="text-2xl font-semibold text-gray-900">
              Warum Easy Lehrer?
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <div>
                <div className="text-lg font-medium text-gray-900">
                  Qualitätsgeprüft
                </div>
                <p className="mt-2 text-gray-600">
                  Alle Materialien werden auf Qualität und Lehrplan-Konformität
                  geprüft.
                </p>
              </div>
              <div>
                <div className="text-lg font-medium text-gray-900">
                  Lehrplan 21
                </div>
                <p className="mt-2 text-gray-600">
                  Ressourcen sind nach Kompetenzen und Zyklen des Lehrplan 21
                  kategorisiert.
                </p>
              </div>
              <div>
                <div className="text-lg font-medium text-gray-900">
                  Schullizenzen
                </div>
                <p className="mt-2 text-gray-600">
                  Schulen können Team-Lizenzen erwerben und Materialien mit
                  allen Lehrpersonen teilen.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-gray-500">
          © 2026 Easy Lehrer. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
}
