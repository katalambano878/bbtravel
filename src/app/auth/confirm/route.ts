import { type NextRequest } from "next/server";
import { AuthError, confirmEmail, createSessionCookie } from "@/lib/auth/session";
import { redirectTo } from "@/lib/utils/redirect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Target of the link in the sign-up confirmation email. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  try {
    const row = await confirmEmail(token);
    const response = redirectTo("/portal");
    const cookie = await createSessionCookie(row);
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    if (!(error instanceof AuthError)) console.error("[auth/confirm]", error);
    return redirectTo(`/portal/login?error=${error instanceof AuthError ? error.code : "unknown"}`);
  }
}
