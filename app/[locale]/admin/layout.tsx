"use client";

import { useState, useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Menu, ChevronDown } from "lucide-react";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface AdminStats {
  totalUsers: number;
  newUsersToday: number;
  totalResources: number;
  pendingApproval: number;
  totalRevenue: number;
  revenueToday: number;
  activeSchools: number;
  openReports: number;
  newMessages: number;
}

type TabType =
  | "overview"
  | "users"
  | "documents"
  | "messages"
  | "reports"
  | "transactions"
  | "settings";

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("admin");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Redirect non-admin users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/anmelden");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/konto");
    }
  }, [status, session?.user?.role, router]);

  // Fetch admin stats
  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "ADMIN") {
      return;
    }

    let isCancelled = false;

    const fetchData = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        if (response.ok && !isCancelled) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Error fetching admin stats:", error);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [status, session?.user?.role]);

  // Get active tab based on pathname
  const getActiveTab = (): TabType => {
    if (pathname === "/admin") return "overview";
    if (pathname.startsWith("/admin/users")) return "users";
    if (pathname.startsWith("/admin/documents")) return "documents";
    if (pathname.startsWith("/admin/messages")) return "messages";
    if (pathname.startsWith("/admin/reports")) return "reports";
    if (pathname.startsWith("/admin/transactions")) return "transactions";
    if (pathname.startsWith("/admin/settings")) return "settings";
    return "overview";
  };

  const activeTab = getActiveTab();

  // Get page title based on active tab
  const getPageTitle = (): string => {
    switch (activeTab) {
      case "overview":
        return t("layout.overview");
      case "users":
        return t("layout.users");
      case "documents":
        return t("layout.documents");
      case "messages":
        return t("layout.messages");
      case "reports":
        return t("layout.reports");
      case "transactions":
        return t("layout.transactions");
      case "settings":
        return t("layout.settings");
      default:
        return t("title");
    }
  };

  // Show loading state while checking auth
  if (status === "loading" || status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return (
      <div className="bg-bg flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-3">
          <Breadcrumb
            items={
              activeTab === "overview"
                ? [{ label: "Admin" }]
                : [{ label: "Admin", href: "/admin" }, { label: getPageTitle() }]
            }
          />
        </div>

        {/* Main Layout: Sidebar + Content */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="border-border bg-bg-secondary text-text-secondary hover:border-error hover:text-error flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors"
            >
              <Menu className="h-5 w-5" />
              <span>{t("menu")}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Mobile Sidebar */}
            {mobileMenuOpen && (
              <div className="mt-4">
                <AdminSidebar
                  activeTab={activeTab}
                  stats={stats}
                  adminName={session?.user?.name || undefined}
                  adminEmail={session?.user?.email || undefined}
                />
              </div>
            )}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden w-72 flex-shrink-0 lg:block">
            <div className="sticky top-24">
              <AdminSidebar
                activeTab={activeTab}
                stats={stats}
                adminName={session?.user?.name || undefined}
                adminEmail={session?.user?.email || undefined}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
