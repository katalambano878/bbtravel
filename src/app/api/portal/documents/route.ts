import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/db/admin";
import { getSessionUser } from "@/lib/auth/session";
import { isOwnCase } from "@/lib/data/queries";
import { putObject } from "@/lib/storage/local";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 50 * 1024 * 1024;

function safeFileName(name: string): string {
  const cleaned = name
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9._-]/g, "_")
    .replace(/^\.+/, "")
    .slice(-120);
  return cleaned || "document";
}

/** Client portal upload: stores the file privately and logs it on the client's own case. */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const caseId = String(formData?.get("case_id") ?? "");
  const docType = String(formData?.get("doc_type") ?? "").trim().slice(0, 64);

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Select a file first" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Files must be 50MB or smaller." }, { status: 400 });
  if (!docType) return NextResponse.json({ error: "Choose a document type." }, { status: 400 });
  if (!(await isOwnCase(caseId))) return NextResponse.json({ error: "Case not found." }, { status: 404 });

  const filePath = `${user.id}/${caseId}/${Date.now()}-${safeFileName(file.name)}`;
  await putObject("client-documents", filePath, Buffer.from(await file.arrayBuffer()), file.type || "application/octet-stream");

  const admin = createAdminClient();
  const { error } = await admin.from("documents").insert({
    case_id: caseId,
    doc_type: docType,
    file_url: filePath,
    status: "PENDING",
    uploaded_by: user.id
  });
  if (error) {
    console.error("[portal/documents]", error);
    return NextResponse.json({ error: "Could not save the document. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
