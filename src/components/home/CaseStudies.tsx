"use client";

import { motion } from "framer-motion";
import { Star, Quote, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { testimonials } from "@/lib/mockData";

export function CaseStudies() {
  return (
    <Section className="relative border-y border-slate-200/50 py-24 overflow-hidden">
      {/* Background Image with Parallax */}
      <div 
        className="absolute inset-0 bg-[url('/images/page-hero/services.webp')] bg-cover bg-center bg-scroll md:bg-fixed"
      />
      {/* 40% Dark Overlay */}
      <div className="absolute inset-0 bg-bb-navy/40" />

      <Container className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-20">
          <div className="max-w-xl">
            <span className="eyebrow mb-4 inline-block text-bb-gold/90">Client Success</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
              Real challenges. <br />
              <span className="text-bb-gold">Strategic execution.</span>
            </h2>
          </div>
          <p className="text-white/80 font-light max-w-sm text-lg leading-relaxed pb-2">
            We don't sell hope. Here's exactly what our clients have to say about the results we deliver.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-700 ease-out flex flex-col group relative overflow-hidden"
            >
              <div className="mb-4">
                <svg className="w-6 h-6 text-bb-gold/60" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.232 8.96 7.328 8.96 4.288 0 7.616-3.52 7.616-7.712 0-4.16-3.136-7.36-6.88-7.36-.64 0-1.216.096-1.728.256.448-3.072 2.656-6.624 5.92-9.6L9.352 4zm14.496 0c-4.896 3.456-8.352 9.12-8.352 15.36 0 5.088 3.232 8.96 7.328 8.96 4.288 0 7.616-3.52 7.616-7.712 0-4.16-3.136-7.36-6.88-7.36-.64 0-1.216.096-1.728.256.448-3.072 2.656-6.624 5.92-9.6z" />
                </svg>
              </div>

              <blockquote className="text-slate-600 text-[15px] leading-relaxed font-light mb-6 flex-1 italic">
                "{testimonial.quote}"
              </blockquote>

              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200">
                  <img src={testimonial.avatar} alt={testimonial.client} className="w-full h-full object-cover grayscale opacity-90 transition-all group-hover:grayscale-0 group-hover:opacity-100" />
                </div>
                <div>
                  <h4 className="font-bold text-bb-navy text-sm">{testimonial.client}</h4>
                  <p className="text-xs text-slate-500 font-light">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button variant="secondary" asChild className="rounded-xl border-white/20 bg-white/10 hover:bg-white text-white hover:text-bb-navy backdrop-blur-md transition-all h-14 px-8 text-base shadow-glass group">
            <Link href="/success">Read more success stories <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" /></Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
