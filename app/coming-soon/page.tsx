import Link from "next/link";
import TopBar from "@/components/ui/TopBar";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[--background]">
      <TopBar />
      <div className="flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl">
          <div className="flex items-center justify-center w-16 h-16 bg-[--primary-light] rounded-full mx-auto mb-6">
            <svg
              className="w-8 h-8 text-[--primary]"
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
          <h1 className="text-4xl font-bold text-[--text-heading] mb-4">
            Bald verfügbar
          </h1>
          <p className="text-lg text-[--text-muted] mb-8">
            Diese Funktion ist noch in Entwicklung. Wir arbeiten daran, sie so
            schnell wie möglich verfügbar zu machen.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-[--radius-md] bg-[--primary] px-6 py-3.5 font-semibold text-white hover:bg-[--primary-hover] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,82,204,0.25)]"
          >
            <svg
              className="mr-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
      </div>
    </div>
  );
}
