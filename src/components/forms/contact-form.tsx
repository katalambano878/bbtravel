"use client";

import { useActionState, useEffect } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

import { submitContactAction, type ContactFormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SERVICE_OPTIONS: { value: string; label: string }[] = [
  { value: "CONSULTATION", label: "General consultation" },
  { value: "VISA_ASSISTANCE", label: "Visa assistance" },
  { value: "INTERNATIONAL_RECRUITMENT", label: "Jobs abroad" },
  { value: "STUDY_ABROAD", label: "Study abroad" },
  { value: "TOUR_PACKAGE", label: "Tours & packages" },
  { value: "FLIGHT_RESERVATION", label: "Flights" },
  { value: "CORPORATE_TRAVEL", label: "Corporate travel" }
];

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactAction, null as ContactFormState);

  useEffect(() => {
    if (state?.ok) {
      const el = document.getElementById("contact-form");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state?.ok]);

  if (state?.ok) {
    return (
      <div
        id="contact-form"
        className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-10 text-center shadow-sm"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-bb-navy">Message received.</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
          A consultant will reach out shortly. For faster response, message us on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form id="contact-form" action={formAction} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      {state?.error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{state.error}</p>
      ) : null}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="cf-name">Full name</Label>
          <Input id="cf-name" name="name" required placeholder="Your name" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="cf-email">Email</Label>
          <Input id="cf-email" name="email" type="email" required placeholder="you@example.com" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="cf-phone">Phone / WhatsApp</Label>
          <Input id="cf-phone" name="phone" placeholder="+233…" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="cf-service">Topic</Label>
          <select
            id="cf-service"
            name="service_type"
            defaultValue="CONSULTATION"
            className="mt-1.5 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            {SERVICE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="cf-message">How can we help?</Label>
        <Textarea
          id="cf-message"
          name="message"
          required
          minLength={5}
          rows={5}
          placeholder="Tell us briefly what you need — destination, timeline, and any deadlines."
          className="mt-1.5"
        />
      </div>
      <Button type="submit" disabled={isPending} className="h-12 w-full md:w-auto">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          "Send message"
        )}
      </Button>
    </form>
  );
}
