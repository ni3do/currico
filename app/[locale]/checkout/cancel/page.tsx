"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { XCircle, ArrowLeft, ShoppingBag, HelpCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  const searchParams = useSearchParams();
  const materialId = searchParams.get("resource_id");
  const t = useTranslations("checkoutCancel");
  const tCommon = useTranslations("common");

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-4 sm:py-6">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: tCommon("breadcrumb.checkout"), href: "/materialien" },
              { label: tCommon("breadcrumb.checkoutCancel") },
            ]}
            className="mb-4"
          />

          <div className="card overflow-hidden">
            {/* Header with icon */}
            <div className="from-warning to-warning/80 relative bg-gradient-to-r px-6 py-8 text-center">
              <div className="relative">
                <div className="bg-text-on-accent/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full backdrop-blur-sm">
                  <XCircle className="text-text-on-accent h-8 w-8" />
                </div>
                <h1 className="text-text-on-accent mb-2 text-2xl font-bold sm:text-3xl">
                  {t("title")}
                </h1>
                <p className="text-text-on-accent mx-auto max-w-md opacity-90">
                  {t("description")}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6 p-6">
              {/* Reassurance message */}
              <div className="bg-bg-secondary flex items-start gap-3 rounded-xl p-4">
                <HelpCircle className="text-text-muted mt-0.5 h-5 w-5 flex-shrink-0" />
                <p className="text-text-muted text-sm">{t("reassurance")}</p>
              </div>

              {/* Action Buttons */}
              <div className="grid gap-3 sm:grid-cols-2">
                {materialId && (
                  <Link
                    href={`/materialien/${materialId}`}
                    className="group bg-primary hover:bg-primary-hover text-text-on-accent flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold shadow-md transition-all hover:shadow-lg"
                  >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    {t("actions.tryAgain")}
                  </Link>
                )}
                <Link
                  href="/materialien"
                  className={`group border-border bg-surface text-text hover:border-primary hover:bg-primary/5 flex items-center justify-center gap-2 rounded-xl border-2 px-6 py-3.5 font-semibold transition-all ${
                    !materialId ? "sm:col-span-2" : ""
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  {t("actions.browseResources")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
