import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "following" });
  return {
    title: t("followedProfiles"),
    description: t("noFollowingDescription"),
  };
}

export default function FollowingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
