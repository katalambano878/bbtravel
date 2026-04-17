"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

const errorMessages: Record<string, string> = {
  invalid: "Invalid email or password.",
  locked: "Account temporarily locked due to repeated failed login attempts.",
  denied: "Access denied. This login is for authorised staff only."
};

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const errorKey = searchParams.get("error");
  const errorMessage = errorKey ? errorMessages[errorKey] ?? "Login failed. Please try again." : null;
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      action="/api/admin-signin"
      method="POST"
      onSubmit={() => setSubmitting(true)}
      className="space-y-5"
    >
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
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
        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
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
