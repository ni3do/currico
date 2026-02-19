import Script from "next/script";

const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const plausibleUrl = process.env.NEXT_PUBLIC_PLAUSIBLE_URL;

export default function PlausibleProvider() {
  if (!domain || !plausibleUrl) return null;

  return (
    <Script strategy="afterInteractive" data-domain={domain} src={`${plausibleUrl}/js/script.js`} />
  );
}
