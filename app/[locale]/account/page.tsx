"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  Menu,
  ChevronDown,
  TrendingUp,
  Download,
  FileText,
  ExternalLink,
  User,
  Palette,
  Bell,
  Shield,
  Camera,
  Mail,
  MapPin,
  BookOpen,
  GraduationCap,
  Check,
  X,
  Trash2,
  Star,
  Sparkles,
  ShoppingBag,
  Gift,
  Tag,
  Newspaper,
  Megaphone,
} from "lucide-react";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { ThemeSettings } from "@/components/ui/ThemeToggle";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { EmailVerificationBanner } from "@/components/account/EmailVerificationBanner";
import { StripeConnectStatus } from "@/components/account/StripeConnectStatus";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { WelcomeGuide } from "@/components/account/WelcomeGuide";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { DashboardResourceCard } from "@/components/ui/DashboardResourceCard";
import { SWISS_CANTONS } from "@/lib/validations/user";

// Cycles are stable, can be hardcoded
const CYCLES = ["Zyklus 1", "Zyklus 2", "Zyklus 3"];
import { motion, AnimatePresence } from "framer-motion";

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
  previewUrl?: string | null;
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
  previewUrl?: string | null;
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
  previewUrl?: string | null;
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
  // Notification preferences
  notify_new_from_followed?: boolean;
  notify_recommendations?: boolean;
  notify_material_updates?: boolean;
  notify_review_reminders?: boolean;
  notify_wishlist_price_drops?: boolean;
  notify_welcome_offers?: boolean;
  notify_sales?: boolean;
  notify_newsletter?: boolean;
  notify_platform_updates?: boolean;
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

type TabType =
  | "overview"
  | "library"
  | "uploads"
  | "wishlist"
  | "settings-profile"
  | "settings-appearance"
  | "settings-notifications"
  | "settings-account";

const VALID_TABS: TabType[] = [
  "overview",
  "library",
  "uploads",
  "wishlist",
  "settings-profile",
  "settings-appearance",
  "settings-notifications",
  "settings-account",
];

function isValidTab(tab: string | null): tab is TabType {
  return tab !== null && VALID_TABS.includes(tab as TabType);
}

export default function AccountPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<TabType>(
    isValidTab(initialTab) ? initialTab : "overview"
  );
  // Derive settings section from activeTab
  const settingsSection = activeTab.startsWith("settings-")
    ? (activeTab.replace("settings-", "") as "profile" | "appearance" | "notifications" | "account")
    : "profile";
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

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState<{
    display_name: string;
    subjects: string[];
    cycles: string[];
    cantons: string[];
  }>({
    display_name: "",
    subjects: [],
    cycles: [],
    cantons: [],
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Email verification resend state
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    notify_new_from_followed: true,
    notify_recommendations: true,
    notify_material_updates: true,
    notify_review_reminders: true,
    notify_wishlist_price_drops: true,
    notify_welcome_offers: true,
    notify_sales: true,
    notify_newsletter: false,
    notify_platform_updates: true,
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Subject options from database
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);

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
        // Populate notification preferences from user data
        if (data.user) {
          setNotificationPrefs({
            notify_new_from_followed: data.user.notify_new_from_followed ?? true,
            notify_recommendations: data.user.notify_recommendations ?? true,
            notify_material_updates: data.user.notify_material_updates ?? true,
            notify_review_reminders: data.user.notify_review_reminders ?? true,
            notify_wishlist_price_drops: data.user.notify_wishlist_price_drops ?? true,
            notify_welcome_offers: data.user.notify_welcome_offers ?? true,
            notify_sales: data.user.notify_sales ?? true,
            notify_newsletter: data.user.notify_newsletter ?? false,
            notify_platform_updates: data.user.notify_platform_updates ?? true,
          });
        }
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

  // Fetch curriculum data for subject options
  const fetchCurriculum = useCallback(async () => {
    try {
      const response = await fetch("/api/curriculum?curriculum=LP21");
      if (response.ok) {
        const data = await response.json();
        const subjects = data.subjects?.map((s: { name_de: string }) => s.name_de) || [];
        setSubjectOptions(subjects);
      }
    } catch (error) {
      console.error("Error fetching curriculum:", error);
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
        fetchCurriculum(),
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
    fetchCurriculum,
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

  // Resend email verification
  const handleResendVerification = async () => {
    if (verificationSending) return;

    setVerificationSending(true);
    setVerificationError(null);

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Fehler beim Senden");
      }

      setVerificationSent(true);
    } catch (error) {
      setVerificationError(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten");
    } finally {
      setVerificationSending(false);
    }
  };

  // Start editing profile
  const handleStartEditingProfile = () => {
    setProfileFormData({
      display_name: userData?.name || userData?.displayName || "",
      subjects: userData?.subjects || [],
      cycles: userData?.cycles || [],
      cantons: userData?.cantons || [],
    });
    setProfileErrors({});
    setProfileMessage(null);
    setIsEditingProfile(true);
  };

  // Cancel editing profile
  const handleCancelEditingProfile = () => {
    setIsEditingProfile(false);
    setProfileErrors({});
    setProfileMessage(null);
  };

  // Handle profile form field change
  const handleProfileFieldChange = (field: string, value: string | string[]) => {
    setProfileFormData((prev) => ({ ...prev, [field]: value }));
    if (profileErrors[field]) {
      setProfileErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Save profile
  const handleSaveProfile = async () => {
    const errors: Record<string, string> = {};

    if (!profileFormData.display_name || profileFormData.display_name.length < 2) {
      errors.display_name = "Name muss mindestens 2 Zeichen haben";
    }
    if (profileFormData.subjects.length === 0) {
      errors.subjects = "Mindestens ein Fach auswählen";
    }
    if (profileFormData.cycles.length === 0) {
      errors.cycles = "Mindestens einen Zyklus auswählen";
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setIsSavingProfile(true);
    setProfileMessage(null);

    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: profileFormData.display_name,
          subjects: profileFormData.subjects,
          cycles: profileFormData.cycles,
          cantons: profileFormData.cantons,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Fehler beim Speichern");
      }

      const updatedUser = await response.json();

      // Update local state with new data
      if (userData) {
        setUserData({
          ...userData,
          name: updatedUser.display_name || updatedUser.name,
          displayName: updatedUser.display_name,
          subjects: updatedUser.subjects || [],
          cycles: updatedUser.cycles || [],
          cantons: updatedUser.cantons || [],
        });
      }

      setProfileMessage({ type: "success", text: "Profil erfolgreich gespeichert!" });
      setIsEditingProfile(false);
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setProfileMessage({
        type: "error",
        text: "Fehler beim Speichern. Bitte versuchen Sie es erneut.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle notification preference toggle
  const handleNotificationToggle = async (key: keyof typeof notificationPrefs) => {
    const newValue = !notificationPrefs[key];
    const previousPrefs = { ...notificationPrefs };

    // Optimistically update UI
    setNotificationPrefs((prev) => ({ ...prev, [key]: newValue }));
    setIsSavingNotifications(true);
    setNotificationMessage(null);

    try {
      const response = await fetch("/api/users/me/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setNotificationMessage({ type: "success", text: "Gespeichert" });
      setTimeout(() => setNotificationMessage(null), 2000);
    } catch (error) {
      console.error("Error saving notification preference:", error);
      // Revert on error
      setNotificationPrefs(previousPrefs);
      setNotificationMessage({ type: "error", text: "Fehler beim Speichern" });
      setTimeout(() => setNotificationMessage(null), 3000);
    } finally {
      setIsSavingNotifications(false);
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
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 overflow-hidden"
                >
                  <AccountSidebar
                    userData={displayData}
                    stats={displayStats}
                    followedSellers={followedSellers}
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                      setActiveTab(tab);
                      setMobileMenuOpen(false);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden w-72 flex-shrink-0 lg:block">
            <div className="sticky top-24">
              <AccountSidebar
                userData={displayData}
                stats={displayStats}
                followedSellers={followedSellers}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-6">
                    {/* Welcome Guide for new users */}
                    <WelcomeGuide
                      userName={userData?.displayName || userData?.name}
                      onNavigate={(tab) => setActiveTab(tab)}
                    />

                    {/* Email Verification Banner */}
                    {userData && !userData.emailVerified && (
                      <EmailVerificationBanner email={userData.email} />
                    )}

                    {/* Stripe Connect Status */}
                    {userData && userData.emailVerified && (
                      <StripeConnectStatus isSeller={userData.isSeller} />
                    )}

                    {/* KPI Metrics Row */}
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
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
                                  <tr
                                    key={resource.id}
                                    className="group hover:bg-bg transition-colors"
                                  >
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
                </motion.div>
              )}

              {/* Library Tab - Acquired Resources Only */}
              {activeTab === "library" && (
                <motion.div
                  key="library"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
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
                          <div key={i} className="card animate-pulse overflow-hidden">
                            <div className="bg-bg-secondary aspect-[16/9]"></div>
                            <div className="p-4">
                              <div className="bg-surface-hover mb-3 h-5 w-20 rounded-full"></div>
                              <div className="bg-surface-hover mb-2 h-3 w-24 rounded"></div>
                              <div className="bg-surface-hover mb-2 h-5 w-full rounded"></div>
                              <div className="bg-surface-hover mb-4 h-4 w-32 rounded"></div>
                              <div className="bg-surface-hover h-10 w-full rounded-lg"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : libraryItems.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {libraryItems.map((item) => (
                          <DashboardResourceCard
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            description={item.description}
                            subject={item.subject}
                            cycle={item.cycle}
                            previewUrl={item.previewUrl}
                            badge={{
                              label: item.type === "purchased" ? "Gekauft" : "Gratis",
                              variant: item.type === "purchased" ? "primary" : "success",
                            }}
                            secondaryBadge={
                              item.verified
                                ? { label: "Verifiziert", variant: "success" }
                                : undefined
                            }
                            seller={{ displayName: item.seller.displayName }}
                            primaryAction={{
                              label: "Herunterladen",
                              icon: "download",
                              onClick: () => handleDownload(item.id),
                              loading: downloading === item.id,
                            }}
                          />
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
                </motion.div>
              )}

              {/* Uploads Tab */}
              {activeTab === "uploads" && (
                <motion.div
                  key="uploads"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
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
                          <div key={i} className="card animate-pulse overflow-hidden">
                            <div className="bg-bg-secondary aspect-[16/9]"></div>
                            <div className="p-4">
                              <div className="bg-surface-hover mb-3 h-5 w-20 rounded-full"></div>
                              <div className="bg-surface-hover mb-2 h-3 w-24 rounded"></div>
                              <div className="bg-surface-hover mb-2 h-5 w-full rounded"></div>
                              <div className="bg-surface-hover mb-4 h-4 w-32 rounded"></div>
                              <div className="bg-surface-hover h-10 w-full rounded-lg"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : uploadedItems.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {uploadedItems.map((item) => (
                          <DashboardResourceCard
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            description={item.description}
                            subject={item.subject}
                            cycle={item.cycle}
                            previewUrl={item.previewUrl}
                            badge={{
                              label:
                                item.status === "VERIFIED"
                                  ? "Verifiziert"
                                  : item.status === "PENDING"
                                    ? "Ausstehend"
                                    : item.status,
                              variant:
                                item.status === "VERIFIED"
                                  ? "success"
                                  : item.status === "PENDING"
                                    ? "warning"
                                    : "neutral",
                            }}
                            price={{
                              formatted: item.priceFormatted,
                              isFree: item.price === 0,
                            }}
                            stats={{
                              downloads: item.downloadCount,
                              purchases: item.purchaseCount,
                            }}
                            primaryAction={{
                              label: "Ansehen",
                              icon: "view",
                              href: `/resources/${item.id}`,
                            }}
                          />
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
                </motion.div>
              )}

              {/* Wishlist Tab */}
              {activeTab === "wishlist" && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
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
                          <div key={i} className="card animate-pulse overflow-hidden">
                            <div className="bg-bg-secondary aspect-[16/9]"></div>
                            <div className="p-4">
                              <div className="bg-surface-hover mb-3 h-5 w-20 rounded-full"></div>
                              <div className="bg-surface-hover mb-2 h-3 w-24 rounded"></div>
                              <div className="bg-surface-hover mb-2 h-5 w-full rounded"></div>
                              <div className="bg-surface-hover mb-4 h-4 w-32 rounded"></div>
                              <div className="bg-surface-hover h-10 w-full rounded-lg"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : wishlistItems.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {wishlistItems.map((item) => (
                          <DashboardResourceCard
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            description={item.description}
                            subject={item.subject}
                            cycle={item.cycle}
                            previewUrl={item.previewUrl}
                            price={{
                              formatted: item.priceFormatted,
                              isFree: item.price === 0,
                            }}
                            seller={{ displayName: item.seller.displayName }}
                            onRemove={() => handleRemoveFromWishlist(item.id)}
                            primaryAction={{
                              label: "Ansehen",
                              icon: "view",
                              href: `/resources/${item.id}`,
                            }}
                          />
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
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab.startsWith("settings-") && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnimatePresence mode="wait">
                    {/* Profile Section */}
                    {settingsSection === "profile" && (
                      <motion.div
                        key="profile-settings"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                      >
                        {/* Section Header */}
                        <div>
                          <h2 className="text-text text-xl font-semibold">Profil bearbeiten</h2>
                          <p className="text-text-muted mt-1 text-sm">
                            Verwalten Sie Ihre persönlichen Informationen und Präferenzen
                          </p>
                        </div>

                        {/* Success/Error Message */}
                        {(profileMessage || avatarMessage) && (
                          <div
                            className={`flex items-center gap-3 rounded-xl border p-4 ${
                              (profileMessage?.type || avatarMessage?.type) === "success"
                                ? "border-success/30 bg-success/5"
                                : "border-error/30 bg-error/5"
                            }`}
                          >
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                (profileMessage?.type || avatarMessage?.type) === "success"
                                  ? "bg-success/10"
                                  : "bg-error/10"
                              }`}
                            >
                              {(profileMessage?.type || avatarMessage?.type) === "success" ? (
                                <Check className="text-success h-4 w-4" />
                              ) : (
                                <X className="text-error h-4 w-4" />
                              )}
                            </div>
                            <span
                              className={`text-sm font-medium ${
                                (profileMessage?.type || avatarMessage?.type) === "success"
                                  ? "text-success"
                                  : "text-error"
                              }`}
                            >
                              {profileMessage?.text || avatarMessage?.text}
                            </span>
                          </div>
                        )}

                        {/* Profile Picture Card */}
                        <div className="border-border bg-surface rounded-xl border">
                          <div className="border-border border-b p-5">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                                <Camera className="text-primary h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-text font-semibold">Profilbild</h3>
                                <p className="text-text-muted text-sm">
                                  JPG, PNG oder GIF. Max. 2MB
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="p-5">
                            <div className="flex items-center gap-6">
                              <div className="relative">
                                <AvatarUploader
                                  currentAvatarUrl={avatarUrl}
                                  displayName={displayData.name || "Benutzer"}
                                  onUpload={handleAvatarUpload}
                                />
                                {isUploadingAvatar && (
                                  <div className="bg-bg/80 absolute inset-0 flex items-center justify-center rounded-full">
                                    <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                <p className="text-text-secondary text-sm">
                                  Klicken Sie auf das Bild, um ein neues Foto hochzuladen
                                </p>
                                {avatarUrl && (
                                  <button
                                    onClick={handleAvatarDelete}
                                    disabled={isDeletingAvatar}
                                    className="text-error hover:bg-error/10 inline-flex w-fit items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    {isDeletingAvatar ? "Wird entfernt..." : "Entfernen"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Personal Information Card */}
                        <div className="border-border bg-surface rounded-xl border">
                          <div className="border-border flex items-center justify-between border-b p-5">
                            <div className="flex items-center gap-3">
                              <div className="bg-accent/10 flex h-10 w-10 items-center justify-center rounded-lg">
                                <User className="text-accent h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-text font-semibold">Persönliche Daten</h3>
                                <p className="text-text-muted text-sm">
                                  Name und Kontaktinformationen
                                </p>
                              </div>
                            </div>
                            {!isEditingProfile && (
                              <button
                                onClick={handleStartEditingProfile}
                                className="bg-primary text-text-on-accent hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                              >
                                Bearbeiten
                              </button>
                            )}
                          </div>
                          <div className="p-5">
                            {isEditingProfile ? (
                              <div className="space-y-5">
                                <div className="grid gap-5 sm:grid-cols-2">
                                  <div>
                                    <label className="text-text mb-2 block text-sm font-medium">
                                      Anzeigename <span className="text-error">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={profileFormData.display_name}
                                      onChange={(e) =>
                                        handleProfileFieldChange("display_name", e.target.value)
                                      }
                                      placeholder="z.B. Frau M. oder Maria S."
                                      className={`border-border bg-bg text-text placeholder:text-text-muted focus:ring-primary/20 w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-2 focus:outline-none ${
                                        profileErrors.display_name
                                          ? "border-error focus:border-error"
                                          : "focus:border-primary"
                                      }`}
                                    />
                                    {profileErrors.display_name && (
                                      <p className="text-error mt-1.5 text-xs">
                                        {profileErrors.display_name}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="text-text mb-2 block text-sm font-medium">
                                      E-Mail-Adresse
                                    </label>
                                    <div className="relative">
                                      <Mail className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                      <input
                                        type="email"
                                        value={displayData.email}
                                        disabled
                                        className="border-border bg-surface text-text-muted w-full cursor-not-allowed rounded-lg border py-2.5 pr-4 pl-10 text-sm"
                                      />
                                    </div>
                                    <p className="text-text-muted mt-1.5 text-xs">
                                      Kontaktieren Sie uns, um Ihre E-Mail zu ändern
                                    </p>
                                  </div>
                                </div>

                                <div className="border-border border-t pt-5">
                                  <MultiSelect
                                    label="Kantone"
                                    options={SWISS_CANTONS}
                                    selected={profileFormData.cantons}
                                    onChange={(value) => handleProfileFieldChange("cantons", value)}
                                    placeholder="Kantone auswählen (optional)..."
                                  />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                  <button
                                    type="button"
                                    onClick={handleCancelEditingProfile}
                                    disabled={isSavingProfile}
                                    className="border-border text-text-secondary hover:bg-bg rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                                  >
                                    Abbrechen
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleSaveProfile}
                                    disabled={isSavingProfile}
                                    className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                                  >
                                    {isSavingProfile ? (
                                      <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Speichern...
                                      </>
                                    ) : (
                                      <>
                                        <Check className="h-4 w-4" />
                                        Speichern
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="grid gap-6 sm:grid-cols-2">
                                <div className="flex items-start gap-3">
                                  <div className="bg-bg flex h-10 w-10 items-center justify-center rounded-lg">
                                    <User className="text-text-muted h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="text-text-muted text-xs font-medium tracking-wide uppercase">
                                      Name
                                    </p>
                                    <p className="text-text mt-0.5 font-medium">
                                      {displayData.name || "-"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <div className="bg-bg flex h-10 w-10 items-center justify-center rounded-lg">
                                    <Mail className="text-text-muted h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="text-text-muted text-xs font-medium tracking-wide uppercase">
                                      E-Mail
                                    </p>
                                    <p className="text-text mt-0.5 font-medium">
                                      {displayData.email}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <div className="bg-bg flex h-10 w-10 items-center justify-center rounded-lg">
                                    <MapPin className="text-text-muted h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="text-text-muted text-xs font-medium tracking-wide uppercase">
                                      Kantone
                                    </p>
                                    <p className="text-text mt-0.5 font-medium">
                                      {displayData.cantons && displayData.cantons.length > 0
                                        ? displayData.cantons.join(", ")
                                        : "-"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Teaching Preferences Card */}
                        <div className="border-border bg-surface rounded-xl border">
                          <div className="border-border flex items-center justify-between border-b p-5">
                            <div className="flex items-center gap-3">
                              <div className="bg-success/10 flex h-10 w-10 items-center justify-center rounded-lg">
                                <BookOpen className="text-success h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-text font-semibold">Unterrichtspräferenzen</h3>
                                <p className="text-text-muted text-sm">
                                  Fächer und Schulstufen für personalisierte Empfehlungen
                                </p>
                              </div>
                            </div>
                            {!isEditingProfile && (
                              <button
                                onClick={handleStartEditingProfile}
                                className="text-primary text-sm font-medium hover:underline"
                              >
                                Bearbeiten
                              </button>
                            )}
                          </div>
                          <div className="p-5">
                            {isEditingProfile ? (
                              <div className="space-y-5">
                                <MultiSelect
                                  label="Fächer"
                                  options={subjectOptions}
                                  selected={profileFormData.subjects}
                                  onChange={(value) => handleProfileFieldChange("subjects", value)}
                                  placeholder="Fächer auswählen..."
                                  required
                                  error={profileErrors.subjects}
                                />
                                <MultiSelect
                                  label="Zyklen"
                                  options={CYCLES}
                                  selected={profileFormData.cycles}
                                  onChange={(value) => handleProfileFieldChange("cycles", value)}
                                  placeholder="Zyklen auswählen..."
                                  required
                                  error={profileErrors.cycles}
                                />
                              </div>
                            ) : (
                              <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="text-text-muted h-4 w-4" />
                                    <p className="text-text-muted text-xs font-medium tracking-wide uppercase">
                                      Fächer
                                    </p>
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {displayData.subjects && displayData.subjects.length > 0 ? (
                                      displayData.subjects.map((subject) => (
                                        <span
                                          key={subject}
                                          className={`pill text-xs ${getSubjectPillClass(subject)}`}
                                        >
                                          {subject}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-text-muted text-sm">
                                        Keine Fächer ausgewählt
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <GraduationCap className="text-text-muted h-4 w-4" />
                                    <p className="text-text-muted text-xs font-medium tracking-wide uppercase">
                                      Zyklen
                                    </p>
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {displayData.cycles && displayData.cycles.length > 0 ? (
                                      displayData.cycles.map((cycle) => (
                                        <span key={cycle} className="pill pill-primary text-xs">
                                          {cycle}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-text-muted text-sm">
                                        Keine Zyklen ausgewählt
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Appearance Section */}
                    {settingsSection === "appearance" && (
                      <motion.div
                        key="appearance-settings"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                      >
                        {/* Section Header */}
                        <div>
                          <h2 className="text-text text-xl font-semibold">Darstellung</h2>
                          <p className="text-text-muted mt-1 text-sm">
                            Passen Sie das Aussehen der Anwendung an Ihre Vorlieben an
                          </p>
                        </div>

                        {/* Theme Settings Card */}
                        <div className="border-border bg-surface rounded-xl border">
                          <div className="border-border border-b p-5">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                                <Palette className="text-primary h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-text font-semibold">Farbschema</h3>
                                <p className="text-text-muted text-sm">
                                  Wählen Sie zwischen Hell, Dunkel oder System
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="p-5">
                            <ThemeSettings />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Notifications Section */}
                    {settingsSection === "notifications" && (
                      <motion.div
                        key="notifications-settings"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                      >
                        {/* Section Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-text text-xl font-semibold">Benachrichtigungen</h2>
                            <p className="text-text-muted mt-1 text-sm">
                              Verwalten Sie, welche Benachrichtigungen Sie erhalten möchten
                            </p>
                          </div>
                          {notificationMessage && (
                            <span
                              className={`text-sm ${notificationMessage.type === "success" ? "text-success" : "text-error"}`}
                            >
                              {notificationMessage.text}
                            </span>
                          )}
                        </div>

                        {/* Favorite Authors Card */}
                        <div className="border-border bg-surface rounded-xl border">
                          <div className="border-border border-b p-5">
                            <div className="flex items-center gap-3">
                              <div className="bg-warning/10 flex h-10 w-10 items-center justify-center rounded-lg">
                                <Star className="text-warning h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-text font-semibold">Lieblings-Autor*innen</h3>
                                <p className="text-text-muted text-sm">
                                  Updates von Verkäufern, denen Sie folgen
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="divide-border divide-y">
                            <label className="hover:bg-bg flex cursor-pointer items-center justify-between p-5 transition-colors">
                              <div className="flex items-start gap-4">
                                <div className="bg-success/10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                                  <FileText className="text-success h-4 w-4" />
                                </div>
                                <div>
                                  <span className="text-text font-medium">
                                    Neue Materialien von Lieblings-Autor*innen
                                  </span>
                                  <p className="text-text-muted mt-0.5 text-sm">
                                    Benachrichtigung bei neuen Uploads von Verkäufern, denen Sie
                                    folgen, passend zu Ihren Fächern
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleNotificationToggle("notify_new_from_followed")}
                                disabled={isSavingNotifications}
                                className="relative ml-4 flex-shrink-0"
                                aria-label="Toggle notification"
                              >
                                <div
                                  className={`h-6 w-11 rounded-full transition-colors ${notificationPrefs.notify_new_from_followed ? "bg-primary" : "bg-border"}`}
                                >
                                  <div
                                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationPrefs.notify_new_from_followed ? "translate-x-5" : "translate-x-0.5"}`}
                                  />
                                </div>
                              </button>
                            </label>
                          </div>
                        </div>

                        {/* Personalized Recommendations Card */}
                        <div className="border-border bg-surface rounded-xl border">
                          <div className="border-border border-b p-5">
                            <div className="flex items-center gap-3">
                              <div className="bg-accent/10 flex h-10 w-10 items-center justify-center rounded-lg">
                                <Sparkles className="text-accent h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-text font-semibold">
                                  Personalisierte Empfehlungen
                                </h3>
                                <p className="text-text-muted text-sm">
                                  Materialvorschläge basierend auf Ihren Downloads
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="divide-border divide-y">
                            <label className="hover:bg-bg flex cursor-pointer items-center justify-between p-5 transition-colors">
                              <div className="flex items-start gap-4">
                                <div className="bg-accent/10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                                  <Mail className="text-accent h-4 w-4" />
                                </div>
                                <div>
                                  <span className="text-text font-medium">
                                    Material-Empfehlungen per E-Mail
                                  </span>
                                  <p className="text-text-muted mt-0.5 text-sm">
                                    Beliebte Materialien, die zu Ihren Downloads passen
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleNotificationToggle("notify_recommendations")}
                                disabled={isSavingNotifications}
                                className="relative ml-4 flex-shrink-0"
                                aria-label="Toggle notification"
                              >
                                <div
                                  className={`h-6 w-11 rounded-full transition-colors ${notificationPrefs.notify_recommendations ? "bg-primary" : "bg-border"}`}
                                >
                                  <div
                                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationPrefs.notify_recommendations ? "translate-x-5" : "translate-x-0.5"}`}
                                  />
                                </div>
                              </button>
                            </label>
                          </div>
                        </div>

                        {/* Purchased Materials Card */}
                        <div className="border-border bg-surface rounded-xl border">
                          <div className="border-border border-b p-5">
                            <div className="flex items-center gap-3">
                              <div className="bg-success/10 flex h-10 w-10 items-center justify-center rounded-lg">
                                <ShoppingBag className="text-success h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-text font-semibold">Erworbene Materialien</h3>
                                <p className="text-text-muted text-sm">
                                  Updates zu Ihren gekauften Ressourcen
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="divide-border divide-y">
                            <label className="hover:bg-bg flex cursor-pointer items-center justify-between p-5 transition-colors">
                              <div className="flex items-start gap-4">
                                <div className="bg-primary/10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                                  <Download className="text-primary h-4 w-4" />
                                </div>
                                <div>
                                  <span className="text-text font-medium">
                                    Updates für gekaufte Materialien
                                  </span>
                                  <p className="text-text-muted mt-0.5 text-sm">
                                    Benachrichtigung, wenn ein gekauftes Material ein kostenloses
                                    Update erhält
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleNotificationToggle("notify_material_updates")}
                                disabled={isSavingNotifications}
                                className="relative ml-4 flex-shrink-0"
                                aria-label="Toggle notification"
                              >
                                <div
                                  className={`h-6 w-11 rounded-full transition-colors ${notificationPrefs.notify_material_updates ? "bg-primary" : "bg-border"}`}
                                >
                                  <div
                                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationPrefs.notify_material_updates ? "translate-x-5" : "translate-x-0.5"}`}
                                  />
                                </div>
                              </button>
                            </label>
                            <label className="hover:bg-bg flex cursor-pointer items-center justify-between p-5 transition-colors">
                              <div className="flex items-start gap-4">
                                <div className="bg-warning/10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                                  <Star className="text-warning h-4 w-4" />
                                </div>
                                <div>
                                  <span className="text-text font-medium">
                                    Erinnerungen zur Bewertung
                                  </span>
                                  <p className="text-text-muted mt-0.5 text-sm">
                                    Erinnerungen, gekaufte Materialien zu bewerten
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleNotificationToggle("notify_review_reminders")}
                                disabled={isSavingNotifications}
                                className="relative ml-4 flex-shrink-0"
                                aria-label="Toggle notification"
                              >
                                <div
                                  className={`h-6 w-11 rounded-full transition-colors ${notificationPrefs.notify_review_reminders ? "bg-primary" : "bg-border"}`}
                                >
                                  <div
                                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationPrefs.notify_review_reminders ? "translate-x-5" : "translate-x-0.5"}`}
                                  />
                                </div>
                              </button>
                            </label>
                            <label className="hover:bg-bg flex cursor-pointer items-center justify-between p-5 transition-colors">
                              <div className="flex items-start gap-4">
                                <div className="bg-price/10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                                  <Tag className="text-price h-4 w-4" />
                                </div>
                                <div>
                                  <span className="text-text font-medium">
                                    Preisänderungen auf der Wunschliste
                                  </span>
                                  <p className="text-text-muted mt-0.5 text-sm">
                                    Benachrichtigung bei Preissenkungen von Artikeln auf Ihrer
                                    Wunschliste
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleNotificationToggle("notify_wishlist_price_drops")
                                }
                                disabled={isSavingNotifications}
                                className="relative ml-4 flex-shrink-0"
                                aria-label="Toggle notification"
                              >
                                <div
                                  className={`h-6 w-11 rounded-full transition-colors ${notificationPrefs.notify_wishlist_price_drops ? "bg-primary" : "bg-border"}`}
                                >
                                  <div
                                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationPrefs.notify_wishlist_price_drops ? "translate-x-5" : "translate-x-0.5"}`}
                                  />
                                </div>
                              </button>
                            </label>
                          </div>
                        </div>

                        {/* Promotions Card */}
                        <div className="border-border bg-surface rounded-xl border">
                          <div className="border-border border-b p-5">
                            <div className="flex items-center gap-3">
                              <div className="bg-error/10 flex h-10 w-10 items-center justify-center rounded-lg">
                                <Gift className="text-error h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-text font-semibold">
                                  Rabatt- und Sonderaktionen
                                </h3>
                                <p className="text-text-muted text-sm">
                                  Angebote und Plattform-Neuigkeiten
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="divide-border divide-y">
                            <label className="hover:bg-bg flex cursor-pointer items-center justify-between p-5 transition-colors">
                              <div className="flex items-start gap-4">
                                <div className="bg-success/10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                                  <Gift className="text-success h-4 w-4" />
                                </div>
                                <div>
                                  <span className="text-text font-medium">Willkommensangebote</span>
                                  <p className="text-text-muted mt-0.5 text-sm">
                                    Willkommens-E-Mails und individuelle Angebote
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleNotificationToggle("notify_welcome_offers")}
                                disabled={isSavingNotifications}
                                className="relative ml-4 flex-shrink-0"
                                aria-label="Toggle notification"
                              >
                                <div
                                  className={`h-6 w-11 rounded-full transition-colors ${notificationPrefs.notify_welcome_offers ? "bg-primary" : "bg-border"}`}
                                >
                                  <div
                                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationPrefs.notify_welcome_offers ? "translate-x-5" : "translate-x-0.5"}`}
                                  />
                                </div>
                              </button>
                            </label>
                            <label className="hover:bg-bg flex cursor-pointer items-center justify-between p-5 transition-colors">
                              <div className="flex items-start gap-4">
                                <div className="bg-error/10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                                  <Megaphone className="text-error h-4 w-4" />
                                </div>
                                <div>
                                  <span className="text-text font-medium">
                                    Website-weite Aktionen
                                  </span>
                                  <p className="text-text-muted mt-0.5 text-sm">
                                    Benachrichtigungen über plattformweite Rabattaktionen
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleNotificationToggle("notify_sales")}
                                disabled={isSavingNotifications}
                                className="relative ml-4 flex-shrink-0"
                                aria-label="Toggle notification"
                              >
                                <div
                                  className={`h-6 w-11 rounded-full transition-colors ${notificationPrefs.notify_sales ? "bg-primary" : "bg-border"}`}
                                >
                                  <div
                                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationPrefs.notify_sales ? "translate-x-5" : "translate-x-0.5"}`}
                                  />
                                </div>
                              </button>
                            </label>
                            <label className="hover:bg-bg flex cursor-pointer items-center justify-between p-5 transition-colors">
                              <div className="flex items-start gap-4">
                                <div className="bg-primary/10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                                  <Newspaper className="text-primary h-4 w-4" />
                                </div>
                                <div>
                                  <span className="text-text font-medium">
                                    Newsletter abonnieren
                                  </span>
                                  <p className="text-text-muted mt-0.5 text-sm">
                                    Wöchentliche Updates mit Tipps, neuen Funktionen und
                                    ausgewählten Ressourcen
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleNotificationToggle("notify_newsletter")}
                                disabled={isSavingNotifications}
                                className="relative ml-4 flex-shrink-0"
                                aria-label="Toggle notification"
                              >
                                <div
                                  className={`h-6 w-11 rounded-full transition-colors ${notificationPrefs.notify_newsletter ? "bg-primary" : "bg-border"}`}
                                >
                                  <div
                                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationPrefs.notify_newsletter ? "translate-x-5" : "translate-x-0.5"}`}
                                  />
                                </div>
                              </button>
                            </label>
                            <label className="hover:bg-bg flex cursor-pointer items-center justify-between p-5 transition-colors">
                              <div className="flex items-start gap-4">
                                <div className="bg-accent/10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                                  <Bell className="text-accent h-4 w-4" />
                                </div>
                                <div>
                                  <span className="text-text font-medium">Plattform-Updates</span>
                                  <p className="text-text-muted mt-0.5 text-sm">
                                    Neuigkeiten über neue Funktionen und Verbesserungen der
                                    Plattform
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleNotificationToggle("notify_platform_updates")}
                                disabled={isSavingNotifications}
                                className="relative ml-4 flex-shrink-0"
                                aria-label="Toggle notification"
                              >
                                <div
                                  className={`h-6 w-11 rounded-full transition-colors ${notificationPrefs.notify_platform_updates ? "bg-primary" : "bg-border"}`}
                                >
                                  <div
                                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notificationPrefs.notify_platform_updates ? "translate-x-5" : "translate-x-0.5"}`}
                                  />
                                </div>
                              </button>
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Account Section */}
                    {settingsSection === "account" && (
                      <motion.div
                        key="account-settings"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                      >
                        {/* Section Header */}
                        <div>
                          <h2 className="text-text text-xl font-semibold">Konto & Sicherheit</h2>
                          <p className="text-text-muted mt-1 text-sm">
                            Verwalten Sie Ihre Kontoeinstellungen und Sicherheitsoptionen
                          </p>
                        </div>

                        {/* Account Info Card */}
                        <div className="border-border bg-surface rounded-xl border">
                          <div className="border-border border-b p-5">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                                <Shield className="text-primary h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-text font-semibold">Kontostatus</h3>
                                <p className="text-text-muted text-sm">
                                  Informationen zu Ihrem Konto
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="p-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="border-border rounded-lg border p-4">
                                <p className="text-text-muted text-xs font-medium tracking-wide uppercase">
                                  Kontotyp
                                </p>
                                <p className="text-text mt-1 font-semibold">
                                  {displayData.isSeller ? "Verkäufer" : "Käufer"}
                                </p>
                              </div>
                              <div className="border-border rounded-lg border p-4">
                                <p className="text-text-muted text-xs font-medium tracking-wide uppercase">
                                  E-Mail-Status
                                </p>
                                <div className="mt-1">
                                  {displayData.emailVerified ? (
                                    <div className="flex items-center gap-2">
                                      <div className="bg-success/20 rounded-full p-1">
                                        <Check className="text-success h-3 w-3" />
                                      </div>
                                      <span className="text-success font-semibold">
                                        Verifiziert
                                      </span>
                                    </div>
                                  ) : verificationSent ? (
                                    <div className="flex items-center gap-2">
                                      <div className="bg-success/20 rounded-full p-1">
                                        <Mail className="text-success h-3 w-3" />
                                      </div>
                                      <span className="text-success text-sm font-semibold">
                                        E-Mail gesendet!
                                      </span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={handleResendVerification}
                                      disabled={verificationSending}
                                      className="group flex items-center gap-2 transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <div className="bg-warning/20 rounded-full p-1">
                                        {verificationSending ? (
                                          <div className="border-warning h-3 w-3 animate-spin rounded-full border border-t-transparent" />
                                        ) : (
                                          <X className="text-warning h-3 w-3" />
                                        )}
                                      </div>
                                      <span className="text-warning font-semibold group-hover:underline">
                                        {verificationSending
                                          ? "Wird gesendet..."
                                          : "Nicht verifiziert"}
                                      </span>
                                      {!verificationSending && (
                                        <span className="text-text-muted text-xs">
                                          (Klicken zum Senden)
                                        </span>
                                      )}
                                    </button>
                                  )}
                                  {verificationError && (
                                    <p className="text-error mt-1 text-xs">{verificationError}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Data Export Card */}
                        <div className="border-border bg-surface rounded-xl border">
                          <div className="border-border border-b p-5">
                            <div className="flex items-center gap-3">
                              <div className="bg-accent/10 flex h-10 w-10 items-center justify-center rounded-lg">
                                <Download className="text-accent h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-text font-semibold">Datenexport</h3>
                                <p className="text-text-muted text-sm">
                                  Laden Sie eine Kopie Ihrer Daten herunter
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="p-5">
                            <p className="text-text-secondary mb-4 text-sm">
                              Sie können jederzeit eine Kopie Ihrer persönlichen Daten anfordern.
                              Der Download enthält Ihre Profilinformationen, Käufe und hochgeladenen
                              Ressourcen.
                            </p>
                            <button className="border-border text-text hover:border-primary hover:text-primary inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors">
                              <Download className="h-4 w-4" />
                              Daten exportieren
                            </button>
                          </div>
                        </div>

                        {/* Danger Zone Card */}
                        <div className="border-error/30 bg-error/5 rounded-xl border">
                          <div className="border-error/30 border-b p-5">
                            <div className="flex items-center gap-3">
                              <div className="bg-error/10 flex h-10 w-10 items-center justify-center rounded-lg">
                                <Trash2 className="text-error h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-error font-semibold">Gefahrenzone</h3>
                                <p className="text-text-muted text-sm">Unwiderrufliche Aktionen</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-5">
                            <p className="text-text-secondary mb-4 text-sm">
                              Das Löschen Ihres Kontos ist unwiderruflich. Alle Ihre Daten,
                              hochgeladenen Ressourcen und Käufe werden permanent gelöscht.
                            </p>
                            <button className="border-error text-error hover:bg-error hover:text-text-on-accent inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors">
                              <Trash2 className="h-4 w-4" />
                              Konto löschen
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
