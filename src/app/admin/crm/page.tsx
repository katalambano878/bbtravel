import { redirect } from "next/navigation";

import { addLeadActivityAction, assignLeadAction, convertLeadAction } from "@/app/actions";
import { getStaffAccessContext } from "@/lib/data/queries";
import { getCrmSnapshot } from "@/lib/crm/service";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function AdminCrmPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/portal/login");
  if (!(context.permissions.includes("crm.view") || context.permissions.includes("leads.view") || context.profile.role === "super_admin")) {
    redirect("/admin");
  }

  const snapshot = await getCrmSnapshot();
  const admin = createAdminClient();
  const { data: staffUsers } = await admin.from("staff_profiles").select("user_id, full_name, role").eq("is_active", true);

  return (
    <section className="section-shell space-y-8">
      <div>
        <p className="eyebrow">CRM</p>
        <h1 className="text-3xl font-semibold text-bb-navy">Lead Pipeline & Assignment</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        {snapshot.pipelineStages.map((stage) => {
          const count = snapshot.leads.filter((lead) => lead.stage === stage.stage_key).length;
          return (
            <Card key={stage.id}>
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">{stage.stage_name}</p>
                <p className="mt-2 text-2xl font-semibold text-bb-navy">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-xl font-semibold text-bb-navy">Latest Leads</h2>
          <div className="space-y-4">
            {snapshot.leads.slice(0, 20).map((lead) => (
              <div key={lead.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-bb-navy">
                    {lead.name} • {lead.service_type}
                  </p>
                  <p className="text-xs text-slate-500">Stage: {lead.stage}</p>
                </div>
                <p className="text-xs text-slate-600">{lead.email} • {lead.phone || "N/A"}</p>

                <div className="mt-3 grid gap-3 lg:grid-cols-3">
                  <form action={assignLeadAction} className="space-y-2 rounded-lg bg-slate-50 p-3">
                    <input type="hidden" name="lead_id" value={lead.id} />
                    <input type="hidden" name="mode" value="MANUAL" />
                    <Label htmlFor={`assignee-${lead.id}`}>Assign to</Label>
                    <select id={`assignee-${lead.id}`} name="assignee_user_id" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                      {(staffUsers ?? []).map((staff) => (
                        <option key={staff.user_id} value={staff.user_id}>
                          {staff.full_name} ({staff.role})
                        </option>
                      ))}
                    </select>
                    <Input name="reason" placeholder="Reason (optional)" />
                    <Button type="submit" size="sm">
                      Assign
                    </Button>
                  </form>

                  <form action={addLeadActivityAction} className="space-y-2 rounded-lg bg-slate-50 p-3">
                    <input type="hidden" name="lead_id" value={lead.id} />
                    <Label htmlFor={`activity-type-${lead.id}`}>Activity</Label>
                    <select
                      id={`activity-type-${lead.id}`}
                      name="activity_type"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="NOTE">Note</option>
                      <option value="CALL">Call</option>
                      <option value="EMAIL">Email</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="TASK">Task</option>
                    </select>
                    <Input name="activity_note" placeholder="Activity note" required />
                    <Button type="submit" size="sm" variant="secondary">
                      Log activity
                    </Button>
                  </form>

                  <form action={convertLeadAction} className="space-y-2 rounded-lg bg-slate-50 p-3">
                    <input type="hidden" name="lead_id" value={lead.id} />
                    <Label htmlFor={`case-type-${lead.id}`}>Convert to case</Label>
                    <select id={`case-type-${lead.id}`} name="case_type" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                      <option value="VISA_ASSISTANCE">Visa Assistance</option>
                      <option value="INTERNATIONAL_RECRUITMENT">International Recruitment</option>
                      <option value="STUDY_ABROAD">Study Abroad</option>
                      <option value="TOUR_PACKAGE">Tour Package</option>
                      <option value="FLIGHT_RESERVATION">Flight Reservation</option>
                      <option value="BUSINESS_EXPORT">Hotel Booking</option>
                    </select>
                    <Button type="submit" size="sm">
                      Convert
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
