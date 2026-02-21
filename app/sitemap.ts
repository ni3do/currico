import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getAllPosts } from "@/lib/blog";

const BASE_URL = process.env.AUTH_URL || "https://currico.ch";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages with German slugs
  const staticPages = [
    "",
    "/materialien",
    "/hilfe",
    "/ueber-uns",
    "/kontakt",
    "/anmelden",
    "/registrieren",
    "/impressum",
    "/datenschutz",
    "/agb",
    "/cookie-richtlinien",
    "/urheberrecht",
    "/verkaeufer-stufen",
    "/verifizierter-verkaeufer",
    "/verkaeufer-werden",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${BASE_URL}/de${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1.0 : path === "/materialien" ? 0.9 : 0.7,
    alternates: {
      languages: {
        de: `${BASE_URL}/de${path}`,
        en: `${BASE_URL}/en${path}`,
      },
    },
  }));

  // Dynamic material pages
  let materialEntries: MetadataRoute.Sitemap = [];
  try {
    const materials = await prisma.resource.findMany({
      where: { status: "VERIFIED" },
      select: { id: true, updated_at: true },
      orderBy: { updated_at: "desc" },
      take: 5000,
    });

    materialEntries = materials.map((m: { id: string; updated_at: Date }) => ({
      url: `${BASE_URL}/de/materialien/${m.id}`,
      lastModified: m.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          de: `${BASE_URL}/de/materialien/${m.id}`,
          en: `${BASE_URL}/en/materialien/${m.id}`,
        },
      },
    }));
  } catch {
    // DB unavailable — return static pages only
  }

  // Dynamic profile pages
  let profileEntries: MetadataRoute.Sitemap = [];
  try {
    const users = await prisma.user.findMany({
      where: {
        is_private: false,
        role: { in: ["SELLER", "ADMIN"] },
      },
      select: { id: true, updated_at: true },
      take: 5000,
    });

    profileEntries = users.map((u: { id: string; updated_at: Date }) => ({
      url: `${BASE_URL}/de/profil/${u.id}`,
      lastModified: u.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      alternates: {
        languages: {
          de: `${BASE_URL}/de/profil/${u.id}`,
          en: `${BASE_URL}/en/profil/${u.id}`,
        },
      },
    }));
  } catch {
    // DB unavailable — skip profiles
  }

  // Dynamic blog post pages
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = getAllPosts();
    blogEntries = posts.map((post) => ({
      url: `${BASE_URL}/de/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: {
        languages: {
          de: `${BASE_URL}/de/blog/${post.slug}`,
          en: `${BASE_URL}/en/blog/${post.slug}`,
        },
      },
    }));
  } catch {
    // Blog directory unavailable — skip
  }

  return [...staticEntries, ...materialEntries, ...profileEntries, ...blogEntries];
}
