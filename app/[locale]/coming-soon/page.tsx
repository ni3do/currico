import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

export default function ComingSoonPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-light)]">
            <svg
              className="h-8 w-8 text-[var(--color-primary)]"
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
          <h1 className="mb-4 text-4xl font-bold text-[var(--color-text)]">Bald verfügbar</h1>
          <p className="mb-8 text-lg text-[var(--color-text-muted)]">
            Diese Funktion ist noch in Entwicklung. Wir arbeiten daran, sie so schnell wie möglich
            verfügbar zu machen.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 py-3.5 font-semibold text-[var(--btn-primary-text)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-primary-hover)] hover:shadow-[0_8px_20px_rgba(0,82,204,0.25)]"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Zurück zur Startseite
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
