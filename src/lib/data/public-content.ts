import { createClient as createServerClient } from "@/lib/supabase/server";
import { blogPosts as fallbackPosts, testimonials as fallbackTestimonials, tours as fallbackTours } from "@/lib/data/content";

export async function getPublicTours() {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("tours")
      .select("id, title, slug, price, duration, itinerary, images, is_active")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (!data || data.length === 0) return fallbackTours;
    return data.map((tour) => ({
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      price: Number(tour.price),
      duration: tour.duration,
      summary: "Premium curated package designed for comfort and transparency.",
      destination: "International Destination",
      cover: Array.isArray(tour.images) && tour.images.length > 0 ? String(tour.images[0]) : fallbackTours[0].cover,
      itinerary: Array.isArray(tour.itinerary) ? tour.itinerary.map(String) : []
    }));
  } catch {
    return fallbackTours;
  }
}

export async function getPublicBlogPosts() {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
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
    const supabase = await createServerClient();
    const { data } = await supabase.from("testimonials").select("name, quote, rating").eq("is_active", true);
    if (!data || data.length === 0) return fallbackTestimonials;
    return data.map((item) => ({ ...item, service: "Client Experience" }));
  } catch {
    return fallbackTestimonials;
  }
}
