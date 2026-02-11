"use client";

import { useTranslations } from "next-intl";
import { BadgeCheck, Shield, Server, CreditCard, ShieldCheck } from "lucide-react";
import { FadeIn, StaggerChildren, StaggerItem, motion } from "@/components/ui/animations";

interface TrustItem {
  key: string;
  icon: React.ReactNode;
  labelKey: string;
}

const trustItems: TrustItem[] = [
  {
    key: "lp21",
    icon: <BadgeCheck className="text-success h-5 w-5" aria-hidden="true" />,
    labelKey: "lp21",
  },
  {
    key: "quality",
    icon: <Shield className="text-success h-5 w-5" aria-hidden="true" />,
    labelKey: "quality",
  },
  {
    key: "hosting",
    icon: (
      <span className="relative">
        <Server className="text-primary h-5 w-5" aria-hidden="true" />
        <svg
          className="absolute -right-1 -top-1 h-3 w-3"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <rect width="32" height="32" rx="4" fill="#FF0000" />
          <rect x="13" y="6" width="6" height="20" rx="1" fill="white" />
          <rect x="6" y="13" width="20" height="6" rx="1" fill="white" />
        </svg>
      </span>
    ),
    labelKey: "hosting",
  },
  {
    key: "ndsg",
    icon: <ShieldCheck className="text-primary h-5 w-5" aria-hidden="true" />,
    labelKey: "ndsg",
  },
  {
    key: "securePay",
    icon: <CreditCard className="text-success h-5 w-5" aria-hidden="true" />,
    labelKey: "securePay",
  },
];

export function TrustBar() {
  const t = useTranslations("homePage.trustBar");

  return (
    <section className="bg-surface border-border-subtle border-y py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <StaggerChildren
            staggerDelay={0.1}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 md:gap-12"
          >
            {trustItems.map((item) => (
              <StaggerItem key={item.key}>
                <motion.div
                  className="text-text-muted flex items-center gap-2 text-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.icon}
                  <span className="whitespace-nowrap">{t(item.labelKey)}</span>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </FadeIn>
      </div>
    </section>
  );
}
