import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Bell, ListTodo, Activity } from "lucide-react";

import { createNotificationAction, createSystemTaskAction } from "@/app/actions";
import { getStaffAccessContext } from "@/lib/data/queries";
import { getNotificationSnapshot } from "@/lib/notifications/service";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Notifications — Admin Console" };

export default async function AdminNotificationsPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  if (!(context.permissions.includes("messages.manage") || context.profile.role === "super_admin")) {
    redirect("/admin");
  }

  const snapshot = await getNotificationSnapshot();
  const admin = createAdminClient();
  const { data: staffUsers } = await admin.from("staff_profiles").select("user_id, full_name, role").eq("is_active", true);

  const kpis = [
    { label: "Notifications", value: snapshot.notifications.length, icon: Bell, accent: "border-l-blue-500" },
    { label: "System Tasks", value: snapshot.tasks.length, icon: ListTodo, accent: "border-l-emerald-500" },
    { label: "Event Stream", value: snapshot.events.length, icon: Activity, accent: "border-l-violet-500" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>Notifications & Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">Communications, reminders, and escalation management.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
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

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Create Notification */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-bb-navy flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-400" /> Create Notification
            </h2>
            <form action={createNotificationAction} className="space-y-3">
              <div>
                <Label className="text-xs">Recipient</Label>
                <select name="user_id" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  {(staffUsers ?? []).map((s) => (
                    <option key={s.user_id} value={s.user_id}>{s.full_name} ({s.role})</option>
                  ))}
                </select>
              </div>
              <Input name="title" placeholder="Notification title" required />
              <Input name="body" placeholder="Notification body" required />
              <div>
                <Label className="text-xs">Channel</Label>
                <select name="channel" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option value="IN_APP">In-app</option>
                  <option value="EMAIL">Email</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input name="entity_type" placeholder="Entity type" />
                <Input name="entity_id" placeholder="Entity ID" />
              </div>
              <Button type="submit">Send Notification</Button>
            </form>
          </CardContent>
        </Card>

        {/* Create System Task */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-bb-navy flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-slate-400" /> Create System Task
            </h2>
            <form action={createSystemTaskAction} className="space-y-3">
              <Input name="title" placeholder="Task title" required />
              <Input name="description" placeholder="Task description" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Assign To</Label>
                  <select name="assigned_to" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                    <option value="">Unassigned</option>
                    {(staffUsers ?? []).map((s) => (
                      <option key={s.user_id} value={s.user_id}>{s.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Priority</Label>
                  <select name="priority" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
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
              <Button type="submit">Create Task</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Recent notifications */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-bb-navy">Recent Notifications</h2>
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
                  <TableCell colSpan={4} className="text-center text-slate-400">No notifications yet.</TableCell>
                </TableRow>
              )}
              {snapshot.notifications.slice(0, 20).map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-medium text-bb-navy">{n.title}</TableCell>
                  <TableCell className="text-xs uppercase text-slate-500">{n.channel}</TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      {n.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {new Date(n.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
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
