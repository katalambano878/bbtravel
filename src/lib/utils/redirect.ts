import { NextResponse } from "next/server";

/**
 * Same-site redirect with a relative Location header. Behind Traefik,
 * `request.url` carries the container's internal host (localhost:3000), so
 * `new URL(path, request.url)` sends browsers to localhost.
 */
export function redirectTo(pathWithQuery: string, status: 303 | 307 = 303): NextResponse {
  return new NextResponse(null, { status, headers: { Location: pathWithQuery } });
}
