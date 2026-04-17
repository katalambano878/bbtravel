import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function baseUrl(request: NextRequest) {
  return new URL("/", request.url);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("error", "missing");
    return NextResponse.redirect(url, { status: 303 });
  }

  // We attach Supabase's auth cookies to this response object so they are
  // sent to the browser along with the redirect.
  let response = NextResponse.redirect(new URL("/admin", request.url), {
    status: 303
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnon) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("error", "config");
    return NextResponse.redirect(url, { status: 303 });
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          // Update request cookies so subsequent calls within this handler
          // (e.g. the staff_profiles lookup that runs RLS via auth.uid())
          // see the freshly issued session.
          request.cookies.set({ name, value, ...options });
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data?.user) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("error", "credentials");
    return NextResponse.redirect(url, { status: 303 });
  }

  // Verify the user is a staff member with an active profile.
  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("user_id, is_active")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!profile || profile.is_active === false) {
    await supabase.auth.signOut();
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("error", "not_staff");
    return NextResponse.redirect(url, { status: 303 });
  }

  // Best-effort: stamp last_login_at. Never block login if this fails.
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const admin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false }
      });
      await admin
        .from("staff_profiles")
        .update({ last_login_at: new Date().toISOString() })
        .eq("user_id", data.user.id);
    } catch {
      // ignore
    }
  }

  return response;
}
