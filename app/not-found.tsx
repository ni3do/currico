import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="de">
      <body className="bg-bg text-text flex min-h-screen items-center justify-center">
        <div className="mx-auto max-w-md px-6 text-center">
          <p className="text-primary text-6xl font-extrabold">404</p>
          <h1 className="mt-4 text-2xl font-bold">Seite nicht gefunden</h1>
          <p className="text-text-muted mt-3 leading-relaxed">
            Die gesuchte Seite existiert nicht oder wurde verschoben.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/de"
              className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold transition-colors"
            >
              Zur Startseite
            </Link>
            <Link
              href="/de/materialien"
              className="text-primary hover:text-primary-hover inline-flex items-center text-sm font-medium transition-colors"
            >
              Materialien durchsuchen
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
