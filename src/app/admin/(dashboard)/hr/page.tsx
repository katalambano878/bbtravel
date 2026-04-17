import { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserCog, CalendarDays, Clock, Banknote, UserSearch } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "HR — Admin Console" };

export default async function AdminHrPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  if (!(context.permissions.includes("hr.view") || context.profile.role === "super_admin")) {
    redirect("/admin");
  }

  const snapshot = await getHrSnapshot();
  const admin = createAdminClient();
  const { data: staffUsers } = await admin.from("staff_profiles").select("user_id, full_name").eq("is_active", true);

  const kpis = [
    { label: "Employees", value: snapshot.employees.length, icon: UserCog, accent: "border-l-blue-500" },
    { label: "Attendance", value: snapshot.attendance.length, icon: CalendarDays, accent: "border-l-emerald-500" },
    { label: "Leave Requests", value: snapshot.leaveRequests.length, icon: Clock, accent: "border-l-amber-500" },
    { label: "Payroll Inputs", value: snapshot.payrollInputs.length, icon: Banknote, accent: "border-l-violet-500" },
    { label: "Candidates", value: snapshot.candidates.length, icon: UserSearch, accent: "border-l-rose-500" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>
          People & HR
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          B.B. Travel Consult staff, departments, attendance, leave, and payroll.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
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

      {/* Org structure reference */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-bb-navy">Organisational structure</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {snapshot.departments.length} departments • {snapshot.teams.length} teams
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {snapshot.departments.map((dept) => {
              const deptTeams = snapshot.teams.filter((t) => t.department_id === dept.id);
              return (
                <div key={dept.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <p className="text-sm font-semibold text-bb-navy">{dept.name}</p>
                  {dept.description && (
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{dept.description}</p>
                  )}
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {deptTeams.length === 0 && (
                      <span className="text-xs text-slate-400">No teams configured.</span>
                    )}
                    {deptTeams.map((team) => (
                      <li
                        key={team.id}
                        className="inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600"
                      >
                        {team.name}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="employees">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees">
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-lg font-semibold text-bb-navy">Add Employee Record</h2>
                <form action={upsertEmployeeRecordAction} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Employee Code</Label>
                      <Input name="employee_code" placeholder="e.g. BB-001" required />
                    </div>
                    <div>
                      <Label className="text-xs">Linked User</Label>
                      <select name="user_id" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                        <option value="">Select user (optional)</option>
                        {(staffUsers ?? []).map((s) => (
                          <option key={s.user_id} value={s.user_id}>{s.full_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Job Title</Label>
                      <Input name="job_title" placeholder="Job title" required />
                    </div>
                    <div>
                      <Label className="text-xs">Base Salary (GHS)</Label>
                      <Input name="base_salary" type="number" placeholder="0.00" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Department</Label>
                      <select
                        name="department_id"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Select department</option>
                        {snapshot.departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Team</Label>
                      <select
                        name="team_id"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Select team</option>
                        {snapshot.teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Input name="manager_user_id" placeholder="Manager user ID" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Contract Start</Label>
                      <Input name="contract_start_date" type="date" />
                    </div>
                    <div>
                      <Label className="text-xs">Contract End</Label>
                      <Input name="contract_end_date" type="date" />
                    </div>
                  </div>
                  <Button type="submit">Save Employee</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-lg font-semibold text-bb-navy">Employee List</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {snapshot.employees.length === 0 && (
                      <TableRow><TableCell colSpan={3} className="text-center text-slate-400">No employees yet.</TableCell></TableRow>
                    )}
                    {snapshot.employees.slice(0, 20).map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium text-bb-navy">{emp.employee_code}</TableCell>
                        <TableCell>{emp.job_title}</TableCell>
                        <TableCell>
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-slate-600">
                            {emp.employment_status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-bb-navy">Record Attendance</h2>
              <form action={recordAttendanceAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Input name="employee_id" placeholder="Employee ID" required />
                <Input name="attendance_date" type="date" required />
                <select name="status" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late</option>
                  <option value="ABSENT">Absent</option>
                  <option value="HALF_DAY">Half Day</option>
                  <option value="LEAVE">Leave</option>
                </select>
                <Button type="submit" variant="secondary">Save</Button>
                <Input name="clock_in" type="datetime-local" placeholder="Clock in" />
                <Input name="clock_out" type="datetime-local" placeholder="Clock out" />
                <Input name="notes" placeholder="Notes" className="sm:col-span-2" />
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Tab */}
        <TabsContent value="leave">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-bb-navy">Approve / Reject Leave</h2>
              <form action={decideLeaveRequestAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Input name="leave_request_id" placeholder="Leave request ID" required />
                <select name="status" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option value="APPROVED">Approve</option>
                  <option value="REJECTED">Reject</option>
                </select>
                <Input name="approver_notes" placeholder="Approver notes" />
                <Button type="submit">Submit Decision</Button>
              </form>

              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-slate-700">Recent Leave Requests</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {snapshot.leaveRequests.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-slate-400">No leave requests.</TableCell></TableRow>
                    )}
                    {snapshot.leaveRequests.slice(0, 15).map((lr) => (
                      <TableRow key={lr.id}>
                        <TableCell className="text-sm text-bb-navy">{lr.employee_id?.toString().slice(0, 8)}</TableCell>
                        <TableCell className="text-xs uppercase text-slate-500">{lr.leave_type}</TableCell>
                        <TableCell className="text-xs text-slate-600">{lr.start_date}</TableCell>
                        <TableCell className="text-xs text-slate-600">{lr.end_date}</TableCell>
                        <TableCell>
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-slate-600">
                            {lr.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-bb-navy">Payroll Input</h2>
              <form action={upsertPayrollInputAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Input name="payroll_period_id" placeholder="Payroll period ID" required />
                <Input name="employee_id" placeholder="Employee ID" required />
                <Input name="base_salary" type="number" placeholder="Base salary" required />
                <Input name="allowances" type="number" placeholder="Allowances" defaultValue="0" />
                <Input name="deductions" type="number" placeholder="Deductions" defaultValue="0" />
                <Input name="overtime_amount" type="number" placeholder="Overtime" defaultValue="0" />
                <Input name="notes" placeholder="Notes" />
                <Button type="submit" variant="secondary">Save Payroll</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
