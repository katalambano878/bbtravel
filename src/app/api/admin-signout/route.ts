import { clearedSessionCookie } from "@/lib/auth/session";
import { redirectTo } from "@/lib/utils/redirect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = redirectTo("/admin/login");
  response.cookies.set(clearedSessionCookie.name, "", clearedSessionCookie.options);
  return response;
}
