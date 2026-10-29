"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/db/admin";
import {
  AuthError,
  clearSessionCookie,
  requestPasswordReset,
  resetPasswordWithToken,
  setSessionCookie,
  signUpWithPassword,
  verifyPassword,
  type SessionUser
} from "@/lib/auth/session";
import { wizardSchema, type WizardPayload } from "@/lib/validators/wizard";
import { calculateReadinessScore } from "@/lib/utils/readiness-score";
import { requirePermission } from "@/lib/auth/policy";
import { writeAuditEvent } from "@/lib/audit/events";
import { updateSystemSettings } from "@/lib/settings/system-settings";
import { addLeadActivity, assignLead, convertLeadToClientAndCase, createLeadInline, setLeadNextAction, updateLeadStage } from "@/lib/crm/service";
import { addCaseNote, completeCaseTask, createCaseTask, linkCases, updateCaseOwnership } from "@/lib/cases/service";
import { createNotification, createSystemTask } from "@/lib/notifications/service";
import { createDocumentRecord, createDocumentVersion, decideDocument, requestDocumentReview } from "@/lib/documents/service";
import { decideLeaveRequest, recordAttendance, upsertEmployeeRecord, upsertPayrollInput } from "@/lib/hr/service";
import { createInvoice, createVendorBill, decideExpense, processRefund, recordInvoicePayment, submitExpense, upsertVendor } from "@/lib/finance/service";
import { createPettyCashBox, recordPettyCashMovement, transferBetweenBoxes } from "@/lib/finance/petty-cash";
import { EXPENSE_CATEGORIES } from "@/lib/finance/expense-categories";
import { archivePartner, upsertPartner } from "@/lib/partners/service";
import {
  deleteTour,
  parseItineraryText,
  parseLineList,
  setTourActive,
  slugifyTour,
  syncFeaturedToursFromMock,
  upsertTour
} from "@/lib/tours/service";
import { uploadTourImageToStorage } from "@/lib/tours/upload";
import { createAppointment, updateAppointmentStatus } from "@/lib/appointments/service";
import { logWhatsappSend } from "@/lib/whatsapp/service";
import { createScheduledReport, queueReportExport, saveReportView } from "@/lib/reports/service";
import { recordWebsiteFormSubmission } from "@/lib/forms/record-submission";
import type { ServiceType, PaymentMethod, AppointmentType, AppointmentStatus, PartnerType } from "@/types/domain";

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
      whatsapp: payload.phone,
      email: payload.email,
      destination: payload.destination,
      timeline: payload.timeline,
      notes: payload.notes,
      source_key: "website"
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

  try {
    await recordWebsiteFormSubmission({
      formType: "START_APPLICATION",
      payload: {
        ...payload,
        readiness_score: score
      },
      name: payload.full_name,
      email: payload.email,
      phone: payload.phone,
      pageUrl: "/start-application",
      leadId: (lead as { id?: string })?.id ?? null,
      caseId: (caseRecord as { id?: string } | null)?.id ?? null
    });
  } catch (e) {
    console.error("[form_submissions] START_APPLICATION", e);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/inbox");
  redirect(`/start-application/success?lead=${lead?.id ?? ""}&case=${caseRecord?.id ?? ""}&score=${score}`);
}

export type ContactFormState = { error?: string; ok?: boolean } | null;

export async function submitContactAction(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const serviceType = String(formData.get("service_type") || "CONSULTATION") as ServiceType;

  if (name.length < 2) return { error: "Please enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email." };
  if (message.length < 5) return { error: "Please add a short message (at least 5 characters)." };

  const admin = createAdminClient();
  const { data: lead } = await admin
    .from("leads")
    .insert({
      service_type: serviceType,
      name,
      phone: phone || null,
      whatsapp: phone || null,
      email,
      notes: `Contact form:\n\n${message}`,
      source_key: "website"
    })
    .select("id")
    .single();

  try {
    await recordWebsiteFormSubmission({
      formType: "CONTACT",
      payload: { name, email, phone, message, service_type: serviceType },
      name,
      email,
      phone: phone || null,
      pageUrl: "/contact",
      leadId: (lead as { id?: string })?.id ?? null
    });
  } catch (e) {
    console.error("[form_submissions] CONTACT", e);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/inbox");
  return { ok: true };
}

function mapStartIntentToServiceType(intent: string): ServiceType {
  const m: Record<string, ServiceType> = {
    "Visa Assistance": "VISA_ASSISTANCE",
    "Jobs Abroad": "INTERNATIONAL_RECRUITMENT",
    "Study Abroad": "STUDY_ABROAD",
    "Tours / Vacations": "TOUR_PACKAGE"
  };
  return m[intent] ?? "CONSULTATION";
}

export type StartProfileState = { error?: string; ok?: boolean } | null;

export async function submitStartProfileAction(
  _prev: StartProfileState,
  formData: FormData
): Promise<StartProfileState> {
  const intent = String(formData.get("intent") || "");
  const audience = String(formData.get("audience") || "");
  const location = String(formData.get("location") || "");
  const region = String(formData.get("region") || "").trim();
  const town = String(formData.get("town") || "").trim();
  const cityOther = String(formData.get("city_other") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!intent || !audience) return { error: "Please complete all steps." };
  if (name.length < 2) return { error: "Please enter your full legal name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email." };
  if (phone.length < 7) return { error: "Please enter a valid WhatsApp number." };

  if (location === "Ghana") {
    if (!region) return { error: "Please select the region in Ghana you are based in." };
    if (town.length < 2) return { error: "Please tell us the town or exact location you are based in." };
  } else if (location && cityOther.length < 2) {
    return { error: "Please tell us which city or area you are based in." };
  }

  const locationDetail =
    location === "Ghana"
      ? [town, region, "Ghana"].filter(Boolean).join(", ")
      : [cityOther, location].filter(Boolean).join(", ");

  const serviceType = mapStartIntentToServiceType(intent);
  const notes = `Start flow — intent: ${intent}; audience: ${audience}; location: ${locationDetail || location}`;

  const wizardLike: WizardPayload = {
    service_type: serviceType,
    full_name: name,
    phone,
    email,
    destination: locationDetail || location || "Not specified",
    timeline: "To be scheduled with consultant",
    budget_range: undefined,
    experience_level: undefined,
    education_level: undefined,
    passport_status: undefined,
    travel_history: undefined,
    notes
  };
  const score = calculateReadinessScore(wizardLike);
  const checklist = buildChecklist(wizardLike);

  const admin = createAdminClient();

  const { data: lead } = await admin
    .from("leads")
    .insert({
      service_type: serviceType,
      name,
      phone,
      whatsapp: phone,
      email,
      destination: locationDetail || location || null,
      timeline: "TBD",
      notes,
      source_key: "website"
    })
    .select("id")
    .single();

  const { data: existingClient } = await admin.from("clients").select("id").eq("email", email).maybeSingle();
  let clientId: string | null = existingClient?.id ?? null;
  if (!clientId) {
    const { data: created } = await admin
      .from("clients")
      .insert({ name, phone, email, whatsapp: phone })
      .select("id")
      .single();
    clientId = created?.id ?? null;
  }
  if (!clientId) return { error: "We could not save your profile. Please try again or WhatsApp us." };

  const { data: caseRecord } = await admin
    .from("cases")
    .insert({
      client_id: clientId,
      case_type: serviceType,
      status: "SUBMITTED",
      meta: {
        start_profile: true,
        intent,
        audience,
        location,
        region: region || null,
        town: town || null,
        city_other: cityOther || null,
        location_full: locationDetail || location,
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
        step_key: `sp_${index + 1}`,
        title: step,
        status: index === 0 ? "COMPLETED" : "PENDING"
      }))
    );
  }

  try {
    await recordWebsiteFormSubmission({
      formType: "START_PROFILE",
      payload: {
        intent,
        audience,
        location,
        region: region || null,
        town: town || null,
        city_other: cityOther || null,
        location_full: locationDetail || location,
        name,
        email,
        phone,
        readiness_score: score
      },
      name,
      email,
      phone,
      pageUrl: "/start",
      leadId: (lead as { id?: string })?.id ?? null,
      caseId: (caseRecord as { id?: string } | null)?.id ?? null
    });
  } catch (e) {
    console.error("[form_submissions] START_PROFILE", e);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/inbox");
  return { ok: true };
}

export type TourInquiryState = { error?: string; ok?: boolean } | null;

export async function submitTourInquiryAction(
  _prev: TourInquiryState,
  formData: FormData
): Promise<TourInquiryState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const tourSlug = String(formData.get("tour_slug") || "");
  const tourTitle = String(formData.get("tour_title") || "");

  if (name.length < 2) return { error: "Please enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email." };
  if (phone.length < 7) return { error: "Please enter a valid phone number." };

  const admin = createAdminClient();
  const notes = `Travel deal inquiry — ${tourTitle || tourSlug}:\n\n${message || "(No additional message)"}`;

  const { data: lead } = await admin
    .from("leads")
    .insert({
      service_type: "TOUR_PACKAGE" as ServiceType,
      name,
      phone,
      whatsapp: phone,
      email,
      destination: tourTitle || null,
      notes,
      source_key: "website"
    })
    .select("id")
    .single();

  try {
    await recordWebsiteFormSubmission({
      formType: "TOUR_INQUIRY",
      payload: { name, email, phone, message, tour_slug: tourSlug, tour_title: tourTitle },
      name,
      email,
      phone,
      pageUrl: tourSlug ? `/travel-deals/${tourSlug}` : "/travel-deals",
      leadId: (lead as { id?: string })?.id ?? null
    });
  } catch (e) {
    console.error("[form_submissions] TOUR_INQUIRY", e);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/inbox");
  return { ok: true };
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "").trim();

  let user: SessionUser | null;
  try {
    ({ user } = await signUpWithPassword({ email, password, fullName }));
  } catch (error) {
    if (error instanceof AuthError) redirect(`/portal/register?error=${error.code}`);
    throw error;
  }

  if (user) {
    const admin = createAdminClient();
    const { error } = await admin.from("clients").upsert(
      {
        user_id: user.id,
        name: fullName,
        email: user.email
      },
      { onConflict: "user_id" }
    );
    // 23505 on clients.email: a website lead already holds this email; staff link it.
    if (error && error.code !== "23505") console.error("[signup] client record", error);
  }

  redirect("/portal/login?registered=true");
}

export async function signInAction(formData: FormData) {
  const admin = createAdminClient();
  // Normalised so the lockout counter can't be dodged by changing letter case.
  const email = String(formData.get("email") || "").trim().toLowerCase();
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
    redirect("/portal/login?error=locked");
  }

  let signedIn: Awaited<ReturnType<typeof verifyPassword>>;
  try {
    signedIn = await verifyPassword(email, password);
  } catch (error) {
    if (!(error instanceof AuthError)) throw error;
    const failedAttempts = (loginAttempt?.failed_attempts ?? 0) + 1;
    const shouldLock = failedAttempts >= maxFailedAttempts;
    const lockedUntil = shouldLock ? new Date(Date.now() + lockoutMinutes * 60 * 1000).toISOString() : null;

    await admin.from("staff_login_attempts").upsert(
      {
        email,
        failed_attempts: failedAttempts,
        last_attempt_at: new Date().toISOString(),
        locked_until: lockedUntil
      },
      { onConflict: "email" }
    );
    await admin.from("staff_login_events").insert({
      email,
      ip_address: ipAddress,
      user_agent: userAgent,
      login_status: shouldLock ? "LOCKED" : "FAILED",
      failure_reason: error.message
    });
    redirect(`/portal/login?error=${shouldLock ? "locked" : error.code}`);
  }

  await setSessionCookie(signedIn.row);
  await admin.from("staff_login_attempts").upsert(
    {
      email,
      failed_attempts: 0,
      last_attempt_at: new Date().toISOString(),
      locked_until: null
    },
    { onConflict: "email" }
  );
  await admin.from("staff_login_events").insert({
    user_id: signedIn.user.id,
    email,
    ip_address: ipAddress,
    user_agent: userAgent,
    login_status: "SUCCESS"
  });

  await admin.from("staff_profiles").update({ last_login_at: new Date().toISOString() }).eq("user_id", signedIn.user.id);
  redirect("/portal");
}

export async function resetPasswordAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  await requestPasswordReset(email);
  redirect("/portal/login?reset=true");
}

export async function completePasswordResetAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm_password") || "");
  if (password !== confirm) return { error: "Passwords do not match." };

  let row: Awaited<ReturnType<typeof resetPasswordWithToken>>;
  try {
    row = await resetPasswordWithToken(token, password);
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    throw error;
  }
  await setSessionCookie(row);

  const admin = createAdminClient();
  const { data: staff } = await admin.from("staff_profiles").select("user_id").eq("user_id", row.id).maybeSingle();
  redirect(staff ? "/admin" : "/portal");
}

export async function signOutAction() {
  await clearSessionCookie();
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
  const note = String(formData.get("activity_note") || formData.get("note") || "").trim();
  if (!note) return;
  await addLeadActivity({
    leadId: String(formData.get("lead_id") || ""),
    type: String(formData.get("activity_type") || formData.get("type") || "NOTE") as
      | "NOTE"
      | "CALL"
      | "EMAIL"
      | "WHATSAPP"
      | "TASK"
      | "STATUS_CHANGE"
      | "ASSIGNMENT",
    note,
    meta: {
      next_action_date: String(formData.get("next_action_date") || "")
    }
  });
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin/clients");
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
    assignedTo: String(formData.get("assigned_to") || "") || undefined
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
    channel: String(formData.get("channel") || "IN_APP") as "IN_APP" | "EMAIL" | "WHATSAPP" | "SMS",
    entityType: String(formData.get("entity_type") || ""),
    entityId: String(formData.get("entity_id") || "") || undefined
  });
  revalidatePath("/admin/notifications");
}

export async function createSystemTaskAction(formData: FormData) {
  await createSystemTask({
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    assignedTo: String(formData.get("assigned_to") || "") || undefined,
    dueAt: String(formData.get("due_at") || ""),
    priority: String(formData.get("priority") || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    entityType: String(formData.get("entity_type") || ""),
    entityId: String(formData.get("entity_id") || "") || undefined
  });
  revalidatePath("/admin/notifications");
}

export async function upsertEmployeeRecordAction(formData: FormData) {
  await upsertEmployeeRecord({
    employeeCode: String(formData.get("employee_code") || ""),
    userId: String(formData.get("user_id") || "") || undefined,
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
    caseId: String(formData.get("case_id") || "") || undefined,
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
  const depositToBoxId = String(formData.get("deposit_to_box_id") || "");
  await recordInvoicePayment({
    invoiceId: String(formData.get("invoice_id") || ""),
    amount: Number(formData.get("amount") || 0),
    paymentMethod: String(formData.get("payment_method") || "BANK_TRANSFER") as PaymentMethod,
    reference: String(formData.get("reference") || ""),
    notes: String(formData.get("notes") || ""),
    depositToBoxId: depositToBoxId || undefined
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
    paymentId: String(formData.get("payment_id") || "") || undefined,
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

// ======================================================================
// Admin v2 — Ghana-tuned ops actions
// ======================================================================

// -------- CRM / Pipeline --------
export async function createLeadInlineAction(formData: FormData): Promise<void> {
  await createLeadInline({
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || "") || undefined,
    whatsapp: String(formData.get("whatsapp") || "") || undefined,
    serviceType: String(formData.get("service_type") || "CONSULTATION"),
    destination: String(formData.get("destination") || "") || undefined,
    timeline: String(formData.get("timeline") || "") || undefined,
    notes: String(formData.get("notes") || "") || undefined,
    sourceKey: String(formData.get("source_key") || "") || undefined,
    nextActionDate: String(formData.get("next_action_date") || "") || undefined
  });
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin");
}

export async function updateLeadStageAction(formData: FormData) {
  await updateLeadStage({
    leadId: String(formData.get("lead_id") || ""),
    stage: String(formData.get("stage") || "NEW"),
    note: String(formData.get("note") || "") || undefined
  });
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin");
}

export async function setLeadNextActionAction(formData: FormData) {
  const raw = String(formData.get("next_action_date") || "");
  await setLeadNextAction({
    leadId: String(formData.get("lead_id") || ""),
    nextActionDate: raw || null,
    note: String(formData.get("note") || "") || undefined
  });
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin");
}

// -------- Cases --------
export async function updateCaseOwnershipAction(formData: FormData) {
  await updateCaseOwnership({
    caseId: String(formData.get("case_id") || ""),
    status: String(formData.get("status") || "") || undefined,
    assignedTo: String(formData.get("assigned_to") || "") || undefined,
    slaDueAt: (formData.get("sla_due_at") as string) || null
  });
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin");
}

export async function completeCaseTaskAction(formData: FormData) {
  await completeCaseTask({
    taskId: String(formData.get("task_id") || ""),
    status: (String(formData.get("status") || "DONE") as "DONE" | "CANCELLED" | "BLOCKED")
  });
  revalidatePath("/admin");
  revalidatePath("/admin/pipeline");
}

// -------- Documents --------
export async function decideDocumentAction(formData: FormData) {
  await decideDocument({
    documentId: String(formData.get("document_id") || ""),
    decision: String(formData.get("decision") || "APPROVED") as "APPROVED" | "REJECTED",
    notes: String(formData.get("notes") || "") || undefined
  });
  revalidatePath("/admin/documents");
  revalidatePath("/admin");
}

export async function uploadDocumentAction(formData: FormData): Promise<void> {
  await createDocumentRecord({
    caseId: String(formData.get("case_id") || ""),
    docType: String(formData.get("doc_type") || "other"),
    fileUrl: String(formData.get("file_url") || ""),
    fileName: String(formData.get("file_name") || "") || undefined,
    mimeType: String(formData.get("mime_type") || "") || undefined,
    expiresAt: String(formData.get("expires_at") || "") || null
  });
  revalidatePath("/admin/documents");
}

// -------- Appointments --------
export async function createAppointmentAction(formData: FormData) {
  await createAppointment({
    caseId: String(formData.get("case_id") || ""),
    scheduledAt: String(formData.get("scheduled_at") || new Date().toISOString()),
    appointmentType: String(formData.get("appointment_type") || "CONSULTATION") as AppointmentType,
    durationMinutes: Number(formData.get("duration_minutes") || 60),
    location: String(formData.get("location") || "") || undefined,
    notes: String(formData.get("notes") || "") || undefined,
    assignedTo: String(formData.get("assigned_to") || "") || undefined,
    reminderWhatsapp: formData.get("reminder_whatsapp") === "on"
  });
  revalidatePath("/admin");
  revalidatePath("/admin/pipeline");
}

export async function updateAppointmentStatusAction(formData: FormData) {
  await updateAppointmentStatus({
    appointmentId: String(formData.get("appointment_id") || ""),
    status: String(formData.get("status") || "SCHEDULED") as AppointmentStatus,
    notes: String(formData.get("notes") || "") || undefined
  });
  revalidatePath("/admin");
}

// -------- WhatsApp --------
export async function logWhatsappSendAction(formData: FormData) {
  const id = await logWhatsappSend({
    toPhone: String(formData.get("to_phone") || ""),
    toName: String(formData.get("to_name") || "") || undefined,
    clientId: String(formData.get("client_id") || "") || undefined,
    caseId: String(formData.get("case_id") || "") || undefined,
    leadId: String(formData.get("lead_id") || "") || undefined,
    templateKey: String(formData.get("template_key") || "") || undefined,
    subject: String(formData.get("subject") || "") || undefined,
    body: String(formData.get("body") || "")
  });
  revalidatePath("/admin");
  return { id };
}

// -------- Finance: expenses, vendors, vendor bills, petty cash --------
export async function submitExpenseAction(formData: FormData) {
  const categoryKey = String(formData.get("category_key") || "OTHER");
  const explicitLabel = String(formData.get("category") || "");
  const derived = EXPENSE_CATEGORIES.find((c) => c.key === categoryKey)?.label ?? categoryKey;
  await submitExpense({
    categoryKey,
    category: explicitLabel || derived,
    amount: Number(formData.get("amount") || 0),
    description: String(formData.get("description") || "") || undefined,
    vendorId: String(formData.get("vendor_id") || "") || null,
    employeeId: String(formData.get("employee_id") || "") || null,
    expenseDate: String(formData.get("expense_date") || "") || undefined,
    paymentMethod: (String(formData.get("payment_method") || "") || null) as PaymentMethod | null,
    paidFromBoxId: String(formData.get("paid_from_box_id") || "") || null
  });
  revalidatePath("/admin/finance");
}

export async function upsertVendorAction(formData: FormData) {
  await upsertVendor({
    id: String(formData.get("id") || "") || undefined,
    vendorName: String(formData.get("vendor_name") || ""),
    contactName: String(formData.get("contact_name") || "") || undefined,
    phone: String(formData.get("phone") || "") || undefined,
    email: String(formData.get("email") || "") || undefined,
    paymentTerms: String(formData.get("payment_terms") || "") || undefined
  });
  revalidatePath("/admin/finance");
}

export async function createVendorBillAction(formData: FormData) {
  await createVendorBill({
    vendorId: String(formData.get("vendor_id") || ""),
    billNumber: String(formData.get("bill_number") || ""),
    billDate: String(formData.get("bill_date") || ""),
    dueDate: String(formData.get("due_date") || ""),
    amount: Number(formData.get("amount") || 0),
    notes: String(formData.get("notes") || "") || undefined
  });
  revalidatePath("/admin/finance");
}

export async function createPettyCashBoxAction(formData: FormData) {
  await createPettyCashBox({
    name: String(formData.get("name") || ""),
    type: String(formData.get("type") || "CASH") as
      | "CASH"
      | "MOMO_MTN"
      | "MOMO_VODAFONE"
      | "MOMO_AIRTELTIGO"
      | "BANK"
      | "OTHER",
    opening: Number(formData.get("opening") || 0),
    notes: String(formData.get("notes") || "") || undefined
  });
  revalidatePath("/admin/finance");
}

export async function recordPettyCashMovementAction(formData: FormData) {
  await recordPettyCashMovement({
    boxId: String(formData.get("box_id") || ""),
    movementType: String(formData.get("movement_type") || "OUT") as
      | "IN"
      | "OUT"
      | "TRANSFER_IN"
      | "TRANSFER_OUT"
      | "TOPUP"
      | "ADJUSTMENT",
    amount: Number(formData.get("amount") || 0),
    description: String(formData.get("description") || ""),
    category: String(formData.get("category") || "") || undefined,
    reference: String(formData.get("reference") || "") || undefined,
    counterparty: String(formData.get("counterparty") || "") || undefined
  });
  revalidatePath("/admin/finance");
}

export async function transferBetweenBoxesAction(formData: FormData) {
  await transferBetweenBoxes({
    fromBoxId: String(formData.get("from_box_id") || ""),
    toBoxId: String(formData.get("to_box_id") || ""),
    amount: Number(formData.get("amount") || 0),
    description: String(formData.get("description") || "Transfer"),
    reference: String(formData.get("reference") || "") || undefined
  });
  revalidatePath("/admin/finance");
}

// -------- Partners --------
export async function upsertPartnerAction(formData: FormData) {
  await upsertPartner({
    id: String(formData.get("id") || "") || undefined,
    partnerType: String(formData.get("partner_type") || "OTHER") as PartnerType,
    name: String(formData.get("name") || ""),
    country: String(formData.get("country_code") || "") || undefined,
    city: String(formData.get("city") || "") || undefined,
    address: String(formData.get("address") || "") || undefined,
    contactName: String(formData.get("contact_name") || "") || undefined,
    phone: String(formData.get("phone") || "") || undefined,
    whatsapp: String(formData.get("whatsapp") || "") || undefined,
    email: String(formData.get("email") || "") || undefined,
    website: String(formData.get("website") || "") || undefined,
    notes: String(formData.get("notes") || "") || undefined
  });
  revalidatePath("/admin/settings");
}

export async function archivePartnerAction(formData: FormData) {
  await archivePartner(String(formData.get("id") || ""));
  revalidatePath("/admin/settings");
}

/* -----------------------------------------------------------------------
 * Tours (website catalogue)
 * --------------------------------------------------------------------- */

export async function upsertTourAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "") || undefined;
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Title is required.");
  const slug = String(formData.get("slug") || "").trim();
  const slugFolder = slug ? slugifyTour(slug) : slugifyTour(title);
  const destination = String(formData.get("destination") || "").trim();
  const durationDaysRaw = String(formData.get("duration_days") || "").trim();
  const durationDays = durationDaysRaw ? Number(durationDaysRaw) : undefined;
  const durationLabel = String(formData.get("duration_label") || "").trim();
  const priceRaw = String(formData.get("price") || "").trim();
  const price = priceRaw ? Number(priceRaw) : undefined;
  const priceRange = String(formData.get("price_range") || "").trim();
  let coverImage = String(formData.get("cover_image") || "").trim();
  const coverFile = formData.get("cover_file");
  if (coverFile instanceof File && coverFile.size > 0) {
    coverImage = await uploadTourImageToStorage(coverFile, slugFolder);
  }

  const images = parseLineList(formData.get("images"));
  const galleryFiles = formData.getAll("gallery_files");
  for (const entry of galleryFiles) {
    if (entry instanceof File && entry.size > 0) {
      images.push(await uploadTourImageToStorage(entry, slugFolder));
    }
  }
  const shortDescription = String(formData.get("short_description") || "").trim();
  const overview = String(formData.get("overview") || "").trim();
  const highlights = parseLineList(formData.get("highlights"));
  const inclusions = parseLineList(formData.get("inclusions"));
  const exclusions = parseLineList(formData.get("exclusions"));
  const itinerary = parseItineraryText(formData.get("itinerary"));
  const isActive = String(formData.get("is_active") || "") === "true";
  const sortOrderRaw = String(formData.get("sort_order") || "").trim();
  const sortOrder = sortOrderRaw ? Number(sortOrderRaw) : 0;

  await upsertTour({
    id,
    title,
    slug,
    destination,
    durationDays: Number.isFinite(durationDays) ? durationDays : null,
    durationLabel,
    price,
    priceRange,
    coverImage,
    images,
    shortDescription,
    overview,
    highlights,
    inclusions,
    exclusions,
    itinerary,
    isActive,
    sortOrder
  });

  revalidatePath("/admin/tours");
  revalidatePath("/tours");
  revalidatePath("/travel-deals");
  revalidatePath("/");
}

export type SyncMockToursResult = { ok: true; message: string } | { ok: false; error: string };

export async function syncFeaturedToursFromMockAction(): Promise<SyncMockToursResult> {
  try {
    const { count, slugs } = await syncFeaturedToursFromMock();
    revalidatePath("/admin/tours");
    revalidatePath("/tours");
    revalidatePath("/travel-deals");
    revalidatePath("/");
    return {
      ok: true,
      message: `Synced ${count} tour(s). Slugs: ${slugs.join(", ")}.`
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not sync tours from mock catalogue."
    };
  }
}

export async function toggleTourActiveAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "true";
  if (!id) return;
  await setTourActive(id, active);
  revalidatePath("/admin/tours");
  revalidatePath("/tours");
  revalidatePath("/travel-deals");
  revalidatePath("/");
}

export async function deleteTourAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  if (!id) return;
  await deleteTour(id);
  revalidatePath("/admin/tours");
  revalidatePath("/tours");
  revalidatePath("/travel-deals");
  revalidatePath("/");
}
