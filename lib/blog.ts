import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface BlogPostMeta {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  category: string;
  image: string;
  author: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function dirExists(): boolean {
  try {
    return fs.existsSync(BLOG_DIR);
  } catch {
    return false;
  }
}

export function getAllPosts(): BlogPostMeta[] {
  if (!dirExists()) return [];

  try {
    const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

    return files
      .map((filename) => {
        const filePath = path.join(BLOG_DIR, filename);
        const raw = fs.readFileSync(filePath, "utf-8");
        const { data } = matter(raw);

        return {
          title: data.title ?? "",
          slug: data.slug ?? filename.replace(/\.mdx$/, ""),
          date: data.date ?? "",
          excerpt: data.excerpt ?? "",
          category: data.category ?? "",
          image: data.image ?? "",
          author: data.author ?? "",
        } satisfies BlogPostMeta;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}

export function getPostBySlug(slug: string): BlogPost | null {
  if (!dirExists()) return null;

  try {
    const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

    for (const filename of files) {
      const filePath = path.join(BLOG_DIR, filename);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);
      const fileSlug = data.slug ?? filename.replace(/\.mdx$/, "");

      if (fileSlug === slug) {
        return {
          title: data.title ?? "",
          slug: fileSlug,
          date: data.date ?? "",
          excerpt: data.excerpt ?? "",
          category: data.category ?? "",
          image: data.image ?? "",
          author: data.author ?? "",
          content,
        };
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}
