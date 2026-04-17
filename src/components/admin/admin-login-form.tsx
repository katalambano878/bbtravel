"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  credentials: "Invalid email or password.",
  missing: "Please enter both email and password.",
  not_staff: "This account is not authorized for the admin console.",
  config: "Server is misconfigured. Contact your administrator.",
  unknown: "Something went wrong. Please try again."
};

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const [submitting, setSubmitting] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  // Kill any stale service worker / caches from a previous deployment
  // that might be intercepting requests and breaking hydration.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations?.().then((regs) => {
        regs.forEach((reg) => {
          reg.unregister().catch(() => {});
        });
      });
    }
    if ("caches" in window) {
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => {});
    }
  }, []);

  const error =
    clientError ?? (errorCode ? ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.unknown : null);

  return (
    <form
      method="POST"
      action="/api/admin-signin"
      className="space-y-5"
      onSubmit={(e) => {
        const form = e.currentTarget;
        const email = (form.elements.namedItem("email") as HTMLInputElement)?.value?.trim();
        const password = (form.elements.namedItem("password") as HTMLInputElement)?.value;
        if (!email || !password) {
          e.preventDefault();
          setClientError(ERROR_MESSAGES.missing);
          return;
        }
        setClientError(null);
        setSubmitting(true);
      }}
    >
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@bbtravelconsult.com"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-bb-navy placeholder:text-slate-400 outline-none transition-all focus:border-bb-gold focus:ring-2 focus:ring-bb-gold/20"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-bb-navy placeholder:text-slate-400 outline-none transition-all focus:border-bb-gold focus:ring-2 focus:ring-bb-gold/20"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-bb-navy py-3 text-sm font-semibold text-white transition-all hover:bg-bb-navy/90 hover:shadow-premium active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
