import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Briefcase, ListTodo, AlertTriangle, Link2 } from "lucide-react";

import { addCaseNoteAction, createCaseTaskAction, linkCasesAction } from "@/app/actions";
import { getStaffAccessContext, getAdminCases } from "@/lib/data/queries";
import { getCaseOperationsSnapshot } from "@/lib/cases/service";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "Cases — Admin Console" };

export default async function AdminCasesPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  if (!(context.permissions.includes("cases.view") || context.profile.role === "super_admin")) {
    redirect("/admin");
  }

  const [cases, snapshot] = await Promise.all([getAdminCases(), getCaseOperationsSnapshot()]);
  const admin = createAdminClient();
  const { data: staffUsers } = await admin.from("staff_profiles").select("user_id, full_name, role").eq("is_active", true);

  const kpis = [
    { label: "Active Workflows", value: snapshot.workflows.length, icon: Briefcase, accent: "border-l-blue-500" },
    { label: "Open Tasks", value: snapshot.tasks.filter((t) => t.status !== "DONE").length, icon: ListTodo, accent: "border-l-emerald-500" },
    { label: "Open Blockers", value: snapshot.blockers.length, icon: AlertTriangle, accent: "border-l-red-500" },
    { label: "Linked Relations", value: snapshot.links.length, icon: Link2, accent: "border-l-violet-500" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>Case Operations</h1>
        <p className="mt-1 text-sm text-slate-500">Manage workflows, tasks, notes, and linked cases.</p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className={`border-l-4 ${accent}`}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-bb-navy">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cases table */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-bb-navy">All Cases</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{cases.length} total</span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.slice(0, 25).map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell className="font-medium text-bb-navy">{caseItem.case_type}</TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      {caseItem.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {(caseItem.clients as { name?: string })?.name ?? "N/A"}
                  </TableCell>
                  <TableCell>
                    <Tabs defaultValue="task">
                      <TabsList>
                        <TabsTrigger value="task">Task</TabsTrigger>
                        <TabsTrigger value="note">Note</TabsTrigger>
                        <TabsTrigger value="link">Link</TabsTrigger>
                      </TabsList>

                      <TabsContent value="task">
                        <form action={createCaseTaskAction} className="flex flex-wrap items-end gap-2">
                          <input type="hidden" name="case_id" value={caseItem.id} />
                          <Input name="title" placeholder="Task title" required className="h-8 min-w-[140px] text-xs" />
                          <Input name="description" placeholder="Description" className="h-8 min-w-[120px] text-xs" />
                          <select name="priority" className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs">
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="CRITICAL">Critical</option>
                          </select>
                          <select name="assigned_to" className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs">
                            <option value="">Unassigned</option>
                            {(staffUsers ?? []).map((s) => (
                              <option key={s.user_id} value={s.user_id}>{s.full_name}</option>
                            ))}
                          </select>
                          <Button type="submit" size="sm" className="h-8 text-xs">Add</Button>
                        </form>
                      </TabsContent>

                      <TabsContent value="note">
                        <form action={addCaseNoteAction} className="flex flex-wrap items-end gap-2">
                          <input type="hidden" name="case_id" value={caseItem.id} />
                          <Input name="note" placeholder="Case note" required className="h-8 min-w-[200px] text-xs" />
                          <select name="visibility" className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs">
                            <option value="INTERNAL">Internal</option>
                            <option value="CLIENT_VISIBLE">Client Visible</option>
                          </select>
                          <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs">Save</Button>
                        </form>
                      </TabsContent>

                      <TabsContent value="link">
                        <form action={linkCasesAction} className="flex flex-wrap items-end gap-2">
                          <input type="hidden" name="primary_case_id" value={caseItem.id} />
                          <select name="linked_case_id" className="min-w-[180px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs">
                            {cases
                              .filter((c) => c.id !== caseItem.id)
                              .slice(0, 100)
                              .map((c) => (
                                <option key={c.id} value={c.id}>{c.id.slice(0, 8)} — {c.case_type}</option>
                              ))}
                          </select>
                          <select name="relation_type" className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs">
                            <option value="SUB_CASE">Sub-case</option>
                            <option value="DEPENDENT">Dependent</option>
                            <option value="FOLLOW_ON">Follow-on</option>
                          </select>
                          <Button type="submit" size="sm" className="h-8 text-xs">Link</Button>
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
