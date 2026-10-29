import "server-only";

import { createHash } from "crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

import { query } from "@/lib/db/pool";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { brand } from "@/lib/data/brand";

/**
 * Email + password auth on the `auth.users` table carried over from Supabase
 * (same bcrypt hashes, so existing passwords keep working). Sessions are an
 * HS256 JWT in an httpOnly cookie; changing a password invalidates every
 * session issued before it.
 */

export const SESSION_COOKIE = "bb_session";
const SESSION_TTL_SEC = 60 * 60 * 24 * 7;
const CONFIRM_TTL_SEC = 60 * 60 * 24;
const RECOVERY_TTL_SEC = 60 * 60;
const EMAIL_RESEND_INTERVAL_MS = 60 * 1000;
const BCRYPT_COST = 10;
export const MIN_PASSWORD_LENGTH = 6;

export interface SessionUser {
  id: string;
  email: string;
  user_metadata: Record<string, any>;
  app_metadata: Record<string, any>;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
}

export type AuthErrorCode =
  | "invalid_credentials"
  | "email_not_confirmed"
  | "user_banned"
  | "weak_password"
  | "invalid_email"
  | "invalid_token";

export class AuthError extends Error {
  constructor(public code: AuthErrorCode, message: string) {
    super(message);
  }
}

interface UserRow {
  id: string;
  email: string | null;
  encrypted_password: string | null;
  email_confirmed_at: string | null;
  confirmation_sent_at: string | null;
  recovery_sent_at: string | null;
  last_sign_in_at: string | null;
  banned_until: string | null;
  raw_user_meta_data: Record<string, any> | null;
  raw_app_meta_data: Record<string, any> | null;
  created_at: string;
}

const USER_COLUMNS = `id, email, encrypted_password, email_confirmed_at, confirmation_sent_at, recovery_sent_at,
  last_sign_in_at, banned_until, raw_user_meta_data, raw_app_meta_data, created_at`;

function jwtSecret(): Uint8Array {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_JWT_SECRET must be set to at least 32 characters.");
    }
    return new TextEncoder().encode("bb-travel-local-dev-secret-not-for-production");
  }
  return new TextEncoder().encode(secret);
}

function passwordVersion(hash: string | null): string {
  return createHash("sha256").update(hash ?? "").digest("hex").slice(0, 16);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isBanned(row: UserRow): boolean {
  return !!row.banned_until && new Date(row.banned_until) > new Date();
}

function toSessionUser(row: UserRow): SessionUser {
  return {
    id: row.id,
    email: row.email ?? "",
    user_metadata: row.raw_user_meta_data ?? {},
    app_metadata: row.raw_app_meta_data ?? {},
    created_at: row.created_at,
    email_confirmed_at: row.email_confirmed_at,
    last_sign_in_at: row.last_sign_in_at
  };
}

async function findUserByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await query<UserRow>(
    `SELECT ${USER_COLUMNS} FROM auth.users
     WHERE lower(email) = $1 AND deleted_at IS NULL AND is_sso_user = false
     LIMIT 1`,
    [normalizeEmail(email)]
  );
  return rows[0] ?? null;
}

async function findUserById(id: string): Promise<UserRow | null> {
  const { rows } = await query<UserRow>(
    `SELECT ${USER_COLUMNS} FROM auth.users WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

async function signToken(claims: JWTPayload, subject: string, ttlSec: number): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(subject)
    .setIssuedAt()
    .setExpirationTime(`${ttlSec}s`)
    .sign(jwtSecret());
}

async function verifyToken(token: string, purpose: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret(), { algorithms: ["HS256"] });
    if (payload.purpose !== purpose || typeof payload.sub !== "string") return null;
    return payload;
  } catch {
    return null;
  }
}

// ---- session cookie ----------------------------------------------------------

function cookieSecure(): boolean {
  const base = process.env.APP_BASE_URL ?? "";
  return base.startsWith("https://") || (process.env.NODE_ENV === "production" && !base.startsWith("http://"));
}

export async function createSessionCookie(row: Pick<UserRow, "id" | "email" | "encrypted_password">) {
  const value = await signToken(
    { purpose: "session", email: row.email ?? "", pwv: passwordVersion(row.encrypted_password) },
    row.id,
    SESSION_TTL_SEC
  );
  return {
    name: SESSION_COOKIE,
    value,
    options: {
      httpOnly: true,
      secure: cookieSecure(),
      sameSite: "lax" as const,
      path: "/",
      maxAge: SESSION_TTL_SEC
    }
  };
}

export const clearedSessionCookie = {
  name: SESSION_COOKIE,
  value: "",
  options: { httpOnly: true, secure: false, sameSite: "lax" as const, path: "/", maxAge: 0 }
};

/** Resolve a session token to its user, rejecting tokens issued before a password change. */
export async function userFromSessionToken(token: string | undefined | null): Promise<SessionUser | null> {
  if (!token) return null;
  const payload = await verifyToken(token, "session");
  if (!payload) return null;
  const row = await findUserById(payload.sub!);
  if (!row || isBanned(row) || !row.email_confirmed_at) return null;
  if (payload.pwv !== passwordVersion(row.encrypted_password)) return null;
  return toSessionUser(row);
}

/** Current signed-in user for this request (cached per request). */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  return userFromSessionToken(store.get(SESSION_COOKIE)?.value);
});

/** For server actions: write the session cookie through next/headers. */
export async function setSessionCookie(row: Pick<UserRow, "id" | "email" | "encrypted_password">) {
  const cookie = await createSessionCookie(row);
  (await cookies()).set(cookie.name, cookie.value, cookie.options);
}

export async function clearSessionCookie() {
  (await cookies()).set(clearedSessionCookie.name, "", clearedSessionCookie.options);
}

// ---- sign in ------------------------------------------------------------------

// Compared against when the email is unknown so response time doesn't reveal it.
let dummyHash: string | null = null;

export async function verifyPassword(email: string, password: string) {
  const row = await findUserByEmail(email);
  dummyHash ??= await bcrypt.hash("not-a-real-password", BCRYPT_COST);
  const ok = await bcrypt.compare(password, row?.encrypted_password || dummyHash);
  if (!row || !row.encrypted_password || !ok) {
    throw new AuthError("invalid_credentials", "Invalid login credentials");
  }
  if (isBanned(row)) throw new AuthError("user_banned", "User is banned");
  if (!row.email_confirmed_at) throw new AuthError("email_not_confirmed", "Email not confirmed");
  await query(`UPDATE auth.users SET last_sign_in_at = now(), updated_at = now() WHERE id = $1`, [row.id]);
  return { row, user: toSessionUser(row) };
}

// ---- sign up + email confirmation ----------------------------------------------

async function appBaseUrl(): Promise<string> {
  const configured = process.env.APP_BASE_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function recentlySent(at: string | null): boolean {
  return !!at && Date.now() - new Date(at).getTime() < EMAIL_RESEND_INTERVAL_MS;
}

function emailShell(heading: string, body: string, cta: { label: string; href: string }, footnote: string) {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
  <p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#b8862f;margin:0 0 12px">${brand.name}</p>
  <h1 style="font-size:22px;margin:0 0 12px">${heading}</h1>
  <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 24px">${body}</p>
  <p style="margin:0 0 24px"><a href="${cta.href}" style="display:inline-block;background:#0b1f3a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600">${cta.label}</a></p>
  <p style="font-size:12px;line-height:1.6;color:#64748b;margin:0">${footnote}<br/>If the button doesn't work, paste this link into your browser:<br/><span style="word-break:break-all">${cta.href}</span></p>
</div>`;
}

async function sendConfirmationEmail(row: UserRow): Promise<boolean> {
  const token = await signToken({ purpose: "email_confirm", email: row.email ?? "" }, row.id, CONFIRM_TTL_SEC);
  const link = `${await appBaseUrl()}/auth/confirm?token=${encodeURIComponent(token)}`;
  const sent = await sendTransactionalEmail({
    to: row.email!,
    subject: `Confirm your ${brand.name} portal account`,
    html: emailShell(
      "Confirm your email",
      "Thanks for creating your client portal account. Confirm your email address to start tracking your case, uploading documents and receiving updates.",
      { label: "Confirm email", href: link },
      "This link expires in 24 hours. If you didn't create an account, you can ignore this email."
    )
  });
  if (sent) await query(`UPDATE auth.users SET confirmation_sent_at = now() WHERE id = $1`, [row.id]);
  return sent;
}

/**
 * Register a portal user. Mirrors Supabase with email confirmation on: the
 * account can't sign in until the emailed link is opened. Re-registering an
 * unconfirmed email replaces its password and resends the link; a confirmed
 * email returns user = null without revealing that it exists.
 */
export async function signUpWithPassword(input: { email: string; password: string; fullName: string }) {
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) throw new AuthError("invalid_email", "Please enter a valid email address.");
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    throw new AuthError("weak_password", `Password should be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  const hash = await bcrypt.hash(input.password, BCRYPT_COST);
  const meta = { full_name: input.fullName, email, email_verified: false, phone_verified: false };
  const existing = await findUserByEmail(email);

  let row: UserRow;
  if (existing) {
    if (existing.email_confirmed_at) return { user: null as SessionUser | null };
    const { rows } = await query<UserRow>(
      `UPDATE auth.users
       SET encrypted_password = $2, raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || $3::jsonb, updated_at = now()
       WHERE id = $1 RETURNING ${USER_COLUMNS}`,
      [existing.id, hash, JSON.stringify(meta)]
    );
    row = rows[0];
  } else {
    const { rows } = await query<UserRow>(
      `INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, raw_app_meta_data, raw_user_meta_data,
         is_super_admin, created_at, updated_at, is_sso_user, is_anonymous)
       VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $1, $2,
         '{"provider":"email","providers":["email"]}'::jsonb, $3::jsonb, false, now(), now(), false, false)
       RETURNING ${USER_COLUMNS}`,
      [email, hash, JSON.stringify(meta)]
    );
    row = rows[0];
  }

  if (!recentlySent(row.confirmation_sent_at)) {
    const sent = await sendConfirmationEmail(row);
    if (!sent) console.error("[auth] confirmation email was not sent for", row.id);
  }
  return { user: toSessionUser(row) };
}

/** Confirm the email behind a link from the confirmation email. */
export async function confirmEmail(token: string) {
  const payload = await verifyToken(token, "email_confirm");
  if (!payload) throw new AuthError("invalid_token", "This confirmation link is invalid or has expired.");
  const row = await findUserById(payload.sub!);
  if (!row || normalizeEmail(row.email ?? "") !== normalizeEmail(String(payload.email ?? ""))) {
    throw new AuthError("invalid_token", "This confirmation link is invalid or has expired.");
  }
  if (isBanned(row)) throw new AuthError("user_banned", "User is banned");
  const { rows } = await query<UserRow>(
    `UPDATE auth.users
     SET email_confirmed_at = coalesce(email_confirmed_at, now()),
         raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"email_verified": true}'::jsonb,
         last_sign_in_at = now(), updated_at = now()
     WHERE id = $1 RETURNING ${USER_COLUMNS}`,
    [row.id]
  );
  return rows[0];
}

// ---- password recovery ---------------------------------------------------------

/** Email a reset link if the account exists. Never reveals whether it does. */
export async function requestPasswordReset(email: string): Promise<void> {
  const row = await findUserByEmail(email);
  if (!row || isBanned(row) || recentlySent(row.recovery_sent_at)) return;
  const token = await signToken({ purpose: "recovery", pwv: passwordVersion(row.encrypted_password) }, row.id, RECOVERY_TTL_SEC);
  const link = `${await appBaseUrl()}/portal/reset-password?token=${encodeURIComponent(token)}`;
  const sent = await sendTransactionalEmail({
    to: row.email!,
    subject: `Reset your ${brand.name} password`,
    html: emailShell(
      "Reset your password",
      "We received a request to reset the password for your account. Choose a new password using the button below.",
      { label: "Choose a new password", href: link },
      "This link expires in 1 hour and can only be used once. If you didn't ask for this, you can ignore this email."
    )
  });
  if (sent) await query(`UPDATE auth.users SET recovery_sent_at = now() WHERE id = $1`, [row.id]);
  else console.error("[auth] password reset email was not sent for", row.id);
}

/** A recovery token is valid until it expires or the password changes. */
export async function userFromRecoveryToken(token: string): Promise<UserRow | null> {
  const payload = await verifyToken(token, "recovery");
  if (!payload) return null;
  const row = await findUserById(payload.sub!);
  if (!row || isBanned(row) || payload.pwv !== passwordVersion(row.encrypted_password)) return null;
  return row;
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new AuthError("weak_password", `Password should be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  const row = await userFromRecoveryToken(token);
  if (!row) throw new AuthError("invalid_token", "This reset link is invalid or has expired.");
  const hash = await bcrypt.hash(newPassword, BCRYPT_COST);
  const { rows } = await query<UserRow>(
    `UPDATE auth.users
     SET encrypted_password = $2, email_confirmed_at = coalesce(email_confirmed_at, now()),
         recovery_sent_at = NULL, last_sign_in_at = now(), updated_at = now()
     WHERE id = $1 RETURNING ${USER_COLUMNS}`,
    [row.id, hash]
  );
  return rows[0];
}
