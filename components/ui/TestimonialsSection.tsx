"use client";

import { useTranslations } from "next-intl";
import { Quote } from "lucide-react";
import { FadeIn, StaggerChildren, StaggerItem, motion } from "@/components/ui/animations";

interface Testimonial {
  key: string;
  initials: string;
  avatarBg: string;
}

const testimonials: Testimonial[] = [
  {
    key: "testimonial1",
    initials: "SM",
    avatarBg: "bg-primary-light text-primary",
  },
  {
    key: "testimonial2",
    initials: "TK",
    avatarBg: "bg-accent-light text-accent",
  },
  {
    key: "testimonial3",
    initials: "LW",
    avatarBg: "bg-success-light text-success",
  },
];

export function TestimonialsSection() {
  const t = useTranslations("homePage.testimonials");

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" className="mb-12 text-center">
          <h2 className="text-text text-2xl font-semibold sm:text-3xl">{t("title")}</h2>
          <p className="text-text-muted mt-3">{t("description")}</p>
        </FadeIn>

        <StaggerChildren
          staggerDelay={0.15}
          className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <StaggerItem key={testimonial.key}>
              <motion.article
                className="card relative p-6"
                whileHover={{
                  y: -4,
                  scale: 1.02,
                  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                }}
              >
                {/* Quote decoration */}
                <Quote className="text-border absolute top-4 right-4 h-8 w-8 opacity-50" />

                {/* Quote text */}
                <blockquote className="text-text-muted relative mb-6 text-sm leading-relaxed italic">
                  &ldquo;{t(`${testimonial.key}.quote`)}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${testimonial.avatarBg}`}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-text text-sm font-semibold">
                      {t(`${testimonial.key}.name`)}
                    </p>
                    <p className="text-text-muted text-xs">
                      {t(`${testimonial.key}.role`)} · {t(`${testimonial.key}.location`)}
                    </p>
                  </div>
                </div>
              </motion.article>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
