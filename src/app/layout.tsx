import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";

import "@/app/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { brand } from "@/lib/mockData";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const siteUrl = process.env.APP_BASE_URL || "https://bbtravelconsult.com";
const ogImagePath = "/seo/og-image.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "B.B. Travel Consult | Global Opportunities, Made Simple",
    template: "%s | B.B. Travel Consult"
  },
  description:
    "Premium Ghanaian travel and recruitment consultancy for visa assistance, study abroad, international jobs, tours, and hotel booking services.",
  keywords: [
    "B.B. Travel Consult",
    "Travel agency Ghana",
    "Visa assistance Ghana",
    "Study abroad Ghana",
    "International recruitment Ghana",
    "Tour packages Ghana",
    "Flight reservation Ghana",
    "Hotel booking Ghana",
    "Travel consultant Accra"
  ],
  creator: "B.B. Travel Consult",
  publisher: "B.B. Travel Consult",
  category: "Travel",
  applicationName: "B.B. Travel Consult",
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1
    }
  },
  openGraph: {
    title: "B.B. Travel Consult | Global Opportunities, Made Simple",
    description: brand.tagline,
    type: "website",
    url: "/",
    locale: "en_GH",
    siteName: "B.B. Travel Consult",
    images: [
      {
        url: ogImagePath,
        width: 1024,
        height: 1024,
        alt: "B.B. Travel Consult official brand mark"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "B.B. Travel Consult | Global Opportunities, Made Simple",
    description: brand.tagline,
    images: [ogImagePath]
  },
  alternates: {
    canonical: "/"
  },
  other: {
    "geo.region": "GH-AA",
    "geo.placename": "Accra"
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon-32x32.png"]
  }
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  name: brand.name,
  slogan: brand.tagline,
  founder: brand.founder,
  logo: `${siteUrl}${ogImagePath}`,
  image: `${siteUrl}${ogImagePath}`,
  url: siteUrl,
  telephone: [brand.phone, brand.secondaryPhone],
  email: brand.email,
  identifier: brand.digitalAddress,
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: brand.phone,
      contactType: "customer service",
      areaServed: "GH"
    },
    {
      "@type": "ContactPoint",
      telephone: brand.secondaryPhone,
      contactType: "customer service",
      areaServed: "GH"
    }
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: `${brand.address} (${brand.digitalAddress})`,
    addressLocality: "Accra",
    addressCountry: "GH"
  }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "B.B. Travel Consult",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/services?query={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sora.variable} min-h-screen bg-background font-sans`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
