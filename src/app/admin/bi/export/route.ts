import { NextResponse } from "next/server";
import { exportExecutiveDashboardAsCsv } from "@/lib/reports/service";

export async function GET() {
  const csv = await exportExecutiveDashboardAsCsv();
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="bbtravel-executive-kpis.csv"'
    }
  });
}
