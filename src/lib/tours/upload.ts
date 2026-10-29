import { randomUUID } from "crypto";

import { requirePermission } from "@/lib/auth/policy";
import { publicObjectUrl, putObject } from "@/lib/storage/local";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function safeExt(mime: string, filename: string): string {
  const fromName = filename.includes(".") ? filename.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

/** Upload a single image to the public `tour-media` bucket. Requires `tours.manage`. */
export async function uploadTourImageToStorage(file: File, slugFolder: string): Promise<string> {
  await requirePermission("tours.manage");
  if (!file || file.size === 0) throw new Error("Select an image file.");
  if (file.size > MAX_BYTES) throw new Error("Each image must be 8MB or smaller.");
  const mime = (file.type || "application/octet-stream").toLowerCase();
  if (!ALLOWED_TYPES.has(mime)) throw new Error("Please use JPG, PNG, WebP, or GIF.");

  const folder = (slugFolder || "tours")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72) || "tours";
  const ext = safeExt(mime, file.name);
  const objectPath = `${folder}/${Date.now()}-${randomUUID()}.${ext}`;

  const bytes = Buffer.from(await file.arrayBuffer());
  await putObject("tour-media", objectPath, bytes, mime);
  return publicObjectUrl("tour-media", objectPath);
}
