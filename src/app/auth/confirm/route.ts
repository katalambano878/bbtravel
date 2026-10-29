import { NextResponse, type NextRequest } from "next/server";
import { AuthError, confirmEmail, createSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Target of the link in the sign-up confirmation email. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  try {
    const row = await confirmEmail(token);
    const response = NextResponse.redirect(new URL("/portal", request.url), { status: 303 });
    const cookie = await createSessionCookie(row);
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    if (!(error instanceof AuthError)) console.error("[auth/confirm]", error);
    const url = new URL("/portal/login", request.url);
    url.searchParams.set("error", error instanceof AuthError ? error.code : "unknown");
    return NextResponse.redirect(url, { status: 303 });
  }
}
