"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

export default function CheckoutCancelPage() {
  const searchParams = useSearchParams();
  const resourceId = searchParams.get("resource_id");
  const t = useTranslations("checkoutCancel");

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="card p-8 text-center">
            {/* Cancel Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-warning-light)]">
              <svg
                className="h-8 w-8 text-[var(--color-warning)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Title and Description */}
            <h1 className="mb-2 text-2xl font-bold text-[var(--color-text)]">
              {t("title")}
            </h1>
            <p className="mb-6 text-[var(--color-text-muted)]">
              {t("description")}
            </p>

            {/* Reassurance */}
            <div className="mb-8 rounded-lg bg-[var(--color-bg-secondary)] p-4">
              <p className="text-sm text-[var(--color-text-muted)]">
                {t("reassurance")}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              {resourceId ? (
                <Link
                  href={`/resources/${resourceId}`}
                  className="btn btn-primary px-6 py-2"
                >
                  {t("actions.tryAgain")}
                </Link>
              ) : null}
              <Link
                href="/resources"
                className={`btn ${resourceId ? "btn-secondary" : "btn-primary"} px-6 py-2`}
              >
                {t("actions.browseResources")}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
