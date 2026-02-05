"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FadeIn, StaggerChildren, StaggerItem, motion } from "@/components/ui/animations";
import {
  BookOpen,
  Calculator,
  Leaf,
  Languages,
  Music,
  Palette,
  Monitor,
  Dumbbell,
} from "lucide-react";

interface SubjectCategory {
  key: string;
  icon: React.ReactNode;
  pillClass: string;
  queryParam: string;
}

const categories: SubjectCategory[] = [
  {
    key: "deutsch",
    icon: <BookOpen className="h-6 w-6" />,
    pillClass: "pill-deutsch",
    queryParam: "Deutsch",
  },
  {
    key: "mathematik",
    icon: <Calculator className="h-6 w-6" />,
    pillClass: "pill-mathe",
    queryParam: "Mathematik",
  },
  {
    key: "nmg",
    icon: <Leaf className="h-6 w-6" />,
    pillClass: "pill-nmg",
    queryParam: "NMG",
  },
  {
    key: "englisch",
    icon: <Languages className="h-6 w-6" />,
    pillClass: "pill-englisch",
    queryParam: "Englisch",
  },
  {
    key: "franzoesisch",
    icon: <Languages className="h-6 w-6" />,
    pillClass: "pill-franzoesisch",
    queryParam: "Französisch",
  },
  {
    key: "musik",
    icon: <Music className="h-6 w-6" />,
    pillClass: "pill-musik",
    queryParam: "Musik",
  },
  {
    key: "gestalten",
    icon: <Palette className="h-6 w-6" />,
    pillClass: "pill-gestalten",
    queryParam: "Bildnerisches Gestalten",
  },
  {
    key: "medien",
    icon: <Monitor className="h-6 w-6" />,
    pillClass: "pill-medien",
    queryParam: "Medien & Informatik",
  },
];

export function CategoryQuickAccess() {
  const t = useTranslations("homePage.categoryQuickAccess");

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" className="mb-8 text-center">
          <h2 className="text-text text-2xl font-semibold">{t("title")}</h2>
          <p className="text-text-muted mt-2">{t("description")}</p>
        </FadeIn>

        {/* Mobile: horizontal scroll */}
        <div className="sm:hidden">
          <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-4">
            {categories.map((category) => (
              <Link
                key={category.key}
                href={`/resources?subject=${encodeURIComponent(category.queryParam)}`}
                className="flex-shrink-0"
              >
                <motion.div
                  className="card flex h-24 w-28 flex-col items-center justify-center gap-2 p-3"
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${category.pillClass}`}
                  >
                    {category.icon}
                  </div>
                  <span className="text-text text-center text-xs font-medium">
                    {t(`subjects.${category.key}`)}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tablet and Desktop: grid */}
        <StaggerChildren
          staggerDelay={0.05}
          variant="grid"
          className="hidden grid-cols-2 gap-4 sm:grid md:grid-cols-4"
        >
          {categories.map((category) => (
            <StaggerItem key={category.key} variant="card">
              <Link
                href={`/resources?subject=${encodeURIComponent(category.queryParam)}`}
                className="block"
              >
                <motion.div
                  className="card flex flex-col items-center gap-3 p-6"
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${category.pillClass}`}
                  >
                    {category.icon}
                  </div>
                  <span className="text-text text-center text-sm font-medium">
                    {t(`subjects.${category.key}`)}
                  </span>
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
