import { redirect } from "next/navigation";

import { createNotificationAction, createSystemTaskAction } from "@/app/actions";
import { getStaffAccessContext } from "@/lib/data/queries";
import { getNotificationSnapshot } from "@/lib/notifications/service";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function AdminNotificationsPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/portal/login");
  if (!(context.permissions.includes("messages.manage") || context.profile.role === "super_admin")) {
    redirect("/admin");
  }

  const snapshot = await getNotificationSnapshot();
  const admin = createAdminClient();
  const { data: staffUsers } = await admin.from("staff_profiles").select("user_id, full_name, role").eq("is_active", true);

  return (
    <section className="section-shell space-y-8">
      <div>
        <p className="eyebrow">Notifications & Tasks</p>
        <h1 className="text-3xl font-semibold text-bb-navy">Comms, Reminders, Escalations</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Notifications</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.notifications.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">System Tasks</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.tasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Event Stream</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.events.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-semibold text-bb-navy">Create Notification</h2>
            <form action={createNotificationAction} className="space-y-3">
              <div>
                <Label htmlFor="user_id">User</Label>
                <select id="user_id" name="user_id" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                  {(staffUsers ?? []).map((staff) => (
                    <option key={staff.user_id} value={staff.user_id}>
                      {staff.full_name} ({staff.role})
                    </option>
                  ))}
                </select>
              </div>
              <Input name="title" placeholder="Notification title" required />
              <Input name="body" placeholder="Notification body" required />
              <select name="channel" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="IN_APP">In-app</option>
                <option value="EMAIL">Email</option>
              </select>
              <Input name="entity_type" placeholder="Entity type (optional)" />
              <Input name="entity_id" placeholder="Entity ID (optional)" />
              <Button type="submit">Create notification</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-semibold text-bb-navy">Create System Task</h2>
            <form action={createSystemTaskAction} className="space-y-3">
              <Input name="title" placeholder="Task title" required />
              <Input name="description" placeholder="Task description" />
              <select name="assigned_to" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="">Unassigned</option>
                {(staffUsers ?? []).map((staff) => (
                  <option key={staff.user_id} value={staff.user_id}>
                    {staff.full_name}
                  </option>
                ))}
              </select>
              <select name="priority" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
              <Input name="due_at" type="datetime-local" />
              <Input name="entity_type" placeholder="Entity type (optional)" />
              <Input name="entity_id" placeholder="Entity ID (optional)" />
              <Button type="submit">Create task</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
