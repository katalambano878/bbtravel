import { redirect } from "next/navigation";

import {
  decideLeaveRequestAction,
  recordAttendanceAction,
  upsertEmployeeRecordAction,
  upsertPayrollInputAction
} from "@/app/actions";
import { getStaffAccessContext } from "@/lib/data/queries";
import { getHrSnapshot } from "@/lib/hr/service";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function AdminHrPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  if (!(context.permissions.includes("hr.view") || context.profile.role === "super_admin")) {
    redirect("/admin");
  }

  const snapshot = await getHrSnapshot();
  const admin = createAdminClient();
  const { data: staffUsers } = await admin.from("staff_profiles").select("user_id, full_name").eq("is_active", true);

  return (
    <section className="section-shell space-y-8">
      <div>
        <p className="eyebrow">HRMS</p>
        <h1 className="text-3xl font-semibold text-bb-navy">People, Attendance, Leave, Payroll, Performance</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Employees</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.employees.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Attendance Records</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.attendance.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Leave Requests</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.leaveRequests.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Payroll Inputs</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.payrollInputs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Internal Candidates</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.candidates.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-semibold text-bb-navy">Employee Record</h2>
            <form action={upsertEmployeeRecordAction} className="space-y-3">
              <Input name="employee_code" placeholder="Employee code (e.g. BB-001)" required />
              <select name="user_id" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="">Select linked user (optional)</option>
                {(staffUsers ?? []).map((staff) => (
                  <option key={staff.user_id} value={staff.user_id}>
                    {staff.full_name}
                  </option>
                ))}
              </select>
              <Input name="job_title" placeholder="Job title" required />
              <Input name="department_id" placeholder="Department ID (optional)" />
              <Input name="team_id" placeholder="Team ID (optional)" />
              <Input name="manager_user_id" placeholder="Manager user ID (optional)" />
              <Input name="base_salary" type="number" placeholder="Base salary (GHS)" required />
              <Input name="contract_start_date" type="date" />
              <Input name="contract_end_date" type="date" />
              <Button type="submit">Save employee record</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-semibold text-bb-navy">Record Attendance</h2>
            <form action={recordAttendanceAction} className="space-y-3">
              <Input name="employee_id" placeholder="Employee ID" required />
              <Input name="attendance_date" type="date" required />
              <select name="status" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="PRESENT">Present</option>
                <option value="LATE">Late</option>
                <option value="ABSENT">Absent</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="LEAVE">Leave</option>
              </select>
              <Input name="clock_in" type="datetime-local" />
              <Input name="clock_out" type="datetime-local" />
              <Input name="notes" placeholder="Notes (optional)" />
              <Button type="submit" variant="secondary">
                Save attendance
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-semibold text-bb-navy">Approve/Reject Leave</h2>
            <form action={decideLeaveRequestAction} className="space-y-3">
              <Input name="leave_request_id" placeholder="Leave request ID" required />
              <select name="status" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="APPROVED">Approve</option>
                <option value="REJECTED">Reject</option>
              </select>
              <Input name="approver_notes" placeholder="Approver notes" />
              <Button type="submit">Submit decision</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-semibold text-bb-navy">Payroll Input</h2>
            <form action={upsertPayrollInputAction} className="space-y-3">
              <Input name="payroll_period_id" placeholder="Payroll period ID" required />
              <Input name="employee_id" placeholder="Employee ID" required />
              <Input name="base_salary" type="number" placeholder="Base salary" required />
              <Input name="allowances" type="number" placeholder="Allowances" defaultValue="0" />
              <Input name="deductions" type="number" placeholder="Deductions" defaultValue="0" />
              <Input name="overtime_amount" type="number" placeholder="Overtime amount" defaultValue="0" />
              <Input name="notes" placeholder="Notes (optional)" />
              <Button type="submit" variant="secondary">
                Save payroll input
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
