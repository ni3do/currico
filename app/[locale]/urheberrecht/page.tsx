"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Type,
  AlertTriangle,
  ClipboardCheck,
  Mail,
  Scale,
  ArrowUp,
  ExternalLink,
  Sparkles,
  HelpCircle,
  BookOpen,
  Bot,
  List,
  X,
} from "lucide-react";

const TOC_SECTIONS = [
  "legalBasis",
  "allowed",
  "notAllowed",
  "ccLicenses",
  "aiContent",
  "images",
  "imageSources",
  "fonts",
  "greyAreas",
  "commonMistakes",
  "checklist",
  "contact",
] as const;

const COMMON_MISTAKE_KEYS = [
  "textbookPages",
  "clipArt",
  "brandedCharacters",
  "pinterestImages",
  "modifiedContent",
  "fontAssumption",
] as const;

const GREY_AREA_KEYS = [
  "maps",
  "exerciseReference",
  "historicalImages",
  "studentWork",
  "schoolLogo",
] as const;

/** Tailwind color classes for section header icons — full strings to avoid purge issues */
const ICON_COLOR_CLASSES = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  success: { bg: "bg-success/10", text: "text-success" },
  error: { bg: "bg-error/10", text: "text-error" },
  warning: { bg: "bg-warning/10", text: "text-warning" },
} as const;

type SectionColor = keyof typeof ICON_COLOR_CLASSES;

/** Maps each content section to its header icon and color */
const SECTION_CONFIG: Record<string, { icon: LucideIcon; color: SectionColor }> = {
  legalBasis: { icon: Scale, color: "primary" },
  allowed: { icon: CheckCircle, color: "success" },
  notAllowed: { icon: XCircle, color: "error" },
  ccLicenses: { icon: BookOpen, color: "primary" },
  aiContent: { icon: Bot, color: "primary" },
  images: { icon: ImageIcon, color: "primary" },
  imageSources: { icon: ExternalLink, color: "success" },
  fonts: { icon: Type, color: "primary" },
  greyAreas: { icon: HelpCircle, color: "primary" },
  commonMistakes: { icon: AlertTriangle, color: "warning" },
  checklist: { icon: ClipboardCheck, color: "success" },
};

/** Reusable section header: icon box + title (extracted from 11 repeated instances) */
function SectionHeader({
  sectionKey,
  title,
  children,
}: {
  sectionKey: string;
  title: string;
  children?: React.ReactNode;
}) {
  const config = SECTION_CONFIG[sectionKey];
  if (!config) return null;
  const { icon: Icon, color } = config;
  const colors = ICON_COLOR_CLASSES[color];
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className={`${colors.bg} flex h-10 w-10 items-center justify-center rounded-lg`}>
        <Icon className={`${colors.text} h-5 w-5`} aria-hidden="true" />
      </div>
      <h2 className="text-text text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}

export default function CopyrightGuidePage() {
  const t = useTranslations("copyrightGuide");
  const tCommon = useTranslations("common");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  const toggleChecked = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checklistKeys = [
    "ownContent",
    "noScans",
    "noTrademarks",
    "swissSpelling",
    "termsAccepted",
  ] as const;

  const checkedCount = checklistKeys.filter((key) => checkedItems[key]).length;

  const [activeSection, setActiveSection] = useState<string>("");

  // Scroll-spy: highlight active TOC link based on visible section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    for (const section of TOC_SECTIONS) {
      const el = document.getElementById(section);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  // Scroll to anchor on page load (e.g. /urheberrecht#aiContent)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      requestAnimationFrame(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  }, []);

  /** Shared TOC link list used by both desktop sidebar and mobile overlay */
  const renderTocLinks = (onLinkClick?: () => void) => (
    <ol className="space-y-0.5">
      {TOC_SECTIONS.map((section, index) => (
        <li key={section}>
          <a
            href={`#${section}`}
            onClick={onLinkClick}
            aria-current={activeSection === section ? "true" : undefined}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors ${
              activeSection === section
                ? "bg-primary/10 text-primary font-medium"
                : "text-text-secondary hover:text-primary hover:bg-primary/5"
            }`}
          >
            <span className="text-text-muted w-4 text-xs">{index + 1}.</span>
            {t(`toc.${section}`)}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div
      id="top"
      className="bg-bg flex min-h-screen flex-col"
      style={{ "--header-offset": "6rem" } as React.CSSProperties}
    >
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          nav,
          footer,
          .no-print {
            display: none !important;
          }
          main {
            max-width: 100% !important;
            padding: 0 !important;
          }
          .bg-surface {
            border: 1px solid #ccc !important;
            break-inside: avoid;
          }
        }
      `}</style>

      <TopBar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: tCommon("breadcrumb.copyrightGuide") }]} />
          <h1 className="text-text text-2xl font-bold sm:text-3xl">{t("title")}</h1>
          <p className="text-text-muted mt-1">{t("subtitle")}</p>
        </div>

        {/* Two-column layout: sidebar TOC + content */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Desktop Sidebar TOC */}
          <div className="hidden w-72 flex-shrink-0 lg:block">
            <div className="sticky top-[var(--header-offset)]">
              <nav
                className="no-print border-border bg-bg-secondary rounded-xl border p-4 shadow-sm"
                aria-label={t("toc.title")}
              >
                <h2 className="text-text mb-3 text-sm font-semibold">{t("toc.title")}</h2>
                {renderTocLinks()}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            <div className="space-y-6">
              {/* Introduction */}
              <div className="border-primary/20 bg-accent-subtle rounded-xl border p-6">
                <p className="text-text">{t("intro")}</p>
              </div>

              {/* Section 1: Legal Basis */}
              <section
                id="legalBasis"
                className="bg-surface border-border scroll-mt-[var(--header-offset)] rounded-xl border p-6"
              >
                <SectionHeader sectionKey="legalBasis" title={t("sections.legalBasis.title")} />
                <p className="text-text-secondary mb-4">{t("sections.legalBasis.description")}</p>

                <div className="bg-bg-secondary mb-4 rounded-lg p-4">
                  <h3 className="text-text mb-2 font-medium">
                    {t("sections.legalBasis.schulprivileg.title")}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {t("sections.legalBasis.schulprivileg.content")}
                  </p>
                </div>

                <div className="bg-warning/10 border-warning/20 rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className="text-warning mt-0.5 h-5 w-5 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <p className="text-text text-sm font-medium">
                      {t("sections.legalBasis.important")}
                    </p>
                  </div>
                </div>

                <p className="text-text-muted mt-4 text-xs italic">
                  {t("sections.legalBasis.reference")}
                </p>
              </section>

              {/* Section 2: What can I sell? */}
              <section
                id="allowed"
                className="bg-surface border-border scroll-mt-[var(--header-offset)] rounded-xl border p-6"
              >
                <SectionHeader sectionKey="allowed" title={t("sections.allowed.title")} />
                <p className="text-text-secondary mb-4">{t("sections.allowed.description")}</p>
                <ul className="space-y-2">
                  {(
                    [
                      "ownWorksheets",
                      "ownPhotos",
                      "cc0Materials",
                      "ownPresentations",
                      "ownTemplates",
                    ] as const
                  ).map((key) => (
                    <li key={key} className="flex items-start gap-3">
                      <CheckCircle
                        className="text-success mt-0.5 h-4 w-4 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-text-secondary text-sm">
                        {t(`sections.allowed.items.${key}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Section 3: What can I NOT sell? */}
              <section
                id="notAllowed"
                className="bg-surface border-border scroll-mt-[var(--header-offset)] rounded-xl border p-6"
              >
                <SectionHeader sectionKey="notAllowed" title={t("sections.notAllowed.title")} />
                <p className="text-text-secondary mb-4">{t("sections.notAllowed.description")}</p>
                <ul className="space-y-2">
                  {(
                    [
                      "textbookScans",
                      "copyrightedCharacters",
                      "copyrightedImages",
                      "eszettContent",
                      "thirdPartyContent",
                    ] as const
                  ).map((key) => (
                    <li key={key} className="flex items-start gap-3">
                      <XCircle
                        className="text-error mt-0.5 h-4 w-4 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-text-secondary text-sm">
                        {t(`sections.notAllowed.items.${key}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Section 4: Creative Commons Licenses */}
              <section
                id="ccLicenses"
                className="bg-surface border-border scroll-mt-[var(--header-offset)] rounded-xl border p-6"
              >
                <SectionHeader sectionKey="ccLicenses" title={t("sections.ccLicenses.title")} />
                <p className="text-text-secondary mb-4">{t("sections.ccLicenses.description")}</p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Allowed CC */}
                  <div className="border-success/20 bg-success/5 rounded-lg border p-4">
                    <h3 className="text-success mb-3 font-medium">
                      {t("sections.ccLicenses.allowed.title")}
                    </h3>
                    <ul className="space-y-2">
                      {(["cc0", "ccBy", "ccBySa"] as const).map((key) => (
                        <li key={key} className="flex items-start gap-2">
                          <CheckCircle
                            className="text-success mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-text-secondary text-sm">
                            {t(`sections.ccLicenses.allowed.${key}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Not allowed CC */}
                  <div className="border-error/20 bg-error/5 rounded-lg border p-4">
                    <h3 className="text-error mb-3 font-medium">
                      {t("sections.ccLicenses.notAllowed.title")}
                    </h3>
                    <ul className="space-y-2">
                      {(["ccByNc", "ccByNd", "ccByNcSa"] as const).map((key) => (
                        <li key={key} className="flex items-start gap-2">
                          <XCircle
                            className="text-error mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-text-secondary text-sm">
                            {t(`sections.ccLicenses.notAllowed.${key}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-primary/5 border-primary/20 mt-4 rounded-lg border p-3">
                  <div className="flex items-start gap-2">
                    <Sparkles
                      className="text-primary mt-0.5 h-4 w-4 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-text-secondary text-sm">
                      {t("sections.ccLicenses.tip")}
                    </span>
                  </div>
                </div>
              </section>

              {/* Section 5: AI-Generated Content */}
              <section
                id="aiContent"
                className="bg-surface border-border scroll-mt-[var(--header-offset)] rounded-xl border p-6"
              >
                <SectionHeader sectionKey="aiContent" title={t("sections.aiContent.title")} />
                <p className="text-text-secondary mb-4">{t("sections.aiContent.description")}</p>

                <div className="space-y-4">
                  {/* Allowed AI */}
                  <div className="border-success/20 bg-success/5 rounded-lg border p-4">
                    <h3 className="text-success mb-3 font-medium">
                      {t("sections.aiContent.allowedTitle")}
                    </h3>
                    <ul className="space-y-2">
                      {(["aiText", "aiInspiration", "aiLayout"] as const).map((key) => (
                        <li key={key} className="flex items-start gap-2">
                          <CheckCircle
                            className="text-success mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-text-secondary text-sm">
                            {t(`sections.aiContent.allowedItems.${key}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Caution AI */}
                  <div className="border-warning/20 bg-warning/5 rounded-lg border p-4">
                    <h3 className="text-warning mb-3 font-medium">
                      {t("sections.aiContent.cautionTitle")}
                    </h3>
                    <ul className="space-y-2">
                      {(["aiImages", "aiFullContent"] as const).map((key) => (
                        <li key={key} className="flex items-start gap-2">
                          <AlertTriangle
                            className="text-warning mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-text-secondary text-sm">
                            {t(`sections.aiContent.cautionItems.${key}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Not allowed AI */}
                  <div className="border-error/20 bg-error/5 rounded-lg border p-4">
                    <h3 className="text-error mb-3 font-medium">
                      {t("sections.aiContent.notAllowedTitle")}
                    </h3>
                    <ul className="space-y-2">
                      {(["aiCopy", "aiStyle"] as const).map((key) => (
                        <li key={key} className="flex items-start gap-2">
                          <XCircle
                            className="text-error mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-text-secondary text-sm">
                            {t(`sections.aiContent.notAllowedItems.${key}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-primary/5 border-primary/20 mt-4 rounded-lg border p-3">
                  <div className="flex items-start gap-2">
                    <Sparkles
                      className="text-primary mt-0.5 h-4 w-4 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-text-secondary text-sm">
                      {t("sections.aiContent.notice")}
                    </span>
                  </div>
                </div>
              </section>

              {/* Section 6: Images */}
              <section
                id="images"
                className="bg-surface border-border scroll-mt-[var(--header-offset)] rounded-xl border p-6"
              >
                <SectionHeader sectionKey="images" title={t("sections.images.title")} />
                <p className="text-text-secondary mb-4">{t("sections.images.description")}</p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Allowed images */}
                  <div className="border-success/20 bg-success/5 rounded-lg border p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <CheckCircle className="text-success h-4 w-4" aria-hidden="true" />
                      <h3 className="text-success font-medium">
                        {t("sections.images.allowedTitle")}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {(
                        ["ownPhotos", "cc0Images", "purchasedStock", "createdGraphics"] as const
                      ).map((key) => (
                        <li key={key} className="flex items-start gap-2">
                          <CheckCircle
                            className="text-success mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-text-secondary text-sm">
                            {t(`sections.images.allowedItems.${key}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Not allowed images */}
                  <div className="border-error/20 bg-error/5 rounded-lg border p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <XCircle className="text-error h-4 w-4" aria-hidden="true" />
                      <h3 className="text-error font-medium">
                        {t("sections.images.notAllowedTitle")}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {(
                        ["googleImages", "socialMedia", "editorialStock", "otherTeachers"] as const
                      ).map((key) => (
                        <li key={key} className="flex items-start gap-2">
                          <XCircle
                            className="text-error mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-text-secondary text-sm">
                            {t(`sections.images.notAllowedItems.${key}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 7: Image Sources */}
              <section
                id="imageSources"
                className="bg-surface border-border scroll-mt-[var(--header-offset)] rounded-xl border p-6"
              >
                <SectionHeader sectionKey="imageSources" title={t("sections.imageSources.title")} />
                <p className="text-text-secondary mb-4">{t("sections.imageSources.description")}</p>
                <ul className="space-y-3">
                  {(
                    ["unsplash", "pixabay", "pexels", "openclipart", "wikimediaCommons"] as const
                  ).map((key) => (
                    <li key={key} className="flex items-start gap-3">
                      <CheckCircle
                        className="text-success mt-0.5 h-4 w-4 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-text-secondary text-sm">
                        {t(`sections.imageSources.sources.${key}`)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="bg-primary/5 border-primary/20 mt-4 rounded-lg border p-3">
                  <div className="flex items-start gap-2">
                    <Sparkles
                      className="text-primary mt-0.5 h-4 w-4 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-text-secondary text-sm">
                      {t("sections.imageSources.tip")}
                    </span>
                  </div>
                </div>
              </section>

              {/* Section 8: Fonts */}
              <section
                id="fonts"
                className="bg-surface border-border scroll-mt-[var(--header-offset)] rounded-xl border p-6"
              >
                <SectionHeader sectionKey="fonts" title={t("sections.fonts.title")} />
                <p className="text-text-secondary mb-4">{t("sections.fonts.description")}</p>
                <ul className="space-y-2">
                  {(
                    ["googleFonts", "purchasedFonts", "systemFonts", "freeWithLicense"] as const
                  ).map((key) => (
                    <li key={key} className="flex items-start gap-3">
                      <CheckCircle
                        className="text-success mt-0.5 h-4 w-4 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-text-secondary text-sm">
                        {t(`sections.fonts.items.${key}`)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="bg-warning/10 border-warning/20 mt-4 rounded-lg border p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      className="text-warning mt-0.5 h-4 w-4 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-text-secondary text-sm">
                      {t("sections.fonts.warning")}
                    </span>
                  </div>
                </div>
              </section>

              {/* Section 9: Grey Areas */}
              <section
                id="greyAreas"
                className="bg-surface border-border scroll-mt-[var(--header-offset)] rounded-xl border p-6"
              >
                <SectionHeader sectionKey="greyAreas" title={t("sections.greyAreas.title")} />
                <p className="text-text-secondary mb-4">{t("sections.greyAreas.description")}</p>

                <div className="space-y-3">
                  {GREY_AREA_KEYS.map((key) => (
                    <div key={key} className="bg-bg-secondary rounded-lg p-4">
                      <h3 className="text-text mb-1 text-sm font-semibold">
                        {t(`sections.greyAreas.items.${key}.question`)}
                      </h3>
                      <p className="text-text-secondary text-sm">
                        {t(`sections.greyAreas.items.${key}.answer`)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 10: Common Mistakes */}
              <section
                id="commonMistakes"
                className="bg-surface border-border scroll-mt-[var(--header-offset)] rounded-xl border p-6"
              >
                <SectionHeader
                  sectionKey="commonMistakes"
                  title={t("sections.commonMistakes.title")}
                />
                <p className="text-text-secondary mb-4">
                  {t("sections.commonMistakes.description")}
                </p>
                <div className="space-y-4">
                  {COMMON_MISTAKE_KEYS.map((key) => (
                    <div key={key} className="border-warning/20 bg-warning/5 rounded-lg border p-4">
                      <div className="flex items-start gap-3">
                        <XCircle
                          className="text-warning mt-0.5 h-4 w-4 flex-shrink-0"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="text-text text-sm font-medium">
                            {t(`sections.commonMistakes.items.${key}.mistake`)}
                          </p>
                          <p className="text-text-secondary mt-1 text-sm italic">
                            {t(`sections.commonMistakes.items.${key}.why`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 11: Checklist */}
              <section
                id="checklist"
                className="bg-surface border-border scroll-mt-[var(--header-offset)] rounded-xl border p-6"
              >
                <SectionHeader sectionKey="checklist" title={t("sections.checklist.title")}>
                  <span
                    className={`ml-auto text-sm font-bold ${checkedCount === 5 ? "text-success" : "text-text-muted"}`}
                  >
                    {checkedCount} / 5
                  </span>
                </SectionHeader>
                <p className="text-text-secondary mb-4">{t("sections.checklist.description")}</p>

                {/* Progress bar */}
                <div className="bg-border mb-5 h-1.5 overflow-hidden rounded-full">
                  <div
                    className={`h-full transition-all duration-300 ${checkedCount === 5 ? "bg-success" : "bg-primary"}`}
                    style={{ width: `${(checkedCount / 5) * 100}%` }}
                  />
                </div>

                <ul className="space-y-3">
                  {checklistKeys.map((key) => (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => toggleChecked(key)}
                        className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                          checkedItems[key]
                            ? "bg-success/5 border-success/20 border"
                            : "bg-bg-secondary hover:bg-bg-secondary/80 border border-transparent"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                            checkedItems[key]
                              ? "border-success bg-success text-text-on-accent"
                              : "border-border bg-surface"
                          }`}
                        >
                          {checkedItems[key] && (
                            <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                        </div>
                        <span
                          className={`text-sm transition-colors ${
                            checkedItems[key] ? "text-text" : "text-text-secondary"
                          }`}
                        >
                          {t(`sections.checklist.items.${key}`)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Terms link */}
                <div className="mt-4 text-center">
                  <Link href="/agb" className="text-primary text-sm hover:underline">
                    {t("sections.checklist.termsLinkText")} →
                  </Link>
                </div>

                {/* Upload CTA */}
                <div className="no-print mt-6 text-center">
                  <Link
                    href="/hochladen"
                    className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
                  >
                    {t("readyToUpload")}
                  </Link>
                </div>
              </section>

              {/* Section 12: Contact CTA */}
              <section
                id="contact"
                className="border-border bg-bg-secondary scroll-mt-[var(--header-offset)] rounded-xl border p-6 text-center"
              >
                <Mail className="text-primary mx-auto mb-4 h-8 w-8" aria-hidden="true" />
                <h2 className="text-text text-lg font-semibold">{t("sections.contact.title")}</h2>
                <p className="text-text-muted mt-2">{t("sections.contact.description")}</p>
                <a
                  href={`mailto:${t("sections.contact.email")}`}
                  className="bg-primary text-text-on-accent hover:bg-primary-hover mt-4 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
                  title={t("sections.contact.emailTitle")}
                >
                  {t("sections.contact.email")}
                </a>
              </section>
            </div>

            {/* Back to top — real anchor for keyboard nav, smooth scroll enhancement */}
            <div className="no-print mt-8 text-center">
              <a
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-text-muted hover:text-primary inline-flex items-center gap-1.5 text-sm transition-colors"
              >
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
                {t("backToTop")}
              </a>
            </div>
          </div>
          {/* close content column */}
        </div>
        {/* close flex container */}
      </main>

      <Footer />

      {/* Mobile/Tablet TOC floating button (visible below lg breakpoint) */}
      {!mobileTocOpen && (
        <button
          type="button"
          className="no-print bg-primary text-text-on-accent fixed right-6 bottom-6 z-40 flex items-center gap-2 rounded-full px-4 py-3 shadow-lg transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 lg:hidden"
          onClick={() => setMobileTocOpen(true)}
          aria-label={t("toc.showContents")}
        >
          <List className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-medium">{t("toc.title")}</span>
        </button>
      )}

      {/* Mobile/Tablet TOC overlay panel */}
      {mobileTocOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileTocOpen(false)}
            aria-hidden="true"
          />
          {/* Bottom sheet */}
          <nav
            className="bg-surface absolute right-0 bottom-0 left-0 max-h-[70vh] overflow-y-auto rounded-t-2xl p-6 shadow-xl"
            aria-label={t("toc.title")}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-text text-lg font-semibold">{t("toc.title")}</h2>
              <button
                type="button"
                onClick={() => setMobileTocOpen(false)}
                aria-label={t("toc.hideContents")}
                className="text-text-muted hover:text-text rounded-lg p-1 transition-colors"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {renderTocLinks(() => setMobileTocOpen(false))}
          </nav>
        </div>
      )}
    </div>
  );
}
