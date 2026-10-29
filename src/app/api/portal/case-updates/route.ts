import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/db/admin";
import { isOwnCase } from "@/lib/data/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Change fingerprints for the portal's Live Updates card, which polls this.
 * `case` changes when the case row is updated; each document's value changes
 * when staff review it.
 */
export async function GET(request: NextRequest) {
  const caseId = request.nextUrl.searchParams.get("caseId") ?? "";
  if (!(await isOwnCase(caseId))) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const admin = createAdminClient();
  const [{ data: caseRow }, { data: docs }] = await Promise.all([
    admin.from("cases").select("status, updated_at").eq("id", caseId).maybeSingle(),
    admin.from("documents").select("id, status, reviewer_notes, version_no").eq("case_id", caseId)
  ]);

  const documents: Record<string, string> = {};
  for (const doc of docs ?? []) {
    documents[doc.id as string] = `${doc.status}|${doc.reviewer_notes ?? ""}|${doc.version_no ?? ""}`;
  }
  return NextResponse.json(
    { case: caseRow ? `${caseRow.status}|${caseRow.updated_at}` : null, documents },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
