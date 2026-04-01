"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight, Download, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { blogPosts, faqs } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function InsightsFaq() {
  return (
    <Section variant="white" className="relative border-b border-slate-200">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="eyebrow mb-4 inline-block">Latest Insights</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-bb-navy leading-[1.1]">
              Know before <br />
              <span className="text-bb-gold">you go.</span>
            </h2>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-slate-500 hover:text-bb-navy flex items-center transition-colors pb-2">
            View all insights <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {blogPosts.map((post, idx) => (
            <Link 
              href={`/blog/${post.slug}`} 
              key={post.id}
              className="group bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:shadow-premium transition-all duration-300 flex flex-col relative overflow-hidden h-full"
            >
              <div className="h-48 w-full relative overflow-hidden bg-slate-100 shrink-0">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${(post as any).image}')` }}
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-bb-navy uppercase tracking-wider shadow-sm">
                  {post.category}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-4">
                  <span>{post.date}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
                </div>

                <h4 className="text-lg font-bold text-bb-navy group-hover:text-bb-gold transition-colors leading-snug mb-3">
                  {post.title}
                </h4>

                <p className="text-sm text-slate-500 font-light leading-relaxed line-clamp-3 mt-auto">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
