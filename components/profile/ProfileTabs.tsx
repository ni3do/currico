"use client";

import { useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { FileText, FolderOpen, Loader2, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MaterialCard } from "@/components/ui/MaterialCard";
import { CollectionCard } from "@/components/profile/CollectionCard";
import { StaggerChildren, StaggerItem } from "@/components/ui/animations";
import { getSubjectPillClass } from "@/lib/constants/subject-colors";
import { formatPrice } from "@/lib/utils/price";
import type { ProfileMaterial, ProfileCollection } from "@/lib/types/profile";

interface ProfileTabsProps {
  activeTab: "uploads" | "collections";
  onTabChange: (tab: "uploads" | "collections") => void;
  resourceCount: number;
  collectionCount: number;
  isPrivate: boolean;
  isOwnProfile: boolean;
  displayName: string;
  materials: ProfileMaterial[];
  collections: ProfileCollection[];
  hasMoreMaterials: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

const tabContentVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
} as const;

export function ProfileTabs({
  activeTab,
  onTabChange,
  resourceCount,
  collectionCount,
  isPrivate,
  isOwnProfile,
  displayName,
  materials,
  collections,
  hasMoreMaterials,
  loadingMore,
  onLoadMore,
}: ProfileTabsProps) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");

  const tabs = [
    {
      id: "uploads" as const,
      label: t("tabs.uploads"),
      count: resourceCount,
      icon: FileText,
      show: true,
    },
    {
      id: "collections" as const,
      label: t("tabs.collections"),
      count: collectionCount,
      icon: FolderOpen,
      show: !isPrivate,
    },
  ];

  const visibleTabs = tabs.filter((tab) => tab.show);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const currentIndex = visibleTabs.findIndex((tab) => tab.id === activeTab);
      const nextIndex =
        e.key === "ArrowRight"
          ? (currentIndex + 1) % visibleTabs.length
          : (currentIndex - 1 + visibleTabs.length) % visibleTabs.length;
      const nextTab = visibleTabs[nextIndex];
      onTabChange(nextTab.id);
      requestAnimationFrame(() => {
        const el = document.getElementById(`tab-${nextTab.id}`);
        el?.focus();
      });
    },
    [activeTab, visibleTabs, onTabChange]
  );

  return (
    <div>
      {/* Tab Bar */}
      <div
        className="border-border relative mb-6 flex gap-4 border-b"
        role="tablist"
        onKeyDown={handleTabKeyDown}
      >
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-2 pb-4 text-sm font-medium transition-colors ${
              activeTab === tab.id ? "text-primary" : "text-text-muted hover:text-text"
            }`}
          >
            <tab.icon className="h-4 w-4" aria-hidden="true" />
            {tab.label} ({tab.count})
            {activeTab === tab.id && (
              <motion.div
                layoutId="profile-tab-underline"
                className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === "uploads" && (
          <motion.section
            key="uploads"
            role="tabpanel"
            id="tabpanel-uploads"
            aria-labelledby="tab-uploads"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {materials.length === 0 ? (
              <div className="card flex flex-col items-center justify-center py-16">
                <FileText className="text-text-faint mb-4 h-12 w-12" aria-hidden="true" />
                <p className="text-text">{t("noUploads")}</p>
                <p className="text-text-muted mb-4 text-sm">
                  {isOwnProfile ? t("noUploadsOwn") : t("noUploadsOther")}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/hochladen"
                    className="btn-primary inline-flex items-center gap-2 px-6 py-2.5"
                  >
                    <Upload className="h-4 w-4" />
                    {t("startUpload")}
                  </Link>
                )}
              </div>
            ) : (
              <>
                <StaggerChildren
                  className="grid gap-5 min-[1920px]:grid-cols-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  variant="grid"
                >
                  {materials.map((material) => (
                    <StaggerItem key={material.id} variant="card">
                      <MaterialCard
                        id={material.id}
                        title={material.title}
                        description={material.description}
                        subject={material.subjects[0] || ""}
                        cycle={material.cycles[0] || ""}
                        price={material.price}
                        priceFormatted={formatPrice(material.price, { freeLabel: tCommon("free") })}
                        previewUrl={material.preview_url}
                        seller={{ displayName }}
                        subjectPillClass={getSubjectPillClass(material.subjects[0] || "")}
                      />
                    </StaggerItem>
                  ))}
                </StaggerChildren>

                {hasMoreMaterials && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={onLoadMore}
                      disabled={loadingMore}
                      className="btn-secondary inline-flex items-center gap-2 px-8 py-3 disabled:opacity-60"
                    >
                      {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                      {t("loadMore")}
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.section>
        )}

        {activeTab === "collections" && (
          <motion.section
            key="collections"
            role="tabpanel"
            id="tabpanel-collections"
            aria-labelledby="tab-collections"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {collections.length === 0 ? (
              <div className="card flex flex-col items-center justify-center py-16">
                <FolderOpen className="text-text-faint mb-4 h-12 w-12" aria-hidden="true" />
                <p className="text-text">{t("noCollections")}</p>
                <p className="text-text-muted text-sm">
                  {isOwnProfile ? t("noCollectionsOwn") : t("noCollectionsOther")}
                </p>
              </div>
            ) : (
              <StaggerChildren
                className="grid gap-5 min-[1920px]:grid-cols-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                variant="grid"
              >
                {collections.map((collection) => (
                  <StaggerItem key={collection.id} variant="card">
                    <CollectionCard collection={collection} />
                  </StaggerItem>
                ))}
              </StaggerChildren>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
