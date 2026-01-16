"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { ThemeSettings } from "@/components/ui/ThemeToggle";

interface LibraryItem {
  id: string;
  title: string;
  description: string;
  price: number;
  priceFormatted: string;
  subject: string;
  cycle: string;
  verified: boolean;
  type: "purchased" | "free";
  acquiredAt: string;
  seller: {
    id: string;
    displayName: string | null;
    image: string | null;
  };
}

interface UploadedItem {
  id: string;
  title: string;
  description: string;
  price: number;
  priceFormatted: string;
  subject: string;
  cycle: string;
  verified: boolean;
  status: string;
  isApproved: boolean;
  type: "uploaded";
  createdAt: string;
  downloadCount: number;
  purchaseCount: number;
}

interface WishlistItem {
  id: string;
  title: string;
  description: string;
  price: number;
  priceFormatted: string;
  subject: string;
  cycle: string;
  addedAt: string;
  seller: {
    id: string;
    displayName: string | null;
    image: string | null;
  };
}

interface UserStats {
  purchasedResources: number;
  downloadedResources: number;
  totalInLibrary: number;
  wishlistItems: number;
  uploadedResources: number;
  followedSellers: number;
}

interface SellerStats {
  netEarnings: string;
  totalDownloads: number;
  followers: number;
}

interface SellerResource {
  id: string;
  title: string;
  type: string;
  status: string;
  downloads: number;
  netEarnings: string;
}

interface Transaction {
  id: string;
  resource: string;
  date: string;
  gross: string;
  platformFee: string;
  sellerPayout: string;
}

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  displayName: string | null;
  subjects: string[];
  cycles: string[];
  cantons: string[];
  isSeller: boolean;
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "library" | "wishlist" | "settings">(
    "overview"
  );
  const [librarySubTab, setLibrarySubTab] = useState<"acquired" | "uploaded">("acquired");
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for API data
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [librarySearch, setLibrarySearch] = useState("");
  const [uploadedSearch, setUploadedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadedLoading, setUploadedLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Seller dashboard state
  const [sellerStats, setSellerStats] = useState<SellerStats>({
    netEarnings: "CHF 0.00",
    totalDownloads: 0,
    followers: 0,
  });
  const [sellerResources, setSellerResources] = useState<SellerResource[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sellerView, setSellerView] = useState<"resources" | "transactions">("resources");

  // Fetch user stats and profile
  const fetchUserStats = useCallback(async () => {
    try {
      const response = await fetch("/api/user/stats");
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  }, []);

  // Fetch library items (acquired)
  const fetchLibrary = useCallback(async (search?: string) => {
    try {
      const params = new URLSearchParams({ type: "acquired" });
      if (search) params.set("search", search);
      const response = await fetch(`/api/user/library?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLibraryItems(data.items);
      }
    } catch (error) {
      console.error("Error fetching library:", error);
    }
  }, []);

  // Fetch uploaded items
  const fetchUploaded = useCallback(async (search?: string) => {
    setUploadedLoading(true);
    try {
      const params = new URLSearchParams({ type: "uploaded" });
      if (search) params.set("search", search);
      const response = await fetch(`/api/user/library?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUploadedItems(data.items);
      }
    } catch (error) {
      console.error("Error fetching uploaded:", error);
    } finally {
      setUploadedLoading(false);
    }
  }, []);

  // Fetch wishlist items
  const fetchWishlist = useCallback(async () => {
    try {
      const response = await fetch("/api/user/wishlist");
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.items);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  }, []);

  // Fetch seller dashboard data
  const fetchSellerData = useCallback(async () => {
    try {
      const response = await fetch("/api/seller/dashboard");
      if (response.ok) {
        const data = await response.json();
        setSellerStats(data.stats);
        setSellerResources(data.resources);
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Error fetching seller data:", error);
    }
  }, []);

  // Handle redirects in useEffect to avoid setState during render
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role === "ADMIN") {
      router.push("/admin");
    }
  }, [status, session?.user?.role, router]);

  // Fetch data when authenticated
  useEffect(() => {
    if (status === "authenticated") {
      setLoading(true);
      Promise.all([
        fetchUserStats(),
        fetchLibrary(),
        fetchUploaded(),
        fetchWishlist(),
        fetchSellerData(),
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [status, fetchUserStats, fetchLibrary, fetchUploaded, fetchWishlist, fetchSellerData]);

  // Handle library search (acquired)
  useEffect(() => {
    if (status === "authenticated") {
      const debounce = setTimeout(() => {
        fetchLibrary(librarySearch);
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [librarySearch, status, fetchLibrary]);

  // Handle uploaded search
  useEffect(() => {
    if (status === "authenticated") {
      const debounce = setTimeout(() => {
        fetchUploaded(uploadedSearch);
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [uploadedSearch, status, fetchUploaded]);

  // Handle download
  const handleDownload = async (resourceId: string) => {
    setDownloading(resourceId);
    try {
      // Trigger the download by opening the download URL
      window.open(`/api/resources/${resourceId}/download`, "_blank");
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setDownloading(null);
    }
  };

  // Handle wishlist removal
  const handleRemoveFromWishlist = async (resourceId: string) => {
    try {
      const response = await fetch(`/api/user/wishlist?resourceId=${resourceId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setWishlistItems((prev) => prev.filter((item) => item.id !== resourceId));
        if (stats) {
          setStats({ ...stats, wishlistItems: stats.wishlistItems - 1 });
        }
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  // Show loading state while checking auth or redirecting
  if (status === "loading" || status === "unauthenticated" || session?.user?.role === "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  // Fallback data from session
  const displayData = userData || {
    name: session?.user?.name || "Benutzer",
    email: session?.user?.email || "",
    image: session?.user?.image || null,
    subjects: [],
    cycles: [],
    cantons: [],
  };

  const displayStats = stats || {
    purchasedResources: 0,
    downloadedResources: 0,
    totalInLibrary: 0,
    wishlistItems: 0,
    uploadedResources: 0,
    followedSellers: 0,
  };

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header with User Info */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            {displayData.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayData.image}
                alt={displayData.name || "Benutzer"}
                className="h-16 w-16 rounded-full border-2 border-[var(--color-border)]"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]">
                <span className="text-2xl font-bold text-white">
                  {(displayData.name || "B").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-[var(--color-text)]">
                {displayData.name}
              </h1>
              <p className="text-[var(--color-text-muted)]">{displayData.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-[var(--color-border)]">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-4 text-sm font-medium transition-colors ${
                activeTab === "overview"
                  ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Übersicht
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={`pb-4 text-sm font-medium transition-colors ${
                activeTab === "library"
                  ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Meine Bibliothek
            </button>
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`pb-4 text-sm font-medium transition-colors ${
                activeTab === "wishlist"
                  ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Wunschliste
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`pb-4 text-sm font-medium transition-colors ${
                activeTab === "settings"
                  ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Einstellungen
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Top Stats Row - Buyer & Seller stats combined */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Buyer Stats */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-light)]">
                    <svg
                      className="h-5 w-5 text-[var(--color-primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-[var(--color-text-muted)]">Bibliothek</span>
                </div>
                <div className="text-2xl font-bold text-[var(--color-text)]">
                  {loading ? "-" : displayStats.totalInLibrary}
                </div>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent-light)]">
                    <svg
                      className="h-5 w-5 text-[var(--color-accent)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-[var(--color-text-muted)]">Wunschliste</span>
                </div>
                <div className="text-2xl font-bold text-[var(--color-text)]">
                  {loading ? "-" : displayStats.wishlistItems}
                </div>
              </div>

              {/* Seller Stats */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-success-light)]">
                    <svg
                      className="h-5 w-5 text-[var(--color-success)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-[var(--color-text-muted)]">Einnahmen</span>
                </div>
                <div className="text-2xl font-bold text-[var(--color-success)]">
                  {loading ? "-" : sellerStats.netEarnings}
                </div>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-light)]">
                    <svg
                      className="h-5 w-5 text-[var(--color-primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-[var(--color-text-muted)]">Downloads</span>
                </div>
                <div className="text-2xl font-bold text-[var(--color-text)]">
                  {loading ? "-" : sellerStats.totalDownloads}
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
              >
                <svg
                  className="h-4 w-4 text-[var(--color-text-muted)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Ressourcen entdecken
                </span>
              </Link>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-white transition-colors hover:bg-[var(--color-primary-hover)]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-sm font-medium">Neue Ressource hochladen</span>
              </Link>
              <Link
                href="/following"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
              >
                <svg
                  className="h-4 w-4 text-[var(--color-text-muted)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Gefolgte ({displayStats.followedSellers})
                </span>
              </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Recent Downloads */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 lg:col-span-1">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">
                    Letzte Downloads
                  </h2>
                  <button
                    onClick={() => setActiveTab("library")}
                    className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                  >
                    Alle
                  </button>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse rounded-lg bg-[var(--color-bg)] p-3">
                        <div className="mb-2 h-4 w-3/4 rounded bg-[var(--color-surface-elevated)]"></div>
                        <div className="h-3 w-1/2 rounded bg-[var(--color-surface-elevated)]"></div>
                      </div>
                    ))}
                  </div>
                ) : libraryItems.length > 0 ? (
                  <div className="space-y-2">
                    {libraryItems.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 transition-colors hover:border-[var(--color-primary)]"
                      >
                        <div className="mr-3 min-w-0 flex-1">
                          <h3 className="truncate text-sm font-medium text-[var(--color-text)]">
                            {item.title}
                          </h3>
                          <p className="text-xs text-[var(--color-text-muted)]">{item.subject}</p>
                        </div>
                        <button
                          onClick={() => handleDownload(item.id)}
                          disabled={downloading === item.id}
                          className="shrink-0 rounded-md p-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-light)] disabled:opacity-50"
                          title="Herunterladen"
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
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-sm text-[var(--color-text-muted)]">Noch keine Ressourcen.</p>
                    <Link
                      href="/resources"
                      className="mt-2 inline-block text-sm text-[var(--color-primary)] hover:underline"
                    >
                      Entdecken
                    </Link>
                  </div>
                )}
              </div>

              {/* Right Column - Seller Resources & Transactions */}
              <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] lg:col-span-2">
                {/* Sub-navigation */}
                <div className="flex border-b border-[var(--color-border)]">
                  <button
                    onClick={() => setSellerView("resources")}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      sellerView === "resources"
                        ? "border-b-2 border-[var(--color-primary)] bg-[var(--color-bg)] text-[var(--color-primary)]"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    Meine Ressourcen ({sellerResources.length})
                  </button>
                  <button
                    onClick={() => setSellerView("transactions")}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      sellerView === "transactions"
                        ? "border-b-2 border-[var(--color-primary)] bg-[var(--color-bg)] text-[var(--color-primary)]"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    Transaktionen ({transactions.length})
                  </button>
                </div>

                {/* Resources View */}
                {sellerView === "resources" && (
                  <div className="p-4">
                    {loading ? (
                      <div className="py-8 text-center text-[var(--color-text-muted)]">
                        Laden...
                      </div>
                    ) : sellerResources.length === 0 ? (
                      <div className="py-8 text-center">
                        <svg
                          className="mx-auto mb-3 h-12 w-12 text-[var(--color-text-faint)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="mb-3 text-[var(--color-text-muted)]">
                          Noch keine Ressourcen hochgeladen
                        </p>
                        <Link
                          href="/upload"
                          className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
                        >
                          Erste Ressource hochladen
                        </Link>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-xs tracking-wide text-[var(--color-text-muted)] uppercase">
                              <th className="pb-3 font-medium">Titel</th>
                              <th className="pb-3 font-medium">Status</th>
                              <th className="pb-3 text-right font-medium">Downloads</th>
                              <th className="pb-3 text-right font-medium">Einnahmen</th>
                              <th className="pb-3 text-right font-medium">Aktionen</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--color-border)]">
                            {sellerResources.slice(0, 5).map((resource) => (
                              <tr key={resource.id} className="group">
                                <td className="py-3 pr-4">
                                  <div className="text-sm font-medium text-[var(--color-text)]">
                                    {resource.title}
                                  </div>
                                  <div className="text-xs text-[var(--color-text-muted)]">
                                    {resource.type}
                                  </div>
                                </td>
                                <td className="py-3 pr-4">
                                  <span
                                    className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                                      resource.status === "Verified"
                                        ? "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]"
                                        : resource.status === "AI-Checked"
                                          ? "bg-[var(--color-accent-light)] text-[var(--color-accent)]"
                                          : "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]"
                                    }`}
                                  >
                                    {resource.status === "Verified"
                                      ? "Verifiziert"
                                      : resource.status === "AI-Checked"
                                        ? "KI-Geprüft"
                                        : "Ausstehend"}
                                  </span>
                                </td>
                                <td className="py-3 pr-4 text-right text-sm text-[var(--color-text-secondary)]">
                                  {resource.downloads}
                                </td>
                                <td className="py-3 pr-4 text-right text-sm font-semibold text-[var(--color-success)]">
                                  {resource.netEarnings}
                                </td>
                                <td className="py-3 text-right">
                                  <Link
                                    href={`/resources/${resource.id}`}
                                    className="text-sm text-[var(--color-primary)] hover:underline"
                                  >
                                    Ansehen
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {sellerResources.length > 5 && (
                          <div className="mt-2 border-t border-[var(--color-border)] pt-3 text-center">
                            <button
                              onClick={() => {
                                setActiveTab("library");
                                setLibrarySubTab("uploaded");
                              }}
                              className="text-sm text-[var(--color-primary)] hover:underline"
                            >
                              Alle {sellerResources.length} Ressourcen anzeigen
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Transactions View */}
                {sellerView === "transactions" && (
                  <div className="p-4">
                    {loading ? (
                      <div className="py-8 text-center text-[var(--color-text-muted)]">
                        Laden...
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="py-8 text-center">
                        <svg
                          className="mx-auto mb-3 h-12 w-12 text-[var(--color-text-faint)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <p className="text-[var(--color-text-muted)]">
                          Noch keine Transaktionen vorhanden
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-xs tracking-wide text-[var(--color-text-muted)] uppercase">
                              <th className="pb-3 font-medium">Ressource</th>
                              <th className="pb-3 font-medium">Datum</th>
                              <th className="pb-3 text-right font-medium">Brutto</th>
                              <th className="pb-3 text-right font-medium">Gebühr</th>
                              <th className="pb-3 text-right font-medium">Netto</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--color-border)]">
                            {transactions.slice(0, 5).map((transaction) => (
                              <tr key={transaction.id}>
                                <td className="py-3 pr-4 text-sm font-medium text-[var(--color-text)]">
                                  {transaction.resource}
                                </td>
                                <td className="py-3 pr-4 text-sm text-[var(--color-text-muted)]">
                                  {new Date(transaction.date).toLocaleDateString("de-CH")}
                                </td>
                                <td className="py-3 pr-4 text-right text-sm text-[var(--color-text-secondary)]">
                                  {transaction.gross}
                                </td>
                                <td className="py-3 pr-4 text-right text-sm text-[var(--color-error)]">
                                  -{transaction.platformFee}
                                </td>
                                <td className="py-3 text-right text-sm font-semibold text-[var(--color-success)]">
                                  {transaction.sellerPayout}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {transactions.length > 5 && (
                          <div className="mt-2 border-t border-[var(--color-border)] pt-3 text-center">
                            <span className="text-sm text-[var(--color-text-muted)]">
                              +{transactions.length - 5} weitere Transaktionen
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Information Card */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  Profilinformationen
                </h2>
                <Link
                  href="/profile/edit"
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                  Bearbeiten
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {displayData.cantons && displayData.cantons.length > 0 ? (
                  <div>
                    <label className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
                      Kanton
                    </label>
                    <p className="mt-1 text-[var(--color-text)]">
                      {displayData.cantons.join(", ")}
                    </p>
                  </div>
                ) : null}
                {displayData.subjects && displayData.subjects.length > 0 ? (
                  <div>
                    <label className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
                      Fächer
                    </label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {displayData.subjects.slice(0, 3).map((subject) => (
                        <span
                          key={subject}
                          className="rounded bg-[var(--color-bg)] px-2 py-0.5 text-sm text-[var(--color-text-secondary)]"
                        >
                          {subject}
                        </span>
                      ))}
                      {displayData.subjects.length > 3 && (
                        <span className="px-2 py-0.5 text-sm text-[var(--color-text-muted)]">
                          +{displayData.subjects.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}
                {displayData.cycles && displayData.cycles.length > 0 ? (
                  <div>
                    <label className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
                      Zyklen
                    </label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {displayData.cycles.map((cycle) => (
                        <span
                          key={cycle}
                          className="rounded bg-[var(--color-primary-light)] px-2 py-0.5 text-sm text-[var(--color-primary)]"
                        >
                          {cycle}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {(!displayData.subjects || displayData.subjects.length === 0) &&
                  (!displayData.cycles || displayData.cycles.length === 0) &&
                  (!displayData.cantons || displayData.cantons.length === 0) && (
                    <p className="col-span-3 text-[var(--color-text-muted)]">
                      Vervollständigen Sie Ihr Profil für personalisierte Empfehlungen.
                    </p>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === "library" && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text)]">Meine Bibliothek</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {librarySubTab === "acquired"
                    ? "Ressourcen, die Sie erworben haben"
                    : "Ressourcen, die Sie hochgeladen haben"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Suchen..."
                  value={librarySubTab === "acquired" ? librarySearch : uploadedSearch}
                  onChange={(e) =>
                    librarySubTab === "acquired"
                      ? setLibrarySearch(e.target.value)
                      : setUploadedSearch(e.target.value)
                  }
                  className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Sub-tabs for Acquired vs Uploaded */}
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setLibrarySubTab("acquired")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  librarySubTab === "acquired"
                    ? "bg-[var(--color-primary)] text-white"
                    : "border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)]"
                }`}
              >
                Erworben ({libraryItems.length})
              </button>
              <button
                onClick={() => setLibrarySubTab("uploaded")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  librarySubTab === "uploaded"
                    ? "bg-[var(--color-primary)] text-white"
                    : "border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)]"
                }`}
              >
                Hochgeladen ({uploadedItems.length})
              </button>
            </div>

            {/* Acquired Resources */}
            {librarySubTab === "acquired" && (
              <>
                {loading ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
                      >
                        <div className="mb-3 h-4 w-16 rounded bg-[var(--color-surface-elevated)]"></div>
                        <div className="mb-2 h-5 w-full rounded bg-[var(--color-surface-elevated)]"></div>
                        <div className="mb-4 h-4 w-24 rounded bg-[var(--color-surface-elevated)]"></div>
                        <div className="h-10 w-full rounded bg-[var(--color-surface-elevated)]"></div>
                      </div>
                    ))}
                  </div>
                ) : libraryItems.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {libraryItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 transition-colors hover:border-[var(--color-primary)]"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="rounded bg-[var(--color-surface)] px-2 py-1 text-xs font-medium text-[var(--color-text-muted)]">
                            {item.type === "purchased" ? "Gekauft" : "Gratis"}
                          </span>
                          {item.verified && (
                            <span className="rounded bg-[var(--badge-success-bg)] px-2 py-1 text-xs font-medium text-[var(--badge-success-text)]">
                              Verifiziert
                            </span>
                          )}
                        </div>
                        <h3 className="mb-1 font-semibold text-[var(--color-text)]">
                          {item.title}
                        </h3>
                        <p className="mb-2 text-sm text-[var(--color-text-muted)]">
                          {item.subject} - {item.cycle}
                        </p>
                        <p className="mb-4 text-xs text-[var(--color-text-muted)]">
                          Von: {item.seller.displayName || "Unbekannt"}
                        </p>
                        <button
                          onClick={() => handleDownload(item.id)}
                          disabled={downloading === item.id}
                          className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
                        >
                          {downloading === item.id ? "Wird geladen..." : "Herunterladen"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <svg
                      className="mx-auto mb-4 h-16 w-16 text-[var(--color-text-faint)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <h3 className="mb-2 text-lg font-medium text-[var(--color-text)]">
                      Noch keine erworbenen Ressourcen
                    </h3>
                    <p className="mb-4 text-[var(--color-text-muted)]">
                      Entdecken Sie unsere Ressourcen und beginnen Sie Ihre Sammlung.
                    </p>
                    <Link
                      href="/resources"
                      className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
                    >
                      Ressourcen entdecken
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Uploaded Resources */}
            {librarySubTab === "uploaded" && (
              <>
                {loading || uploadedLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
                      >
                        <div className="mb-3 h-4 w-16 rounded bg-[var(--color-surface-elevated)]"></div>
                        <div className="mb-2 h-5 w-full rounded bg-[var(--color-surface-elevated)]"></div>
                        <div className="mb-4 h-4 w-24 rounded bg-[var(--color-surface-elevated)]"></div>
                        <div className="h-10 w-full rounded bg-[var(--color-surface-elevated)]"></div>
                      </div>
                    ))}
                  </div>
                ) : uploadedItems.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {uploadedItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 transition-colors hover:border-[var(--color-primary)]"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              item.status === "VERIFIED"
                                ? "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]"
                                : item.status === "PENDING"
                                  ? "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]"
                                  : "bg-[var(--color-surface)] text-[var(--color-text-muted)]"
                            }`}
                          >
                            {item.status === "VERIFIED"
                              ? "Verifiziert"
                              : item.status === "PENDING"
                                ? "Ausstehend"
                                : item.status}
                          </span>
                          <span className="text-sm font-semibold text-[var(--color-primary)]">
                            {item.priceFormatted}
                          </span>
                        </div>
                        <Link href={`/resources/${item.id}`}>
                          <h3 className="mb-1 font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)]">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="mb-3 text-sm text-[var(--color-text-muted)]">
                          {item.subject} - {item.cycle}
                        </p>
                        <div className="mb-4 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                          <span>{item.downloadCount} Downloads</span>
                          <span>{item.purchaseCount} Verkäufe</span>
                        </div>
                        <Link
                          href={`/resources/${item.id}`}
                          className="block w-full rounded-md bg-[var(--color-primary)] px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
                        >
                          Ansehen
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <svg
                      className="mx-auto mb-4 h-16 w-16 text-[var(--color-text-faint)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    <h3 className="mb-2 text-lg font-medium text-[var(--color-text)]">
                      Noch keine hochgeladenen Ressourcen
                    </h3>
                    <p className="mb-4 text-[var(--color-text-muted)]">
                      Teilen Sie Ihre Unterrichtsmaterialien mit anderen Lehrpersonen.
                    </p>
                    <Link
                      href="/upload"
                      className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
                    >
                      Material hochladen
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === "wishlist" && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text)]">Wunschliste</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Gespeicherte Ressourcen für später
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
                  >
                    <div className="mb-3 h-4 w-16 rounded bg-[var(--color-surface-elevated)]"></div>
                    <div className="mb-2 h-5 w-full rounded bg-[var(--color-surface-elevated)]"></div>
                    <div className="mb-4 h-4 w-24 rounded bg-[var(--color-surface-elevated)]"></div>
                    <div className="h-10 w-full rounded bg-[var(--color-surface-elevated)]"></div>
                  </div>
                ))}
              </div>
            ) : wishlistItems.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {wishlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 transition-colors hover:border-[var(--color-primary)]"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded bg-[var(--color-surface)] px-2 py-1 text-xs font-medium text-[var(--color-text-muted)]">
                        {item.subject}
                      </span>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="text-[var(--color-error)] hover:text-[var(--color-error-hover)]"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                    <Link href={`/resources/${item.id}`}>
                      <h3 className="mb-1 font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)]">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="mb-4 text-sm text-[var(--color-text-muted)]">{item.cycle}</p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-lg font-bold ${item.price === 0 ? "text-[var(--color-success)]" : "text-[var(--color-primary)]"}`}
                      >
                        {item.priceFormatted}
                      </span>
                      <Link
                        href={`/resources/${item.id}`}
                        className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
                      >
                        Ansehen
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <svg
                  className="mx-auto mb-4 h-16 w-16 text-[var(--color-text-faint)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <h3 className="mb-2 text-lg font-medium text-[var(--color-text)]">
                  Ihre Wunschliste ist leer
                </h3>
                <p className="mb-4 text-[var(--color-text-muted)]">
                  Speichern Sie interessante Ressourcen für später.
                </p>
                <Link
                  href="/resources"
                  className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
                >
                  Ressourcen entdecken
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-6">
            {/* Profile Settings */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
                Profileinstellungen
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                    Name
                  </label>
                  <input
                    type="text"
                    value={displayData.name || ""}
                    disabled
                    className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[var(--color-text-muted)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                    E-Mail
                  </label>
                  <input
                    type="email"
                    value={displayData.email}
                    disabled
                    className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[var(--color-text-muted)]"
                  />
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    E-Mail kann nicht geändert werden.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  href="/profile/edit"
                  className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
                >
                  Profil bearbeiten
                </Link>
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Darstellung</h2>
              <p className="mb-4 text-sm text-[var(--color-text-muted)]">
                Wählen Sie Ihr bevorzugtes Farbschema
              </p>
              <ThemeSettings />
            </div>

            {/* Notification Settings */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
                Benachrichtigungen
              </h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-[var(--color-text)]">Neue Ressourcen</span>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Benachrichtigungen über neue Materialien von gefolgten Verkäufern
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-5 w-5 rounded text-[var(--color-primary)]"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-[var(--color-text)]">Preisänderungen</span>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Benachrichtigungen bei Preisänderungen auf der Wunschliste
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-5 w-5 rounded text-[var(--color-primary)]"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-[var(--color-text)]">Newsletter</span>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Wöchentliche Updates und Tipps
                    </p>
                  </div>
                  <input type="checkbox" className="h-5 w-5 rounded text-[var(--color-primary)]" />
                </label>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-xl border border-[var(--color-error)]/30 bg-[var(--color-surface)] p-6">
              <h2 className="mb-4 text-lg font-semibold text-[var(--color-error)]">Gefahrenzone</h2>
              <p className="mb-4 text-sm text-[var(--color-text-muted)]">
                Diese Aktionen sind unwiderruflich. Bitte seien Sie vorsichtig.
              </p>
              <button className="rounded-md border border-[var(--color-error)] px-4 py-2 text-sm font-medium text-[var(--color-error)] transition-colors hover:bg-[var(--badge-error-bg)]">
                Konto löschen
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
