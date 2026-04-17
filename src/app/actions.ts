"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { wizardSchema, type WizardPayload } from "@/lib/validators/wizard";
import { calculateReadinessScore } from "@/lib/utils/readiness-score";
import { requirePermission } from "@/lib/auth/policy";
import { writeAuditEvent } from "@/lib/audit/events";
import { updateSystemSettings } from "@/lib/settings/system-settings";
import { addLeadActivity, assignLead, convertLeadToClientAndCase } from "@/lib/crm/service";
import { addCaseNote, createCaseTask, linkCases } from "@/lib/cases/service";
import { createNotification, createSystemTask } from "@/lib/notifications/service";
import { createDocumentVersion, requestDocumentReview } from "@/lib/documents/service";
import { decideLeaveRequest, recordAttendance, upsertEmployeeRecord, upsertPayrollInput } from "@/lib/hr/service";
import { createInvoice, decideExpense, processRefund, recordInvoicePayment } from "@/lib/finance/service";
import { createScheduledReport, queueReportExport, saveReportView } from "@/lib/reports/service";

function buildChecklist(payload: WizardPayload) {
  const base = ["Identity details validated", "Initial consultation completed"];

  if (payload.service_type === "VISA_ASSISTANCE") {
    return [...base, "Passport validity check", "Visa form guidance", "Appointment prep"];
  }
  if (payload.service_type === "INTERNATIONAL_RECRUITMENT") {
    return [...base, "CV review", "Credentials verification", "Interview prep"];
  }
  if (payload.service_type === "STUDY_ABROAD") {
    return [...base, "Program fit review", "Application document prep", "Student visa readiness"];
  }
  if (payload.service_type === "TOUR_PACKAGE") {
    return [...base, "Itinerary planning", "Budget matching", "Travel documentation guidance"];
  }
  if (payload.service_type === "FLIGHT_RESERVATION") {
    return [...base, "Route and fare comparison", "Ticket issuance", "Pre-flight checklist"];
  }
  return [...base, "Hotel preference review", "Reservation policy alignment", "Stay coordination setup"];
}

export async function submitWizardAction(formData: FormData) {
  const payload = wizardSchema.parse({
    service_type: formData.get("service_type"),
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    destination: formData.get("destination"),
    timeline: formData.get("timeline"),
    budget_range: formData.get("budget_range"),
    experience_level: formData.get("experience_level"),
    education_level: formData.get("education_level"),
    passport_status: formData.get("passport_status"),
    travel_history: formData.get("travel_history"),
    notes: formData.get("notes")
  });

  const score = calculateReadinessScore(payload);
  const checklist = buildChecklist(payload);

  const admin = createAdminClient();

  const { data: lead } = await admin
    .from("leads")
    .insert({
      service_type: payload.service_type,
      name: payload.full_name,
      phone: payload.phone,
      email: payload.email,
      destination: payload.destination,
      timeline: payload.timeline,
      notes: payload.notes
    })
    .select("id")
    .single();

  let clientId: string | null = null;
  const { data: existingClient } = await admin.from("clients").select("id").eq("email", payload.email).maybeSingle();

  if (existingClient) {
    clientId = existingClient.id;
  } else {
    const { data: createdClient } = await admin
      .from("clients")
      .insert({
        name: payload.full_name,
        phone: payload.phone,
        email: payload.email
      })
      .select("id")
      .single();
    clientId = createdClient?.id ?? null;
  }

  if (!clientId) {
    throw new Error("Unable to create or find client profile");
  }

  const { data: caseRecord } = await admin
    .from("cases")
    .insert({
      client_id: clientId,
      case_type: payload.service_type,
      status: "SUBMITTED",
      meta: {
        destination: payload.destination,
        timeline: payload.timeline,
        budget_range: payload.budget_range,
        experience_level: payload.experience_level,
        education_level: payload.education_level,
        passport_status: payload.passport_status,
        travel_history: payload.travel_history,
        readiness_score: score,
        checklist
      }
    })
    .select("id")
    .single();

  if (caseRecord?.id) {
    await admin.from("case_steps").insert(
      checklist.map((step, index) => ({
        case_id: caseRecord.id,
        step_key: `step_${index + 1}`,
        title: step,
        status: index === 0 ? "COMPLETED" : "PENDING"
      }))
    );
  }

  revalidatePath("/admin");
  redirect(`/start-application/success?lead=${lead?.id ?? ""}&case=${caseRecord?.id ?? ""}&score=${score}`);
}

export async function submitContactAction(formData: FormData) {
  const admin = createAdminClient();
  await admin.from("leads").insert({
    service_type: formData.get("service_type") || "VISA_ASSISTANCE",
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    notes: `Contact form: ${formData.get("message")}`
  });
  revalidatePath("/admin");
}

export async function signUpAction(formData: FormData) {
  const supabase = await createServerClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.APP_BASE_URL}/portal`
    }
  });

  if (error) throw error;

  if (data.user) {
    const admin = createAdminClient();
    await admin.from("clients").upsert(
      {
        user_id: data.user.id,
        name: fullName,
        email
      },
      { onConflict: "user_id" }
    );
  }

  redirect("/portal/login?registered=true");
}

export async function signInAction(formData: FormData) {
  const supabase = await createServerClient();
  const admin = createAdminClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent");
  const ipAddress = requestHeaders.get("x-forwarded-for") ?? requestHeaders.get("x-real-ip");

  const { data: policy } = await admin.from("auth_security_policies").select("*").eq("id", 1).maybeSingle();
  const maxFailedAttempts = policy?.max_failed_attempts ?? 5;
  const lockoutMinutes = policy?.lockout_minutes ?? 15;

  const { data: loginAttempt } = await admin.from("staff_login_attempts").select("*").eq("email", email).maybeSingle();
  if (loginAttempt?.locked_until && new Date(loginAttempt.locked_until) > new Date()) {
    await admin.from("staff_login_events").insert({
      email,
      ip_address: ipAddress,
      user_agent: userAgent,
      login_status: "LOCKED",
      failure_reason: "LOCKOUT_ACTIVE"
    });
    throw new Error("Account temporarily locked due to repeated failed login attempts.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const failedAttempts = (loginAttempt?.failed_attempts ?? 0) + 1;
    const shouldLock = failedAttempts >= maxFailedAttempts;
    const lockedUntil = shouldLock ? new Date(Date.now() + lockoutMinutes * 60 * 1000).toISOString() : null;

    await admin.from("staff_login_attempts").upsert({
      email,
      failed_attempts: failedAttempts,
      last_attempt_at: new Date().toISOString(),
      locked_until: lockedUntil
    });
    await admin.from("staff_login_events").insert({
      email,
      ip_address: ipAddress,
      user_agent: userAgent,
      login_status: shouldLock ? "LOCKED" : "FAILED",
      failure_reason: error.message
    });
    throw error;
  }

  await admin.from("staff_login_attempts").upsert({
    email,
    failed_attempts: 0,
    last_attempt_at: new Date().toISOString(),
    locked_until: null
  });
  await admin.from("staff_login_events").insert({
    user_id: data.user?.id ?? null,
    email,
    ip_address: ipAddress,
    user_agent: userAgent,
    login_status: "SUCCESS"
  });

  if (data.user?.id) {
    await admin.from("staff_profiles").update({ last_login_at: new Date().toISOString() }).eq("user_id", data.user.id);
  }
  redirect("/portal");
}

export async function adminSignInAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createServerClient();
  const admin = createAdminClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent");
  const ipAddress = requestHeaders.get("x-forwarded-for") ?? requestHeaders.get("x-real-ip");

  const { data: policy } = await admin.from("auth_security_policies").select("*").eq("id", 1).maybeSingle();
  const maxFailedAttempts = policy?.max_failed_attempts ?? 5;
  const lockoutMinutes = policy?.lockout_minutes ?? 15;

  const { data: loginAttempt } = await admin.from("staff_login_attempts").select("*").eq("email", email).maybeSingle();
  if (loginAttempt?.locked_until && new Date(loginAttempt.locked_until) > new Date()) {
    await admin.from("staff_login_events").insert({
      email,
      ip_address: ipAddress,
      user_agent: userAgent,
      login_status: "LOCKED",
      failure_reason: "LOCKOUT_ACTIVE"
    });
    return { error: "Account temporarily locked due to repeated failed login attempts." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const failedAttempts = (loginAttempt?.failed_attempts ?? 0) + 1;
    const shouldLock = failedAttempts >= maxFailedAttempts;
    const lockedUntil = shouldLock ? new Date(Date.now() + lockoutMinutes * 60 * 1000).toISOString() : null;

    await admin.from("staff_login_attempts").upsert({
      email,
      failed_attempts: failedAttempts,
      last_attempt_at: new Date().toISOString(),
      locked_until: lockedUntil
    });
    await admin.from("staff_login_events").insert({
      email,
      ip_address: ipAddress,
      user_agent: userAgent,
      login_status: shouldLock ? "LOCKED" : "FAILED",
      failure_reason: error.message
    });
    return { error: "Invalid email or password." };
  }

  const { data: staffProfile } = await admin
    .from("staff_profiles")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!staffProfile) {
    await supabase.auth.signOut();
    return { error: "Access denied. This login is for authorised staff only." };
  }

  await admin.from("staff_login_attempts").upsert({
    email,
    failed_attempts: 0,
    last_attempt_at: new Date().toISOString(),
    locked_until: null
  });
  await admin.from("staff_login_events").insert({
    user_id: data.user.id,
    email,
    ip_address: ipAddress,
    user_agent: userAgent,
    login_status: "SUCCESS"
  });
  await admin.from("staff_profiles").update({ last_login_at: new Date().toISOString() }).eq("user_id", data.user.id);

  return { success: true };
}

export async function resetPasswordAction(formData: FormData) {
  const supabase = await createServerClient();
  const email = String(formData.get("email") || "");
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.APP_BASE_URL}/portal/reset-password`
  });
  redirect("/portal/login?reset=true");
}

export async function signOutAction() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/portal/login");
}

export async function updateCaseStatusAction(formData: FormData) {
  const context = await requirePermission("cases.status.change_owner");
  const admin = createAdminClient();
  const caseId = String(formData.get("case_id") || "");
  const status = String(formData.get("status") || "");
  const assignedTo = String(formData.get("assigned_to") || "");
  await admin.from("cases").update({ status }).eq("id", caseId);
  if (assignedTo) {
    await admin.from("cases").update({ assigned_to: assignedTo }).eq("id", caseId);
  }
  await writeAuditEvent({
    actorId: context.user.id,
    action: "CASE_STATUS_UPDATED",
    targetType: "case",
    targetId: caseId,
    payload: {
      status,
      assigned_to: assignedTo || null
    }
  });
  revalidatePath("/admin");
  revalidatePath("/portal");
}

export async function reviewDocumentAction(formData: FormData) {
  const context = await requirePermission("documents.review");
  const admin = createAdminClient();
  const documentId = String(formData.get("document_id") || "");
  const status = String(formData.get("status") || "APPROVED");
  const reviewerNotes = String(formData.get("reviewer_notes") || "");
  await admin.from("documents").update({ status, reviewer_notes: reviewerNotes }).eq("id", documentId);
  await writeAuditEvent({
    actorId: context.user.id,
    action: "DOCUMENT_REVIEWED",
    targetType: "document",
    targetId: documentId,
    payload: { status, reviewer_notes: reviewerNotes }
  });
  revalidatePath("/admin");
  revalidatePath("/portal");
}

export async function updateSystemSettingsAction(formData: FormData) {
  await requirePermission("settings.manage");
  const payload = {
    company_profile: {
      company_name: String(formData.get("company_name") || "B.B. Travel Consult"),
      legal_name: String(formData.get("legal_name") || "Bright Brown Travel Consult"),
      phone: String(formData.get("phone") || ""),
      secondary_phone: String(formData.get("secondary_phone") || ""),
      email: String(formData.get("email") || ""),
      address: String(formData.get("address") || ""),
      digital_address: String(formData.get("digital_address") || "")
    },
    approval_thresholds: {
      expense_tier_1: Number(formData.get("expense_tier_1") || 1000),
      expense_tier_2: Number(formData.get("expense_tier_2") || 5000)
    }
  };
  await updateSystemSettings(payload);
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
}

export async function assignLeadAction(formData: FormData) {
  await assignLead({
    leadId: String(formData.get("lead_id") || ""),
    assigneeUserId: String(formData.get("assignee_user_id") || ""),
    reason: String(formData.get("reason") || ""),
    mode: (String(formData.get("mode") || "MANUAL") as "ROUND_ROBIN" | "MANUAL" | "AUTO")
  });
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
}

export async function addLeadActivityAction(formData: FormData) {
  await addLeadActivity({
    leadId: String(formData.get("lead_id") || ""),
    type: String(formData.get("activity_type") || "NOTE") as
      | "NOTE"
      | "CALL"
      | "EMAIL"
      | "WHATSAPP"
      | "TASK"
      | "STATUS_CHANGE"
      | "ASSIGNMENT",
    note: String(formData.get("activity_note") || ""),
    meta: {
      next_action_date: String(formData.get("next_action_date") || "")
    }
  });
  revalidatePath("/admin/crm");
}

export async function convertLeadAction(formData: FormData) {
  await convertLeadToClientAndCase({
    leadId: String(formData.get("lead_id") || ""),
    caseType: String(formData.get("case_type") || "VISA_ASSISTANCE")
  });
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
}

export async function createCaseTaskAction(formData: FormData) {
  await createCaseTask({
    caseId: String(formData.get("case_id") || ""),
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    priority: String(formData.get("priority") || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    dueAt: String(formData.get("due_at") || ""),
    assignedTo: String(formData.get("assigned_to") || "")
  });
  revalidatePath("/admin/cases");
}

export async function addCaseNoteAction(formData: FormData) {
  await addCaseNote({
    caseId: String(formData.get("case_id") || ""),
    note: String(formData.get("note") || ""),
    visibility: String(formData.get("visibility") || "INTERNAL") as "INTERNAL" | "CLIENT_VISIBLE"
  });
  revalidatePath("/admin/cases");
}

export async function linkCasesAction(formData: FormData) {
  await linkCases({
    primaryCaseId: String(formData.get("primary_case_id") || ""),
    linkedCaseId: String(formData.get("linked_case_id") || ""),
    relationType: String(formData.get("relation_type") as string) as "SUB_CASE" | "DEPENDENT" | "FOLLOW_ON"
  });
  revalidatePath("/admin/cases");
}

export async function requestDocumentReviewAction(formData: FormData) {
  await requestDocumentReview({
    documentId: String(formData.get("document_id") || ""),
    reviewNotes: String(formData.get("review_notes") || ""),
    requestedChanges: String(formData.get("requested_changes") || "")
  });
  revalidatePath("/admin/documents");
  revalidatePath("/admin");
}

export async function createDocumentVersionAction(formData: FormData) {
  await createDocumentVersion({
    documentId: String(formData.get("document_id") || ""),
    fileUrl: String(formData.get("file_url") || ""),
    fileName: String(formData.get("file_name") || ""),
    mimeType: String(formData.get("mime_type") || "")
  });
  revalidatePath("/admin/documents");
}

export async function createNotificationAction(formData: FormData) {
  await createNotification({
    userId: String(formData.get("user_id") || ""),
    title: String(formData.get("title") || ""),
    body: String(formData.get("body") || ""),
    channel: String(formData.get("channel") || "IN_APP") as "IN_APP" | "EMAIL",
    entityType: String(formData.get("entity_type") || ""),
    entityId: String(formData.get("entity_id") || "")
  });
  revalidatePath("/admin/notifications");
}

export async function createSystemTaskAction(formData: FormData) {
  await createSystemTask({
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    assignedTo: String(formData.get("assigned_to") || ""),
    dueAt: String(formData.get("due_at") || ""),
    priority: String(formData.get("priority") || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    entityType: String(formData.get("entity_type") || ""),
    entityId: String(formData.get("entity_id") || "")
  });
  revalidatePath("/admin/notifications");
}

export async function upsertEmployeeRecordAction(formData: FormData) {
  await upsertEmployeeRecord({
    employeeCode: String(formData.get("employee_code") || ""),
    userId: String(formData.get("user_id") || ""),
    jobTitle: String(formData.get("job_title") || ""),
    departmentId: String(formData.get("department_id") || ""),
    teamId: String(formData.get("team_id") || ""),
    managerUserId: String(formData.get("manager_user_id") || ""),
    baseSalary: Number(formData.get("base_salary") || 0),
    contractStartDate: String(formData.get("contract_start_date") || ""),
    contractEndDate: String(formData.get("contract_end_date") || "")
  });
  revalidatePath("/admin/hr");
}

export async function recordAttendanceAction(formData: FormData) {
  await recordAttendance({
    employeeId: String(formData.get("employee_id") || ""),
    attendanceDate: String(formData.get("attendance_date") || ""),
    status: String(formData.get("status") || "PRESENT") as "PRESENT" | "LATE" | "ABSENT" | "HALF_DAY" | "LEAVE",
    clockIn: String(formData.get("clock_in") || ""),
    clockOut: String(formData.get("clock_out") || ""),
    notes: String(formData.get("notes") || "")
  });
  revalidatePath("/admin/hr");
}

export async function decideLeaveRequestAction(formData: FormData) {
  await decideLeaveRequest({
    leaveRequestId: String(formData.get("leave_request_id") || ""),
    status: String(formData.get("status") || "APPROVED") as "APPROVED" | "REJECTED",
    approverNotes: String(formData.get("approver_notes") || "")
  });
  revalidatePath("/admin/hr");
}

export async function upsertPayrollInputAction(formData: FormData) {
  await upsertPayrollInput({
    payrollPeriodId: String(formData.get("payroll_period_id") || ""),
    employeeId: String(formData.get("employee_id") || ""),
    baseSalary: Number(formData.get("base_salary") || 0),
    allowances: Number(formData.get("allowances") || 0),
    deductions: Number(formData.get("deductions") || 0),
    overtimeAmount: Number(formData.get("overtime_amount") || 0),
    notes: String(formData.get("notes") || "")
  });
  revalidatePath("/admin/hr");
}

export async function createInvoiceAction(formData: FormData) {
  const itemDescription = String(formData.get("item_description") || "");
  const itemQuantity = Number(formData.get("item_quantity") || 1);
  const itemUnitPrice = Number(formData.get("item_unit_price") || 0);
  await createInvoice({
    clientId: String(formData.get("client_id") || ""),
    caseId: String(formData.get("case_id") || ""),
    dueDate: String(formData.get("due_date") || ""),
    taxAmount: Number(formData.get("tax_amount") || 0),
    discountAmount: Number(formData.get("discount_amount") || 0),
    notes: String(formData.get("notes") || ""),
    items: [
      {
        description: itemDescription,
        quantity: itemQuantity,
        unitPrice: itemUnitPrice,
        taxRate: Number(formData.get("item_tax_rate") || 0)
      }
    ]
  });
  revalidatePath("/admin/finance");
}

export async function recordInvoicePaymentAction(formData: FormData) {
  await recordInvoicePayment({
    invoiceId: String(formData.get("invoice_id") || ""),
    amount: Number(formData.get("amount") || 0),
    paymentMethod: String(formData.get("payment_method") || "BANK_TRANSFER") as "CASH" | "BANK_TRANSFER" | "MOBILE_MONEY" | "CARD" | "OTHER",
    reference: String(formData.get("reference") || ""),
    notes: String(formData.get("notes") || "")
  });
  revalidatePath("/admin/finance");
}

export async function decideExpenseAction(formData: FormData) {
  await decideExpense({
    expenseId: String(formData.get("expense_id") || ""),
    status: String(formData.get("status") || "APPROVED") as "APPROVED" | "REJECTED",
    approverNotes: String(formData.get("approver_notes") || "")
  });
  revalidatePath("/admin/finance");
}

export async function processRefundAction(formData: FormData) {
  await processRefund({
    invoiceId: String(formData.get("invoice_id") || ""),
    paymentId: String(formData.get("payment_id") || ""),
    refundAmount: Number(formData.get("refund_amount") || 0),
    reason: String(formData.get("reason") || "")
  });
  revalidatePath("/admin/finance");
}

export async function saveReportViewAction(formData: FormData) {
  await saveReportView({
    reportKey: String(formData.get("report_key") || "executive_dashboard"),
    viewName: String(formData.get("view_name") || "Default View"),
    filters: {
      date_from: String(formData.get("date_from") || ""),
      date_to: String(formData.get("date_to") || "")
    }
  });
  revalidatePath("/admin/bi");
}

export async function queueReportExportAction(formData: FormData) {
  await queueReportExport({
    reportKey: String(formData.get("report_key") || "executive_dashboard"),
    format: String(formData.get("format") || "CSV") as "CSV" | "XLSX" | "PDF" | "JSON",
    filters: {
      date_from: String(formData.get("date_from") || ""),
      date_to: String(formData.get("date_to") || "")
    }
  });
  revalidatePath("/admin/bi");
}

export async function createScheduledReportAction(formData: FormData) {
  const recipients = String(formData.get("recipients") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  await createScheduledReport({
    reportKey: String(formData.get("report_key") || "executive_dashboard"),
    scheduleCron: String(formData.get("schedule_cron") || "0 8 * * 1"),
    recipients,
    exportFormat: String(formData.get("export_format") || "CSV") as "CSV" | "XLSX" | "PDF" | "JSON",
    filters: {
      period: String(formData.get("period") || "weekly")
    }
  });
  revalidatePath("/admin/bi");
}
