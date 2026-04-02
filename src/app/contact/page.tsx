import { Metadata } from "next";
import { ArrowRight, MapPin, Phone, Mail, MessageCircle, Clock } from "lucide-react";
import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { brand } from "@/lib/mockData";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact Concierge | Reach the Experts",
  description: "Schedule your strategic consultation with our elite travel and recruitment advisors."
};

export default function ContactHubPage() {
  return (
    <>
      <Section variant="navy" className="pt-32 pb-20 md:pt-48 md:pb-32 relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/page-hero/contact.webp"
            alt="Contact B.B. Travel Consult"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-bb-navy via-transparent to-transparent opacity-90" />
        </div>

        <Container className="relative z-10 text-center">
          <span className="eyebrow mb-6 inline-block text-bb-gold">Direct Access</span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Engage the <br className="hidden md:block" />
            <span className="text-bb-gold">experts directly.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto">
            Book an absolute analysis of your travel trajectory. We respond with precision, not boilerplate.
          </p>
        </Container>
      </Section>

      <Section variant="white" className="border-b border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            
            {/* Left Col - Contact Methods */}
            <div className="lg:col-span-5 space-y-12">
              <div>
                <h2 className="text-3xl font-bold text-bb-navy mb-4">Initial Contact</h2>
                <p className="text-slate-500 font-light">
                  Select your preferred channel. For immediate pre-assessments, we highly recommend initiating dialogue via WhatsApp.
                </p>
              </div>

              <div className="space-y-6">
                <a 
                  href={`https://wa.me/${brand.whatsapp.replace(/\D/g, "")}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-6 p-6 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-premium hover:border-bb-gold transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-green-500 transition-colors">
                    <MessageCircle className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-bb-navy text-lg mb-1">WhatsApp Concierge</h3>
                    <p className="text-sm text-slate-500 font-light">Average response: 15 mins</p>
                  </div>
                </a>

                <a 
                  href={`tel:${brand.phone.replace(/\D/g, "")}`} 
                  className="flex items-center gap-6 p-6 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-premium hover:border-bb-navy transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-bb-navy/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-bb-navy transition-colors">
                    <Phone className="w-6 h-6 text-bb-navy group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-bb-navy text-lg mb-1">Direct Line</h3>
                    <p className="text-sm font-medium text-bb-navy">{brand.phone}</p>
                    <p className="text-sm text-slate-500 font-light mt-1">Mon-Fri, 9am - 5pm GMT</p>
                  </div>
                </a>

                <a 
                  href={`mailto:${brand.email}`} 
                  className="flex items-center gap-6 p-6 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-premium hover:border-bb-sky transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-bb-sky/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-bb-sky transition-colors">
                    <Mail className="w-6 h-6 text-bb-sky group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-bb-navy text-lg mb-1">Official Email</h3>
                    <p className="text-sm font-medium text-bb-navy">{brand.email}</p>
                    <p className="text-sm text-slate-500 font-light mt-1">Corporate & Partnership Inquiries</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Right Col - In-person & Address */}
            <div className="lg:col-span-7 relative">
              <div className="bg-slate-50 rounded-[2rem] p-8 lg:p-12 border border-slate-200 h-full flex flex-col justify-center">
                <MapPin className="w-10 h-10 text-bb-gold mb-6" />
                <h2 className="text-3xl font-bold text-bb-navy mb-4">Visit our Headquarters</h2>
                <p className="text-xl text-slate-600 font-medium mb-6 leading-relaxed">
                  {brand.address}
                </p>
                <div className="space-y-4 mb-10">
                  <div className="flex items-start gap-3 text-slate-500 font-light">
                    <Clock className="w-5 h-5 text-bb-navy shrink-0 mt-0.5" />
                    <p>Consultations are strictly by appointment to guarantee utmost confidentiality and undivided attention from our experts.</p>
                  </div>
                </div>

                <Button asChild className="h-14 px-8 bg-bb-navy hover:bg-bb-gold text-white text-base rounded-xl font-bold self-start shadow-sm">
                  <a href={`https://wa.me/${brand.whatsapp.replace(/\D/g, "")}?text=Hi,%20I%20would%20like%20to%20schedule%20an%20in-person%20consultation.`} target="_blank" rel="noreferrer">
                    Request Appointment <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
              </div>
            </div>

          </div>
        </Container>
      </Section>
    </>
  );
}
