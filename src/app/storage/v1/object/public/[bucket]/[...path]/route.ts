import { NextResponse, type NextRequest } from "next/server";

import { PUBLIC_BUCKETS, openObject } from "@/lib/storage/local";

export const runtime = "nodejs";

/** Public media (tour images, site media, blog covers). Same URL shape Supabase Storage used. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ bucket: string; path: string[] }> }) {
  const { bucket, path } = await params;
  if (!PUBLIC_BUCKETS.has(bucket)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const object = await openObject(bucket, path.map((p) => decodeURIComponent(p)).join("/"));
  if (!object) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(object.stream, {
    headers: {
      "Content-Type": object.contentType,
      "Content-Length": String(object.size),
      "Cache-Control": "public, max-age=86400, immutable",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
