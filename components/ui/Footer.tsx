"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const tCommon = useTranslations("common");

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          {/* Left: Copyright with logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[var(--color-primary)]">
              <span className="text-xs font-bold text-white">{tCommon("brand.logoText")}</span>
            </div>
            <span className="text-sm text-gray-500">{tCommon("footer.copyright")}</span>
          </div>

          {/* Right: Essential links */}
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/coming-soon"
              className="text-sm text-gray-500 transition-colors hover:text-[var(--color-primary)] hover:text-gray-700"
            >
              {tCommon("footer.links.help")}
            </Link>
            <Link
              href="/coming-soon"
              className="text-sm text-gray-500 transition-colors hover:text-[var(--color-primary)] hover:text-gray-700"
            >
              {tCommon("footer.links.imprint")}
            </Link>
            <Link
              href="/coming-soon"
              className="text-sm text-gray-500 transition-colors hover:text-[var(--color-primary)] hover:text-gray-700"
            >
              {tCommon("footer.links.privacy")}
            </Link>
            <Link
              href="/coming-soon"
              className="text-sm text-gray-500 transition-colors hover:text-[var(--color-primary)] hover:text-gray-700"
            >
              {tCommon("footer.links.terms")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
