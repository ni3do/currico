"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Home, Library, Heart, Settings, Search, Upload, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Navigation items
const NAV_ITEMS = [
  { id: "overview", label: "Übersicht", icon: Home },
  { id: "library", label: "Bibliothek", icon: Library },
  { id: "uploads", label: "Meine Uploads", icon: Upload },
  { id: "wishlist", label: "Wunschliste", icon: Heart },
  { id: "settings", label: "Einstellungen", icon: Settings },
] as const;

type TabType = "overview" | "library" | "uploads" | "wishlist" | "settings";

interface UserData {
  name: string | null;
  email: string;
  image: string | null;
  subjects: string[];
  cycles: string[];
  cantons: string[];
  isSeller: boolean;
}

interface UserStats {
  totalInLibrary: number;
  uploadedResources: number;
  wishlistItems: number;
  followedSellers: number;
}

interface FollowedSeller {
  id: string;
  displayName: string | null;
  image: string | null;
  newResources?: number;
}

interface AccountSidebarProps {
  userData: UserData;
  stats: UserStats;
  followedSellers?: FollowedSeller[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  className?: string;
}

export function AccountSidebar({
  userData,
  stats,
  followedSellers = [],
  activeTab,
  onTabChange,
  className = "",
}: AccountSidebarProps) {
  return (
    <aside className={`border-border bg-bg-secondary rounded-xl border shadow-sm ${className}`}>
      <div className="p-5">
        {/* Navigation */}
        <nav className="mb-5 space-y-1">
          <h3 className="label-meta mb-3">Navigation</h3>
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onTabChange(item.id as TabType)}
                className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text"
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="bg-primary/10 absolute inset-0 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                  {item.label}
                </span>
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      className="bg-primary relative z-10 ml-auto h-2 w-2 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </nav>

        <div className="divider my-5" />

        {/* Gefolgte Verkäufer */}
        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="label-meta flex items-center gap-2">
              <Users className="text-text-muted h-4 w-4" />
              Gefolgte ({stats.followedSellers})
            </h3>
            <Link href="/following" className="text-primary text-xs font-medium hover:underline">
              Alle
            </Link>
          </div>
          {followedSellers.length > 0 ? (
            <div className="space-y-2">
              {followedSellers.slice(0, 3).map((seller) => (
                <Link
                  key={seller.id}
                  href={`/seller/${seller.id}`}
                  className="group border-border bg-bg hover:border-primary flex items-center gap-3 rounded-lg border p-2 transition-all hover:shadow-sm"
                >
                  {seller.image ? (
                    <Image
                      src={seller.image}
                      alt={seller.displayName || "Verkäufer"}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-surface flex h-8 w-8 items-center justify-center rounded-full">
                      <span className="text-text-muted text-xs font-medium">
                        {(seller.displayName || "V").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-text group-hover:text-primary flex-1 truncate text-sm font-medium">
                    {seller.displayName || "Unbekannt"}
                  </span>
                  {seller.newResources && seller.newResources > 0 && (
                    <span className="bg-primary text-text-on-accent flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold">
                      {seller.newResources}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="border-border bg-bg rounded-lg border border-dashed p-4 text-center">
              <Users className="text-text-faint mx-auto mb-2 h-6 w-6" />
              <p className="text-text-muted text-xs">Noch keine Verkäufer gefolgt</p>
              <Link
                href="/resources"
                className="text-primary mt-2 inline-block text-xs font-medium hover:underline"
              >
                Entdecken
              </Link>
            </div>
          )}
        </div>

        <div className="divider my-5" />

        {/* Quick Actions */}
        <div className="space-y-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/upload"
              className="bg-primary text-text-on-accent hover:bg-primary-hover flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              <Upload className="h-4 w-4" />
              Neue Ressource
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/resources"
              className="border-border bg-bg text-text-secondary hover:border-primary hover:text-primary flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
            >
              <Search className="h-4 w-4" />
              Ressourcen entdecken
            </Link>
          </motion.div>
        </div>
      </div>
    </aside>
  );
}

export default AccountSidebar;
