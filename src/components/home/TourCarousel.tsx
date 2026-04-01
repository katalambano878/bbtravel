"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin, Clock } from "lucide-react";

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { featuredTours } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function TourCarousel() {
  return (
    <Section variant="white" className="overflow-hidden">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <span className="eyebrow mb-4 inline-block">Exclusive Packages</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-bb-navy leading-[1.1]">
              Curated escapes for <br />
              <span className="text-bb-gold">global citizens.</span>
            </h2>
          </div>
          <Button variant="secondary" asChild className="hidden md:flex rounded-xl shrink-0 border-slate-200 text-slate-600 hover:text-bb-navy">
            <Link href="/tours">View All Destinations</Link>
          </Button>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pb-12">
          {featuredTours.map((tour, idx) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="w-full h-[380px] rounded-[2rem] overflow-hidden group relative flex flex-col justify-end shadow-sm hover:shadow-premium"
            >
              {/* Background Image & Overlays */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                style={{ backgroundImage: `url(${tour.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Price Tag (Top Right) */}
              <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-lg border border-white/20">
                <span className="text-[13px] font-bold text-bb-navy">{tour.priceRange}</span>
              </div>

              {/* Content block */}
              <div className="relative z-10 p-6 pt-0 transition-transform duration-500 translate-y-8 group-hover:translate-y-0">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-bb-gold tracking-widest uppercase">
                    <MapPin className="w-3 h-3" /> {tour.destination}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 tracking-widest uppercase">
                    <Clock className="w-3 h-3" /> {tour.durationDays} Days
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-bb-gold transition-colors">{tour.title}</h3>
                
                {/* Expandable Section */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden h-0 group-hover:h-auto">
                  <ul className="space-y-1.5 mb-5 mt-3">
                    {tour.highlights.slice(0, 2).map((highlight, i) => (
                      <li key={i} className="flex gap-2 text-slate-300 text-[13px] font-light">
                        <ArrowRight className="w-3.5 h-3.5 text-bb-gold shrink-0 mt-0.5" /> 
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  <Button asChild className="w-full bg-bb-gold text-bb-navy hover:bg-white rounded-xl h-10 text-sm font-bold transition-all shadow-md hover:shadow-xl">
                    <Link href={`/tours/${tour.slug}`}>View Itinerary</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <Button variant="secondary" asChild className="w-full md:hidden mt-4 rounded-xl border-slate-200 text-slate-700 h-12">
          <Link href="/tours">View All Destinations</Link>
        </Button>
      </Container>
    </Section>
  );
}
