import type { MetadataRoute } from "next";
import { getPublicBlogPosts, getPublicTours } from "@/lib/data/public-content";
import { services, featuredTours, blogPosts } from "@/lib/mockData";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_BASE_URL || "https://bbtravelconsult.vercel.app";
  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/start",
    "/success",
    "/tours",
    "/services/visa-assistance",
    "/services/international-recruitment",
    "/services/study-abroad",
    "/services/tour-packages",
    "/services/flight-reservations",
    "/services/hotel-booking-reservation",
    "/success-stories",
    "/travel-deals",
    "/blog",
    "/contact",
    "/start-application"
  ];
  const [dealsTours, cmsPosts] = await Promise.all([getPublicTours(), getPublicBlogPosts()]);

  const dynamicRoutes = Array.from(
    new Set([
      ...services.map((service) => `/services/${service.slug}`),
      ...featuredTours.map((tour) => `/tours/${tour.slug}`),
      ...dealsTours.map((tour) => `/travel-deals/${tour.slug}`),
      ...cmsPosts.map((post) => `/blog/${post.slug}`),
      ...blogPosts.map((post) => `/blog/${post.slug}`)
    ])
  );

  return Array.from(new Set([...staticRoutes, ...dynamicRoutes])).map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route.startsWith("/blog") ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7
  }));
}
