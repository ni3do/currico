import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getAllPosts } from "@/lib/blog";
import { Calendar, ArrowRight } from "lucide-react";

export default async function BlogPage() {
  const t = await getTranslations("blogPage");
  const posts = getAllPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Currico Blog",
    description: t("subtitle"),
    url: `${process.env.NEXTAUTH_URL || "https://currico.siwachter.com"}/de/blog`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${process.env.NEXTAUTH_URL || "https://currico.siwachter.com"}/de`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
      },
    ],
  };

  return (
    <>
      <TopBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main id="main-content" className="bg-bg min-h-screen">
        {/* Header */}
        <section className="bg-bg-secondary border-border border-b">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            <Breadcrumb items={[{ label: t("title") }]} className="mb-3" />
            <h1 className="text-text text-3xl font-bold sm:text-4xl">{t("title")}</h1>
            <p className="text-text-secondary mt-2 text-lg">{t("subtitle")}</p>
          </div>
        </section>

        {/* Posts */}
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <p className="text-text-muted py-20 text-center">{t("noPosts")}</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group card overflow-hidden"
                >
                  {post.image && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="image-zoom object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="text-text-muted flex items-center gap-3 text-xs">
                      <span className="pill pill-primary">{post.category}</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.date).toLocaleDateString("de-CH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h2 className="text-text group-hover:text-primary mt-3 line-clamp-2 text-lg font-semibold transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-text-secondary mt-2 line-clamp-3 text-sm">{post.excerpt}</p>
                    <span className="text-primary mt-4 inline-flex items-center gap-1 text-sm font-medium">
                      {t("readMore")}
                      <ArrowRight className="arrow-slide h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
