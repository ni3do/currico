"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { ThemeSettings } from "@/components/ui/ThemeToggle";
import { AvatarUploader } from "@/components/profile/AvatarUploader";

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
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Avatar management state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Close action menu when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setOpenActionMenu(null);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenActionMenu(null);
      }
    }

    if (openActionMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [openActionMenu]);

  // Fetch user stats and profile
  const fetchUserStats = useCallback(async () => {
    try {
      const response = await fetch("/api/user/stats");
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setStats(data.stats);
        setAvatarUrl(data.user?.image || null);
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

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    setAvatarMessage(null);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch("/api/users/me/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Fehler beim Hochladen");
      }

      const data = await response.json();
      setAvatarUrl(data.url);
      if (userData) {
        setUserData({ ...userData, image: data.url });
      }
      setAvatarMessage({ type: "success", text: "Profilbild erfolgreich hochgeladen!" });
      setTimeout(() => setAvatarMessage(null), 3000);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setAvatarMessage({
        type: "error",
        text: "Fehler beim Hochladen. Bitte versuchen Sie es erneut.",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle avatar deletion
  const handleAvatarDelete = async () => {
    if (isDeletingAvatar) return;

    setIsDeletingAvatar(true);
    setAvatarMessage(null);

    try {
      const response = await fetch("/api/users/me/avatar", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Fehler beim Löschen");
      }

      setAvatarUrl(null);
      if (userData) {
        setUserData({ ...userData, image: null });
      }
      setAvatarMessage({ type: "success", text: "Profilbild erfolgreich entfernt!" });
      setTimeout(() => setAvatarMessage(null), 3000);
    } catch (error) {
      console.error("Error deleting avatar:", error);
      setAvatarMessage({
        type: "error",
        text: "Fehler beim Löschen. Bitte versuchen Sie es erneut.",
      });
    } finally {
      setIsDeletingAvatar(false);
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
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <div className="mx-auto flex max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Vertical Sidebar Navigation */}
        <aside className="mr-8 hidden w-64 shrink-0 lg:block">
          {/* User Info in Sidebar */}
          <div className="mb-6 flex items-center gap-3">
            {displayData.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayData.image}
                alt={displayData.name || "Benutzer"}
                className="h-12 w-12 rounded-full border-2 border-[var(--color-border)]"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]">
                <span className="text-lg font-bold text-[var(--btn-primary-text)]">
                  {(displayData.name || "B").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-[var(--color-text)]">
                {displayData.name}
              </h2>
              <p className="truncate text-xs text-[var(--color-text-muted)]">{displayData.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "overview"
                  ? "bg-[var(--color-primary-light)] text-[var(--ctp-blue)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
              }`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Übersicht
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "library"
                  ? "bg-[var(--color-primary-light)] text-[var(--ctp-blue)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
              }`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Meine Bibliothek
            </button>
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "wishlist"
                  ? "bg-[var(--color-primary-light)] text-[var(--ctp-blue)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
              }`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              Wunschliste
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "settings"
                  ? "bg-[var(--color-primary-light)] text-[var(--ctp-blue)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
              }`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              Einstellungen
            </button>
          </nav>

          {/* Quick Stats in Sidebar */}
          <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-[var(--color-text-muted)] uppercase">
              Statistiken
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-secondary)]">In Bibliothek</span>
                <span className="text-sm font-semibold text-[var(--color-text)]">
                  {displayStats.totalInLibrary}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-secondary)]">Hochgeladen</span>
                <span className="text-sm font-semibold text-[var(--color-text)]">
                  {displayStats.uploadedResources}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-secondary)]">Wunschliste</span>
                <span className="text-sm font-semibold text-[var(--color-text)]">
                  {displayStats.wishlistItems}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation - visible only on smaller screens */}
        <div className="mb-6 lg:hidden">
          {/* Mobile User Info */}
          <div className="mb-4 flex items-center gap-3">
            {displayData.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayData.image}
                alt={displayData.name || "Benutzer"}
                className="h-12 w-12 rounded-full border-2 border-[var(--color-border)]"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]">
                <span className="text-lg font-bold text-[var(--btn-primary-text)]">
                  {(displayData.name || "B").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-sm font-semibold text-[var(--color-text)]">{displayData.name}</h2>
              <p className="text-xs text-[var(--color-text-muted)]">{displayData.email}</p>
            </div>
          </div>
          {/* Mobile Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "overview"
                  ? "bg-[var(--color-primary)] text-[var(--btn-primary-text)]"
                  : "bg-[var(--color-surface)] text-[var(--color-text-muted)]"
              }`}
            >
              Übersicht
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "library"
                  ? "bg-[var(--color-primary)] text-[var(--btn-primary-text)]"
                  : "bg-[var(--color-surface)] text-[var(--color-text-muted)]"
              }`}
            >
              Bibliothek
            </button>
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "wishlist"
                  ? "bg-[var(--color-primary)] text-[var(--btn-primary-text)]"
                  : "bg-[var(--color-surface)] text-[var(--color-text-muted)]"
              }`}
            >
              Wunschliste
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "settings"
                  ? "bg-[var(--color-primary)] text-[var(--btn-primary-text)]"
                  : "bg-[var(--color-surface)] text-[var(--color-text-muted)]"
              }`}
            >
              Einstellungen
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* KPI Metrics Row - 3 columns */}
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Einnahmen (Earnings) */}
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-muted)]">
                        Einnahmen
                      </p>
                      <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                        {loading ? "-" : sellerStats.netEarnings}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-success-light)]">
                      <svg
                        className="h-6 w-6 text-[var(--ctp-green)]"
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
                  </div>
                </div>

                {/* Downloads */}
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-muted)]">
                        Downloads
                      </p>
                      <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                        {loading ? "-" : sellerStats.totalDownloads}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-light)]">
                      <svg
                        className="h-6 w-6 text-[var(--ctp-blue)]"
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
                  </div>
                </div>

                {/* Beiträge (Contributions) */}
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-muted)]">Beiträge</p>
                      <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                        {loading ? "-" : sellerResources.length}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent-light)]">
                      <svg
                        className="h-6 w-6 text-[var(--ctp-mauve)]"
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
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid - Resources Table + Sidebar */}
              <div className="grid gap-6 lg:grid-cols-4">
                {/* Main Resources Table Container - Takes 3 columns */}
                <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] lg:col-span-3">
                  {/* Integrated Header with Search and Upload Button */}
                  <div className="flex flex-col gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg)] p-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search Bar (Left) */}
                    <div className="relative flex-1 sm:max-w-sm">
                      <svg
                        className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
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
                      <input
                        type="text"
                        placeholder="Ressourcen durchsuchen..."
                        value={uploadedSearch}
                        onChange={(e) => setUploadedSearch(e.target.value)}
                        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pr-4 pl-10 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none"
                      />
                    </div>

                    {/* Upload Button (Right) */}
                    <Link
                      href="/upload"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--ctp-blue)] px-5 py-2.5 text-sm font-semibold text-[var(--btn-primary-text)] shadow-[var(--ctp-blue)]/20 shadow-md transition-all hover:bg-[var(--ctp-sapphire)] hover:shadow-[var(--ctp-blue)]/25 hover:shadow-lg"
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>Neue Ressource hochladen</span>
                    </Link>
                  </div>

                  {/* Table Content */}
                  <div className="p-4">
                    {loading ? (
                      <div className="py-12 text-center text-[var(--color-text-muted)]">
                        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
                        Laden...
                      </div>
                    ) : sellerResources.length === 0 ? (
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
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <h3 className="mb-2 text-lg font-medium text-[var(--color-text)]">
                          Noch keine Ressourcen hochgeladen
                        </h3>
                        <p className="mb-4 text-sm text-[var(--color-text-muted)]">
                          Teilen Sie Ihre Unterrichtsmaterialien mit anderen Lehrpersonen.
                        </p>
                        <Link
                          href="/upload"
                          className="inline-flex items-center gap-2 rounded-lg bg-[var(--ctp-blue)] px-5 py-2.5 text-sm font-semibold text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--ctp-sapphire)]"
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
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Erste Ressource hochladen
                        </Link>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-xs font-medium tracking-wider text-[var(--color-text-muted)] uppercase">
                              <th className="pb-4">Titel</th>
                              <th className="pb-4">Status</th>
                              <th className="pb-4 text-right">Downloads</th>
                              <th className="pb-4 text-right">Einnahmen</th>
                              <th className="pb-4 text-right">Aktionen</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--color-border)]">
                            {sellerResources.map((resource) => (
                              <tr
                                key={resource.id}
                                className="group transition-colors hover:bg-[var(--color-bg)]"
                              >
                                <td className="py-4 pr-4">
                                  <Link href={`/resources/${resource.id}`} className="block">
                                    <div className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                                      {resource.title}
                                    </div>
                                    <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                                      {resource.type}
                                    </div>
                                  </Link>
                                </td>
                                <td className="py-4 pr-4">
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${resource.status === "Verified" ? "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]" : resource.status === "AI-Checked" ? "bg-[var(--color-accent-light)] text-[var(--color-accent)]" : "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]"}`}
                                  >
                                    {resource.status === "Verified"
                                      ? "Verifiziert"
                                      : resource.status === "AI-Checked"
                                        ? "KI-Geprüft"
                                        : "Ausstehend"}
                                  </span>
                                </td>
                                <td className="py-4 pr-4 text-right text-sm font-medium text-[var(--color-text)]">
                                  {resource.downloads}
                                </td>
                                <td className="py-4 pr-4 text-right text-sm font-semibold text-[var(--color-success)]">
                                  {resource.netEarnings}
                                </td>
                                <td className="py-4 text-right">
                                  <div
                                    className="relative inline-block"
                                    ref={openActionMenu === resource.id ? actionMenuRef : null}
                                  >
                                    <button
                                      onClick={() =>
                                        setOpenActionMenu(
                                          openActionMenu === resource.id ? null : resource.id
                                        )
                                      }
                                      className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]"
                                      aria-label="Aktionen"
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
                                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                        />
                                      </svg>
                                    </button>
                                    {openActionMenu === resource.id && (
                                      <div className="absolute right-0 z-10 mt-1 w-40 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-1.5 shadow-lg">
                                        <Link
                                          href={`/resources/${resource.id}`}
                                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg)]"
                                          onClick={() => setOpenActionMenu(null)}
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
                                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                          </svg>
                                          Ansehen
                                        </Link>
                                        <Link
                                          href={`/resources/${resource.id}/edit`}
                                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg)]"
                                          onClick={() => setOpenActionMenu(null)}
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
                                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                          </svg>
                                          Bearbeiten
                                        </Link>
                                        <button
                                          onClick={() => setOpenActionMenu(null)}
                                          className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[var(--color-error)] transition-colors hover:bg-[var(--badge-error-bg)]"
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
                                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                          </svg>
                                          Löschen
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Sidebar - Recent Downloads */}
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:col-span-1">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[var(--color-text)]">
                      Letzte Downloads
                    </h2>
                    <button
                      onClick={() => setActiveTab("library")}
                      className="text-xs font-medium text-[var(--color-primary)] hover:underline"
                    >
                      Alle anzeigen
                    </button>
                  </div>

                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse rounded-xl bg-[var(--color-bg)] p-3">
                          <div className="mb-2 h-4 w-3/4 rounded bg-[var(--color-surface-elevated)]"></div>
                          <div className="h-3 w-1/2 rounded bg-[var(--color-surface-elevated)]"></div>
                        </div>
                      ))}
                    </div>
                  ) : libraryItems.length > 0 ? (
                    <div className="space-y-2">
                      {libraryItems.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="group flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 transition-all hover:border-[var(--color-primary)] hover:shadow-sm"
                        >
                          <div className="mr-2 min-w-0 flex-1">
                            <h3 className="truncate text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                              {item.title}
                            </h3>
                            <p className="truncate text-xs text-[var(--color-text-muted)]">
                              {item.subject}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDownload(item.id)}
                            disabled={downloading === item.id}
                            className="shrink-0 rounded-lg p-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-light)] disabled:opacity-50"
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
                    <div className="py-8 text-center">
                      <svg
                        className="mx-auto mb-3 h-10 w-10 text-[var(--color-text-faint)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-[var(--color-text-muted)]">
                        Noch keine Ressourcen
                      </p>
                      <Link
                        href="/resources"
                        className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                      >
                        Entdecken
                      </Link>
                    </div>
                  )}

                  {/* Quick Links */}
                  <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                    <h3 className="mb-3 text-xs font-semibold tracking-wider text-[var(--color-text-muted)] uppercase">
                      Schnellzugriff
                    </h3>
                    <div className="space-y-2">
                      <Link
                        href="/resources"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
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
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        Ressourcen entdecken
                      </Link>
                      <Link
                        href="/following"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Gefolgte ({displayStats.followedSellers})
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Library Tab */}
          {activeTab === "library" && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-text)]">
                    Meine Bibliothek
                  </h2>
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
                      ? "bg-[var(--color-primary)] text-[var(--btn-primary-text)]"
                      : "border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)]"
                  }`}
                >
                  Erworben ({libraryItems.length})
                </button>
                <button
                  onClick={() => setLibrarySubTab("uploaded")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    librarySubTab === "uploaded"
                      ? "bg-[var(--color-primary)] text-[var(--btn-primary-text)]"
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
                            className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
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
                        className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--color-primary-hover)]"
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
                            className="block w-full rounded-md bg-[var(--color-primary)] px-4 py-2 text-center text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--color-primary-hover)]"
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
                        className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--color-primary-hover)]"
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
                          className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--color-primary-hover)]"
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
                    className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--color-primary-hover)]"
                  >
                    Ressourcen entdecken
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Settings Grid - 2 columns on large screens */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column - Profile & Avatar */}
                <div className="space-y-6">
                  {/* Profile Picture Settings */}
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                    <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
                      Profilbild
                    </h2>
                    <p className="mb-6 text-sm text-[var(--color-text-muted)]">
                      Laden Sie ein Profilbild hoch oder entfernen Sie das aktuelle Bild
                    </p>

                    {/* Avatar Message */}
                    {avatarMessage && (
                      <div
                        className={`mb-4 rounded-lg border p-3 ${
                          avatarMessage.type === "success"
                            ? "border-[var(--color-success)]/50 bg-[var(--color-success)]/10 text-[var(--color-success)]"
                            : "border-[var(--color-error)]/50 bg-[var(--color-error)]/10 text-[var(--color-error)]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {avatarMessage.type === "success" ? (
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                          <span className="text-sm">{avatarMessage.text}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                      {/* Avatar Uploader */}
                      <AvatarUploader
                        currentAvatarUrl={avatarUrl}
                        displayName={displayData.name || "Benutzer"}
                        onUpload={handleAvatarUpload}
                      />

                      {/* Delete Button */}
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          Klicken Sie auf das Kamera-Symbol, um ein neues Bild hochzuladen.
                        </p>
                        {avatarUrl && (
                          <button
                            onClick={handleAvatarDelete}
                            disabled={isDeletingAvatar}
                            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-error)]/50 px-4 py-2 text-sm font-medium text-[var(--color-error)] transition-colors hover:bg-[var(--color-error)]/10 disabled:opacity-50"
                          >
                            {isDeletingAvatar ? (
                              <>
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                Wird entfernt...
                              </>
                            ) : (
                              <>
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Profilbild entfernen
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile Settings */}
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-[var(--color-text)]">Profil</h2>
                      <Link
                        href="/profile/edit"
                        className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                      >
                        Bearbeiten
                      </Link>
                    </div>

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

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
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

                {/* Right Column - Preferences */}
                <div className="space-y-6">
                  {/* Appearance Settings */}
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                    <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
                      Darstellung
                    </h2>
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
                          <span className="font-medium text-[var(--color-text)]">
                            Neue Ressourcen
                          </span>
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
                          <span className="font-medium text-[var(--color-text)]">
                            Preisänderungen
                          </span>
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
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded text-[var(--color-primary)]"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="rounded-xl border border-[var(--color-error)]/30 bg-[var(--color-surface)] p-6">
                    <h2 className="mb-4 text-lg font-semibold text-[var(--color-error)]">
                      Gefahrenzone
                    </h2>
                    <p className="mb-4 text-sm text-[var(--color-text-muted)]">
                      Diese Aktionen sind unwiderruflich. Bitte seien Sie vorsichtig.
                    </p>
                    <button className="rounded-md border border-[var(--color-error)] px-4 py-2 text-sm font-medium text-[var(--color-error)] transition-colors hover:bg-[var(--badge-error-bg)]">
                      Konto löschen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
