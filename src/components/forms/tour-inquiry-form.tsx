"use client";

import { useActionState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

import { submitTourInquiryAction, type TourInquiryState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TourInquiryForm({ tourSlug, tourTitle }: { tourSlug: string; tourTitle: string }) {
  const [state, formAction, isPending] = useActionState(submitTourInquiryAction, null as TourInquiryState);

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
        <p className="font-semibold text-bb-navy">We received your request</p>
        <p className="mt-1 text-sm text-slate-600">Our team will contact you with availability and next steps.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="tour_slug" value={tourSlug} />
      <input type="hidden" name="tour_title" value={tourTitle} />
      {state?.error ? <p className="text-sm text-rose-700">{state.error}</p> : null}
      <div>
        <Label htmlFor="ti-name">Name</Label>
        <Input id="ti-name" name="name" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="ti-email">Email</Label>
        <Input id="ti-email" name="email" type="email" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="ti-phone">Phone / WhatsApp</Label>
        <Input id="ti-phone" name="phone" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="ti-msg">Message (optional)</Label>
        <Textarea id="ti-msg" name="message" rows={3} placeholder="Travel dates, number of guests…" className="mt-1" />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Request this deal"
        )}
      </Button>
    </form>
  );
}
