import { createAdminClient } from "@/lib/db/admin";
import { blogPosts as fallbackPosts, testimonials as fallbackTestimonials, tours as fallbackTours } from "@/lib/data/content";

/**
 * Travel deals (/travel-deals) are the curated list in `content.ts`. That is
 * what the live site has always served, so their URLs stay stable. Tours
 * managed in admin are published under /tours and the home carousel instead.
 */
export async function getPublicTours() {
  return fallbackTours;
}

export async function getPublicBlogPosts() {
  try {
    const db = createAdminClient();
    const { data } = await db
      .from("blog_posts")
      .select("id, title, slug, excerpt, content, cover_image_url, is_published, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false });
    if (!data || data.length === 0) return fallbackPosts;
    return data.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content,
      cover: post.cover_image_url ?? fallbackPosts[0].cover,
      category: "Insights"
    }));
  } catch {
    return fallbackPosts;
  }
}

export async function getPublicTestimonials() {
  try {
    const db = createAdminClient();
    const { data } = await db.from("testimonials").select("name, quote, rating").eq("is_active", true);
    if (!data || data.length === 0) return fallbackTestimonials;
    return data.map((item) => ({ ...item, service: "Client Experience" }));
  } catch {
    return fallbackTestimonials;
  }
}
