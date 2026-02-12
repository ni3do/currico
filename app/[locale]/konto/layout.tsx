"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  Home,
  Library,
  Heart,
  Settings,
  Upload,
  Package,
  MessageCircle,
  Bell,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { AccountDataContext, useAccountDataProvider } from "@/lib/hooks/useAccountData";
import { pathToTab, TAB_TO_PATH, type TabType } from "@/lib/types/account";

// Mobile tab items (subset - no settings sub-items)
const MOBILE_TABS = [
  { id: "overview" as TabType, label: "nav.overview", icon: Home },
  { id: "library" as TabType, label: "nav.library", icon: Library },
  { id: "uploads" as TabType, label: "nav.uploads", icon: Upload },
  { id: "bundles" as TabType, label: "nav.bundles", icon: Package },
  { id: "wishlist" as TabType, label: "nav.wishlist", icon: Heart },
  {
    id: "comments" as TabType,
    label: "nav.comments",
    icon: MessageCircle,
    sellerOnly: true,
  },
  { id: "notifications" as TabType, label: "nav.notifications", icon: Bell },
  { id: "following" as TabType, label: "nav.following", icon: Users },
  {
    id: "settings-profile" as TabType,
    label: "nav.settings",
    icon: Settings,
  },
] as const;

function AccountLayoutInner({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const tCommon = useTranslations("common");
  const t = useTranslations("accountPage");
  const accountData = useAccountDataProvider();
  const { userData, stats, followedSellers, loading } = accountData;
  const pathname = usePathname();
  const activeTab = pathToTab(pathname);
  const tabBarRef = useRef<HTMLDivElement>(null);

  // Scroll active mobile tab into view
  useEffect(() => {
    if (tabBarRef.current) {
      const activeEl = tabBarRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeTab]);

  // Show loading state while checking auth or redirecting
  if (status === "loading" || status === "unauthenticated" || session?.user?.role === "ADMIN") {
    return (
      <div className="bg-bg flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  // Fallback data from session
  const displayData = userData || {
    id: "",
    name: session?.user?.name || "Benutzer",
    email: session?.user?.email || "",
    emailVerified: null,
    image: session?.user?.image || null,
    displayName: null,
    subjects: [],
    cycles: [],
    cantons: [],
    isSeller: false,
  };

  const displayStats = stats || {
    purchasedResources: 0,
    downloadedResources: 0,
    totalInLibrary: 0,
    wishlistItems: 0,
    uploadedResources: 0,
    followedSellers: 0,
  };

  const userName = displayData.displayName || displayData.name || session?.user?.name;
  const userImage = displayData.image || session?.user?.image;
  const isSeller = displayData.isSeller;

  // Breadcrumb with sub-page context
  const getBreadcrumbItems = () => {
    const items: { label: string; href?: string }[] = [
      { label: tCommon("breadcrumb.account"), href: "/konto" },
    ];
    if (activeTab !== "overview") {
      const tabLabels: Record<string, string> = {
        library: t("nav.library"),
        uploads: t("nav.uploads"),
        bundles: t("nav.bundles"),
        comments: t("nav.comments"),
        wishlist: t("nav.wishlist"),
        notifications: t("nav.notifications"),
        following: t("nav.following"),
        "settings-profile": t("nav.settingsProfile"),
        "settings-notifications": t("nav.settingsNotifications"),
        "settings-account": t("nav.settingsAccount"),
      };
      if (tabLabels[activeTab]) {
        items.push({ label: tabLabels[activeTab] });
      }
    }
    return items;
  };

  return (
    <AccountDataContext.Provider value={accountData}>
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb items={getBreadcrumbItems()} className="mb-4" />

          {/* Profile Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {userImage ? (
                  <Image
                    src={userImage}
                    alt={userName || ""}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                  />
                ) : (
                  <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold ring-2 ring-white dark:ring-gray-800">
                    {(userName || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                {isSeller && (
                  <div className="bg-accent absolute right-0 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-800">
                    <span className="text-[10px] text-white">S</span>
                  </div>
                )}
              </div>

              {/* Name & meta */}
              <div className="min-w-0 flex-1">
                <h1 className="text-text truncate text-xl font-bold sm:text-2xl">
                  {userName ? t("welcomeBack", { name: userName }) : t("welcomeGeneric")}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isSeller ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {isSeller ? t("roleSeller") : t("roleBuyer")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Horizontal Tab Bar */}
          <div className="mb-4 lg:hidden">
            <div
              ref={tabBarRef}
              className="scrollbar-hide bg-bg-secondary flex gap-1 overflow-x-auto rounded-xl p-1"
            >
              {MOBILE_TABS.filter(
                (tab) => !("sellerOnly" in tab && tab.sellerOnly) || isSeller
              ).map((tab) => {
                const Icon = tab.icon;
                const isActive =
                  activeTab === tab.id ||
                  (tab.id === "settings-profile" && activeTab.startsWith("settings-"));
                return (
                  <Link
                    key={tab.id}
                    href={TAB_TO_PATH[tab.id]}
                    data-active={isActive}
                    className={`relative flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-surface text-primary shadow-sm"
                        : "text-text-secondary hover:text-text"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t(tab.label as any)}
                    {isActive && (
                      <motion.div
                        layoutId="mobileActiveTab"
                        className="bg-primary absolute right-1 bottom-0 left-1 h-0.5 rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Main Layout: Sidebar + Content */}
          <div className="flex gap-6 lg:flex-row">
            {/* Desktop Sidebar */}
            <div className="hidden w-72 flex-shrink-0 lg:block">
              <div className="sticky top-24">
                <AccountSidebar userData={displayData} stats={displayStats} />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="min-w-0 flex-1">{loading ? <AccountLoadingSkeleton /> : children}</div>
          </div>
        </main>

        <Footer />
      </div>
    </AccountDataContext.Provider>
  );
}

/** Skeleton loader matching the overview page shape */
function AccountLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* KPI cards skeleton */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-border bg-surface rounded-2xl border p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="bg-border h-4 w-20 rounded" />
                <div className="bg-border h-8 w-24 rounded" />
              </div>
              <div className="bg-border h-12 w-12 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="border-border bg-surface rounded-2xl border">
        <div className="border-border flex items-center justify-between border-b p-4">
          <div className="bg-border h-6 w-40 rounded" />
          <div className="bg-border h-9 w-36 rounded-lg" />
        </div>
        <div className="space-y-0 p-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="border-border flex items-center gap-4 border-b py-4 last:border-0"
            >
              <div className="bg-border h-10 w-10 flex-shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="bg-border h-4 w-48 rounded" />
                <div className="bg-border h-3 w-24 rounded" />
              </div>
              <div className="bg-border h-6 w-20 rounded-full" />
              <div className="bg-border h-4 w-12 rounded" />
              <div className="bg-border h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent downloads skeleton */}
      <div className="border-border bg-surface rounded-2xl border">
        <div className="border-border flex items-center justify-between border-b p-4">
          <div className="bg-border h-6 w-40 rounded" />
          <div className="bg-border h-4 w-24 rounded" />
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-border rounded-xl border p-4">
              <div className="bg-border mb-2 h-4 w-3/4 rounded" />
              <div className="bg-border h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <AccountLayoutInner>{children}</AccountLayoutInner>;
}
