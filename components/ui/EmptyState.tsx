"use client";

import { Link } from "@/i18n/navigation";
import {
  Heart,
  BookOpen,
  FolderOpen,
  Search,
  ShoppingBag,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  variant?: "default" | "compact";
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  variant = "default",
}: EmptyStateProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={`border-border-subtle bg-bg-secondary flex flex-col items-center justify-center rounded-lg border ${isCompact ? "px-6 py-10" : "px-8 py-16"}`}
    >
      <div className="bg-surface-hover mb-4 flex h-16 w-16 items-center justify-center rounded-full">
        <Icon className="text-text-muted h-8 w-8" />
      </div>
      <p
        className={`text-text mb-2 text-center font-medium ${isCompact ? "text-base" : "text-lg"}`}
      >
        {title}
      </p>
      <p className="text-text-muted mb-6 max-w-sm text-center text-sm">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="bg-primary text-text-on-accent hover:bg-primary-hover rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="bg-primary text-text-on-accent hover:bg-primary-hover rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Pre-configured empty state variants for common use cases
export function EmptyWishlist() {
  return (
    <EmptyState
      icon={Heart}
      title="Ihre Wunschliste ist leer"
      description="Speichern Sie Materialien, die Sie interessieren, indem Sie auf das Herz-Symbol klicken."
      actionLabel="Materialien entdecken"
      actionHref="/materialien"
    />
  );
}

export function EmptyLibrary() {
  return (
    <EmptyState
      icon={BookOpen}
      title="Ihre Bibliothek ist leer"
      description="Hier finden Sie alle Materialien, die Sie gekauft oder kostenlos heruntergeladen haben."
      actionLabel="Materialien durchsuchen"
      actionHref="/materialien"
    />
  );
}

export function EmptyCollections() {
  return (
    <EmptyState
      icon={FolderOpen}
      title="Keine Sammlungen vorhanden"
      description="Organisieren Sie Ihre Materialien in Sammlungen, um sie leichter wiederzufinden."
    />
  );
}

export function EmptySearchResults({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title="Keine Ergebnisse gefunden"
      description="Versuchen Sie andere Suchbegriffe, weniger Filter, oder durchsuchen Sie alle Materialien."
      actionLabel="Alle Materialien anzeigen"
      actionHref="/materialien"
    />
  );
}

export function EmptyUploads() {
  return (
    <EmptyState
      icon={Upload}
      title="Noch keine Materialien hochgeladen"
      description="Teilen Sie Ihre Unterrichtsmaterialien mit anderen Lehrpersonen und verdienen Sie 70% bei jedem Verkauf."
      actionLabel="Material hochladen"
      actionHref="/materialien/upload"
    />
  );
}

export function EmptyFollowing() {
  return (
    <EmptyState
      icon={Users}
      title="Sie folgen noch niemandem"
      description="Folgen Sie Lehrpersonen, deren Materialien Ihnen gefallen, um keine neuen Uploads zu verpassen."
      actionLabel="Ersteller entdecken"
      actionHref="/materialien?showMaterials=false"
    />
  );
}

export function EmptyPurchases() {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="Noch keine Käufe"
      description="Hier erscheinen alle Materialien, die Sie gekauft haben."
      actionLabel="Materialien entdecken"
      actionHref="/materialien"
    />
  );
}
