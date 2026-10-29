#!/usr/bin/env node
/**
 * HTTP smoke test for the plain-Postgres build.
 *   node scripts/migration/smoke.mjs --base http://127.0.0.1:3000 --accounts migration-artifacts/staging-qa-accounts.env
 * Checks every public route, admin sign-in (good + bad password), every admin
 * page as the QA admin, upload + public serving of a tour image, and that
 * protected endpoints refuse anonymous callers. Exit code 1 on any failure.
 */
import fs from "node:fs";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: { base: { type: "string" }, accounts: { type: "string" } }
});
const base = (values.base || "http://127.0.0.1:3000").replace(/\/$/, "");
const accounts = Object.fromEntries(
  fs.readFileSync(values.accounts, "utf8").trim().split("\n").map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)])
);

let failures = 0;
const ok = (msg) => console.log(`PASS ${msg}`);
const fail = (msg) => {
  failures++;
  console.log(`FAIL ${msg}`);
};

const ERROR_MARKERS = [
  "Application error",
  "Internal Server Error",
  "NEXT_REDIRECT",
  "Unsafe SQL identifier",
  "Could not find a relationship",
  "does not exist"
];

async function get(path, cookie) {
  const res = await fetch(base + path, { headers: cookie ? { cookie } : {}, redirect: "manual" });
  const body = res.headers.get("content-type")?.includes("text/html") ? await res.text() : "";
  return { res, body };
}

async function checkPage(path, cookie, { expect = 200 } = {}) {
  const { res, body } = await get(path, cookie);
  const marker = ERROR_MARKERS.find((m) => body.includes(m)) ?? (/<title>404/.test(body) ? "404 title" : undefined);
  if (res.status !== expect) fail(`${path} -> ${res.status} (expected ${expect})${res.headers.get("location") ? " → " + res.headers.get("location") : ""}`);
  else if (marker) fail(`${path} -> ${res.status} but page contains "${marker}"`);
  else ok(`${path} -> ${res.status}`);
  return body;
}

// ---- public routes ------------------------------------------------------------
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const publicPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const extraPublic = ["/portal/login", "/portal/register", "/portal/forgot-password", "/admin/login", "/robots.txt", "/manifest.webmanifest"];
for (const p of [...new Set([...publicPaths, ...extraPublic])]) await checkPage(p);

// ---- anonymous access is refused ------------------------------------------------
for (const [path, statuses] of [
  ["/admin", [307, 308]],
  ["/portal", [307, 308]],
  ["/api/portal/case-updates?caseId=00000000-0000-0000-0000-000000000000", [404]],
  ["/api/documents/00000000-0000-0000-0000-000000000000/file", [401]],
  ["/storage/v1/object/public/client-documents/x/y.pdf", [404]]
]) {
  const { res } = await get(path);
  if (statuses.includes(res.status)) ok(`anonymous ${path} refused (${res.status})`);
  else fail(`anonymous ${path} -> ${res.status}, expected ${statuses.join("/")}`);
}
{
  const body = new FormData();
  body.set("file", new Blob([Buffer.from("x")], { type: "image/png" }), "x.png");
  const res = await fetch(`${base}/api/admin/tours/upload`, { method: "POST", body });
  if (res.status === 401) ok("anonymous tour upload refused (401)");
  else fail(`anonymous tour upload -> ${res.status}`);
}

// ---- admin sign-in ----------------------------------------------------------------
async function adminSignIn(email, password) {
  const form = new URLSearchParams({ email, password });
  const res = await fetch(`${base}/api/admin-signin`, {
    method: "POST",
    body: form,
    headers: { "content-type": "application/x-www-form-urlencoded" },
    redirect: "manual"
  });
  return { location: res.headers.get("location") || "", cookie: (res.headers.get("set-cookie") || "").split(";")[0] };
}
{
  const bad = await adminSignIn(accounts.QA_ADMIN_EMAIL, "definitely-wrong-password");
  if (bad.location === "/admin/login?error=credentials" && !bad.cookie.startsWith("bb_session=")) ok("admin sign-in rejects a wrong password");
  else fail(`wrong password: location=${bad.location}`);
}
const signedIn = await adminSignIn(accounts.QA_ADMIN_EMAIL, accounts.QA_ADMIN_PASSWORD);
// Must stay on this site: behind the proxy an absolute URL would point at localhost.
if (signedIn.location !== "/admin" || !signedIn.cookie.startsWith("bb_session=")) {
  fail(`admin sign-in failed: location=${signedIn.location}`);
  process.exit(1);
}
ok("admin sign-in issues a session cookie");
const cookie = signedIn.cookie;

// ---- every admin page -------------------------------------------------------------
const adminHtml = await checkPage("/admin", cookie);
const adminLinks = new Set(["/admin"]);
for (const m of adminHtml.matchAll(/href="(\/admin[^"#?]*)(\?[^"]*)?"/g)) adminLinks.add(m[1] + (m[2] ? m[2].replace(/&amp;/g, "&") : ""));
for (const p of ["/admin/clients", "/admin/pipeline", "/admin/inbox", "/admin/documents", "/admin/finance", "/admin/team", "/admin/settings", "/admin/tours", "/admin/tours/new", "/admin/bi/export"]) adminLinks.add(p);
const visited = new Set();
const queue = [...adminLinks];
while (queue.length) {
  const p = queue.shift();
  if (visited.has(p) || p.startsWith("/admin/login")) continue;
  visited.add(p);
  if (p.startsWith("/admin/bi/export")) {
    const { res } = await get(p, cookie);
    if (res.status === 200) ok(`${p} -> 200 (${res.headers.get("content-type")})`);
    else fail(`${p} -> ${res.status}`);
    continue;
  }
  const html = await checkPage(p, cookie);
  // follow detail links one level deep (clients/<id>, tours/<id>, tabs)
  for (const m of html.matchAll(/href="(\/admin[^"#]*)"/g)) {
    const link = m[1].replace(/&amp;/g, "&");
    if (!visited.has(link) && visited.size + queue.length < 400) queue.push(link);
  }
}
console.log(`visited ${visited.size} admin URLs`);

// ---- tour image upload + public serving + image optimizer --------------------------
{
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );
  const body = new FormData();
  body.set("file", new Blob([png], { type: "image/png" }), "smoke test.png");
  body.set("folder", "smoke-test");
  const res = await fetch(`${base}/api/admin/tours/upload`, { method: "POST", body, headers: { cookie } });
  const json = await res.json().catch(() => ({}));
  if (res.status !== 200 || !json.url?.startsWith("/storage/v1/object/public/tour-media/")) {
    fail(`tour upload -> ${res.status} ${JSON.stringify(json)}`);
  } else {
    ok(`tour upload -> ${json.url}`);
    const img = await fetch(base + json.url);
    const bytes = Buffer.from(await img.arrayBuffer());
    if (img.status === 200 && img.headers.get("content-type") === "image/png" && bytes.equals(png)) ok("uploaded image served byte-identical as image/png");
    else fail(`serve uploaded image -> ${img.status} ${img.headers.get("content-type")}`);
    if ((img.headers.get("cache-control") || "").includes("max-age=86400")) ok("public media is cacheable");
    else fail(`public media cache-control: ${img.headers.get("cache-control")}`);
    const opt = await fetch(`${base}/_next/image?url=${encodeURIComponent(json.url)}&w=640&q=75`);
    if (opt.status === 200 && (opt.headers.get("content-type") || "").startsWith("image/")) ok("next/image optimizer serves uploaded image");
    else fail(`next/image optimizer -> ${opt.status} ${opt.headers.get("content-type")}`);
  }
}

// ---- sign-out --------------------------------------------------------------------
{
  const res = await fetch(`${base}/api/admin-signout`, { method: "POST", headers: { cookie }, redirect: "manual" });
  const cleared = (res.headers.get("set-cookie") || "").startsWith("bb_session=;");
  if (res.status === 303 && cleared && res.headers.get("location") === "/admin/login") ok("admin sign-out clears the session cookie");
  else fail(`sign-out -> ${res.status} ${res.headers.get("set-cookie")}`);
}

console.log(failures ? `\n${failures} FAILURE(S)` : "\nALL CHECKS PASSED");
process.exit(failures ? 1 : 0);
