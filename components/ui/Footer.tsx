"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const tCommon = useTranslations("common");

  return (
    <footer className="border-border bg-bg-secondary border-t">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          {/* Left: Copyright with logo */}
          <div className="flex items-center gap-2">
            <div className="bg-primary flex h-6 w-6 items-center justify-center rounded">
              <span className="text-text-on-accent text-xs font-bold">
                {tCommon("brand.logoText")}
              </span>
            </div>
            <span className="text-text-muted text-sm">{tCommon("footer.copyright")}</span>
          </div>

          {/* Right: Essential links */}
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/faq"
              className="text-text-muted hover:text-primary text-sm transition-colors"
            >
              {tCommon("footer.links.help")}
            </Link>
            <Link
              href="/impressum"
              className="text-text-muted hover:text-primary text-sm transition-colors"
            >
              {tCommon("footer.links.imprint")}
            </Link>
            <Link
              href="/privacy"
              className="text-text-muted hover:text-primary text-sm transition-colors"
            >
              {tCommon("footer.links.privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-text-muted hover:text-primary text-sm transition-colors"
            >
              {tCommon("footer.links.terms")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
