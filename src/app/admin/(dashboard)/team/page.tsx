import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserCog, CalendarDays, Clock, Banknote } from "lucide-react";

import {
  decideLeaveRequestAction,
  recordAttendanceAction,
  upsertEmployeeRecordAction,
  upsertPayrollInputAction
} from "@/app/actions";
import { getStaffAccessContext } from "@/lib/data/queries";
import { getHrSnapshot } from "@/lib/hr/service";
import { createAdminClient } from "@/lib/db/admin";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Team — B.B. Admin" };

type TabKey = "people" | "leave" | "attendance" | "payroll";

function formatDate(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GH", { dateStyle: "medium" });
}

export default async function AdminTeamPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  if (!(context.permissions.includes("hr.view") || context.profile.role === "super_admin")) {
    redirect("/admin");
  }

  const tab = ((await searchParams).tab as TabKey) ?? "people";
  const snapshot = await getHrSnapshot();
  const admin = createAdminClient();
  const { data: staffUsers } = await admin
    .from("staff_profiles")
    .select("user_id, full_name, role, department, custom_title")
    .eq("is_active", true)
    .order("full_name");

  const kpis = [
    { label: "Employees", value: snapshot.employees.length, icon: UserCog, accent: "border-l-blue-500" },
    { label: "Attendance entries", value: snapshot.attendance.length, icon: CalendarDays, accent: "border-l-emerald-500" },
    { label: "Pending leave", value: snapshot.leaveRequests.filter((l) => l.status === "PENDING").length, icon: Clock, accent: "border-l-amber-500" },
    { label: "Payroll inputs", value: snapshot.payrollInputs.length, icon: Banknote, accent: "border-l-violet-500" }
  ];

  const TABS: { key: TabKey; label: string }[] = [
    { key: "people", label: "People" },
    { key: "leave", label: "Leave" },
    { key: "attendance", label: "Attendance" },
    { key: "payroll", label: "Payroll" }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>
        Team
      </h1>

      <div className="grid gap-3 md:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className={`border-l-4 ${accent}`}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="text-xl font-bold text-bb-navy">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/team?tab=${t.key}`}
            className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
              tab === t.key ? "border-bb-navy text-bb-navy" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "people" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-bold text-bb-navy">Add / update employee</h2>
              <form action={upsertEmployeeRecordAction} className="grid grid-cols-2 gap-3">
                <input
                  name="employee_code"
                  required
                  placeholder="Employee code (e.g. BB-001)"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <select
                  name="user_id"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  defaultValue=""
                >
                  <option value="">Link staff login (optional)</option>
                  {(staffUsers ?? []).map((s) => (
                    <option key={s.user_id as string} value={s.user_id as string}>
                      {s.full_name}
                    </option>
                  ))}
                </select>
                <input
                  name="job_title"
                  required
                  placeholder="Job title"
                  className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  name="base_salary"
                  type="number"
                  step="0.01"
                  required
                  placeholder="Base salary (GHS)"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <select
                  name="department_id"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  defaultValue=""
                >
                  <option value="">Department…</option>
                  {snapshot.departments.map((d) => (
                    <option key={d.id as string} value={d.id as string}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <select
                  name="team_id"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  defaultValue=""
                >
                  <option value="">Team…</option>
                  {snapshot.teams.map((t) => (
                    <option key={t.id as string} value={t.id as string}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <input
                  name="contract_start_date"
                  type="date"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  name="contract_end_date"
                  type="date"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="col-span-2 rounded-lg bg-bb-navy px-4 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90"
                >
                  Save employee
                </button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-bold text-bb-navy">Directory ({(staffUsers ?? []).length})</h2>
              <ul className="divide-y divide-slate-100">
                {(staffUsers ?? []).map((s) => (
                  <li key={s.user_id as string} className="flex items-center justify-between gap-2 py-2">
                    <div>
                      <p className="text-[12px] font-semibold text-bb-navy">{s.full_name}</p>
                      <p className="text-[11px] text-slate-500">
                        {s.custom_title || String(s.role).replace(/_/g, " ")}
                        {s.department ? ` · ${s.department}` : ""}
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                      {s.role}
                    </span>
                  </li>
                ))}
                {(staffUsers ?? []).length === 0 ? (
                  <li className="py-6 text-center text-[12px] text-slate-400">No staff yet.</li>
                ) : null}
              </ul>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-bold text-bb-navy">Employees on payroll</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-2.5 text-left font-semibold">Code</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Title</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Base (GHS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 [&_tr]:transition-colors [&_tr:hover]:bg-slate-50/60">
                    {snapshot.employees.map((e) => (
                      <tr key={e.id as string}>
                        <td className="px-4 py-2 font-semibold text-bb-navy">{e.employee_code}</td>
                        <td className="px-4 py-2 text-[12px] text-slate-700">{e.job_title}</td>
                        <td className="px-4 py-2 text-[11px] text-slate-500">{e.employment_status}</td>
                        <td className="px-4 py-2 text-right text-[12px] text-slate-700">
                          {Number(e.base_salary ?? 0).toLocaleString("en-GH")}
                        </td>
                      </tr>
                    ))}
                    {snapshot.employees.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-[12px] text-slate-400">
                          No employees yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "leave" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-2.5 text-left font-semibold">Employee</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Type</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Start</th>
                    <th className="px-4 py-2.5 text-left font-semibold">End</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&_tr]:transition-colors [&_tr:hover]:bg-slate-50/60">
                  {snapshot.leaveRequests.map((lr) => (
                    <tr key={lr.id as string}>
                      <td className="px-4 py-2 text-[12px] text-bb-navy">{String(lr.employee_id).slice(0, 8)}…</td>
                      <td className="px-4 py-2 text-[11px] uppercase text-slate-500">{lr.leave_types?.leave_name ?? "—"}</td>
                      <td className="px-4 py-2 text-[12px] text-slate-600">{formatDate(lr.start_date as string)}</td>
                      <td className="px-4 py-2 text-[12px] text-slate-600">{formatDate(lr.end_date as string)}</td>
                      <td className="px-4 py-2 text-[12px]">{lr.status}</td>
                      <td className="px-4 py-2 text-right">
                        {lr.status === "PENDING" ? (
                          <div className="inline-flex items-center gap-1">
                            <form action={decideLeaveRequestAction} className="inline-flex">
                              <input type="hidden" name="leave_request_id" value={lr.id as string} />
                              <input type="hidden" name="status" value="APPROVED" />
                              <button
                                type="submit"
                                className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100"
                              >
                                Approve
                              </button>
                            </form>
                            <form action={decideLeaveRequestAction} className="inline-flex">
                              <input type="hidden" name="leave_request_id" value={lr.id as string} />
                              <input type="hidden" name="status" value="REJECTED" />
                              <button
                                type="submit"
                                className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 hover:bg-rose-100"
                              >
                                Reject
                              </button>
                            </form>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {snapshot.leaveRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-[12px] text-slate-400">
                        No leave requests yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "attendance" && (
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 text-sm font-bold text-bb-navy">Record attendance</h2>
            <form action={recordAttendanceAction} className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <select
                name="employee_id"
                required
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
              >
                <option value="">Select employee…</option>
                {snapshot.employees.map((e) => (
                  <option key={e.id as string} value={e.id as string}>
                    {e.employee_code} — {e.job_title}
                  </option>
                ))}
              </select>
              <input
                name="attendance_date"
                required
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <select
                name="status"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                defaultValue="PRESENT"
              >
                <option value="PRESENT">Present</option>
                <option value="LATE">Late</option>
                <option value="ABSENT">Absent</option>
                <option value="HALF_DAY">Half day</option>
                <option value="LEAVE">Leave</option>
              </select>
              <input
                name="clock_in"
                type="datetime-local"
                placeholder="Clock in"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                name="clock_out"
                type="datetime-local"
                placeholder="Clock out"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                name="notes"
                placeholder="Notes"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
              />
              <button
                type="submit"
                className="rounded-lg bg-bb-navy px-4 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90"
              >
                Save
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {tab === "payroll" && (
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 text-sm font-bold text-bb-navy">Payroll input</h2>
            <form action={upsertPayrollInputAction} className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <input
                name="payroll_period_id"
                required
                placeholder="Payroll period ID"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
              />
              <select
                name="employee_id"
                required
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
              >
                <option value="">Employee…</option>
                {snapshot.employees.map((e) => (
                  <option key={e.id as string} value={e.id as string}>
                    {e.employee_code} — {e.job_title}
                  </option>
                ))}
              </select>
              <input
                name="base_salary"
                type="number"
                step="0.01"
                required
                placeholder="Base"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                name="allowances"
                type="number"
                step="0.01"
                defaultValue="0"
                placeholder="Allowances"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                name="deductions"
                type="number"
                step="0.01"
                defaultValue="0"
                placeholder="Deductions"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                name="overtime_amount"
                type="number"
                step="0.01"
                defaultValue="0"
                placeholder="Overtime"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                name="notes"
                placeholder="Notes"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-3"
              />
              <button
                type="submit"
                className="rounded-lg bg-bb-navy px-4 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90 md:col-span-4"
              >
                Save payroll input
              </button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
