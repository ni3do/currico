"use client";

import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";

export default function TopBar() {
  const t = useTranslations("common");
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const isAdmin = session?.user?.role === "ADMIN";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Close user menu when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [isUserMenuOpen]);

  return (
    <header className="border-border-subtle bg-bg/95 sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-md">
              <span className="text-text-on-accent text-lg font-bold">{t("brand.logoText")}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-text text-lg leading-tight font-semibold">
                {t("brand.name")}
              </span>
              <span className="text-text-muted text-xs leading-tight">{t("brand.tagline")}</span>
            </div>
          </Link>

          <nav className="hidden items-center lg:flex">
            <div className="border-border mr-6 flex items-center border-r pr-6">
              <Link
                href="/materialien"
                className={`px-4 py-2 text-sm font-medium transition-colors ${isActive("/materialien") ? "text-primary" : "text-text-secondary hover:text-primary"}`}
              >
                {t("navigation.materials")}
              </Link>
              <Link
                href="/ueber-uns"
                className={`px-4 py-2 text-sm font-medium transition-colors ${isActive("/ueber-uns") ? "text-primary" : "text-text-secondary hover:text-primary"}`}
              >
                {t("navigation.aboutUs")}
              </Link>
              <Link
                href="/kontakt"
                className={`px-4 py-2 text-sm font-medium transition-colors ${isActive("/kontakt") ? "text-primary" : "text-text-secondary hover:text-primary"}`}
              >
                {t("navigation.contact")}
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LocaleSwitcher />
              {session ? (
                <div className="relative" ref={userMenuRef}>
                  {/* User Avatar/Name Dropdown Trigger */}
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="text-text-secondary hover:bg-surface hover:text-primary flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                  >
                    {isAdmin ? (
                      <div className="relative">
                        <div className="bg-error absolute -inset-1 rounded-full opacity-20 blur-sm"></div>
                        <div className="bg-error relative flex h-8 w-8 items-center justify-center rounded-full">
                          <span className="text-text-on-accent text-sm font-bold">
                            {(session.user?.name || "A").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ) : session.user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt={session.user?.name || ""}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                        <span className="text-text-on-accent text-sm font-bold">
                          {(session.user?.name || "U").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="max-w-[120px] truncate">
                      {session.user?.name || t("navigation.account")}
                    </span>
                    <svg
                      className={`h-4 w-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="border-border bg-surface absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-lg border py-1 shadow-lg"
                      >
                        <Link
                          href="/konto"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="text-text hover:bg-bg flex items-center gap-2 px-4 py-2 text-sm transition-colors"
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
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          {t("navigation.profile")}
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="text-text hover:bg-bg flex items-center gap-2 px-4 py-2 text-sm transition-colors"
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
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                            {t("navigation.admin")}
                          </Link>
                        )}
                        <div className="border-border my-1 border-t"></div>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            signOut();
                          }}
                          className="text-error hover:bg-error/10 flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors"
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
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          {t("navigation.logout")}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/anmelden"
                    className="text-text-secondary hover:text-primary px-4 py-2 text-sm font-medium transition-colors"
                  >
                    {t("navigation.login")}
                  </Link>
                  <Link
                    href="/registrieren"
                    className="bg-primary text-text-on-accent hover:bg-primary-hover rounded-lg px-5 py-2 text-sm font-medium transition-colors"
                  >
                    {t("navigation.register")}
                  </Link>
                </>
              )}
            </div>
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-text-secondary hover:text-primary p-2 lg:hidden"
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

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="border-border overflow-hidden border-t lg:hidden"
            >
              <nav className="flex flex-col space-y-2 py-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <Link
                    href="/materialien"
                    className={`block px-4 py-2 text-sm font-medium transition-colors ${isActive("/materialien") ? "text-primary" : "text-text-secondary hover:text-primary"}`}
                  >
                    {t("navigation.materials")}
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link
                    href="/ueber-uns"
                    className={`block px-4 py-2 text-sm font-medium transition-colors ${isActive("/ueber-uns") ? "text-primary" : "text-text-secondary hover:text-primary"}`}
                  >
                    {t("navigation.aboutUs")}
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Link
                    href="/kontakt"
                    className={`block px-4 py-2 text-sm font-medium transition-colors ${isActive("/kontakt") ? "text-primary" : "text-text-secondary hover:text-primary"}`}
                  >
                    {t("navigation.contact")}
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="border-border mt-2 flex flex-col space-y-2 border-t pt-4"
                >
                  <div className="flex items-center gap-3 px-4 py-2">
                    <ThemeToggle />
                    <LocaleSwitcher />
                  </div>
                  {session ? (
                    <>
                      <Link
                        href="/konto"
                        className="text-text-secondary hover:text-primary flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        {t("navigation.profile")}
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="text-text-secondary hover:text-primary flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                          {t("navigation.admin")}
                        </Link>
                      )}
                      <button
                        onClick={() => signOut()}
                        className="text-text-secondary hover:text-primary px-4 py-2 text-left text-sm font-medium transition-colors"
                      >
                        {t("navigation.logout")}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/anmelden"
                        className="text-text-secondary hover:text-primary px-4 py-2 text-sm font-medium transition-colors"
                      >
                        {t("navigation.login")}
                      </Link>
                      <Link
                        href="/registrieren"
                        className="bg-primary text-text-on-accent hover:bg-primary-hover mx-4 rounded-lg px-5 py-2 text-center text-sm font-medium transition-colors"
                      >
                        {t("navigation.register")}
                      </Link>
                    </>
                  )}
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
