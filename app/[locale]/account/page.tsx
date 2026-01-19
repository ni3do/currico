"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Menu, ChevronDown, TrendingUp, Download, FileText, ExternalLink } from "lucide-react";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { ThemeSettings } from "@/components/ui/ThemeToggle";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { EmailVerificationBanner } from "@/components/account/EmailVerificationBanner";
import { StripeConnectStatus } from "@/components/account/StripeConnectStatus";
import { AccountSidebar } from "@/components/account/AccountSidebar";

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
  emailVerified: string | null;
  image: string | null;
  displayName: string | null;
  subjects: string[];
  cycles: string[];
  cantons: string[];
  isSeller: boolean;
}

interface FollowedSeller {
  id: string;
  displayName: string | null;
  image: string | null;
  newResources?: number;
}

// Subject color mapping for pills
const SUBJECT_PILL_CLASSES: Record<string, string> = {
  Deutsch: "pill-deutsch",
  Mathematik: "pill-mathe",
  NMG: "pill-nmg",
  BG: "pill-gestalten",
  Musik: "pill-musik",
  Sport: "pill-sport",
  Englisch: "pill-fremdsprachen",
  Französisch: "pill-fremdsprachen",
  "Medien und Informatik": "pill-medien",
};

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "library" | "uploads" | "wishlist" | "settings"
  >("overview");
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for API data
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [followedSellers, setFollowedSellers] = useState<FollowedSeller[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadedLoading, setUploadedLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Seller dashboard state
  const [sellerStats, setSellerStats] = useState<SellerStats>({
    netEarnings: "CHF 0.00",
    totalDownloads: 0,
    followers: 0,
  });
  const [sellerResources, setSellerResources] = useState<SellerResource[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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

  // Fetch followed sellers
  const fetchFollowedSellers = useCallback(async () => {
    try {
      const response = await fetch("/api/user/following");
      if (response.ok) {
        const data = await response.json();
        setFollowedSellers(data.sellers || []);
      }
    } catch (error) {
      console.error("Error fetching followed sellers:", error);
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
        fetchFollowedSellers(),
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [
    status,
    fetchUserStats,
    fetchLibrary,
    fetchUploaded,
    fetchWishlist,
    fetchSellerData,
    fetchFollowedSellers,
  ]);

  // Handle search
  useEffect(() => {
    if (status === "authenticated" && searchQuery) {
      const debounce = setTimeout(() => {
        fetchLibrary(searchQuery);
        fetchUploaded(searchQuery);
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [searchQuery, status, fetchLibrary, fetchUploaded]);

  // Handle download
  const handleDownload = async (resourceId: string) => {
    setDownloading(resourceId);
    try {
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

  // Get subject pill class
  const getSubjectPillClass = (subject: string): string => {
    return SUBJECT_PILL_CLASSES[subject] || "pill-neutral";
  };

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

  // Count pending resources
  const pendingResourcesCount = sellerResources.filter(
    (r) => r.status !== "Verified" && r.status !== "AI-Checked"
  ).length;

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="text-text-muted mb-2 flex items-center gap-2 text-sm">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-text-secondary">Mein Konto</span>
          </div>
          <h1 className="text-text text-2xl font-bold">Mein Konto</h1>
        </div>

        {/* Main Layout: Sidebar + Content */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="border-border bg-bg-secondary text-text-secondary hover:border-primary hover:text-primary flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors"
            >
              <Menu className="h-5 w-5" />
              <span>Menü</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Mobile Sidebar */}
            {mobileMenuOpen && (
              <div className="mt-4">
                <AccountSidebar
                  userData={displayData}
                  stats={displayStats}
                  sellerStats={{
                    ...sellerStats,
                    pendingResources: pendingResourcesCount,
                    stripeConnected: true,
                  }}
                  followedSellers={followedSellers}
                  activeTab={activeTab}
                  onTabChange={(tab) => {
                    setActiveTab(tab);
                    setMobileMenuOpen(false);
                  }}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
            )}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden w-72 flex-shrink-0 lg:block">
            <div className="sticky top-24">
              <AccountSidebar
                userData={displayData}
                stats={displayStats}
                sellerStats={{
                  ...sellerStats,
                  pendingResources: pendingResourcesCount,
                  stripeConnected: true,
                }}
                followedSellers={followedSellers}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="min-w-0 flex-1">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Email Verification Banner */}
                {userData && !userData.emailVerified && (
                  <EmailVerificationBanner email={userData.email} />
                )}

                {/* Stripe Connect Status */}
                {userData && userData.emailVerified && (
                  <StripeConnectStatus isSeller={userData.isSeller} />
                )}

                {/* KPI Metrics Row */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Einnahmen (Earnings) */}
                  <div className="border-border bg-surface rounded-2xl border p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-text-muted text-sm font-medium">Einnahmen</p>
                        <p className="text-text mt-2 text-3xl font-bold">
                          {loading ? "-" : sellerStats.netEarnings}
                        </p>
                      </div>
                      <div className="bg-success/10 flex h-12 w-12 items-center justify-center rounded-xl">
                        <TrendingUp className="text-success h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  {/* Downloads */}
                  <div className="border-border bg-surface rounded-2xl border p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-text-muted text-sm font-medium">Downloads</p>
                        <p className="text-text mt-2 text-3xl font-bold">
                          {loading ? "-" : sellerStats.totalDownloads}
                        </p>
                      </div>
                      <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                        <Download className="text-primary h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  {/* Beiträge (Contributions) */}
                  <div className="border-border bg-surface rounded-2xl border p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-text-muted text-sm font-medium">Beiträge</p>
                        <p className="text-text mt-2 text-3xl font-bold">
                          {loading ? "-" : sellerResources.length}
                        </p>
                      </div>
                      <div className="bg-accent/10 flex h-12 w-12 items-center justify-center rounded-xl">
                        <FileText className="text-accent h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resources Table */}
                <div className="border-border bg-surface overflow-hidden rounded-2xl border">
                  <div className="border-border bg-bg-secondary flex items-center justify-between border-b p-4">
                    <h2 className="text-text text-lg font-semibold">Meine Ressourcen</h2>
                    <Link
                      href="/upload"
                      className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
                    >
                      <span>+</span>
                      Neue Ressource
                    </Link>
                  </div>

                  <div className="p-4">
                    {loading ? (
                      <div className="text-text-muted py-12 text-center">
                        <div className="border-primary mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                        Laden...
                      </div>
                    ) : sellerResources.length === 0 ? (
                      <div className="py-12 text-center">
                        <FileText className="text-text-faint mx-auto mb-4 h-16 w-16" />
                        <h3 className="text-text mb-2 text-lg font-medium">
                          Noch keine Ressourcen hochgeladen
                        </h3>
                        <p className="text-text-muted mb-4 text-sm">
                          Teilen Sie Ihre Unterrichtsmaterialien mit anderen Lehrpersonen.
                        </p>
                        <Link
                          href="/upload"
                          className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
                        >
                          Erste Ressource hochladen
                        </Link>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-text-muted text-left text-xs font-medium tracking-wider uppercase">
                              <th className="pb-4">Titel</th>
                              <th className="pb-4">Status</th>
                              <th className="pb-4 text-right">Downloads</th>
                              <th className="pb-4 text-right">Einnahmen</th>
                              <th className="pb-4 text-right">Aktionen</th>
                            </tr>
                          </thead>
                          <tbody className="divide-border divide-y">
                            {sellerResources.map((resource) => (
                              <tr key={resource.id} className="group hover:bg-bg transition-colors">
                                <td className="py-4 pr-4">
                                  <Link href={`/resources/${resource.id}`} className="block">
                                    <div className="text-text group-hover:text-primary text-sm font-medium">
                                      {resource.title}
                                    </div>
                                    <div className="text-text-muted mt-0.5 text-xs">
                                      {resource.type}
                                    </div>
                                  </Link>
                                </td>
                                <td className="py-4 pr-4">
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                      resource.status === "Verified"
                                        ? "bg-success/10 text-success"
                                        : resource.status === "AI-Checked"
                                          ? "bg-accent/10 text-accent"
                                          : "bg-warning/10 text-warning"
                                    }`}
                                  >
                                    {resource.status === "Verified"
                                      ? "Verifiziert"
                                      : resource.status === "AI-Checked"
                                        ? "KI-Geprüft"
                                        : "Ausstehend"}
                                  </span>
                                </td>
                                <td className="text-text py-4 pr-4 text-right text-sm font-medium">
                                  {resource.downloads}
                                </td>
                                <td className="text-success py-4 pr-4 text-right text-sm font-semibold">
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
                                      className="text-text-muted hover:bg-surface-hover hover:text-text rounded-lg p-2 transition-colors"
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
                                      <div className="border-border bg-surface absolute right-0 z-10 mt-1 w-40 rounded-xl border py-1.5 shadow-lg">
                                        <Link
                                          href={`/resources/${resource.id}`}
                                          className="text-text hover:bg-bg flex items-center gap-2.5 px-4 py-2 text-sm transition-colors"
                                          onClick={() => setOpenActionMenu(null)}
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                          Ansehen
                                        </Link>
                                        <Link
                                          href={`/resources/${resource.id}/edit`}
                                          className="text-text hover:bg-bg flex items-center gap-2.5 px-4 py-2 text-sm transition-colors"
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
                                          className="text-error hover:bg-error/10 flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors"
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

                {/* Recent Downloads */}
                <div className="border-border bg-surface rounded-2xl border">
                  <div className="border-border flex items-center justify-between border-b p-4">
                    <h2 className="text-text text-lg font-semibold">Letzte Downloads</h2>
                    <button
                      onClick={() => setActiveTab("library")}
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      Alle anzeigen
                    </button>
                  </div>
                  <div className="p-4">
                    {loading ? (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-bg animate-pulse rounded-xl p-4">
                            <div className="bg-surface-hover mb-2 h-4 w-3/4 rounded"></div>
                            <div className="bg-surface-hover h-3 w-1/2 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : libraryItems.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {libraryItems.slice(0, 6).map((item) => (
                          <div
                            key={item.id}
                            className="group border-border bg-bg hover:border-primary flex items-center justify-between rounded-xl border p-4 transition-all hover:shadow-sm"
                          >
                            <div className="mr-3 min-w-0 flex-1">
                              <h3 className="text-text group-hover:text-primary truncate text-sm font-medium">
                                {item.title}
                              </h3>
                              <div className="mt-1 flex items-center gap-2">
                                <span
                                  className={`pill text-xs ${getSubjectPillClass(item.subject)}`}
                                >
                                  {item.subject}
                                </span>
                                <span className="text-text-muted text-xs">{item.cycle}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownload(item.id)}
                              disabled={downloading === item.id}
                              className="text-primary hover:bg-primary/10 shrink-0 rounded-lg p-2 transition-colors disabled:opacity-50"
                              title="Herunterladen"
                            >
                              <Download className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <Download className="text-text-faint mx-auto mb-3 h-10 w-10" />
                        <p className="text-text-muted mb-2 text-sm">Noch keine Ressourcen</p>
                        <Link
                          href="/resources"
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          Entdecken
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Library Tab - Acquired Resources Only */}
            {activeTab === "library" && (
              <div className="border-border bg-surface rounded-xl border p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-text text-xl font-semibold">Erworbene Ressourcen</h2>
                    <p className="text-text-muted mt-1 text-sm">
                      Ressourcen, die Sie erworben haben
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="border-border bg-bg animate-pulse rounded-lg border p-4"
                      >
                        <div className="bg-surface-hover mb-3 h-4 w-16 rounded"></div>
                        <div className="bg-surface-hover mb-2 h-5 w-full rounded"></div>
                        <div className="bg-surface-hover mb-4 h-4 w-24 rounded"></div>
                        <div className="bg-surface-hover h-10 w-full rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : libraryItems.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {libraryItems.map((item) => (
                      <div
                        key={item.id}
                        className="border-border bg-bg hover:border-primary rounded-lg border p-4 transition-colors"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span
                            className={`pill text-xs ${item.type === "purchased" ? "pill-primary" : "pill-success"}`}
                          >
                            {item.type === "purchased" ? "Gekauft" : "Gratis"}
                          </span>
                          {item.verified && (
                            <span className="pill pill-success text-xs">Verifiziert</span>
                          )}
                        </div>
                        <h3 className="text-text mb-1 font-semibold">{item.title}</h3>
                        <div className="mb-2 flex items-center gap-2">
                          <span className={`pill text-xs ${getSubjectPillClass(item.subject)}`}>
                            {item.subject}
                          </span>
                          <span className="text-text-muted text-xs">{item.cycle}</span>
                        </div>
                        <p className="text-text-muted mb-4 text-xs">
                          Von: {item.seller.displayName || "Unbekannt"}
                        </p>
                        <button
                          onClick={() => handleDownload(item.id)}
                          disabled={downloading === item.id}
                          className="bg-primary text-text-on-accent hover:bg-primary-hover w-full rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {downloading === item.id ? "Wird geladen..." : "Herunterladen"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Download className="text-text-faint mx-auto mb-4 h-16 w-16" />
                    <h3 className="text-text mb-2 text-lg font-medium">
                      Noch keine erworbenen Ressourcen
                    </h3>
                    <p className="text-text-muted mb-4">
                      Entdecken Sie unsere Ressourcen und beginnen Sie Ihre Sammlung.
                    </p>
                    <Link
                      href="/resources"
                      className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
                    >
                      Ressourcen entdecken
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Uploads Tab */}
            {activeTab === "uploads" && (
              <div className="border-border bg-surface rounded-xl border p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-text text-xl font-semibold">Meine Uploads</h2>
                    <p className="text-text-muted mt-1 text-sm">
                      Ressourcen, die Sie hochgeladen haben
                    </p>
                  </div>
                  <Link
                    href="/upload"
                    className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
                  >
                    <span>+</span>
                    Neue Ressource
                  </Link>
                </div>

                {loading || uploadedLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="border-border bg-bg animate-pulse rounded-lg border p-4"
                      >
                        <div className="bg-surface-hover mb-3 h-4 w-16 rounded"></div>
                        <div className="bg-surface-hover mb-2 h-5 w-full rounded"></div>
                        <div className="bg-surface-hover mb-4 h-4 w-24 rounded"></div>
                        <div className="bg-surface-hover h-10 w-full rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : uploadedItems.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {uploadedItems.map((item) => (
                      <div
                        key={item.id}
                        className="border-border bg-bg hover:border-primary rounded-lg border p-4 transition-colors"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span
                            className={`pill text-xs ${
                              item.status === "VERIFIED"
                                ? "pill-success"
                                : item.status === "PENDING"
                                  ? "pill-warning"
                                  : "pill-neutral"
                            }`}
                          >
                            {item.status === "VERIFIED"
                              ? "Verifiziert"
                              : item.status === "PENDING"
                                ? "Ausstehend"
                                : item.status}
                          </span>
                          <span className="text-price text-sm font-semibold">
                            {item.priceFormatted}
                          </span>
                        </div>
                        <Link href={`/resources/${item.id}`}>
                          <h3 className="text-text hover:text-primary mb-1 font-semibold">
                            {item.title}
                          </h3>
                        </Link>
                        <div className="mb-3 flex items-center gap-2">
                          <span className={`pill text-xs ${getSubjectPillClass(item.subject)}`}>
                            {item.subject}
                          </span>
                          <span className="text-text-muted text-xs">{item.cycle}</span>
                        </div>
                        <div className="text-text-muted mb-4 flex items-center justify-between text-xs">
                          <span>{item.downloadCount} Downloads</span>
                          <span>{item.purchaseCount} Verkäufe</span>
                        </div>
                        <Link
                          href={`/resources/${item.id}`}
                          className="bg-primary text-text-on-accent hover:bg-primary-hover block w-full rounded-md px-4 py-2 text-center text-sm font-medium transition-colors"
                        >
                          Ansehen
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <FileText className="text-text-faint mx-auto mb-4 h-16 w-16" />
                    <h3 className="text-text mb-2 text-lg font-medium">
                      Noch keine hochgeladenen Ressourcen
                    </h3>
                    <p className="text-text-muted mb-4">
                      Teilen Sie Ihre Unterrichtsmaterialien mit anderen Lehrpersonen.
                    </p>
                    <Link
                      href="/upload"
                      className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
                    >
                      Material hochladen
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="border-border bg-surface rounded-xl border p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-text text-xl font-semibold">Wunschliste</h2>
                    <p className="text-text-muted mt-1 text-sm">
                      Gespeicherte Ressourcen für später
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="border-border bg-bg animate-pulse rounded-lg border p-4"
                      >
                        <div className="bg-surface-hover mb-3 h-4 w-16 rounded"></div>
                        <div className="bg-surface-hover mb-2 h-5 w-full rounded"></div>
                        <div className="bg-surface-hover mb-4 h-4 w-24 rounded"></div>
                        <div className="bg-surface-hover h-10 w-full rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : wishlistItems.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlistItems.map((item) => (
                      <div
                        key={item.id}
                        className="border-border bg-bg hover:border-primary rounded-lg border p-4 transition-colors"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className={`pill text-xs ${getSubjectPillClass(item.subject)}`}>
                            {item.subject}
                          </span>
                          <button
                            onClick={() => handleRemoveFromWishlist(item.id)}
                            className="text-error hover:text-error/80"
                          >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>
                        <Link href={`/resources/${item.id}`}>
                          <h3 className="text-text hover:text-primary mb-1 font-semibold">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-text-muted mb-4 text-sm">{item.cycle}</p>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-lg font-bold ${item.price === 0 ? "text-success" : "text-price"}`}
                          >
                            {item.priceFormatted}
                          </span>
                          <Link
                            href={`/resources/${item.id}`}
                            className="bg-primary text-text-on-accent hover:bg-primary-hover rounded-md px-4 py-2 text-sm font-medium transition-colors"
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
                      className="text-text-faint mx-auto mb-4 h-16 w-16"
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
                    <h3 className="text-text mb-2 text-lg font-medium">
                      Ihre Wunschliste ist leer
                    </h3>
                    <p className="text-text-muted mb-4">
                      Speichern Sie interessante Ressourcen für später.
                    </p>
                    <Link
                      href="/resources"
                      className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
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
                {/* User Profile Card */}
                <div className="border-border bg-surface rounded-xl border p-6">
                  <div className="flex items-center gap-4">
                    {displayData.image ? (
                      <Image
                        src={displayData.image}
                        alt={displayData.name || "Benutzer"}
                        width={64}
                        height={64}
                        className="border-border h-16 w-16 rounded-full border-2 object-cover"
                      />
                    ) : (
                      <div className="bg-primary flex h-16 w-16 items-center justify-center rounded-full">
                        <span className="text-text-on-accent text-2xl font-bold">
                          {(displayData.name || "B").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="text-text truncate text-lg font-semibold">
                        {displayData.name || "Benutzer"}
                      </h2>
                      <p className="text-text-muted truncate text-sm">{displayData.email}</p>
                    </div>
                    <Link
                      href="/profile/edit"
                      className="border-border bg-bg text-text-secondary hover:border-primary hover:text-primary flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                    >
                      Profil bearbeiten
                    </Link>
                  </div>
                </div>

                {/* Settings Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Left Column - Profile & Avatar */}
                  <div className="space-y-6">
                    {/* Profile Picture Settings */}
                    <div className="border-border bg-surface rounded-xl border p-6">
                      <h2 className="text-text mb-4 text-lg font-semibold">Profilbild</h2>
                      <p className="text-text-muted mb-6 text-sm">
                        Laden Sie ein Profilbild hoch oder entfernen Sie das aktuelle Bild
                      </p>

                      {avatarMessage && (
                        <div
                          className={`mb-4 rounded-lg border p-3 ${
                            avatarMessage.type === "success"
                              ? "border-success/50 bg-success/10 text-success"
                              : "border-error/50 bg-error/10 text-error"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{avatarMessage.text}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                        <AvatarUploader
                          currentAvatarUrl={avatarUrl}
                          displayName={displayData.name || "Benutzer"}
                          onUpload={handleAvatarUpload}
                        />

                        <div className="flex flex-col gap-2">
                          <p className="text-text-secondary text-sm">
                            Klicken Sie auf das Kamera-Symbol, um ein neues Bild hochzuladen.
                          </p>
                          {avatarUrl && (
                            <button
                              onClick={handleAvatarDelete}
                              disabled={isDeletingAvatar}
                              className="border-error/50 text-error hover:bg-error/10 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              {isDeletingAvatar ? "Wird entfernt..." : "Profilbild entfernen"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Profile Settings */}
                    <div className="border-border bg-surface rounded-xl border p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-text text-lg font-semibold">Profil</h2>
                        <Link
                          href="/profile/edit"
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          Bearbeiten
                        </Link>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-text mb-1 block text-sm font-medium">Name</label>
                          <input
                            type="text"
                            value={displayData.name || ""}
                            disabled
                            className="border-border bg-surface text-text-muted w-full rounded-md border px-4 py-2"
                          />
                        </div>
                        <div>
                          <label className="text-text mb-1 block text-sm font-medium">E-Mail</label>
                          <input
                            type="email"
                            value={displayData.email}
                            disabled
                            className="border-border bg-surface text-text-muted w-full rounded-md border px-4 py-2"
                          />
                          <p className="text-text-muted mt-1 text-xs">
                            E-Mail kann nicht geändert werden.
                          </p>
                        </div>
                      </div>

                      {/* User Tags */}
                      <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        {displayData.cantons && displayData.cantons.length > 0 && (
                          <div>
                            <label className="text-text-muted text-xs font-medium tracking-wide uppercase">
                              Kanton
                            </label>
                            <p className="text-text mt-1">{displayData.cantons.join(", ")}</p>
                          </div>
                        )}
                        {displayData.subjects && displayData.subjects.length > 0 && (
                          <div>
                            <label className="text-text-muted text-xs font-medium tracking-wide uppercase">
                              Fächer
                            </label>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {displayData.subjects.slice(0, 3).map((subject) => (
                                <span
                                  key={subject}
                                  className={`pill text-xs ${getSubjectPillClass(subject)}`}
                                >
                                  {subject}
                                </span>
                              ))}
                              {displayData.subjects.length > 3 && (
                                <span className="text-text-muted px-2 py-0.5 text-sm">
                                  +{displayData.subjects.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {displayData.cycles && displayData.cycles.length > 0 && (
                          <div>
                            <label className="text-text-muted text-xs font-medium tracking-wide uppercase">
                              Zyklen
                            </label>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {displayData.cycles.map((cycle) => (
                                <span key={cycle} className="pill pill-primary text-xs">
                                  {cycle}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Preferences */}
                  <div className="space-y-6">
                    {/* Appearance Settings */}
                    <div className="border-border bg-surface rounded-xl border p-6">
                      <h2 className="text-text mb-4 text-lg font-semibold">Darstellung</h2>
                      <p className="text-text-muted mb-4 text-sm">
                        Wählen Sie Ihr bevorzugtes Farbschema
                      </p>
                      <ThemeSettings />
                    </div>

                    {/* Notification Settings */}
                    <div className="border-border bg-surface rounded-xl border p-6">
                      <h2 className="text-text mb-4 text-lg font-semibold">Benachrichtigungen</h2>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between">
                          <div>
                            <span className="text-text font-medium">Neue Ressourcen</span>
                            <p className="text-text-muted text-sm">
                              Benachrichtigungen über neue Materialien von gefolgten Verkäufern
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            defaultChecked
                            className="text-primary h-5 w-5 rounded"
                          />
                        </label>
                        <label className="flex items-center justify-between">
                          <div>
                            <span className="text-text font-medium">Preisänderungen</span>
                            <p className="text-text-muted text-sm">
                              Benachrichtigungen bei Preisänderungen auf der Wunschliste
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            defaultChecked
                            className="text-primary h-5 w-5 rounded"
                          />
                        </label>
                        <label className="flex items-center justify-between">
                          <div>
                            <span className="text-text font-medium">Newsletter</span>
                            <p className="text-text-muted text-sm">
                              Wöchentliche Updates und Tipps
                            </p>
                          </div>
                          <input type="checkbox" className="text-primary h-5 w-5 rounded" />
                        </label>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border-error/30 bg-surface rounded-xl border p-6">
                      <h2 className="text-error mb-4 text-lg font-semibold">Gefahrenzone</h2>
                      <p className="text-text-muted mb-4 text-sm">
                        Diese Aktionen sind unwiderruflich. Bitte seien Sie vorsichtig.
                      </p>
                      <button className="border-error text-error hover:bg-error/10 rounded-md border px-4 py-2 text-sm font-medium transition-colors">
                        Konto löschen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
