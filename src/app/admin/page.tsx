import { Metadata } from "next";
import { redirect } from "next/navigation";
import { PlusCircle, Shield, UserCog } from "lucide-react";

import {
  getAdminAppointments,
  getAdminAuditLogs,
  getAdminCases,
  getAdminDocuments,
  getAdminLeads,
  getAdminOverview,
  getSiteContent,
  getStaffAccessContext
} from "@/lib/data/queries";
import { updateCaseStatusAction, reviewDocumentAction } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Admin Console",
  robots: {
    index: false,
    follow: false
  }
};

function hasAccess(permissions: string[], key: string) {
  return permissions.includes(key) || permissions.includes("staff.manage");
}

export default async function AdminPage() {
  const context = await getStaffAccessContext();
  if (!context) {
    redirect("/portal/login");
  }

  const [overview, leads, cases, docs, appointments, logs, content] = await Promise.all([
    getAdminOverview(),
    getAdminLeads(),
    getAdminCases(),
    getAdminDocuments(),
    getAdminAppointments(),
    getAdminAuditLogs(),
    getSiteContent()
  ]);

  return (
    <section className="section-shell">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Admin Console</p>
          <h1 className="text-3xl font-semibold text-bb-navy">Operations Dashboard</h1>
          <p className="text-sm text-slate-500">
            Signed in as {context.profile.full_name} ({context.profile.role})
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">New leads today</p>
            <p className="text-2xl font-semibold text-bb-navy">{overview.newLeadsToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Active cases</p>
            <p className="text-2xl font-semibold text-bb-navy">{overview.activeCases}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Pending documents</p>
            <p className="text-2xl font-semibold text-bb-navy">{overview.pendingDocuments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Upcoming appointments</p>
            <p className="text-2xl font-semibold text-bb-navy">{overview.upcomingAppointments}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-8">
        {hasAccess(context.permissions, "leads.view") ? (
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-xl font-semibold text-bb-navy">Leads Inbox (Pipeline)</h2>
              <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-5">
                {["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"].map((stage) => (
                  <div key={stage} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                    {stage}
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                {leads.slice(0, 8).map((lead) => (
                  <p key={lead.id} className="rounded-lg bg-slate-50 px-3 py-2">
                    {lead.name} - {lead.service_type} - {lead.email}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {hasAccess(context.permissions, "cases.view") ? (
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-xl font-semibold text-bb-navy">Cases Management</h2>
              <div className="space-y-3">
                {cases.slice(0, 8).map((caseItem) => (
                  <div key={caseItem.id} className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-bb-navy">
                      {caseItem.case_type} - {caseItem.status}
                    </p>
                    <p className="text-xs text-slate-500">Client: {(caseItem.clients as { name?: string })?.name ?? "N/A"}</p>
                    {hasAccess(context.permissions, "cases.edit") ? (
                      <form action={updateCaseStatusAction} className="mt-3 flex flex-wrap items-center gap-2">
                        <input type="hidden" name="case_id" value={caseItem.id} />
                        <Input name="status" placeholder="e.g. UNDER_REVIEW" className="h-9 max-w-[220px]" />
                        <Button size="sm" type="submit">
                          Update status
                        </Button>
                      </form>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {hasAccess(context.permissions, "documents.review") ? (
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-xl font-semibold text-bb-navy">Document Review</h2>
              <div className="space-y-3">
                {docs.slice(0, 10).map((doc) => (
                  <div key={doc.id} className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-700">
                      {doc.doc_type} - {doc.status}
                    </p>
                    <form action={reviewDocumentAction} className="mt-2 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                      <input type="hidden" name="document_id" value={doc.id} />
                      <Input name="status" placeholder="APPROVED / REJECTED" className="h-9" />
                      <Input name="reviewer_notes" placeholder="Reviewer notes" className="h-9" />
                      <Button size="sm" type="submit">
                        Save
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {hasAccess(context.permissions, "appointments.manage") ? (
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-xl font-semibold text-bb-navy">Appointments</h2>
              <div className="space-y-2 text-sm text-slate-600">
                {appointments.slice(0, 10).map((appointment) => (
                  <p key={appointment.id} className="rounded-lg bg-slate-50 px-3 py-2">
                    Case {appointment.case_id} • {new Date(appointment.scheduled_at).toLocaleString()} •{" "}
                    {appointment.location ?? "Virtual"}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {hasAccess(context.permissions, "tours.manage") ? (
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-xl font-semibold text-bb-navy">Tours Manager</h2>
              <p className="text-sm text-slate-600">Active tours: {content.tours.length}</p>
              <p className="text-xs text-slate-500">CRUD API endpoints are ready via Supabase tables and RLS for staff roles.</p>
            </CardContent>
          </Card>
        ) : null}

        {hasAccess(context.permissions, "content.manage") ? (
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-xl font-semibold text-bb-navy">Content Manager (CMS-lite)</h2>
              <p className="text-sm text-slate-600">
                Published testimonials: {content.testimonials.length} • Blog posts: {content.posts.length}
              </p>
              <p className="text-xs text-slate-500">Homepage sections, FAQs, testimonials, and blog content are database-driven.</p>
            </CardContent>
          </Card>
        ) : null}

        {hasAccess(context.permissions, "messages.manage") ? (
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-xl font-semibold text-bb-navy">Messaging</h2>
              <p className="text-sm text-slate-600">Use `case_messages` table to send portal updates and optional email notifications.</p>
            </CardContent>
          </Card>
        ) : null}

        {hasAccess(context.permissions, "audit.view") ? (
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-xl font-semibold text-bb-navy">Audit Logs</h2>
              <div className="space-y-2 text-xs text-slate-600">
                {logs.slice(0, 15).map((log) => (
                  <p key={log.id} className="rounded-lg bg-slate-50 px-3 py-2">
                    {new Date(log.created_at).toLocaleString()} • {log.action} • {log.target_type}:{log.target_id}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {context.profile.role === "super_admin" ? (
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-bb-navy">
                <Shield className="h-5 w-5 text-bb-gold" /> Super Admin Controls
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-bb-navy">
                    <UserCog className="h-4 w-4" /> Staff accounts
                  </p>
                  <p className="text-xs text-slate-600">Create staff users in Supabase Auth and assign roles via `staff_profiles`.</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-bb-navy">
                    <PlusCircle className="h-4 w-4" /> Permission mapping
                  </p>
                  <p className="text-xs text-slate-600">Configure access in `role_permissions` with module-level permission keys.</p>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <Label htmlFor="staff_role_help">Role restriction guidance</Label>
                <p id="staff_role_help" className="text-xs text-slate-600">
                  Access is controlled by database permission tables and RLS helpers (`is_super_admin`, `has_permission`,
                  `is_case_assignee`), not hardcoded UI checks.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
