import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck, Building, Gauge, LayoutGrid, BookOpen, Handshake } from "lucide-react";

import { getStaffAccessContext } from "@/lib/data/queries";
import { getSystemSettings } from "@/lib/settings/system-settings";
import { getPartners, PARTNER_TYPES } from "@/lib/partners/service";
import {
  updateSystemSettingsAction,
  upsertPartnerAction,
  archivePartnerAction
} from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { divisions, serviceList, type ServiceDivisionKey } from "@/lib/services/catalogue";
import { MESSAGE_TEMPLATES, TEMPLATE_GROUPS } from "@/lib/notifications/templates";

export const metadata: Metadata = { title: "Settings — B.B. Admin" };

export default async function AdminSettingsPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  if (!context.permissions.includes("settings.manage") && context.profile.role !== "super_admin") {
    redirect("/admin");
  }

  const settings = await getSystemSettings();
  const companyProfile = (settings?.company_profile ?? {}) as Record<string, unknown>;
  const approvalThresholds = (settings?.approval_thresholds ?? {}) as Record<string, unknown>;
  const partners = await getPartners();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>
        Settings
      </h1>

      <form action={updateSystemSettingsAction} className="space-y-6">
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-bb-navy">
              <Building className="h-4 w-4 text-slate-400" /> Company profile
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field name="company_name" label="Company name" value={companyProfile.company_name} />
              <Field name="legal_name" label="Legal name" value={companyProfile.legal_name} />
              <Field name="phone" label="Primary phone" value={companyProfile.phone} />
              <Field name="secondary_phone" label="Secondary phone" value={companyProfile.secondary_phone} />
              <Field name="email" label="Email" value={companyProfile.email} />
              <Field name="digital_address" label="Ghana Post GPS" value={companyProfile.digital_address} />
              <Field name="address" label="Address" value={companyProfile.address} full />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-bb-navy">
              <Gauge className="h-4 w-4 text-slate-400" /> Approval thresholds
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                name="expense_tier_1"
                label="Expense tier 1 (GHS)"
                type="number"
                value={approvalThresholds.expense_tier_1 ?? 1000}
              />
              <Field
                name="expense_tier_2"
                label="Expense tier 2 (GHS)"
                type="number"
                value={approvalThresholds.expense_tier_2 ?? 5000}
              />
            </div>
          </CardContent>
        </Card>

        <div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-bb-navy px-4 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Save settings
          </button>
        </div>
      </form>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-bb-navy">
            <Handshake className="h-4 w-4 text-slate-400" /> Partner directory ({partners.length})
          </h2>
          <form action={upsertPartnerAction} className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              name="name"
              required
              placeholder="Partner name (e.g. British High Commission Accra)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
            />
            <select
              name="partner_type"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              defaultValue="EMBASSY"
            >
              {PARTNER_TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              name="country_code"
              placeholder="Country (e.g. GH, GB)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              name="city"
              placeholder="City"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              name="contact_name"
              placeholder="Contact person"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              name="phone"
              placeholder="Phone"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              name="whatsapp"
              placeholder="WhatsApp"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              name="email"
              placeholder="Email"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              name="website"
              placeholder="Website"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
            />
            <input
              name="notes"
              placeholder="Notes"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-3"
            />
            <button
              type="submit"
              className="rounded-lg bg-bb-navy px-4 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90"
            >
              Add partner
            </button>
          </form>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5 text-left font-semibold">Name</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Type</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Location</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Contact</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 [&_tr]:transition-colors [&_tr:hover]:bg-slate-50/60">
                {partners.map((p) => (
                  <tr key={p.id as string} className={p.is_active ? "" : "opacity-50"}>
                    <td className="px-4 py-2 font-semibold text-bb-navy">{p.name}</td>
                    <td className="px-4 py-2 text-[12px] text-slate-700">
                      {PARTNER_TYPES.find((t) => t.key === p.partner_type)?.label ?? String(p.partner_type)}
                    </td>
                    <td className="px-4 py-2 text-[12px] text-slate-600">
                      {[p.city, p.country_code].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-2 text-[11px] text-slate-500">
                      {[p.contact_name, p.phone, p.email].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {p.is_active ? (
                        <form action={archivePartnerAction} className="inline-flex">
                          <input type="hidden" name="id" value={p.id as string} />
                          <button
                            type="submit"
                            className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            Archive
                          </button>
                        </form>
                      ) : (
                        <span className="text-[10px] text-slate-400">Archived</span>
                      )}
                    </td>
                  </tr>
                ))}
                {partners.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-[12px] text-slate-400">
                      No partners yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-bb-navy">
            <LayoutGrid className="h-4 w-4 text-slate-400" /> Service catalogue
          </h2>
          <p className="text-[11px] text-slate-500">
            Defined in <code className="rounded bg-slate-100 px-1 text-slate-600">src/lib/services/catalogue.ts</code>. Drives pricing, document checklists, CRM conversion, and BI slicing.
          </p>
          <div className="mt-4 space-y-4">
            {(Object.keys(divisions) as ServiceDivisionKey[]).map((divKey) => {
              const division = divisions[divKey];
              const items = serviceList.filter((svc) => svc.division === divKey);
              if (items.length === 0) return null;
              return (
                <div key={divKey}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {division.label}
                  </p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((svc) => (
                      <div
                        key={svc.key}
                        className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[13px] font-semibold text-bb-navy">{svc.label}</p>
                          <span className="rounded-full bg-white px-1.5 py-0 text-[10px] font-medium text-slate-500">
                            {svc.priceLabel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-bb-navy">
            <BookOpen className="h-4 w-4 text-slate-400" /> Message templates
          </h2>
          <p className="text-[11px] text-slate-500">
            {MESSAGE_TEMPLATES.length} templates across {TEMPLATE_GROUPS.length} moments. Edit at{" "}
            <code className="rounded bg-slate-100 px-1 text-slate-600">src/lib/notifications/templates.ts</code>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TEMPLATE_GROUPS.map((group) => (
              <span
                key={group}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-600"
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

function Field({
  name,
  label,
  value,
  type,
  full
}: {
  name: string;
  label: string;
  value: unknown;
  type?: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <input
        name={name}
        type={type ?? "text"}
        defaultValue={String(value ?? "")}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
    </div>
  );
}
