import { NextResponse, type NextRequest } from "next/server";

import { AuthorizationError } from "@/lib/auth/policy";
import { uploadTourImageToStorage } from "@/lib/tours/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Upload one tour image (admin tour form). Body: multipart `file` + optional `folder`. */
export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Select an image file." }, { status: 400 });
  }
  try {
    const url = await uploadTourImageToStorage(file, String(formData?.get("folder") ?? ""));
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHENTICATED" ? 401 : 403 });
    }
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
