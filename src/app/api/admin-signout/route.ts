import { NextResponse, type NextRequest } from "next/server";
import { clearedSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  response.cookies.set(clearedSessionCookie.name, "", clearedSessionCookie.options);
  return response;
}
