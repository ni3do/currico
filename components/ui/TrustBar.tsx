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
    icon: <BadgeCheck className="text-success h-5 w-5" />,
    labelKey: "lp21",
  },
  {
    key: "quality",
    icon: <Shield className="text-success h-5 w-5" />,
    labelKey: "quality",
  },
  {
    key: "hosting",
    icon: <Server className="text-primary h-5 w-5" />,
    labelKey: "hosting",
  },
  {
    key: "securePay",
    icon: <CreditCard className="text-success h-5 w-5" />,
    labelKey: "securePay",
  },
  {
    key: "ndsg",
    icon: <ShieldCheck className="text-primary h-5 w-5" />,
    labelKey: "ndsg",
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
