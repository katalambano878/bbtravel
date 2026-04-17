import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck, Building, Gauge, LayoutGrid, BookOpen, Handshake } from "lucide-react";

import { getStaffAccessContext } from "@/lib/data/queries";
import { getSystemSettings } from "@/lib/settings/system-settings";
import { updateSystemSettingsAction } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  divisions,
  serviceList,
  type ServiceDivisionKey
} from "@/lib/services/catalogue";
import { MESSAGE_TEMPLATES, TEMPLATE_GROUPS } from "@/lib/notifications/templates";

export const metadata: Metadata = { title: "Settings — Admin Console" };

export default async function AdminSettingsPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  if (!context.permissions.includes("settings.manage") && context.profile.role !== "super_admin") {
    redirect("/admin");
  }

  const settings = await getSystemSettings();
  const companyProfile = (settings?.company_profile ?? {}) as Record<string, unknown>;
  const approvalThresholds = (settings?.approval_thresholds ?? {}) as Record<string, unknown>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>Settings</h1>
        <p className="mt-1 text-sm text-slate-500">System configuration, business profile, and approval thresholds.</p>
      </div>

      <form action={updateSystemSettingsAction} className="space-y-6">
        {/* Company Profile */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-bb-navy">
              <Building className="h-4 w-4 text-slate-400" /> Company Profile
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="company_name" className="text-xs">Company Name</Label>
                <Input id="company_name" name="company_name" defaultValue={String(companyProfile.company_name ?? "")} />
              </div>
              <div>
                <Label htmlFor="legal_name" className="text-xs">Legal Name</Label>
                <Input id="legal_name" name="legal_name" defaultValue={String(companyProfile.legal_name ?? "")} />
              </div>
              <div>
                <Label htmlFor="phone" className="text-xs">Primary Phone</Label>
                <Input id="phone" name="phone" defaultValue={String(companyProfile.phone ?? "")} />
              </div>
              <div>
                <Label htmlFor="secondary_phone" className="text-xs">Secondary Phone</Label>
                <Input id="secondary_phone" name="secondary_phone" defaultValue={String(companyProfile.secondary_phone ?? "")} />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input id="email" name="email" defaultValue={String(companyProfile.email ?? "")} />
              </div>
              <div>
                <Label htmlFor="digital_address" className="text-xs">Digital Address</Label>
                <Input id="digital_address" name="digital_address" defaultValue={String(companyProfile.digital_address ?? "")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address" className="text-xs">Address</Label>
                <Input id="address" name="address" defaultValue={String(companyProfile.address ?? "")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approval Thresholds */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-bb-navy">
              <Gauge className="h-4 w-4 text-slate-400" /> Approval Thresholds
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="expense_tier_1" className="text-xs">Expense Tier 1 (GHS)</Label>
                <Input id="expense_tier_1" name="expense_tier_1" type="number" defaultValue={String(approvalThresholds.expense_tier_1 ?? 1000)} />
              </div>
              <div>
                <Label htmlFor="expense_tier_2" className="text-xs">Expense Tier 2 (GHS)</Label>
                <Input id="expense_tier_2" name="expense_tier_2" type="number" defaultValue={String(approvalThresholds.expense_tier_2 ?? 5000)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit">
            <ShieldCheck className="mr-1.5 h-4 w-4" /> Save settings
          </Button>
        </div>
      </form>

      {/* Service catalogue reference */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-bb-navy">
            <LayoutGrid className="h-4 w-4 text-slate-400" />
            Service catalogue
          </h2>
          <p className="text-xs text-slate-500">
            These are the services B.B. Travel Consult delivers. Pricing and
            checklists defined here drive invoice presets, CRM conversions,
            document requirements, and workflow steps across the admin console.
          </p>
          <div className="mt-4 space-y-5">
            {(Object.keys(divisions) as ServiceDivisionKey[]).map((divKey) => {
              const division = divisions[divKey];
              const items = serviceList.filter((svc) => svc.division === divKey);
              if (items.length === 0) return null;
              return (
                <div key={divKey}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {division.label}
                  </p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((svc) => (
                      <div
                        key={svc.key}
                        className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-bb-navy">{svc.label}</p>
                          <span className="whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500">
                            {svc.priceLabel}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                          {svc.shortDescription}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Turnaround: {svc.expectedTurnaround}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-[11px] text-slate-400">
            To edit a service, update{" "}
            <code className="rounded bg-slate-100 px-1 text-slate-600">
              src/lib/services/catalogue.ts
            </code>{" "}
            — changes propagate automatically across public site, CRM, cases,
            documents, finance, and BI.
          </p>
        </CardContent>
      </Card>

      {/* Partner directory placeholder */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-bb-navy">
            <Handshake className="h-4 w-4 text-slate-400" />
            Partner directory
          </h2>
          <p className="text-xs text-slate-500">
            Track the embassies, airlines, hotel chains, insurers, and overseas
            employers you work with most frequently. Use the groups below as a
            reference today; a dedicated partner record system is on the roadmap.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Embassies & consulates",
                items: ["UK VFS Global", "Canadian Embassy / VFS", "US Embassy", "Schengen embassies (Germany, France, Italy, Spain)", "UAE Embassy", "South African Embassy"]
              },
              {
                title: "Airlines",
                items: ["Emirates", "Qatar Airways", "Turkish Airlines", "British Airways", "KLM / Air France", "Ethiopian Airlines", "Africa World Airlines"]
              },
              {
                title: "Hotels & OTAs",
                items: ["Booking.com", "Expedia TAAP", "Hotelbeds", "Marriott Bonvoy", "Accor Hotels", "Local verified partners"]
              },
              {
                title: "Recruitment / Study",
                items: ["UK NHS Trusts", "Canadian LTCs", "Gulf healthcare networks", "UK/Canada/Australia universities", "Scholarship bodies"]
              }
            ].map((group) => (
              <div
                key={group.title}
                className="rounded-xl border border-slate-100 bg-slate-50/40 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {group.title}
                </p>
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  {group.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Message templates overview */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-bb-navy">
            <BookOpen className="h-4 w-4 text-slate-400" />
            Message templates
          </h2>
          <p className="text-xs text-slate-500">
            {MESSAGE_TEMPLATES.length} pre-baked templates across{" "}
            {TEMPLATE_GROUPS.length} moments — lead acknowledgement, visa
            updates, flight confirmations, invoicing, and document follow-ups.
            Edit them at{" "}
            <code className="rounded bg-slate-100 px-1 text-slate-600">
              src/lib/notifications/templates.ts
            </code>
            .
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TEMPLATE_GROUPS.map((group) => (
              <span
                key={group}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
              >
                {group} ({MESSAGE_TEMPLATES.filter((t) => t.group === group).length})
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
