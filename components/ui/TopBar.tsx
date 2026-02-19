"use client";

import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronDown, User, ShieldCheck, LogOut, X, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LoginLink } from "@/components/ui/LoginLink";

import NotificationDropdown from "@/components/ui/NotificationDropdown";

export default function TopBar() {
  const t = useTranslations("common");
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [unreadCount, setUnreadCount] = useState(0);

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

  // Poll for unread notification count
  useEffect(() => {
    if (!session) return;
    let active = true;

    const fetchCount = async () => {
      try {
        const res = await fetch("/api/users/me/notifications?unread=true");
        if (res.ok && active) {
          const data = await res.json();
          setUnreadCount(data.unreadCount ?? 0);
        }
      } catch {
        // Silently ignore — TopBar badge is non-critical
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [session]);

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

          <nav aria-label="Main navigation" className="hidden items-center lg:flex">
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
              {session && (
                <NotificationDropdown unreadCount={unreadCount} onCountChange={setUnreadCount} />
              )}
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
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        className="border-border bg-surface absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-lg border py-1 shadow-lg"
                      >
                        <Link
                          href="/konto"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="text-text hover:bg-bg flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                        >
                          <User className="h-4 w-4" />
                          {t("navigation.profile")}
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="text-text hover:bg-bg flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                          >
                            <ShieldCheck className="h-4 w-4" />
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
                          <LogOut className="h-4 w-4" />
                          {t("navigation.logout")}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <LoginLink className="text-text-secondary hover:text-primary px-4 py-2 text-sm font-medium transition-colors">
                    {t("navigation.login")}
                  </LoginLink>
                  <Link href="/registrieren" className="btn-primary px-5 py-2 text-sm">
                    {t("navigation.register")}
                  </Link>
                </>
              )}
            </div>
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-text-secondary hover:text-primary p-2 lg:hidden"
            aria-label={t("toggleNavigation")}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
              <nav aria-label="Mobile navigation" className="flex flex-col space-y-2 py-4">
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
                  </div>
                  {session ? (
                    <>
                      <Link
                        href="/konto"
                        className="text-text-secondary hover:text-primary flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
                      >
                        <User className="h-5 w-5" />
                        {t("navigation.profile")}
                      </Link>
                      <Link
                        href="/konto/notifications"
                        className="text-text-secondary hover:text-primary flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
                      >
                        <div className="relative">
                          <Bell className="h-5 w-5" />
                          {unreadCount > 0 && (
                            <span className="bg-error text-text-on-accent absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </div>
                        {t("navigation.notifications")}
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="text-text-secondary hover:text-primary flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
                        >
                          <ShieldCheck className="h-5 w-5" />
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
                      <LoginLink className="text-text-secondary hover:text-primary px-4 py-2 text-sm font-medium transition-colors">
                        {t("navigation.login")}
                      </LoginLink>
                      <Link
                        href="/registrieren"
                        className="btn-primary mx-4 px-5 py-2 text-center text-sm"
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
