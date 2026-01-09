"use client";

interface ProfileCompletionBannerProps {
  missingFields: string[];
  onComplete: () => void;
}

export function ProfileCompletionBanner({
  missingFields,
  onComplete,
}: ProfileCompletionBannerProps) {
  if (missingFields.length === 0) return null;

  return (
    <div className="rounded-xl border border-[--yellow]/50 bg-[--yellow]/10 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[--yellow]/20">
          <svg
            className="h-5 w-5 text-[--yellow]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-[--text]">
            Profil vervollständigen
          </h3>
          <p className="mt-1 text-sm text-[--text-muted]">
            Bevor Sie Materialien hochladen können, müssen Sie folgende Angaben
            ergänzen:
          </p>
          <ul className="mt-3 space-y-1">
            {missingFields.map((field) => (
              <li
                key={field}
                className="flex items-center gap-2 text-sm text-[--red]"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                {field}
              </li>
            ))}
          </ul>
          <button
            onClick={onComplete}
            className="mt-4 rounded-lg bg-gradient-to-r from-[--primary] to-[--secondary] px-4 py-2 text-sm font-medium text-[--background] hover:opacity-90 transition-opacity"
          >
            Profil vervollständigen
          </button>
        </div>
      </div>
    </div>
  );
}
