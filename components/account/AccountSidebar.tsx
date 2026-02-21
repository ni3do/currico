"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Home,
  Library,
  Heart,
  Settings,
  Upload,
  Users,
  User,
  Bell,
  Shield,
  ChevronDown,
  Package,
  Star,
  Trophy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SellerBadge } from "@/components/ui/SellerBadge";
import { type TabType, TAB_TO_PATH, pathToTab } from "@/lib/types/account";

interface SidebarUserData {
  name: string | null;
  email: string;
  image: string | null;
  subjects: string[];
  cycles: string[];
  cantons: string[];
  isSeller: boolean;
  displayName?: string | null;
  bio?: string | null;
  emailVerified?: string | null;
  sellerPoints?: number;
}

interface SidebarUserStats {
  totalInLibrary: number;
  uploadedResources: number;
  wishlistItems: number;
  followedSellers: number;
}

interface AccountSidebarProps {
  userData: SidebarUserData;
  stats: SidebarUserStats;
  unreadNotifications?: number;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  className?: string;
}

export function AccountSidebar({
  userData,
  stats,
  unreadNotifications = 0,
  activeTab: activeTabProp,
  onTabChange,
  className = "",
}: AccountSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("accountPage");
  const activeTab = activeTabProp ?? pathToTab(pathname);
  const isSettingsActive = activeTab.startsWith("settings-");
  const [userExpandedSettings, setUserExpandedSettings] = useState(false);
  const settingsExpanded = isSettingsActive || userExpandedSettings;
  const useLinks = !onTabChange;

  const NAV_ITEMS = [
    { id: "overview" as TabType, label: t("nav.overview"), icon: Home, count: null },
    {
      id: "library" as TabType,
      label: t("nav.library"),
      icon: Library,
      count: stats.totalInLibrary,
    },
    {
      id: "uploads" as TabType,
      label: t("nav.uploads"),
      icon: Upload,
      count: stats.uploadedResources,
    },
    { id: "bundles" as TabType, label: t("nav.bundles"), icon: Package, count: null },
    {
      id: "comments" as TabType,
      label: t("nav.comments"),
      icon: Star,
      sellerOnly: true,
      count: null,
    },
    {
      id: "wishlist" as TabType,
      label: t("nav.wishlist"),
      icon: Heart,
      count: stats.wishlistItems,
    },
    {
      id: "notifications" as TabType,
      label: t("nav.notifications"),
      icon: Bell,
      count: unreadNotifications > 0 ? unreadNotifications : null,
    },
    {
      id: "following" as TabType,
      label: t("nav.following"),
      icon: Users,
      count: stats.followedSellers,
    },
    {
      id: "rewards" as TabType,
      label: t("nav.rewards"),
      icon: Trophy,
      sellerOnly: true,
      count: null,
    },
  ] as const;

  const SETTINGS_SUB_ITEMS = [
    { id: "settings-profile" as TabType, label: t("nav.settingsProfile"), icon: User },
    { id: "settings-notifications" as TabType, label: t("nav.settingsNotifications"), icon: Bell },
    { id: "settings-account" as TabType, label: t("nav.settingsAccount"), icon: Shield },
  ] as const;

  const handleNavClick = (tabId: TabType) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const displayName = userData.displayName || userData.name || userData.email;

  return (
    <aside className={`border-border bg-bg-secondary rounded-xl border shadow-sm ${className}`}>
      {/* User Identity Card */}
      <div className="border-border border-b p-4">
        <div className="flex items-center gap-3">
          {userData.image ? (
            <Image
              src={userData.image}
              alt={displayName}
              width={40}
              height={40}
              className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-text truncate text-sm font-semibold">{displayName}</div>
            <div className="text-text-muted truncate text-xs">{userData.email}</div>
            {userData.isSeller &&
              (userData.sellerPoints !== undefined ? (
                <SellerBadge points={userData.sellerPoints} variant="compact" className="mt-1.5" />
              ) : (
                <span className="bg-accent/10 text-accent mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                  {t("roleSeller")}
                </span>
              ))}
          </div>
        </div>
        {/* Compact stats */}
        <div className="text-text-muted px-4 pt-2 pb-0 text-xs">
          {stats.totalInLibrary} {t("sidebar.materials")} &middot; {stats.followedSellers}{" "}
          {t("sidebar.followers")}
        </div>
      </div>

      <div className="p-4">
        {/* Navigation */}
        <nav className="mb-4 space-y-0.5">
          <h3 className="label-meta mb-2">{t("nav.navigation")}</h3>
          {NAV_ITEMS.filter(
            (item) => !("sellerOnly" in item && item.sellerOnly) || userData.isSeller
          ).map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const content = (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="bg-primary/5 absolute inset-0 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="bg-primary absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <Icon className={`h-[18px] w-[18px] ${isActive ? "text-primary" : ""}`} />
                  {item.label}
                </span>
                {item.count !== null && item.count > 0 && (
                  <span
                    className={`relative z-10 ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      item.id === "notifications"
                        ? "bg-error text-text-on-accent"
                        : isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-surface text-text-muted"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </>
            );

            const className_str = `relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "text-primary"
                : "text-text-secondary hover:bg-surface-hover hover:text-text"
            }`;

            if (useLinks) {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link href={TAB_TO_PATH[item.id]} className={className_str}>
                    {content}
                  </Link>
                </motion.div>
              );
            }

            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={className_str}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                {content}
              </motion.button>
            );
          })}

          {/* Settings with sub-items */}
          <div>
            <motion.button
              onClick={() => setUserExpandedSettings(!settingsExpanded)}
              className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isSettingsActive
                  ? "text-primary"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text"
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: NAV_ITEMS.length * 0.03 }}
            >
              {isSettingsActive && (
                <motion.div
                  layoutId="activeTab"
                  className="bg-primary/5 absolute inset-0 rounded-lg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {isSettingsActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="bg-primary absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-3">
                <Settings
                  className={`h-[18px] w-[18px] ${isSettingsActive ? "text-primary" : ""}`}
                />
                {t("nav.settings")}
              </span>
              <motion.span
                className="relative z-10 ml-auto"
                animate={{ rotate: settingsExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {settingsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-border mt-1 ml-4 space-y-0.5 border-l pl-3">
                    {SETTINGS_SUB_ITEMS.map((item, index) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      const subClassName = `relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/5 text-primary"
                          : "text-text-secondary hover:bg-surface-hover hover:text-text"
                      }`;

                      const subContent = (
                        <>
                          <Icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                          {item.label}
                        </>
                      );

                      if (useLinks) {
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <Link href={TAB_TO_PATH[item.id]} className={subClassName}>
                              {subContent}
                            </Link>
                          </motion.div>
                        );
                      }

                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={subClassName}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          {subContent}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>
    </aside>
  );
}

export default AccountSidebar;
