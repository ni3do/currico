"use client";

import { ReactNode } from "react";

interface HeroWithOverlapProps {
  /** Main headline text */
  headline: string;
  /** Subheadline text */
  subheadline?: string;
  /** The card content to display in the overlapping position */
  children: ReactNode;
  /** Additional class names for the hero section */
  heroClassName?: string;
  /** Additional class names for the card container */
  cardClassName?: string;
  /** Maximum width of the floating card (default: max-w-lg) */
  cardMaxWidth?: string;
}

export function HeroWithOverlap({
  headline,
  subheadline,
  children,
  heroClassName = "",
  cardClassName = "",
  cardMaxWidth = "max-w-lg",
}: HeroWithOverlapProps) {
  return (
    <div className="hero-overlap-wrapper">
      {/* Hero Section */}
      <section
        className={`hero-overlap-hero relative overflow-hidden px-6 pb-36 pt-16 text-center md:pb-44 md:pt-20 ${heroClassName}`}
        style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, #1e40af 100%)",
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)
            `,
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            {headline}
          </h1>
          {subheadline && (
            <p className="mx-auto mt-4 max-w-xl text-base text-white/85 md:text-lg">
              {subheadline}
            </p>
          )}
        </div>
      </section>

      {/* Floating Card Container - The Overlap Effect */}
      <div
        className={`hero-overlap-card relative z-20 mx-auto -mt-24 px-4 md:-mt-32 md:px-6 ${cardMaxWidth} ${cardClassName}`}
      >
        {children}
      </div>
    </div>
  );
}

export default HeroWithOverlap;
