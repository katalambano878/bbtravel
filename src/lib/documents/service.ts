import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/auth/policy";
import { publishEvent } from "@/lib/events/bus";
import { writeAuditEvent } from "@/lib/audit/events";

export async function requestDocumentReview(input: {
  documentId: string;
  reviewNotes?: string;
  requestedChanges?: string;
}) {
  const context = await requirePermission("documents.review");
  const admin = createAdminClient();

  await admin.from("document_reviews").insert({
    document_id: input.documentId,
    review_status: "IN_REVIEW",
    reviewer_id: context.user.id,
    review_notes: input.reviewNotes ?? null,
    requested_changes: input.requestedChanges ?? null
  });

  await publishEvent({
    eventKey: "document.review.requested",
    eventType: "DOCUMENT",
    aggregateType: "document",
    aggregateId: input.documentId,
    payload: {
      requested_changes: input.requestedChanges ?? null
    },
    createdBy: context.user.id
  });
}

export async function createDocumentVersion(input: {
  documentId: string;
  fileUrl: string;
  fileName?: string;
  mimeType?: string;
}) {
  const context = await requirePermission("documents.upload");
  const admin = createAdminClient();

  const { data: document } = await admin
    .from("documents")
    .select("id, version_no")
    .eq("id", input.documentId)
    .single();
  if (!document) throw new Error("Document not found.");
  const nextVersion = (document.version_no ?? 1) + 1;

  await admin.from("documents").update({ version_no: nextVersion, file_url: input.fileUrl }).eq("id", input.documentId);
  await admin.from("document_versions").insert({
    document_id: input.documentId,
    version_no: nextVersion,
    file_url: input.fileUrl,
    file_name: input.fileName ?? null,
    mime_type: input.mimeType ?? null,
    uploaded_by: context.user.id
  });

  await writeAuditEvent({
    actorId: context.user.id,
    action: "DOCUMENT_VERSION_CREATED",
    targetType: "document",
    targetId: input.documentId,
    payload: { version_no: nextVersion }
  });
}

export async function getDocumentLifecycleSnapshot() {
  await requirePermission("documents.view");
  const admin = createAdminClient();

  const [documentsRes, versionsRes, reviewsRes, alertsRes] = await Promise.all([
    admin.from("documents").select("*").order("created_at", { ascending: false }).limit(200),
    admin.from("document_versions").select("*").order("created_at", { ascending: false }).limit(200),
    admin.from("document_reviews").select("*").order("created_at", { ascending: false }).limit(200),
    admin.from("document_expiry_alerts").select("*").order("created_at", { ascending: false }).limit(200)
  ]);

  return {
    documents: documentsRes.data ?? [],
    versions: versionsRes.data ?? [],
    reviews: reviewsRes.data ?? [],
    alerts: alertsRes.data ?? []
  };
}
