"use client";

import { useMemo, useState } from "react";
import { serviceCatalog } from "@/lib/data/brand";
import { checklistTemplates } from "@/lib/data/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ServiceType } from "@/types/domain";

export function StartApplicationForm({ action }: { action: (formData: FormData) => void }) {
  const [serviceType, setServiceType] = useState<ServiceType>("VISA_ASSISTANCE");

  const readinessHint = useMemo(() => {
    return checklistTemplates[serviceType].length * 20;
  }, [serviceType]);

  return (
    <form action={action} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="service_type">Service Path</Label>
          <Select
            id="service_type"
            name="service_type"
            value={serviceType}
            onChange={(event) => setServiceType(event.target.value as ServiceType)}
            options={serviceCatalog.map((service) => ({ value: service.type, label: service.title }))}
          />
        </div>
        <div>
          <Label htmlFor="destination">Destination Country</Label>
          <Input id="destination" name="destination" placeholder="e.g. UK, Canada, UAE" />
        </div>
        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <Input id="full_name" name="full_name" required placeholder="Your full name" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" required placeholder="+233..." />
        </div>
        <div>
          <Label htmlFor="timeline">Timeline</Label>
          <Input id="timeline" name="timeline" required placeholder="e.g. within 2 months" />
        </div>
        <div>
          <Label htmlFor="budget_range">Budget Range (Optional)</Label>
          <Input id="budget_range" name="budget_range" placeholder="e.g. $2,000 - $5,000" />
        </div>
        <div>
          <Label htmlFor="passport_status">Passport Status (Optional)</Label>
          <Input id="passport_status" name="passport_status" placeholder="Valid, expiring, none" />
        </div>
        <div>
          <Label htmlFor="education_level">Education (Optional)</Label>
          <Input id="education_level" name="education_level" placeholder="Diploma, Bachelor, etc." />
        </div>
        <div>
          <Label htmlFor="experience_level">Experience (Optional)</Label>
          <Input id="experience_level" name="experience_level" placeholder="Years and domain" />
        </div>
      </div>
      <div>
        <Label htmlFor="travel_history">Travel History (Optional)</Label>
        <Input id="travel_history" name="travel_history" placeholder="Previous countries visited" />
      </div>
      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea id="notes" name="notes" placeholder="Tell us more about your goals." />
      </div>
      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-bb-gold">Readiness score preview</p>
        <p className="mt-1 text-sm text-slate-600">
          Estimated score based on current service path checklist depth: <strong>{readinessHint}%</strong>
        </p>
      </div>
      <Button type="submit" size="lg">
        Submit Assessment
      </Button>
    </form>
  );
}
