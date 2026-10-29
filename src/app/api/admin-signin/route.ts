import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/db/admin";
import { AuthError, createSessionCookie, verifyPassword } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function loginError(request: NextRequest, code: string) {
  const url = new URL("/admin/login", request.url);
  url.searchParams.set("error", code);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return loginError(request, "missing");

  let signedIn: Awaited<ReturnType<typeof verifyPassword>>;
  try {
    signedIn = await verifyPassword(email, password);
  } catch (error) {
    if (error instanceof AuthError) return loginError(request, "credentials");
    console.error("[admin-signin]", error);
    return loginError(request, "unknown");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("staff_profiles")
    .select("user_id, is_active")
    .eq("user_id", signedIn.user.id)
    .maybeSingle();

  if (!profile || profile.is_active === false) return loginError(request, "not_staff");

  // Best-effort: stamp last_login_at. Never block login if this fails.
  try {
    await admin
      .from("staff_profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("user_id", signedIn.user.id);
  } catch {
    // ignore
  }

  const response = NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
  const cookie = await createSessionCookie(signedIn.row);
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
