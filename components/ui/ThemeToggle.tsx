"use client";

import { useTheme, useIsMounted, type Theme } from "@/components/providers/ThemeProvider";

const themes: Theme[] = ["light", "system", "dark"];

const icons = {
  light: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  ),
  system: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  ),
  dark: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
};

const labels: Record<Theme, string> = {
  light: "Light",
  system: "System",
  dark: "Dark",
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();

  const cycleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // Prevent hydration mismatch — render a visually identical but non-functional button
  if (!mounted) {
    return (
      <button
        className="group border-border bg-surface text-text-secondary hover:bg-surface-elevated hover:text-text relative flex h-7 w-7 items-center justify-center rounded-md border transition-all duration-200"
        aria-label="Toggle theme"
        aria-busy="true"
      >
        <span className="h-[14px] w-[14px]" />
      </button>
    );
  }

  return (
    <button
      onClick={cycleTheme}
      className="group border-border bg-surface text-text-secondary hover:bg-surface-elevated hover:text-text relative flex h-7 w-7 items-center justify-center rounded-md border transition-all duration-200"
      aria-label={`Current theme: ${labels[theme]}. Click to change.`}
      title={labels[theme]}
    >
      <span className="transition-transform duration-200 group-hover:scale-110">
        {icons[theme]}
      </span>
    </button>
  );
}

const settingsLabels: Record<Theme, string> = {
  light: "Hell",
  system: "System",
  dark: "Dunkel",
};

// Settings component for account settings page
export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) {
    return (
      <div className="space-y-3">
        {themes.map((t) => (
          <div
            key={t}
            className="border-border flex items-center gap-3 rounded-lg border p-3 opacity-50"
          >
            <div className="border-border h-5 w-5 rounded-full border-2" />
            <span className="h-[14px] w-[14px]" />
            <span className="text-text">{settingsLabels[t]}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {themes.map((t) => (
        <label
          key={t}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
            theme === t
              ? "border-primary bg-primary/15"
              : "border-border hover:border-border-strong"
          }`}
          onClick={() => setTheme(t)}
        >
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
              theme === t ? "border-primary" : "border-border"
            }`}
          >
            {theme === t && <div className="bg-primary h-2.5 w-2.5 rounded-full" />}
          </div>
          <span className="text-text-muted">{icons[t]}</span>
          <span className="text-text">{settingsLabels[t]}</span>
        </label>
      ))}
    </div>
  );
}
