import type { MetadataRoute } from "next";
import { getPublicBlogPosts, getPublicTours } from "@/lib/data/public-content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_BASE_URL || "https://bbtravelconsult.com";
  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/services/visa-assistance",
    "/services/international-recruitment",
    "/services/study-abroad",
    "/services/tour-packages",
    "/services/business-export-facilitation",
    "/success-stories",
    "/travel-deals",
    "/blog",
    "/contact",
    "/start-application"
  ];
  const [tours, posts] = await Promise.all([getPublicTours(), getPublicBlogPosts()]);

  const dynamicRoutes = [
    ...tours.map((tour) => `/travel-deals/${tour.slug}`),
    ...posts.map((post) => `/blog/${post.slug}`)
  ];

  return [...staticRoutes, ...dynamicRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route.startsWith("/blog") ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7
  }));
}
