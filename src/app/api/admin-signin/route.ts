import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const origin = request.nextUrl.origin;

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const userAgent = request.headers.get("user-agent");
  const ipAddress = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");

  const { data: policy } = await admin.from("auth_security_policies").select("*").eq("id", 1).maybeSingle();
  const maxFailedAttempts = policy?.max_failed_attempts ?? 5;
  const lockoutMinutes = policy?.lockout_minutes ?? 15;

  const { data: loginAttempt } = await admin.from("staff_login_attempts").select("*").eq("email", email).maybeSingle();
  if (loginAttempt?.locked_until && new Date(loginAttempt.locked_until) > new Date()) {
    await admin.from("staff_login_events").insert({
      email, ip_address: ipAddress, user_agent: userAgent,
      login_status: "LOCKED", failure_reason: "LOCKOUT_ACTIVE"
    });
    return NextResponse.redirect(`${origin}/admin/login?error=locked`, { status: 303 });
  }

  let response = NextResponse.redirect(`${origin}/admin`, { status: 303 });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const failedAttempts = (loginAttempt?.failed_attempts ?? 0) + 1;
    const shouldLock = failedAttempts >= maxFailedAttempts;
    const lockedUntil = shouldLock ? new Date(Date.now() + lockoutMinutes * 60 * 1000).toISOString() : null;
    await admin.from("staff_login_attempts").upsert({
      email, failed_attempts: failedAttempts,
      last_attempt_at: new Date().toISOString(), locked_until: lockedUntil
    });
    await admin.from("staff_login_events").insert({
      email, ip_address: ipAddress, user_agent: userAgent,
      login_status: shouldLock ? "LOCKED" : "FAILED", failure_reason: error.message
    });
    return NextResponse.redirect(`${origin}/admin/login?error=invalid`, { status: 303 });
  }

  const { data: staffProfile } = await admin
    .from("staff_profiles")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!staffProfile) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/admin/login?error=denied`, { status: 303 });
  }

  await admin.from("staff_login_attempts").upsert({
    email, failed_attempts: 0,
    last_attempt_at: new Date().toISOString(), locked_until: null
  });
  await admin.from("staff_login_events").insert({
    user_id: data.user.id, email, ip_address: ipAddress,
    user_agent: userAgent, login_status: "SUCCESS"
  });
  await admin.from("staff_profiles").update({ last_login_at: new Date().toISOString() }).eq("user_id", data.user.id);

  return response;
}
