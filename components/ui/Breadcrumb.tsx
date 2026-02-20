"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function Breadcrumb({ items, showHome = true, className = "" }: BreadcrumbProps) {
  const t = useTranslations("common");

  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: t("breadcrumb.home"), href: "/" }, ...items]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-text-muted mb-4 flex items-center gap-1.5 text-sm ${className}`}
    >
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;
        const isHome = index === 0 && showHome;

        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight
                className="text-text-faint h-3.5 w-3.5 flex-shrink-0"
                aria-hidden="true"
              />
            )}
            {isLast ? (
              <span className="text-text-secondary font-medium">{item.label}</span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="hover:text-primary flex items-center gap-1 transition-colors"
              >
                {isHome && <Home className="h-3.5 w-3.5" aria-hidden="true" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
