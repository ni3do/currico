"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  Home,
  Library,
  Heart,
  Settings,
  Search,
  Upload,
  Users,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Download,
  FileText,
} from "lucide-react";

// Subject color mapping (matching design system)
const SUBJECT_COLORS: Record<string, { bg: string; text: string; name: string }> = {
  Deutsch: { bg: "bg-subject-deutsch/15", text: "text-subject-deutsch", name: "Deutsch" },
  Mathematik: { bg: "bg-subject-mathe/15", text: "text-subject-mathe", name: "Mathe" },
  NMG: { bg: "bg-subject-nmg/15", text: "text-subject-nmg", name: "NMG" },
  BG: { bg: "bg-subject-gestalten/15", text: "text-subject-gestalten", name: "BG" },
  Musik: { bg: "bg-subject-musik/15", text: "text-subject-musik", name: "Musik" },
  Sport: { bg: "bg-subject-sport/15", text: "text-subject-sport", name: "Sport" },
  Englisch: {
    bg: "bg-subject-fremdsprachen/15",
    text: "text-subject-fremdsprachen",
    name: "Englisch",
  },
  Französisch: {
    bg: "bg-subject-fremdsprachen/15",
    text: "text-subject-fremdsprachen",
    name: "Franz.",
  },
  "Medien und Informatik": { bg: "bg-subject-medien/15", text: "text-subject-medien", name: "M&I" },
};

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

interface SellerStats {
  netEarnings: string;
  totalDownloads: number;
  pendingResources?: number;
  payoutAvailable?: string;
  stripeConnected?: boolean;
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
  sellerStats?: SellerStats;
  followedSellers?: FollowedSeller[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

export function AccountSidebar({
  userData,
  stats,
  sellerStats,
  followedSellers = [],
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  className = "",
}: AccountSidebarProps) {
  return (
    <aside className={`border-border bg-bg-secondary rounded-xl border shadow-sm ${className}`}>
      <div className="p-5">
        {/* Search */}
        <div className="relative mb-5">
          <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Bibliothek durchsuchen..."
            className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
          />
        </div>

        {/* Navigation */}
        <nav className="mb-5 space-y-1">
          <h3 className="label-meta mb-3">Navigation</h3>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as TabType)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                {item.label}
                {isActive && <span className="bg-primary ml-auto h-2 w-2 rounded-full" />}
              </button>
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

        {/* Verkäufer-Dashboard (if seller) */}
        {userData.isSeller && sellerStats && (
          <div className="mb-5">
            <h3 className="label-meta mb-3 flex items-center gap-2">
              <CreditCard className="text-text-muted h-4 w-4" />
              Verkäufer-Dashboard
            </h3>
            <div className="border-border bg-bg space-y-3 rounded-lg border p-4">
              {/* Stripe Status */}
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">Stripe</span>
                {sellerStats.stripeConnected !== false ? (
                  <span className="text-success flex items-center gap-1 text-xs font-medium">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Verbunden
                  </span>
                ) : (
                  <span className="text-warning flex items-center gap-1 text-xs font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Nicht verbunden
                  </span>
                )}
              </div>

              {/* Pending Resources */}
              {sellerStats.pendingResources !== undefined && sellerStats.pendingResources > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary flex items-center gap-2 text-sm">
                    <Clock className="text-warning h-4 w-4" />
                    Ausstehend
                  </span>
                  <span className="bg-warning/10 text-warning rounded-full px-2 py-0.5 text-xs font-medium">
                    {sellerStats.pendingResources}
                  </span>
                </div>
              )}

              {/* Earnings */}
              <div className="border-border flex items-center justify-between border-t pt-3">
                <span className="text-text-secondary flex items-center gap-2 text-sm">
                  <TrendingUp className="text-success h-4 w-4" />
                  Einnahmen
                </span>
                <span className="text-success text-sm font-semibold">
                  {sellerStats.netEarnings}
                </span>
              </div>

              {/* Downloads */}
              <div className="flex items-center justify-between">
                <span className="text-text-secondary flex items-center gap-2 text-sm">
                  <Download className="text-primary h-4 w-4" />
                  Downloads
                </span>
                <span className="text-text text-sm font-semibold">
                  {sellerStats.totalDownloads}
                </span>
              </div>

              {/* Payout Available */}
              {sellerStats.payoutAvailable && (
                <div className="bg-success/10 mt-2 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-success text-xs">Auszahlbar</span>
                    <span className="text-success text-sm font-bold">
                      {sellerStats.payoutAvailable}
                    </span>
                  </div>
                  <button className="bg-success hover:bg-success/90 mt-2 w-full rounded-md py-1.5 text-xs font-semibold text-white transition-colors">
                    Auszahlung anfordern
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2">
          <Link
            href="/upload"
            className="bg-primary text-text-on-accent hover:bg-primary-hover flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            <Upload className="h-4 w-4" />
            Neue Ressource
          </Link>
          <Link
            href="/resources"
            className="border-border bg-bg text-text-secondary hover:border-primary hover:text-primary flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          >
            <Search className="h-4 w-4" />
            Ressourcen entdecken
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default AccountSidebar;
