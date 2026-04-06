import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

import { blogPosts } from "@/lib/mockData";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) return { title: "Insight Not Found" };
  return {
    title: `${post.title} | Insights`,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${params.slug}`
    },
    openGraph: {
      title: `${post.title} | Insights`,
      description: post.excerpt,
      url: `/blog/${params.slug}`,
      images: [{ url: "/seo/og-image.png", width: 1024, height: 1024, alt: "B.B. Travel Consult" }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Insights`,
      description: post.excerpt,
      images: ["/seo/og-image.png"]
    }
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) notFound();

  return (
    <>
      <Section variant="white" className="pt-32 pb-20 md:pt-48 border-b border-slate-200">
        <Container className="max-w-3xl">
          <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-bb-navy transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Insights
          </Link>
          
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 mb-6">
            <span className="uppercase tracking-wider text-bb-gold bg-bb-gold/10 px-3 py-1 rounded-full">{post.category}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-bb-navy mb-8 leading-[1.1]">
            {post.title}
          </h1>

          <div className="prose prose-slate prose-lg prose-headings:text-bb-navy prose-a:text-bb-sky max-w-none font-light text-slate-600 leading-relaxed">
            <p className="text-xl font-normal text-slate-500 mb-8 border-l-4 border-bb-gold pl-6">
              {post.excerpt}
            </p>
            {/* Mock Article Content */}
            <p>
              In the dynamic landscape of global immigration and premium travel, staying informed is not just an advantage; it is a necessity. Our analysts have observed significant shifts following the recent policy updates, impacting the timelines and structural requirements for applicants globally.
            </p>
            <p>
              To eliminate friction, we strongly advise a proactive document gathering phase. As wait times for verification scale up globally, applicants equipped with absolute, verifiable documentation preemptively resolve 80% of typical bottlenecks. The hallmark of a successful application is zero ambiguity.
            </p>
            <p>
              Moving forward, our strategy continues to adapt. We remain structurally aligned with embassy expectations, shifting from narrative-based appeals to heavily digitized, data-centric proof of intent. If you have concerns regarding these impending shifts, schedule a strategic review with our senior consultants today.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
