"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Phone, ArrowRight } from "lucide-react";

import { brand, services } from "@/lib/mockData";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Tours", href: "/tours" },
  { label: "Success", href: "/success" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setServicesOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setServicesOpen(false), 150);
  };

  return (
    <>
      <header
        data-navbar
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between">

            {/* ── Logo ── */}
            <Link href="/" className="relative z-50 flex items-center group">
              <img 
                src="/images/logo.png" 
                alt="B.B. Travel Consult Logo" 
                className={cn(
                  "h-10 md:h-12 w-auto object-contain transition-all duration-300 group-hover:scale-105",
                  !isScrolled && "brightness-0 invert drop-shadow-md"
                )}
              />
            </Link>

            {/* ── Desktop Navigation ── */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/about"
                className={cn(
                  "px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-200",
                  isScrolled
                    ? "text-slate-600 hover:text-bb-navy hover:bg-slate-50"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                About
              </Link>

              {/* Services Dropdown */}
              <div
                className="relative"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-200",
                    isScrolled
                      ? "text-slate-600 hover:text-bb-navy hover:bg-slate-50"
                      : "text-white/80 hover:text-white hover:bg-white/10",
                    servicesOpen && (isScrolled ? "bg-slate-50 text-bb-navy" : "bg-white/10 text-white")
                  )}
                >
                  Services
                  <ChevronDown className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    servicesOpen && "rotate-180"
                  )} />
                </button>

                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-0 w-[320px] pt-2"
                    >
                      <div className="bg-white rounded-xl shadow-lg border border-slate-100/80 py-2 overflow-hidden">
                        {services.map((service, i) => (
                          <Link
                            key={service.slug}
                            href={`/services/${service.slug}`}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
                          >
                            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-bb-navy/5 flex items-center justify-center text-bb-navy text-xs font-bold mt-0.5">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium text-slate-800 group-hover:text-bb-navy transition-colors truncate">
                                {service.title}
                              </span>
                              <span className="text-xs text-slate-400 leading-snug line-clamp-1">
                                {service.shortDescription}
                              </span>
                            </div>
                          </Link>
                        ))}

                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <Link
                            href="/services"
                            className="flex items-center gap-2 px-4 py-3 text-xs font-medium text-bb-gold hover:bg-bb-gold/5 transition-colors"
                          >
                            View all services
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/tours"
                className={cn(
                  "px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-200",
                  isScrolled
                    ? "text-slate-600 hover:text-bb-navy hover:bg-slate-50"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                Tours
              </Link>

              <Link
                href="/success"
                className={cn(
                  "px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-200",
                  isScrolled
                    ? "text-slate-600 hover:text-bb-navy hover:bg-slate-50"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                Success
              </Link>
            </nav>

            {/* ── Desktop Actions ── */}
            <div className="hidden lg:flex items-center gap-3 relative z-50">
              <a
                href={`tel:${brand.phone}`}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-[13px] font-medium rounded-lg transition-all duration-200",
                  isScrolled
                    ? "text-slate-500 hover:text-bb-navy hover:bg-slate-50"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{brand.phone} / {brand.secondaryPhone}</span>
              </a>

              <Link
                href="/start"
                className="flex items-center gap-2 px-5 py-2.5 bg-bb-gold text-white text-[13px] font-semibold rounded-lg hover:bg-[#b08f43] transition-all duration-200 shadow-sm"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* ── Mobile Toggle ── */}
            <button
              className={cn(
                "lg:hidden relative z-50 p-2 -mr-2 rounded-lg transition-colors",
                mobileMenuOpen
                  ? "text-slate-800"
                  : isScrolled ? "text-bb-navy" : "text-white"
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-40 w-[85%] max-w-sm bg-white shadow-2xl lg:hidden"
            >
              <div className="flex flex-col h-full pt-20 pb-6 px-6">
                {/* Nav Links */}
                <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-[15px] font-medium text-slate-700 hover:text-bb-navy hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    About Us
                  </Link>

                  {/* Services Accordion */}
                  <div>
                    <button
                      onClick={() => setServicesOpen(!servicesOpen)}
                      className="flex items-center justify-between w-full px-4 py-3 text-[15px] font-medium text-slate-700 hover:text-bb-navy hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Services
                      <ChevronDown className={cn(
                        "w-4 h-4 text-slate-400 transition-transform duration-200",
                        servicesOpen && "rotate-180"
                      )} />
                    </button>

                    <AnimatePresence>
                      {servicesOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 py-1 space-y-0.5">
                            {services.map((service) => (
                              <Link
                                key={service.slug}
                                href={`/services/${service.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-2.5 text-sm text-slate-500 hover:text-bb-navy hover:bg-slate-50 rounded-lg transition-colors"
                              >
                                {service.title}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link
                    href="/tours"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-[15px] font-medium text-slate-700 hover:text-bb-navy hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Tours
                  </Link>
                  <Link
                    href="/success"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-[15px] font-medium text-slate-700 hover:text-bb-navy hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Success Stories
                  </Link>
                  <Link
                    href="/blog"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-[15px] font-medium text-slate-700 hover:text-bb-navy hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Insights & FAQ
                  </Link>
                </nav>

                {/* Mobile CTA */}
                <div className="pt-6 flex flex-col gap-3 border-t border-slate-100 mt-auto">
                  <a
                    href={`tel:${brand.phone}`}
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {brand.phone} / {brand.secondaryPhone}
                  </a>
                  <Link
                    href="/start"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-white bg-bb-gold rounded-lg hover:bg-[#b08f43] transition-colors"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
