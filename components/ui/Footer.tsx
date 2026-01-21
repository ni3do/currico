"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const tCommon = useTranslations("common");

  return (
    <footer className="border-border bg-bg-secondary border-t">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          {/* Top row: Logo, Copyright & Made in Switzerland */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary flex h-7 w-7 items-center justify-center rounded">
                <span className="text-text-on-accent text-xs font-bold">
                  {tCommon("brand.logoText")}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="text-text-muted text-sm">{tCommon("footer.copyright")}</span>
                <span className="text-text-muted hidden sm:inline">·</span>
                <span className="text-text-muted text-sm">{tCommon("footer.madeIn")}</span>
              </div>
            </div>

            {/* Payment badge */}
            <div className="flex items-center gap-2 rounded-full bg-[var(--ctp-surface0)] px-3 py-1.5">
              <svg
                className="h-4 w-4 text-[var(--ctp-blue)]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
              </svg>
              <span className="text-text-muted text-xs font-medium">
                {tCommon("footer.payment")}
              </span>
            </div>
          </div>

          {/* Bottom row: Links */}
          <div className="border-border flex flex-col items-center gap-3 border-t pt-4 sm:flex-row sm:justify-center">
            <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
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
      </div>
    </footer>
  );
}
