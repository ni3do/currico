"use client";

import { useTranslations } from "next-intl";
import { Clock, Shield, Users } from "lucide-react";
import { FadeIn, StaggerChildren, StaggerItem, motion } from "@/components/ui/animations";

interface ValueProp {
  key: string;
  icon: React.ReactNode;
  iconBgClass: string;
  iconColorClass: string;
}

const valueProps: ValueProp[] = [
  {
    key: "timeSaving",
    icon: <Clock className="h-7 w-7" />,
    iconBgClass: "bg-primary-light",
    iconColorClass: "text-primary",
  },
  {
    key: "quality",
    icon: <Shield className="h-7 w-7" />,
    iconBgClass: "bg-success-light",
    iconColorClass: "text-success",
  },
  {
    key: "community",
    icon: <Users className="h-7 w-7" />,
    iconBgClass: "bg-accent-light",
    iconColorClass: "text-accent",
  },
];

export function ValueProposition() {
  const t = useTranslations("homePage.valueProposition");

  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" className="mb-12 text-center">
          <h2 className="text-text text-2xl font-semibold sm:text-3xl">{t("title")}</h2>
          <p className="text-text-muted mx-auto mt-3 max-w-2xl text-lg">{t("description")}</p>
        </FadeIn>

        <StaggerChildren
          staggerDelay={0.15}
          className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3 sm:gap-8"
        >
          {valueProps.map((prop) => (
            <StaggerItem key={prop.key}>
              <motion.div
                className="card p-8 text-center"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${prop.iconBgClass}`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className={prop.iconColorClass}>{prop.icon}</span>
                </motion.div>
                <h3 className="text-text text-lg font-bold">{t(`${prop.key}.title`)}</h3>
                <p className="text-text-muted mt-3 leading-relaxed">
                  {t(`${prop.key}.description`)}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
