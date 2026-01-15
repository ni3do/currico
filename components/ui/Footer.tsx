"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const tCommon = useTranslations("common");

  return (
    <footer className="bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-[var(--color-primary)] rounded-md">
                <span className="text-white font-bold text-sm">{tCommon("brand.logoText")}</span>
              </div>
              <span className="text-lg font-semibold text-[var(--color-text)]">{tCommon("brand.name")}</span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              {tCommon("footer.brandDescription")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-[var(--color-text)] text-sm uppercase tracking-wider">{tCommon("footer.platformSection.title")}</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/resources" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">{tCommon("footer.platformSection.resources")}</Link></li>
              <li><Link href="/coming-soon" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">{tCommon("footer.platformSection.pricing")}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-[var(--color-text)] text-sm uppercase tracking-wider">{tCommon("footer.infoSection.title")}</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/about" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">{tCommon("footer.infoSection.aboutUs")}</Link></li>
              <li><Link href="/contact" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">{tCommon("footer.infoSection.contact")}</Link></li>
              <li><Link href="/coming-soon" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">{tCommon("footer.infoSection.help")}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-[var(--color-text)] text-sm uppercase tracking-wider">{tCommon("footer.legalSection.title")}</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/coming-soon" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">{tCommon("footer.legalSection.privacy")}</Link></li>
              <li><Link href="/coming-soon" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">{tCommon("footer.legalSection.terms")}</Link></li>
              <li><Link href="/coming-soon" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">{tCommon("footer.legalSection.imprint")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            {tCommon("footer.copyright")}
          </p>
          <p className="text-sm text-[var(--color-text-faint)]">
            {tCommon("footer.initiative")}
          </p>
        </div>
      </div>
    </footer>
  );
}
