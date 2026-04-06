import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";

import "@/app/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { brand } from "@/lib/mockData";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  metadataBase: new URL("https://bbtravelconsult.com"),
  title: {
    default: "B.B. Travel Consult | Global Opportunities, Made Simple",
    template: "%s | B.B. Travel Consult"
  },
  description:
    "Premium Ghanaian travel and recruitment consultancy for visa assistance, study abroad, international jobs, tours, and hotel booking services.",
  openGraph: {
    title: "B.B. Travel Consult",
    description: brand.tagline,
    type: "website",
    locale: "en_GH",
    siteName: "B.B. Travel Consult"
  },
  alternates: {
    canonical: "/"
  }
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  name: brand.name,
  slogan: brand.tagline,
  founder: brand.founder,
  telephone: brand.phone,
  email: brand.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Spintex",
    addressLocality: "Accra",
    addressCountry: "GH"
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
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
