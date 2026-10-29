import "server-only";

import { createReadStream } from "fs";
import { mkdir, readFile, stat, writeFile } from "fs/promises";
import path from "path";
import { Readable } from "stream";

/**
 * File storage on the app's persistent volume (replaces Supabase Storage).
 * Layout: <STORAGE_ROOT>/<bucket>/<object path>, with a sidecar
 * `<file>.meta.json` holding the content type.
 */
export const PUBLIC_BUCKETS = new Set(["site-media", "tour-media", "blog-covers"]);
export const PRIVATE_BUCKETS = new Set(["client-documents"]);

export type Bucket = "site-media" | "tour-media" | "blog-covers" | "client-documents";

function storageRoot(): string {
  const root = process.env.STORAGE_ROOT;
  if (!root || !path.isAbsolute(root)) {
    throw new Error("STORAGE_ROOT must be set to an absolute directory for file storage.");
  }
  return root;
}

function isBucket(value: string): value is Bucket {
  return PUBLIC_BUCKETS.has(value) || PRIVATE_BUCKETS.has(value);
}

/** Resolve an object to an absolute path inside its bucket, or null if unsafe. */
function resolveObject(bucket: string, objectPath: string): string | null {
  if (!isBucket(bucket)) return null;
  if (!objectPath || objectPath.includes("\0") || objectPath.includes("\\")) return null;
  const segments = objectPath.split("/");
  if (segments.some((s) => s === "" || s === "." || s === "..")) return null;
  const bucketDir = path.join(storageRoot(), bucket);
  const full = path.join(bucketDir, ...segments);
  if (!full.startsWith(bucketDir + path.sep)) return null;
  if (full.endsWith(".meta.json")) return null;
  return full;
}

export async function putObject(
  bucket: Bucket,
  objectPath: string,
  bytes: Buffer,
  contentType: string
): Promise<void> {
  const full = resolveObject(bucket, objectPath);
  if (!full) throw new Error("Invalid storage path.");
  await mkdir(path.dirname(full), { recursive: true });
  // `wx` refuses to overwrite, matching Supabase's upsert: false.
  await writeFile(full, bytes, { flag: "wx" });
  await writeFile(`${full}.meta.json`, JSON.stringify({ contentType, size: bytes.length }), { flag: "w" });
}

export async function openObject(
  bucket: string,
  objectPath: string
): Promise<{ stream: ReadableStream; contentType: string; size: number } | null> {
  const full = resolveObject(bucket, objectPath);
  if (!full) return null;
  let size: number;
  try {
    const info = await stat(full);
    if (!info.isFile()) return null;
    size = info.size;
  } catch {
    return null;
  }
  let contentType = "application/octet-stream";
  try {
    const meta = JSON.parse(await readFile(`${full}.meta.json`, "utf8")) as { contentType?: string };
    if (meta.contentType) contentType = meta.contentType;
  } catch {
    // no sidecar: serve as octet-stream
  }
  const stream = Readable.toWeb(createReadStream(full)) as ReadableStream;
  return { stream, contentType, size };
}

/** Host-relative URL so stored links keep working when the domain changes. */
export function publicObjectUrl(bucket: Bucket, objectPath: string): string {
  const encoded = objectPath.split("/").map(encodeURIComponent).join("/");
  return `/storage/v1/object/public/${bucket}/${encoded}`;
}
