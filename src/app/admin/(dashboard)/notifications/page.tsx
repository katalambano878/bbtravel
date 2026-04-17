import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Bell, ListTodo, Activity, BookOpen } from "lucide-react";

import { createSystemTaskAction } from "@/app/actions";
import { getStaffAccessContext } from "@/lib/data/queries";
import { getNotificationSnapshot } from "@/lib/notifications/service";
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
import { NotificationComposer } from "@/components/admin/notification-composer";
import { MESSAGE_TEMPLATES, TEMPLATE_GROUPS } from "@/lib/notifications/templates";

export const metadata: Metadata = { title: "Notifications — Admin Console" };

const CHANNEL_TONE: Record<string, string> = {
  IN_APP: "bg-slate-100 text-slate-600 border-slate-200",
  EMAIL: "bg-blue-50 text-blue-700 border-blue-100",
  WHATSAPP: "bg-emerald-50 text-emerald-700 border-emerald-100",
  SMS: "bg-violet-50 text-violet-700 border-violet-100"
};

export default async function AdminNotificationsPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  if (!(context.permissions.includes("messages.manage") || context.profile.role === "super_admin")) {
    redirect("/admin");
  }

  const snapshot = await getNotificationSnapshot();
  const admin = createAdminClient();
  const { data: staffUsers } = await admin
    .from("staff_profiles")
    .select("user_id, full_name, role")
    .eq("is_active", true);

  const kpis = [
    {
      label: "Notifications sent",
      value: snapshot.notifications.length,
      icon: Bell,
      accent: "border-l-blue-500"
    },
    {
      label: "System tasks",
      value: snapshot.tasks.length,
      icon: ListTodo,
      accent: "border-l-emerald-500"
    },
    {
      label: "Templates available",
      value: MESSAGE_TEMPLATES.length,
      icon: BookOpen,
      accent: "border-l-amber-500"
    },
    {
      label: "Event stream",
      value: snapshot.events.length,
      icon: Activity,
      accent: "border-l-violet-500"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-2xl font-bold text-bb-navy"
          style={{ fontFamily: "var(--font-sora)" }}
        >
          Client communications
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Send WhatsApp, email, SMS, or in-app messages using pre-baked templates
          for lead acknowledgement, visa updates, flight confirmations, invoices,
          and document follow-ups.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className={`border-l-4 ${accent}`}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="text-2xl font-bold text-bb-navy">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Create notification with template picker */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-bb-navy">
              <Bell className="h-4 w-4 text-slate-400" />
              Compose message
            </h2>
            <NotificationComposer staffUsers={staffUsers ?? []} />
          </CardContent>
        </Card>

        {/* System task (unchanged) */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-bb-navy">
              <ListTodo className="h-4 w-4 text-slate-400" />
              Create internal task
            </h2>
            <form action={createSystemTaskAction} className="space-y-3">
              <Input name="title" placeholder="Task title" required />
              <Input name="description" placeholder="Task description" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Assign to</Label>
                  <select
                    name="assigned_to"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {(staffUsers ?? []).map((s) => (
                      <option key={s.user_id} value={s.user_id}>
                        {s.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Priority</Label>
                  <select
                    name="priority"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>
              <Input name="due_at" type="datetime-local" />
              <div className="grid grid-cols-2 gap-3">
                <Input name="entity_type" placeholder="Entity type" />
                <Input name="entity_id" placeholder="Entity ID" />
              </div>
              <Button type="submit">Create task</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Template library */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-bb-navy">
              <BookOpen className="h-4 w-4 text-slate-400" />
              Message template library
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {MESSAGE_TEMPLATES.length} ready-to-send templates
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TEMPLATE_GROUPS.map((group) => (
              <div key={group} className="rounded-xl border border-slate-100 bg-slate-50/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {group}
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-bb-navy">
                  {MESSAGE_TEMPLATES.filter((t) => t.group === group).map((t) => (
                    <li key={t.key} className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 inline-flex rounded-full border px-1.5 py-0 text-[9px] font-bold uppercase ${
                          CHANNEL_TONE[t.channel] ?? ""
                        }`}
                      >
                        {t.channel}
                      </span>
                      <span className="text-[13px]">{t.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent notifications */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-bb-navy">Recent notifications</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshot.notifications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-400">
                    No notifications yet.
                  </TableCell>
                </TableRow>
              )}
              {snapshot.notifications.slice(0, 20).map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-medium text-bb-navy">{n.title}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        CHANNEL_TONE[n.channel as string] ??
                        "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {n.channel}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      {n.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {new Date(n.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short"
                    })}
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
