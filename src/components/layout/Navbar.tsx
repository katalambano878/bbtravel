"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, MessageCircle, ArrowRight } from "lucide-react";

import { brand, services } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { Container } from "./Container";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm py-3" 
            : "bg-transparent py-5"
        )}
      >
        <Container>
          <div className="flex items-center justify-between">
            {/* Logo area */}
            <Link href="/" className="flex flex-col group relative z-50">
              <span className={cn(
                "text-xl md:text-2xl font-bold tracking-tight transition-colors",
                isScrolled ? "text-bb-navy" : "text-white"
              )}>
                {brand.name}
              </span>
              <span className={cn(
                "text-[10px] md:text-xs font-medium tracking-widest uppercase opacity-80 transition-colors",
                isScrolled ? "text-slate-500" : "text-slate-300"
              )}>
                {brand.tagline}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link 
                href="/about" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-bb-gold",
                  isScrolled ? "text-slate-600" : "text-slate-200"
                )}
              >
                About
              </Link>

              {/* Mega Menu Trigger */}
              <div 
                className="relative group"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <button className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors hover:text-bb-gold py-2",
                  isScrolled ? "text-slate-600" : "text-slate-200"
                )}>
                  Services
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Mega Menu Dropdown */}
                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] pt-4"
                    >
                      <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-6 grid grid-cols-2 gap-x-8 gap-y-6">
                        {services.map((service) => (
                          <Link 
                            key={service.slug} 
                            href={`/services/${service.slug}`}
                            className="group flex flex-col gap-1"
                          >
                            <span className="text-sm font-semibold text-bb-navy group-hover:text-bb-gold transition-colors flex items-center gap-2">
                              {service.title}
                            </span>
                            <span className="text-xs text-slate-500 leading-snug">
                              {service.shortDescription}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link 
                href="/tours" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-bb-gold",
                  isScrolled ? "text-slate-600" : "text-slate-200"
                )}
              >
                Tours
              </Link>
              <Link 
                href="/success" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-bb-gold",
                  isScrolled ? "text-slate-600" : "text-slate-200"
                )}
              >
                Success
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4 relative z-50">
              <a 
                href={`https://wa.me/${brand.whatsapp.replace(/\\D/g, "")}`} 
                target="_blank" 
                rel="noreferrer"
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border transition-colors hover:bg-bb-gold hover:text-white hover:border-bb-gold",
                  isScrolled ? "border-slate-200 text-slate-600" : "border-white/20 text-white"
                )}
                aria-label="Contact via WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <Button asChild className="bg-bb-gold text-white hover:bg-[#b08f43] rounded-full px-6 shadow-[0_0_20px_rgba(200,164,93,0.3)]">
                <Link href="/start">
                  Start Application
                </Link>
              </Button>
            </div>

            {/* Mobile Toggle */}
            <button
              className={cn(
                "lg:hidden p-2 -mr-2 relative z-50 transition-colors",
                isScrolled ? "text-bb-navy" : "text-white"
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-bb-navy" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-white"
          >
            <div className="flex flex-col h-full pt-24 pb-8 px-6">
              <nav className="flex flex-col gap-6 flex-1 overflow-y-auto">
                <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-bb-navy">About Us</Link>
                
                <div className="flex flex-col gap-4">
                  <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Services</span>
                  {services.map((service) => (
                    <Link 
                      key={service.slug} 
                      href={`/services/${service.slug}`}
                      onClick={() => setMobileMenuOpen(false)} 
                      className="text-lg font-medium text-slate-700 pl-4 border-l-2 border-slate-100"
                    >
                      {service.title}
                    </Link>
                  ))}
                </div>

                <Link href="/tours" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-bb-navy mt-4">Tours</Link>
                <Link href="/success" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-bb-navy">Success Stories</Link>
                <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-bb-navy">Insights & FAQ</Link>
              </nav>

              <div className="pt-8 flex flex-col gap-4 border-t border-slate-100 mt-auto">
                <Button asChild className="w-full h-14 text-lg bg-bb-navy text-white rounded-xl">
                  <Link href="/start" onClick={() => setMobileMenuOpen(false)}>
                    Start Application <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="secondary" asChild className="w-full h-14 text-lg border-slate-200 text-slate-600 rounded-xl">
                  <a href={`https://wa.me/${brand.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="w-5 h-5 mr-2 text-bb-gold" /> Chat on WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
