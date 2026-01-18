"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Coins,
  Users,
  Upload,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface SellerHeroSectionProps {
  className?: string;
}

export function SellerHeroSection({ className = "" }: SellerHeroSectionProps) {
  const t = useTranslations("sellerHero");
  const tCalc = useTranslations("earningsCalculator");

  // Calculator state
  const [materialsPerMonth, setMaterialsPerMonth] = useState(25);
  const [averagePrice, setAveragePrice] = useState(15);

  const COMMISSION_RATE = 0.7;

  const yearlyEarnings = useMemo(() => {
    return materialsPerMonth * averagePrice * 12 * COMMISSION_RATE;
  }, [materialsPerMonth, averagePrice]);

  const monthlyEarnings = useMemo(() => {
    return materialsPerMonth * averagePrice * COMMISSION_RATE;
  }, [materialsPerMonth, averagePrice]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate slider fill percentage for visual styling
  const materialsPercent = ((materialsPerMonth - 1) / (100 - 1)) * 100;
  const pricePercent = ((averagePrice - 1) / (50 - 1)) * 100;

  const features = [
    {
      icon: <Coins className="h-5 w-5" />,
      title: t("features.commission.title"),
      description: t("features.commission.description"),
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: t("features.community.title"),
      description: t("features.community.description"),
    },
    {
      icon: <Upload className="h-5 w-5" />,
      title: t("features.curriculum.title"),
      description: t("features.curriculum.description"),
    },
  ];

  return (
    <section className={`seller-hero-premium relative overflow-hidden ${className}`}>
      {/* Rich gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f172a]" />

      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-teal-500/20 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[80px]" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">

          {/* Left Side - Text Content */}
          <div className="lg:col-span-6">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-white/90">
                70% Provision für Sie
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("headline")}
            </h1>

            {/* Subheadline */}
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">
              {t("subheadline")}
            </p>

            {/* Feature List */}
            <div className="mt-10 space-y-5">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 text-blue-400 ring-1 ring-white/10">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="mt-1 text-sm text-white/60">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Note */}
            <p className="mt-10 flex items-center gap-2 text-sm text-white/50">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              {t("freeNote")}
            </p>
          </div>

          {/* Right Side - Premium Calculator Card */}
          <div className="lg:col-span-6">
            <div className="relative">
              {/* Glow effect behind card */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/20 via-teal-500/20 to-blue-500/20 blur-2xl" />

              {/* Card */}
              <div className="relative rounded-3xl border border-white/10 bg-white p-8 shadow-2xl lg:p-10">
                {/* Card Header */}
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                    {tCalc("title")}
                  </h2>
                  <p className="mt-2 text-gray-500">
                    {tCalc("subtitle")}
                  </p>
                </div>

                {/* Sliders */}
                <div className="space-y-8">
                  {/* Materials per Month */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        {tCalc("materialsLabel")}
                      </label>
                      <span className="rounded-lg bg-blue-50 px-3 py-1 text-lg font-bold text-blue-600">
                        {materialsPerMonth}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={materialsPerMonth}
                        onChange={(e) => setMaterialsPerMonth(Number(e.target.value))}
                        className="premium-slider w-full"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${materialsPercent}%, #e5e7eb ${materialsPercent}%, #e5e7eb 100%)`,
                        }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-400">
                      <span>1</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                  </div>

                  {/* Average Price */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        {tCalc("priceLabel")}
                      </label>
                      <span className="rounded-lg bg-blue-50 px-3 py-1 text-lg font-bold text-blue-600">
                        {formatCurrency(averagePrice)}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={averagePrice}
                        onChange={(e) => setAveragePrice(Number(e.target.value))}
                        className="premium-slider w-full"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${pricePercent}%, #e5e7eb ${pricePercent}%, #e5e7eb 100%)`,
                        }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-400">
                      <span>CHF 1</span>
                      <span>CHF 25</span>
                      <span>CHF 50</span>
                    </div>
                  </div>
                </div>

                {/* Earnings Display */}
                <div className="mt-10 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center ring-1 ring-emerald-100">
                  <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
                    {tCalc("yearlyEarnings")}
                  </p>
                  <p className="mt-3 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-5xl font-extrabold text-transparent lg:text-6xl">
                    {formatCurrency(yearlyEarnings)}
                  </p>
                  <p className="mt-3 text-sm text-gray-500">
                    {tCalc("monthlyBreakdown", { amount: formatCurrency(monthlyEarnings) })}
                  </p>
                </div>

                {/* Commission Note */}
                <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gray-50 p-4">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                  <p className="text-sm text-gray-600">
                    {tCalc("commissionNote")}
                  </p>
                </div>

                {/* CTA Button */}
                <Link
                  href="/become-seller"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  {tCalc("ctaButton")}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SellerHeroSection;
