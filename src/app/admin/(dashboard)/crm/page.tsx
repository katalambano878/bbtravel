import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Users, PhoneCall, Mail, MessageCircle, ClipboardList, ArrowRightLeft } from "lucide-react";

import { addLeadActivityAction, assignLeadAction, convertLeadAction } from "@/app/actions";
import { getStaffAccessContext } from "@/lib/data/queries";
import { getCrmSnapshot } from "@/lib/crm/service";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "CRM — Admin Console" };

export default async function AdminCrmPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  if (!(context.permissions.includes("crm.view") || context.permissions.includes("leads.view") || context.profile.role === "super_admin")) {
    redirect("/admin");
  }

  const snapshot = await getCrmSnapshot();
  const admin = createAdminClient();
  const { data: staffUsers } = await admin.from("staff_profiles").select("user_id, full_name, role").eq("is_active", true);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>CRM / Lead Pipeline</h1>
        <p className="mt-1 text-sm text-slate-500">Track, assign, and convert leads across your pipeline.</p>
      </div>

      {/* Pipeline stage cards */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {snapshot.pipelineStages.map((stage) => {
          const count = snapshot.leads.filter((lead) => lead.stage === stage.stage_key).length;
          return (
            <Card key={stage.id} className="border-l-4 border-l-bb-sky/60">
              <CardContent className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{stage.stage_name}</p>
                <p className="mt-1 text-2xl font-bold text-bb-navy">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leads table */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-bb-navy flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              All Leads
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {snapshot.leads.length} total
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshot.leads.slice(0, 30).map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium text-bb-navy">{lead.name}</TableCell>
                  <TableCell>{lead.service_type}</TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500">{lead.email}</span>
                    {lead.phone && <span className="ml-2 text-xs text-slate-400">{lead.phone}</span>}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      {lead.stage}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Tabs defaultValue="assign">
                      <TabsList>
                        <TabsTrigger value="assign">Assign</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                        <TabsTrigger value="convert">Convert</TabsTrigger>
                      </TabsList>

                      <TabsContent value="assign">
                        <form action={assignLeadAction} className="flex flex-wrap items-end gap-2">
                          <input type="hidden" name="lead_id" value={lead.id} />
                          <input type="hidden" name="mode" value="MANUAL" />
                          <div>
                            <Label className="text-[10px]">Staff</Label>
                            <select name="assignee_user_id" className="w-full min-w-[160px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs">
                              {(staffUsers ?? []).map((s) => (
                                <option key={s.user_id} value={s.user_id}>{s.full_name} ({s.role})</option>
                              ))}
                            </select>
                          </div>
                          <Input name="reason" placeholder="Reason" className="h-8 max-w-[140px] text-xs" />
                          <Button type="submit" size="sm" className="h-8 text-xs">
                            <ArrowRightLeft className="mr-1 h-3 w-3" /> Assign
                          </Button>
                        </form>
                      </TabsContent>

                      <TabsContent value="activity">
                        <form action={addLeadActivityAction} className="flex flex-wrap items-end gap-2">
                          <input type="hidden" name="lead_id" value={lead.id} />
                          <div>
                            <Label className="text-[10px]">Type</Label>
                            <select name="activity_type" className="min-w-[110px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs">
                              <option value="NOTE">Note</option>
                              <option value="CALL">Call</option>
                              <option value="EMAIL">Email</option>
                              <option value="WHATSAPP">WhatsApp</option>
                              <option value="TASK">Task</option>
                            </select>
                          </div>
                          <Input name="activity_note" placeholder="Activity note" required className="h-8 min-w-[160px] text-xs" />
                          <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs">
                            Log
                          </Button>
                        </form>
                      </TabsContent>

                      <TabsContent value="convert">
                        <form action={convertLeadAction} className="flex flex-wrap items-end gap-2">
                          <input type="hidden" name="lead_id" value={lead.id} />
                          <div>
                            <Label className="text-[10px]">Case Type</Label>
                            <select name="case_type" className="min-w-[170px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs">
                              <option value="VISA_ASSISTANCE">Visa Assistance</option>
                              <option value="INTERNATIONAL_RECRUITMENT">International Recruitment</option>
                              <option value="STUDY_ABROAD">Study Abroad</option>
                              <option value="TOUR_PACKAGE">Tour Package</option>
                              <option value="FLIGHT_RESERVATION">Flight Reservation</option>
                              <option value="BUSINESS_EXPORT">Hotel Booking</option>
                            </select>
                          </div>
                          <Button type="submit" size="sm" className="h-8 text-xs">Convert</Button>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
