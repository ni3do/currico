import { setRequestLocale } from "next-intl/server";
import ContactClient from "./ContactClient";

type Props = {
  params: Promise<{ locale: string }>;
};

// Force dynamic rendering to avoid prerendering issues with next-intl
export const dynamic = "force-dynamic";

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ContactClient />;
}
