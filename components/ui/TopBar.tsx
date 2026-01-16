"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";

export default function TopBar() {
  const t = useTranslations("common");
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg)]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-primary)]">
              <span className="text-lg font-bold text-[var(--btn-primary-text)]">
                {t("brand.logoText")}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg leading-tight font-semibold text-[var(--color-text)]">
                {t("brand.name")}
              </span>
              <span className="text-xs leading-tight text-[var(--color-text-muted)]">
                {t("brand.tagline")}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center lg:flex">
            <div className="mr-6 flex items-center border-r border-[var(--color-border)] pr-6">
              {!isAdmin && (
                <Link
                  href="/resources"
                  className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                >
                  {t("navigation.resources")}
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Admin Panel
                </Link>
              )}
              <Link
                href="/about"
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
              >
                {t("navigation.aboutUs")}
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
              >
                {t("navigation.contact")}
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <LocaleSwitcher />
              {session ? (
                <>
                  {!isAdmin && (
                    <Link
                      href="/account"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                    >
                      {session.user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={session.user.image} alt="" className="h-6 w-6 rounded-full" />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)]">
                          <span className="text-xs font-bold text-white">
                            {(session.user?.name || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {t("navigation.account")}
                    </Link>
                  )}
                  {isAdmin && (
                    <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)]">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--ctp-mauve)] to-[var(--ctp-pink)]">
                        <span className="text-xs font-bold text-white">
                          {(session.user?.name || "A").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[var(--ctp-mauve)]">Admin</span>
                    </div>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                  >
                    {t("navigation.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                  >
                    {t("navigation.login")}
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--color-primary-hover)]"
                  >
                    {t("navigation.register")}
                  </Link>
                </>
              )}
            </div>
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] lg:hidden"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-[var(--color-border)] py-4 lg:hidden">
            <nav className="flex flex-col space-y-2">
              {!isAdmin && (
                <Link
                  href="/resources"
                  className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                >
                  {t("navigation.resources")}
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Admin Panel
                </Link>
              )}
              <Link
                href="/about"
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
              >
                {t("navigation.aboutUs")}
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
              >
                {t("navigation.contact")}
              </Link>
              <div className="mt-2 flex flex-col space-y-2 border-t border-[var(--color-border)] pt-4">
                <div className="flex items-center gap-4 px-4 py-2">
                  <LocaleSwitcher />
                </div>
                {session ? (
                  <>
                    {!isAdmin && (
                      <Link
                        href="/account"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                      >
                        {session.user?.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={session.user.image} alt="" className="h-6 w-6 rounded-full" />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)]">
                            <span className="text-xs font-bold text-white">
                              {(session.user?.name || "U").charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        {t("navigation.account")}
                      </Link>
                    )}
                    {isAdmin && (
                      <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)]">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--ctp-mauve)] to-[var(--ctp-pink)]">
                          <span className="text-xs font-bold text-white">
                            {(session.user?.name || "A").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[var(--ctp-mauve)]">Admin</span>
                      </div>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="px-4 py-2 text-left text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                    >
                      {t("navigation.logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                    >
                      {t("navigation.login")}
                    </Link>
                    <Link
                      href="/register"
                      className="mx-4 rounded-lg bg-[var(--color-primary)] px-5 py-2 text-center text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--color-primary-hover)]"
                    >
                      {t("navigation.register")}
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
