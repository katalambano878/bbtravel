import { Suspense } from "react";
import { Metadata } from "next";
import Image from "next/image";
import { Shield } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Admin Console",
  robots: { index: false, follow: false }
};

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen">
      {/* Left panel — brand + illustration */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between bg-bb-navy p-12 relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay-dark opacity-30 pointer-events-none" />
        <div className="absolute -bottom-[200px] -left-[200px] w-[600px] h-[600px] bg-bb-gold/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-[15%] right-[10%] w-[300px] h-[300px] bg-bb-sky/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <Image
            src="/images/logo.png"
            alt="B.B. Travel Consult"
            width={180}
            height={60}
            className="brightness-0 invert"
            priority
          />
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-bb-gold mb-4">
            Administration Console
          </p>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "var(--font-sora)" }}>
            Manage operations,<br />
            track every case.
          </h1>
          <p className="text-sm leading-relaxed text-slate-400">
            CRM, case workflows, HR, finance, and business intelligence — 
            all in one secure dashboard built for your team.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-xs text-slate-500">
          <Shield className="h-4 w-4 text-bb-gold/60" />
          <span>256-bit encrypted &middot; Role-based access &middot; Audit logged</span>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-10 lg:hidden flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="B.B. Travel Consult"
              width={140}
              height={46}
              priority
            />
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-bb-navy/5 px-3 py-1.5 mb-4">
              <Shield className="h-3.5 w-3.5 text-bb-navy" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-bb-navy">Staff Only</span>
            </div>
            <h2 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>
              Sign in to Admin
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Enter your staff credentials to continue.
            </p>
          </div>

          <Suspense>
            <AdminLoginForm />
          </Suspense>

          <p className="mt-8 text-center text-xs text-slate-400">
            Client portal? <a href="/portal/login" className="text-bb-sky hover:underline">Sign in here</a>
          </p>
        </div>
      </div>
    </div>
  );
}
