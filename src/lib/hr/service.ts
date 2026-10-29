import { createAdminClient } from "@/lib/db/admin";
import { requirePermission } from "@/lib/auth/policy";
import { writeAuditEvent } from "@/lib/audit/events";

export async function upsertEmployeeRecord(input: {
  employeeCode: string;
  fullName?: string;
  userId?: string;
  jobTitle: string;
  departmentId?: string;
  teamId?: string;
  managerUserId?: string;
  baseSalary: number;
  contractStartDate?: string;
  contractEndDate?: string;
}) {
  const context = await requirePermission("hr.staff.manage");
  const admin = createAdminClient();

  const payload = {
    user_id: input.userId ?? null,
    employee_code: input.employeeCode,
    job_title: input.jobTitle,
    department_id: input.departmentId || null,
    team_id: input.teamId || null,
    manager_user_id: input.managerUserId || null,
    base_salary: input.baseSalary,
    contract_start_date: input.contractStartDate || null,
    contract_end_date: input.contractEndDate || null
  };

  const { data, error } = await admin.from("employee_records").upsert(payload, { onConflict: "employee_code" }).select("*").single();
  if (error) throw error;

  await writeAuditEvent({
    actorId: context.user.id,
    action: "EMPLOYEE_RECORD_UPSERTED",
    targetType: "employee_record",
    targetId: data.id,
    payload
  });
}

export async function recordAttendance(input: {
  employeeId: string;
  attendanceDate: string;
  status: "PRESENT" | "LATE" | "ABSENT" | "HALF_DAY" | "LEAVE";
  clockIn?: string;
  clockOut?: string;
  notes?: string;
}) {
  const context = await requirePermission("hr.staff.manage");
  const admin = createAdminClient();
  await admin.from("attendance_records").upsert(
    {
      employee_id: input.employeeId,
      attendance_date: input.attendanceDate,
      status: input.status,
      clock_in: input.clockIn || null,
      clock_out: input.clockOut || null,
      notes: input.notes || null,
      created_by: context.user.id
    },
    { onConflict: "employee_id,attendance_date" }
  );
}

export async function decideLeaveRequest(input: { leaveRequestId: string; status: "APPROVED" | "REJECTED"; approverNotes?: string }) {
  const context = await requirePermission("hr.leave.approve");
  const admin = createAdminClient();
  const { data: leaveRequest } = await admin.from("leave_requests").select("id, employee_id, requested_days, leave_type_id").eq("id", input.leaveRequestId).single();
  if (!leaveRequest) throw new Error("Leave request not found.");

  await admin
    .from("leave_requests")
    .update({
      status: input.status,
      approver_user_id: context.user.id,
      approver_notes: input.approverNotes ?? null,
      decision_at: new Date().toISOString()
    })
    .eq("id", input.leaveRequestId);

  if (input.status === "APPROVED") {
    const currentYear = new Date().getFullYear();
    const { data: balance } = await admin
      .from("leave_balances")
      .select("*")
      .eq("employee_id", leaveRequest.employee_id)
      .eq("leave_type_id", leaveRequest.leave_type_id)
      .eq("period_year", currentYear)
      .maybeSingle();
    if (balance) {
      await admin
        .from("leave_balances")
        .update({ balance_days: Math.max(Number(balance.balance_days) - Number(leaveRequest.requested_days), 0) })
        .eq("id", balance.id);
    }
  }

  await writeAuditEvent({
    actorId: context.user.id,
    action: "LEAVE_REQUEST_DECIDED",
    targetType: "leave_request",
    targetId: input.leaveRequestId,
    payload: { status: input.status }
  });
}

export async function upsertPayrollInput(input: {
  payrollPeriodId: string;
  employeeId: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  overtimeAmount: number;
  notes?: string;
}) {
  const context = await requirePermission("hr.payroll.manage");
  const admin = createAdminClient();
  const { data: period } = await admin.from("payroll_periods").select("status").eq("id", input.payrollPeriodId).single();
  if (period?.status && period.status !== "OPEN") throw new Error("Payroll period is not open for edits.");

  await admin.from("payroll_inputs").upsert(
    {
      payroll_period_id: input.payrollPeriodId,
      employee_id: input.employeeId,
      base_salary: input.baseSalary,
      allowances: input.allowances,
      deductions: input.deductions,
      overtime_amount: input.overtimeAmount,
      notes: input.notes ?? null,
      created_by: context.user.id
    },
    { onConflict: "payroll_period_id,employee_id" }
  );
}

export async function getHrSnapshot() {
  await requirePermission("hr.view");
  const admin = createAdminClient();
  const [departments, teams, employees, attendance, leaveRequests, payrollPeriods, payrollInputs, reviews, candidates] = await Promise.all([
    admin.from("departments").select("*").order("name"),
    admin.from("teams").select("*").order("name"),
    admin.from("employee_records").select("*").order("created_at", { ascending: false }).limit(200),
    admin.from("attendance_records").select("*").order("attendance_date", { ascending: false }).limit(200),
    admin.from("leave_requests").select("*, leave_types(leave_name)").order("created_at", { ascending: false }).limit(200),
    admin.from("payroll_periods").select("*").order("period_start", { ascending: false }).limit(12),
    admin.from("payroll_inputs").select("*").order("created_at", { ascending: false }).limit(300),
    admin.from("performance_reviews").select("*").order("created_at", { ascending: false }).limit(200),
    admin.from("internal_candidates").select("*").order("created_at", { ascending: false }).limit(200)
  ]);

  return {
    departments: departments.data ?? [],
    teams: teams.data ?? [],
    employees: employees.data ?? [],
    attendance: attendance.data ?? [],
    leaveRequests: leaveRequests.data ?? [],
    payrollPeriods: payrollPeriods.data ?? [],
    payrollInputs: payrollInputs.data ?? [],
    performanceReviews: reviews.data ?? [],
    candidates: candidates.data ?? []
  };
}
