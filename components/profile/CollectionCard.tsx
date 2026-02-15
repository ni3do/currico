"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { FileText, FolderOpen } from "lucide-react";
import type { ProfileCollection } from "@/lib/types/profile";

interface CollectionCardProps {
  collection: ProfileCollection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const t = useTranslations("profile");

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="card group overflow-hidden transition-shadow hover:shadow-lg"
    >
      {/* Preview Grid */}
      <div className="bg-bg-secondary grid h-40 grid-cols-2 gap-1 p-1">
        {collection.previewItems.slice(0, 4).map((item) => (
          <div key={item.id} className="bg-surface relative overflow-hidden rounded-md">
            {item.preview_url ? (
              <Image
                src={item.preview_url}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 15vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <FileText className="text-text-faint h-6 w-6" aria-hidden="true" />
              </div>
            )}
          </div>
        ))}
        {collection.previewItems.length < 4 &&
          Array.from({ length: 4 - collection.previewItems.length }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="bg-surface-hover flex items-center justify-center rounded-md"
            >
              <FolderOpen className="text-text-faint h-5 w-5" aria-hidden="true" />
            </div>
          ))}
      </div>

      {/* Collection Info */}
      <div className="p-4">
        <h3 className="text-text group-hover:text-primary mb-1 font-semibold transition-colors">
          {collection.name}
        </h3>
        {collection.description && (
          <p className="text-text-muted mb-2 line-clamp-2 text-sm">{collection.description}</p>
        )}
        <div className="text-text-muted flex items-center gap-1 text-sm">
          <FileText className="h-4 w-4" aria-hidden="true" />
          {collection.itemCount} {t("collectionItems")}
        </div>
      </div>
    </Link>
  );
}
