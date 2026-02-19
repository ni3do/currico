"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MapPin, Mail } from "lucide-react";

export default function Footer() {
  const t = useTranslations("common");

  return (
    <footer className="border-border bg-bg-secondary border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 4-column grid: 1 col mobile → 2 col tablet → 4 col desktop */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <span className="text-text-on-accent text-sm font-bold">{t("brand.logoText")}</span>
              </div>
              <span className="text-text text-lg font-bold">{t("brand.name")}</span>
            </div>
            <p className="text-text-muted mt-3 text-sm leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--ctp-red)_12%,transparent)] px-3 py-1.5">
              <span className="text-xs">🇨🇭</span>
              <span className="text-text-secondary text-xs font-medium">
                {t("footer.swissMade")}
              </span>
            </div>
          </div>

          {/* Column 2: Plattform */}
          <nav aria-labelledby="footer-platform">
            <h3 id="footer-platform" className="text-text mb-3 text-sm font-semibold">
              {t("footer.columns.platform")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/materialien"
                  className="text-text-muted hover:text-primary text-sm transition-colors"
                >
                  {t("footer.links.materials")}
                </Link>
              </li>
              <li>
                <Link
                  href="/hochladen"
                  className="text-text-muted hover:text-primary text-sm transition-colors"
                >
                  {t("footer.links.upload")}
                </Link>
              </li>
              <li>
                <Link
                  href="/hilfe"
                  className="text-text-muted hover:text-primary text-sm transition-colors"
                >
                  {t("footer.links.help")}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-text-muted hover:text-primary text-sm transition-colors"
                >
                  {t("footer.links.blog")}
                </Link>
              </li>
              <li>
                <Link
                  href="/verkaeufer-werden"
                  className="text-text-muted hover:text-primary text-sm transition-colors"
                >
                  {t("footer.links.becomeSeller")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Column 3: Rechtliches */}
          <nav aria-labelledby="footer-legal">
            <h3 id="footer-legal" className="text-text mb-3 text-sm font-semibold">
              {t("footer.columns.legal")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/impressum"
                  className="text-text-muted hover:text-primary text-sm transition-colors"
                >
                  {t("footer.links.imprint")}
                </Link>
              </li>
              <li>
                <Link
                  href="/datenschutz"
                  className="text-text-muted hover:text-primary text-sm transition-colors"
                >
                  {t("footer.links.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/agb"
                  className="text-text-muted hover:text-primary text-sm transition-colors"
                >
                  {t("footer.links.terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie-richtlinien"
                  className="text-text-muted hover:text-primary text-sm transition-colors"
                >
                  {t("footer.links.cookies")}
                </Link>
              </li>
              <li>
                <Link
                  href="/urheberrecht"
                  className="text-text-muted hover:text-primary text-sm transition-colors"
                >
                  {t("footer.links.copyrightGuide")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Column 4: Kontakt */}
          <nav aria-labelledby="footer-contact">
            <h3 id="footer-contact" className="text-text mb-3 text-sm font-semibold">
              {t("footer.columns.contact")}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={`mailto:${t("footer.contact.email")}`}
                  className="text-text-muted hover:text-primary inline-flex items-center gap-2 text-sm transition-colors"
                >
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  {t("footer.contact.email")}
                </a>
              </li>
              <li>
                <span className="text-text-muted inline-flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  {t("footer.contact.location")}
                </span>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="border-border mt-10 flex flex-col items-center gap-2 border-t pt-6 sm:flex-row sm:justify-between">
          <span className="text-text-muted text-xs">{t("footer.copyright")}</span>
          <span className="text-text-muted text-xs">{t("footer.swissHosted")}</span>
        </div>
      </div>
    </footer>
  );
}
