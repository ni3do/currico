"use client";

import { useTranslations } from "next-intl";
import { Search, Eye, Download } from "lucide-react";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/ui/animations";

const STEPS = [
  { key: "step1", icon: Search, color: "bg-primary/10 text-primary" },
  { key: "step2", icon: Eye, color: "bg-accent/10 text-accent" },
  { key: "step3", icon: Download, color: "bg-success/10 text-success" },
] as const;

export function HowItWorks() {
  const t = useTranslations("homePage.howItWorks");

  return (
    <section aria-labelledby="how-it-works-heading" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" className="mb-12 text-center">
          <h2 id="how-it-works-heading" className="text-text text-2xl font-semibold sm:text-3xl">
            {t("title")}
          </h2>
          <p className="text-text-muted mt-3">{t("description")}</p>
        </FadeIn>

        <StaggerChildren
          staggerDelay={0.15}
          className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3"
        >
          {STEPS.map((step, index) => (
            <StaggerItem key={step.key}>
              <div className="flex flex-col items-center text-center">
                {/* Step number + icon */}
                <div className="relative mb-5">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${step.color}`}
                  >
                    <step.icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <span className="bg-primary text-text-on-accent absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
                    {index + 1}
                  </span>
                </div>

                {/* Text */}
                <h3 className="text-text mb-2 text-lg font-semibold">{t(`${step.key}.title`)}</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {t(`${step.key}.description`)}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
