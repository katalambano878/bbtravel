import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { getStaffAccessContext } from "@/lib/data/queries";
import { getSystemSettings } from "@/lib/settings/system-settings";
import { updateSystemSettingsAction } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <section className="section-shell space-y-8">
      <div>
        <p className="eyebrow">Settings & Compliance</p>
        <h1 className="text-3xl font-semibold text-bb-navy">System Configuration</h1>
      </div>

      <Card>
        <CardContent className="space-y-6 p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-bb-navy">
            <ShieldCheck className="h-5 w-5 text-bb-gold" /> Business Profile & Approval Thresholds
          </h2>
          <form action={updateSystemSettingsAction} className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input id="company_name" name="company_name" defaultValue={String(companyProfile.company_name ?? "")} />
            </div>
            <div>
              <Label htmlFor="legal_name">Legal Name</Label>
              <Input id="legal_name" name="legal_name" defaultValue={String(companyProfile.legal_name ?? "")} />
            </div>
            <div>
              <Label htmlFor="phone">Primary Phone</Label>
              <Input id="phone" name="phone" defaultValue={String(companyProfile.phone ?? "")} />
            </div>
            <div>
              <Label htmlFor="secondary_phone">Secondary Phone</Label>
              <Input id="secondary_phone" name="secondary_phone" defaultValue={String(companyProfile.secondary_phone ?? "")} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" defaultValue={String(companyProfile.email ?? "")} />
            </div>
            <div>
              <Label htmlFor="digital_address">Digital Address</Label>
              <Input id="digital_address" name="digital_address" defaultValue={String(companyProfile.digital_address ?? "")} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" defaultValue={String(companyProfile.address ?? "")} />
            </div>
            <div>
              <Label htmlFor="expense_tier_1">Expense Approval Tier 1 (GHS)</Label>
              <Input
                id="expense_tier_1"
                name="expense_tier_1"
                type="number"
                defaultValue={String(approvalThresholds.expense_tier_1 ?? 1000)}
              />
            </div>
            <div>
              <Label htmlFor="expense_tier_2">Expense Approval Tier 2 (GHS)</Label>
              <Input
                id="expense_tier_2"
                name="expense_tier_2"
                type="number"
                defaultValue={String(approvalThresholds.expense_tier_2 ?? 5000)}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Save settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
