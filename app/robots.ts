import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXTAUTH_URL || "https://currico.siwachter.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/konto/", "/admin/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
