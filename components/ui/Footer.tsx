"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const tCommon = useTranslations("common");

  return (
    <footer className="border-border bg-bg-secondary border-t">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between sm:gap-4">
          {/* Left: Logo & Copyright */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="bg-primary flex h-6 w-6 items-center justify-center rounded">
              <span className="text-text-on-accent text-xs font-bold">
                {tCommon("brand.logoText")}
              </span>
            </div>
            <span className="text-text-muted text-sm">{tCommon("footer.copyright")}</span>
            <span className="text-text-muted">·</span>
            <span className="text-text-muted text-sm">{tCommon("footer.madeIn")}</span>
          </div>

          {/* Right: Links */}
          <nav
            aria-label="Footer links"
            className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-3 md:gap-5"
          >
            <Link
              href="/hilfe"
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
              href="/datenschutz"
              className="text-text-muted hover:text-primary text-sm transition-colors"
            >
              {tCommon("footer.links.privacy")}
            </Link>
            <Link
              href="/agb"
              className="text-text-muted hover:text-primary text-sm transition-colors"
            >
              {tCommon("footer.links.terms")}
            </Link>
            <Link
              href="/cookie-richtlinien"
              className="text-text-muted hover:text-primary text-sm transition-colors"
            >
              {tCommon("footer.links.cookies")}
            </Link>
            <Link
              href="/urheberrecht"
              className="text-text-muted hover:text-primary text-sm transition-colors"
            >
              {tCommon("footer.links.copyrightGuide")}
            </Link>
            <Link
              href="/verkaeufer-stufen"
              className="text-text-muted hover:text-primary text-sm transition-colors"
            >
              {tCommon("footer.links.sellerLevels")}
            </Link>
            <Link
              href="/verifizierter-verkaeufer"
              className="text-text-muted hover:text-primary text-sm transition-colors"
            >
              {tCommon("footer.links.verifiedSeller")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
