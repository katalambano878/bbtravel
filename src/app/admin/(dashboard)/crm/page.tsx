import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Users, ArrowRightLeft, MapPin, Clock3 } from "lucide-react";

import { addLeadActivityAction, assignLeadAction, convertLeadAction } from "@/app/actions";
import { getStaffAccessContext } from "@/lib/data/queries";
import { getCrmSnapshot } from "@/lib/crm/service";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LEAD_PIPELINE_STAGES } from "@/lib/services/catalogue";
import { ServiceBadge } from "@/components/admin/service-badge";
import { StageBadge } from "@/components/admin/stage-badge";
import { ServiceTypeSelect } from "@/components/admin/service-type-select";

export const metadata: Metadata = { title: "CRM — Admin Console" };

const LEGACY_STAGE_MAP: Record<string, string> = {
  QUALIFIED: "SCOPED",
  CONVERTED: "BOOKED"
};

export default async function AdminCrmPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  if (
    !(
      context.permissions.includes("crm.view") ||
      context.permissions.includes("leads.view") ||
      context.profile.role === "super_admin"
    )
  ) {
    redirect("/admin");
  }

  const snapshot = await getCrmSnapshot();
  const admin = createAdminClient();
  const { data: staffUsers } = await admin
    .from("staff_profiles")
    .select("user_id, full_name, role")
    .eq("is_active", true);

  const normalizeStage = (stage: string | null | undefined) =>
    stage ? (LEGACY_STAGE_MAP[stage] ?? stage) : stage;

  // Build stage → leads map
  const leadsByStage: Record<string, typeof snapshot.leads> = {};
  for (const stage of LEAD_PIPELINE_STAGES) leadsByStage[stage.key] = [];
  for (const lead of snapshot.leads) {
    const key = normalizeStage(lead.stage as string);
    if (key && leadsByStage[key]) leadsByStage[key].push(lead);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold text-bb-navy"
            style={{ fontFamily: "var(--font-sora)" }}
          >
            Sales pipeline
          </h1>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {snapshot.leads.length} total leads
        </span>
      </div>

      {/* Pipeline stage cards */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {LEAD_PIPELINE_STAGES.map((stage) => {
          const count = leadsByStage[stage.key]?.length ?? 0;
          return (
            <Card key={stage.key} className="relative overflow-hidden">
              <div className={`absolute left-0 top-0 h-full w-1 ${stage.color}`} />
              <CardContent className="p-4 pl-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {stage.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-bb-navy">{count}</p>
                <p className="mt-1 text-[11px] leading-tight text-slate-400">
                  {stage.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leads table */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-bb-navy">
              <Users className="h-4 w-4 text-slate-400" />
              All leads
            </h2>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshot.leads.slice(0, 50).map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <p className="font-medium text-bb-navy">{lead.name}</p>
                    <p className="text-xs text-slate-500">{lead.email}</p>
                    {lead.phone && (
                      <p className="text-xs text-slate-400">{lead.phone}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <ServiceBadge serviceType={lead.service_type as string} short />
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {lead.destination ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {lead.destination}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {lead.timeline ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3 w-3 text-slate-400" />
                        {lead.timeline}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StageBadge stage={lead.stage as string} />
                  </TableCell>
                  <TableCell>
                    <Tabs defaultValue="assign">
                      <TabsList>
                        <TabsTrigger value="assign">Assign</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                        <TabsTrigger value="convert">Convert</TabsTrigger>
                      </TabsList>

                      <TabsContent value="assign">
                        <form
                          action={assignLeadAction}
                          className="flex flex-wrap items-end gap-2"
                        >
                          <input type="hidden" name="lead_id" value={lead.id} />
                          <input type="hidden" name="mode" value="MANUAL" />
                          <div>
                            <Label className="text-[10px]">Staff</Label>
                            <select
                              name="assignee_user_id"
                              className="w-full min-w-[160px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                            >
                              {(staffUsers ?? []).map((s) => (
                                <option key={s.user_id} value={s.user_id}>
                                  {s.full_name} ({s.role})
                                </option>
                              ))}
                            </select>
                          </div>
                          <Input
                            name="reason"
                            placeholder="Reason"
                            className="h-8 max-w-[140px] text-xs"
                          />
                          <Button type="submit" size="sm" className="h-8 text-xs">
                            <ArrowRightLeft className="mr-1 h-3 w-3" /> Assign
                          </Button>
                        </form>
                      </TabsContent>

                      <TabsContent value="activity">
                        <form
                          action={addLeadActivityAction}
                          className="flex flex-wrap items-end gap-2"
                        >
                          <input type="hidden" name="lead_id" value={lead.id} />
                          <div>
                            <Label className="text-[10px]">Type</Label>
                            <select
                              name="activity_type"
                              className="min-w-[110px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                            >
                              <option value="NOTE">Note</option>
                              <option value="CALL">Call</option>
                              <option value="EMAIL">Email</option>
                              <option value="WHATSAPP">WhatsApp</option>
                              <option value="TASK">Task</option>
                            </select>
                          </div>
                          <Input
                            name="activity_note"
                            placeholder="Activity note"
                            required
                            className="h-8 min-w-[160px] text-xs"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            variant="secondary"
                            className="h-8 text-xs"
                          >
                            Log
                          </Button>
                        </form>
                      </TabsContent>

                      <TabsContent value="convert">
                        <form
                          action={convertLeadAction}
                          className="flex flex-wrap items-end gap-2"
                        >
                          <input type="hidden" name="lead_id" value={lead.id} />
                          <div>
                            <Label className="text-[10px]">Case type</Label>
                            <ServiceTypeSelect
                              name="case_type"
                              defaultValue={(lead.service_type as string) ?? "VISA_ASSISTANCE"}
                              className="min-w-[200px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                              exclude={["BUSINESS_EXPORT"]}
                            />
                          </div>
                          <Button type="submit" size="sm" className="h-8 text-xs">
                            Convert &amp; open case
                          </Button>
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
