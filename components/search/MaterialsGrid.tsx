"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { MaterialCard } from "@/components/ui/MaterialCard";
import { getSubjectPillClass } from "@/lib/constants/subject-colors";
import type { MaterialListItem } from "@/lib/types/search";

interface MaterialsGridProps {
  materials: MaterialListItem[];
  wishlistedIds: Set<string>;
  onWishlistToggle: (id: string, currentState: boolean) => Promise<boolean>;
  viewMode: "grid" | "list";
  labels: { wishlistAdd: string; wishlistRemove: string; anonymous: string };
}

export const MaterialsGrid = memo(function MaterialsGrid({
  materials,
  wishlistedIds,
  onWishlistToggle,
  viewMode,
  labels,
}: MaterialsGridProps) {
  return (
    <>
      {materials.map((material, index) => (
        <motion.div
          key={`material-${material.id}`}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              duration: 0.4,
              delay: Math.min(index * 0.05, 0.5) + 0.02,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
        >
          <MaterialCard
            id={material.id}
            title={material.title}
            description={material.description}
            subject={material.subjects[0] || "Allgemein"}
            cycle={material.cycles[0] || ""}
            price={material.price}
            priceFormatted={material.priceFormatted}
            previewUrl={material.previewUrl}
            seller={{
              displayName: material.seller.displayName,
              isVerifiedSeller: material.seller.isVerifiedSeller,
              sellerLevel: material.seller.sellerLevel,
              sellerXp: material.seller.sellerXp,
            }}
            subjectPillClass={getSubjectPillClass(material.subjects[0] || "Allgemein")}
            showWishlist={true}
            isWishlisted={wishlistedIds.has(material.id)}
            onWishlistToggle={onWishlistToggle}
            variant={viewMode === "list" ? "compact" : "default"}
            averageRating={material.averageRating}
            reviewCount={material.reviewCount}
            downloadCount={material.downloadCount}
            competencies={material.competencies}
            tags={material.tags}
            wishlistAddLabel={labels.wishlistAdd}
            wishlistRemoveLabel={labels.wishlistRemove}
            anonymousLabel={labels.anonymous}
          />
        </motion.div>
      ))}
    </>
  );
});
