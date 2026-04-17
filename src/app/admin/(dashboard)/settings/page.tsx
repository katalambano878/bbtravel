import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck, Building, Gauge } from "lucide-react";

import { getStaffAccessContext } from "@/lib/data/queries";
import { getSystemSettings } from "@/lib/settings/system-settings";
import { updateSystemSettingsAction } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
            <ShieldCheck className="mr-1.5 h-4 w-4" /> Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
