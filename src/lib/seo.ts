import type { Metadata } from "next";

const DEFAULT_OG = "/seo/og-image.png";

export function buildServiceMetadata(title: string, description: string, slug: string): Metadata {
  const canonical = `/services/${slug}`;
  const fullTitle = `${title} | B.B. Travel Consult`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      images: [{ url: DEFAULT_OG, width: 1024, height: 1024, alt: "B.B. Travel Consult" }]
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [DEFAULT_OG]
    }
  };
}
