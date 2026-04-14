import { redirect } from "next/navigation";

import { addCaseNoteAction, createCaseTaskAction, linkCasesAction } from "@/app/actions";
import { getStaffAccessContext, getAdminCases } from "@/lib/data/queries";
import { getCaseOperationsSnapshot } from "@/lib/cases/service";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function AdminCasesPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/portal/login");
  if (!(context.permissions.includes("cases.view") || context.profile.role === "super_admin")) {
    redirect("/admin");
  }

  const [cases, snapshot] = await Promise.all([getAdminCases(), getCaseOperationsSnapshot()]);
  const admin = createAdminClient();
  const { data: staffUsers } = await admin.from("staff_profiles").select("user_id, full_name, role").eq("is_active", true);

  return (
    <section className="section-shell space-y-8">
      <div>
        <p className="eyebrow">Case Operations</p>
        <h1 className="text-3xl font-semibold text-bb-navy">Workflow, Tasks, Notes, Linked Cases</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Active workflows</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.workflows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Open tasks</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.tasks.filter((task) => task.status !== "DONE").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Open blockers</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.blockers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Linked case relations</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.links.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-xl font-semibold text-bb-navy">Case Operations Desk</h2>
          <div className="space-y-4">
            {cases.slice(0, 20).map((caseItem) => (
              <div key={caseItem.id} className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-bb-navy">
                  {caseItem.case_type} • {caseItem.status}
                </p>
                <p className="text-xs text-slate-600">Client: {(caseItem.clients as { name?: string })?.name ?? "N/A"}</p>

                <div className="mt-3 grid gap-3 lg:grid-cols-3">
                  <form action={createCaseTaskAction} className="space-y-2 rounded-lg bg-slate-50 p-3">
                    <input type="hidden" name="case_id" value={caseItem.id} />
                    <Label htmlFor={`task-title-${caseItem.id}`}>Create task</Label>
                    <Input id={`task-title-${caseItem.id}`} name="title" placeholder="Task title" required />
                    <Input name="description" placeholder="Task description" />
                    <select name="priority" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                    <select name="assigned_to" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                      <option value="">Unassigned</option>
                      {(staffUsers ?? []).map((staff) => (
                        <option key={staff.user_id} value={staff.user_id}>
                          {staff.full_name}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" size="sm">
                      Add task
                    </Button>
                  </form>

                  <form action={addCaseNoteAction} className="space-y-2 rounded-lg bg-slate-50 p-3">
                    <input type="hidden" name="case_id" value={caseItem.id} />
                    <Label htmlFor={`case-note-${caseItem.id}`}>Add note</Label>
                    <Input id={`case-note-${caseItem.id}`} name="note" placeholder="Case note" required />
                    <select name="visibility" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                      <option value="INTERNAL">Internal</option>
                      <option value="CLIENT_VISIBLE">Client Visible</option>
                    </select>
                    <Button type="submit" size="sm" variant="secondary">
                      Save note
                    </Button>
                  </form>

                  <form action={linkCasesAction} className="space-y-2 rounded-lg bg-slate-50 p-3">
                    <input type="hidden" name="primary_case_id" value={caseItem.id} />
                    <Label htmlFor={`linked-case-${caseItem.id}`}>Link another case</Label>
                    <select id={`linked-case-${caseItem.id}`} name="linked_case_id" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                      {cases
                        .filter((candidate) => candidate.id !== caseItem.id)
                        .slice(0, 100)
                        .map((candidate) => (
                          <option key={candidate.id} value={candidate.id}>
                            {candidate.id.slice(0, 8)} • {candidate.case_type}
                          </option>
                        ))}
                    </select>
                    <select name="relation_type" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                      <option value="SUB_CASE">Sub-case</option>
                      <option value="DEPENDENT">Dependent</option>
                      <option value="FOLLOW_ON">Follow-on</option>
                    </select>
                    <Button type="submit" size="sm">
                      Link case
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
