"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { BookOpen, Gift, ShoppingBag, Sparkles } from "lucide-react";
import { DashboardMaterialCard } from "@/components/ui/DashboardMaterialCard";
import { useAccountData } from "@/lib/hooks/useAccountData";
import type { LibraryItem } from "@/lib/types/account";

export default function AccountLibraryPage() {
  const { status } = useSession();
  const { loading: sharedLoading } = useAccountData();

  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch library items
  const fetchLibrary = useCallback(async () => {
    try {
      const params = new URLSearchParams({ type: "acquired" });
      const response = await fetch(`/api/user/library?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLibraryItems(data.items);
      }
    } catch (error) {
      console.error("Error fetching library:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    if (status === "authenticated") {
      fetchLibrary();
    }
  }, [status, fetchLibrary]);

  const isLoading = loading || sharedLoading;

  return (
    <motion.div
      key="library"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border-border bg-surface rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <BookOpen className="text-primary h-5 w-5" />
            </div>
            <div>
              <p className="text-text-muted text-xs font-medium">Gesamt in Bibliothek</p>
              <p className="text-text text-xl font-bold">{isLoading ? "-" : libraryItems.length}</p>
            </div>
          </div>
        </div>
        <div className="border-border bg-surface rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Gift className="text-success h-5 w-5" />
            </div>
            <div>
              <p className="text-text-muted text-xs font-medium">Gratis erhalten</p>
              <p className="text-text text-xl font-bold">
                {isLoading ? "-" : libraryItems.filter((i) => i.type === "free").length}
              </p>
            </div>
          </div>
        </div>
        <div className="border-border bg-surface rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <ShoppingBag className="text-accent h-5 w-5" />
            </div>
            <div>
              <p className="text-text-muted text-xs font-medium">Gekauft</p>
              <p className="text-text text-xl font-bold">
                {isLoading ? "-" : libraryItems.filter((i) => i.type === "purchased").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="border-border bg-surface rounded-xl border">
        <div className="border-border flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-text text-xl font-semibold">Meine Bibliothek</h2>
            <p className="text-text-muted mt-1 text-sm">Alle erworbenen Materialien an einem Ort</p>
          </div>
          <Link
            href="/materialien"
            className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Mehr entdecken
          </Link>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse overflow-hidden">
                  <div className="bg-bg-secondary aspect-[4/3]"></div>
                  <div className="px-3 pt-2.5 pb-3">
                    <div className="bg-surface-hover mb-2 h-3 w-20 rounded"></div>
                    <div className="bg-surface-hover mb-1.5 h-4 w-full rounded"></div>
                    <div className="border-border-subtle mt-3 border-t pt-2">
                      <div className="flex items-center justify-between">
                        <div className="bg-surface-hover h-3 w-16 rounded"></div>
                        <div className="bg-surface-hover h-6 w-14 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : libraryItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {libraryItems.map((item) => (
                <DashboardMaterialCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  subject={item.subject}
                  cycle={item.cycle}
                  previewUrl={item.previewUrl}
                  badge={{
                    label: item.type === "purchased" ? "Gekauft" : "Gratis",
                    variant: item.type === "purchased" ? "primary" : "success",
                  }}
                  secondaryBadge={
                    item.verified ? { label: "Verifiziert", variant: "success" } : undefined
                  }
                  seller={{ displayName: item.seller.displayName }}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="bg-primary/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                <BookOpen className="text-primary h-10 w-10" />
              </div>
              <h3 className="text-text mb-2 text-xl font-semibold">
                Ihre Bibliothek ist noch leer
              </h3>
              <p className="text-text-muted mx-auto mb-6 max-w-md">
                Entdecken Sie hochwertige Unterrichtsmaterialien von anderen Lehrpersonen und
                beginnen Sie Ihre Sammlung.
              </p>
              <Link
                href="/materialien"
                className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Materialien entdecken
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
