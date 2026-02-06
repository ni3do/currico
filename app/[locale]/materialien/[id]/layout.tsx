import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const isDE = locale === "de";

  try {
    const material = await prisma.resource.findUnique({
      where: { id },
      select: {
        title: true,
        description: true,
        preview_url: true,
      },
    });

    if (!material) {
      return {
        title: isDE ? "Material nicht gefunden" : "Material not found",
      };
    }

    const description = material.description?.slice(0, 160) || "";

    return {
      title: material.title,
      description,
      openGraph: {
        title: `${material.title} | Currico`,
        description,
        type: "article",
        ...(material.preview_url && {
          images: [
            {
              url: material.preview_url,
              width: 1200,
              height: 630,
              alt: material.title,
            },
          ],
        }),
      },
      twitter: {
        card: material.preview_url ? "summary_large_image" : "summary",
        title: material.title,
        description,
        ...(material.preview_url && { images: [material.preview_url] }),
      },
      alternates: {
        canonical: `/${locale}/materialien/${id}`,
        languages: {
          de: `/de/materialien/${id}`,
          en: `/en/materialien/${id}`,
        },
      },
    };
  } catch {
    return {
      title: isDE ? "Material" : "Material",
    };
  }
}

export default function MaterialDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
