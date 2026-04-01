"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { wizardSchema, type WizardPayload } from "@/lib/validators/wizard";
import { calculateReadinessScore } from "@/lib/utils/readiness-score";

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
  return [...base, "Business objective review", "Trade compliance guidance", "Partner outreach prep"];
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
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  redirect("/portal");
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
  const admin = createAdminClient();
  const caseId = String(formData.get("case_id") || "");
  const status = String(formData.get("status") || "");
  await admin.from("cases").update({ status }).eq("id", caseId);
  await admin.from("audit_logs").insert({ action: "CASE_STATUS_UPDATED", target_type: "case", target_id: caseId });
  revalidatePath("/admin");
  revalidatePath("/portal");
}

export async function reviewDocumentAction(formData: FormData) {
  const admin = createAdminClient();
  const documentId = String(formData.get("document_id") || "");
  const status = String(formData.get("status") || "APPROVED");
  const reviewerNotes = String(formData.get("reviewer_notes") || "");
  await admin.from("documents").update({ status, reviewer_notes: reviewerNotes }).eq("id", documentId);
  await admin
    .from("audit_logs")
    .insert({ action: "DOCUMENT_REVIEWED", target_type: "document", target_id: documentId, payload: { status } });
  revalidatePath("/admin");
  revalidatePath("/portal");
}
