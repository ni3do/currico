import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

export default function ComingSoonPage() {
  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="max-w-2xl text-center">
          <div className="bg-primary-light mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
            <svg
              className="text-primary h-8 w-8"
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
          <h1 className="text-text mb-4 text-2xl font-bold sm:text-3xl">Bald verfügbar</h1>
          <p className="text-text-muted mb-8 text-lg">
            Diese Funktion ist noch in Entwicklung. Wir arbeiten daran, sie so schnell wie möglich
            verfügbar zu machen.
          </p>
          <Link
            href="/"
            className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center justify-center rounded-lg px-6 py-3.5 font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,82,204,0.25)]"
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
