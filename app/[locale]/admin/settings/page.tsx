"use client";

import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const t = useTranslations("admin.settings");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Admin Account Settings */}
      <div className="border-border bg-surface rounded-lg border p-8">
        <h2 className="text-text mb-6 text-xl font-semibold">{t("accountSettings")}</h2>

        <div className="space-y-6">
          {/* Admin Info */}
          <div className="border-border bg-bg flex items-center gap-4 rounded-xl border p-4">
            <div className="from-error to-error/80 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br">
              <span className="text-text-on-accent text-lg font-bold">
                {(session?.user?.name || "A").charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-text font-semibold">{session?.user?.name || "Admin"}</p>
              <p className="text-text-muted text-sm">{session?.user?.email}</p>
              <span className="bg-error/20 text-error mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Administrator
              </span>
            </div>
          </div>

          {/* Appearance Settings */}
          <div>
            <h3 className="text-text mb-3 font-semibold">{t("appearance")}</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-text-muted text-sm">{t("theme")}</span>
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="border-border border-t pt-4">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="border-error text-error flex items-center gap-2 rounded-xl border px-4 py-2 transition-colors hover:bg-[var(--badge-error-bg)]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {t("logout")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
