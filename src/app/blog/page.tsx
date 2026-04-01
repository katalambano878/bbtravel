import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { blogPosts } from "@/lib/mockData";

export const metadata: Metadata = {
  title: "Insights & Strategy | The Ledger",
  description: "Read the latest legal insights, travel alerts, and strategic methodologies from our consulting team."
};

export default function BlogHubPage() {
  return (
    <>
      <Section variant="navy" className="pt-32 pb-20 md:pt-48 md:pb-32 relative overflow-hidden">
        <Container className="relative z-10 text-center">
          <span className="eyebrow mb-6 inline-block text-bb-sky">The Ledger</span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Insights, methodology, <br className="hidden md:block" />
            <span className="text-bb-gold">and hard facts.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto">
            Stay updated with tactical insights on global mobility, visa policy shifts, and recruitment trends.
          </p>
        </Container>
      </Section>

      <Section variant="white" className="border-b border-slate-200 py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-premium transition-all duration-300 flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-bb-gold transition-colors duration-300" />
                
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 mb-6 mt-2">
                  <span className="uppercase tracking-wider text-bb-navy bg-slate-100 px-3 py-1 rounded-full">{post.category}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
                </div>

                <h3 className="text-2xl font-bold text-bb-navy mb-4 group-hover:text-bb-gold transition-colors leading-snug">
                  {post.title}
                </h3>
                
                <p className="text-slate-500 font-light leading-relaxed mb-8 flex-1">
                  {post.excerpt}
                </p>

                <div className="flex items-center text-sm font-semibold text-bb-navy mt-auto group-hover:text-bb-gold transition-colors">
                  Read Analysis <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
