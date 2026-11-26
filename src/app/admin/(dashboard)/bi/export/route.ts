import { NextResponse } from "next/server";
import { AuthorizationError } from "@/lib/auth/policy";
import { exportExecutiveDashboardAsCsv } from "@/lib/reports/service";

export async function GET() {
  let csv: string;
  try {
    csv = await exportExecutiveDashboardAsCsv();
  } catch (error) {
    // Signed-out or unprivileged callers get 401/403, not a logged 500.
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHENTICATED" ? 401 : 403 });
    }
    throw error;
  }
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="bbtravel-executive-kpis.csv"'
    }
  });
}
