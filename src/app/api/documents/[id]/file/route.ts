import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/db/admin";
import { getSessionUser } from "@/lib/auth/session";
import { getStaffAccessContext, isOwnCase } from "@/lib/data/queries";
import { openObject } from "@/lib/storage/local";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INLINE_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"]);

async function canReadDocument(caseId: string): Promise<boolean> {
  const staff = await getStaffAccessContext();
  if (staff) {
    return (
      staff.profile.role === "super_admin" ||
      staff.permissions.includes("documents.review") ||
      staff.permissions.includes("cases.view")
    );
  }
  return isOwnCase(caseId);
}

/** Open a case document: staff with document/case access, or the client who owns the case. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();
  const { data: doc } = await admin.from("documents").select("id, case_id, file_url").eq("id", id).maybeSingle();
  if (!doc || !(await canReadDocument(doc.case_id as string))) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const fileUrl = String(doc.file_url ?? "");
  if (/^https?:\/\//i.test(fileUrl)) return NextResponse.redirect(fileUrl);

  const object = await openObject("client-documents", fileUrl);
  if (!object) return NextResponse.json({ error: "File not found." }, { status: 404 });

  const fileName = fileUrl.split("/").pop() ?? "document";
  const disposition = INLINE_TYPES.has(object.contentType) ? "inline" : "attachment";
  return new NextResponse(object.stream, {
    headers: {
      "Content-Type": object.contentType,
      "Content-Length": String(object.size),
      "Content-Disposition": `${disposition}; filename="${fileName.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
