"use client";

import { useTranslations } from "next-intl";
import { Search, Eye, Download, ChevronRight } from "lucide-react";
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
          className="mx-auto flex max-w-4xl flex-col items-center gap-6 md:flex-row md:items-start md:justify-between md:gap-0"
        >
          {STEPS.map((step, index) => (
            <StaggerItem key={step.key} className="flex items-center md:flex-1">
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
                <p className="text-text-muted max-w-[220px] text-sm leading-relaxed">
                  {t(`${step.key}.description`)}
                </p>
              </div>

              {/* Connecting arrow (between steps, not after last) */}
              {index < STEPS.length - 1 && (
                <div className="text-border-subtle hidden shrink-0 px-4 md:flex md:items-center md:pt-6">
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </div>
              )}
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
