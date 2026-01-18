"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  { href: "/admin", label: "Übersicht", icon: "home" },
  { href: "/admin/users", label: "Benutzer", icon: "users" },
  { href: "/admin/documents", label: "Dokumente", icon: "documents" },
  { href: "/admin/reports", label: "Meldungen", icon: "reports" },
  { href: "/admin/transactions", label: "Transaktionen", icon: "transactions" },
  { href: "/admin/settings", label: "Einstellungen", icon: "settings" },
];

const icons: Record<string, React.ReactNode> = {
  home: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  users: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  documents: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  reports: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  transactions: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
  settings: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  // Tab indicator state and refs
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Redirect non-admin users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/account");
    }
  }, [status, session?.user?.role, router]);

  // Get active tab key based on pathname
  const getActiveTab = () => {
    if (pathname === "/admin") return "/admin";
    const activeItem = adminNavItems.find(
      (item) => item.href !== "/admin" && pathname.startsWith(item.href)
    );
    return activeItem?.href || "/admin";
  };

  const activeTab = getActiveTab();

  // Update tab indicator position
  useLayoutEffect(() => {
    const updateIndicator = () => {
      const activeTabEl = tabRefs.current[activeTab];
      const container = tabsContainerRef.current;
      if (activeTabEl && container) {
        const containerRect = container.getBoundingClientRect();
        const tabRect = activeTabEl.getBoundingClientRect();
        setIndicatorStyle({
          left: tabRect.left - containerRect.left,
          width: tabRect.width,
        });
      }
    };
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab]);

  // Show loading state while checking auth
  if (status === "loading" || status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header with Admin Info */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--ctp-mauve)] to-[var(--ctp-pink)]">
              <svg
                className="h-8 w-8 text-text-on-accent"
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
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-text">Admin Panel</h1>
              <p className="text-text-muted">
                {session?.user?.name || session?.user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="relative mb-8 border-b border-border">
          <nav
            ref={tabsContainerRef}
            className="scrollbar-hide relative flex items-center overflow-x-auto"
          >
            {/* Main tabs */}
            <div className="flex gap-1 sm:gap-2">
              {adminNavItems.slice(0, 5).map((item) => {
                const isActive =
                  item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    ref={(el) => {
                      tabRefs.current[item.href] = el;
                    }}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 pt-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors sm:px-4 ${
                      isActive
                        ? "text-[var(--ctp-blue)]"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    <span className="hidden sm:inline">{icons[item.icon]}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Settings tab on the right */}
            <div className="ml-auto flex-shrink-0">
              <Link
                ref={(el) => {
                  tabRefs.current["/admin/settings"] = el;
                }}
                href="/admin/settings"
                className={`flex items-center gap-2 px-3 pt-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors sm:px-4 ${
                  pathname.startsWith("/admin/settings")
                    ? "text-[var(--ctp-blue)]"
                    : "text-text-muted hover:text-text"
                }`}
              >
                <span className="hidden sm:inline">{icons.settings}</span>
                Einstellungen
              </Link>
            </div>

            {/* Animated indicator bar */}
            <div
              className="absolute bottom-0 h-0.5 bg-[var(--ctp-blue)] transition-all duration-300 ease-out"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
            />
          </nav>
        </div>

        {/* Main Content */}
        <div>{children}</div>
      </main>

      <Footer />
    </div>
  );
}
