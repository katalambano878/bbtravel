import { Resend } from "resend";

import { brand } from "@/lib/data/brand";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function defaultFrom() {
  return process.env.RESEND_FROM ?? "B.B. Travel Consult <noreply@bbtravelconsult.com>";
}

/** Comma-separated ADMIN_NOTIFY_EMAILS, or single site email. */
export function getAdminNotifyRecipients(): string[] {
  const raw = process.env.ADMIN_NOTIFY_EMAILS?.trim();
  if (raw) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const single = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  if (single) return [single];
  return [brand.email].filter(Boolean);
}

export async function sendTransactionalEmail({
  to,
  subject,
  html
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  if (!resend || !process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[email] RESEND_API_KEY not set; skipping:", subject);
    }
    return;
  }
  const list = Array.isArray(to) ? to : [to];
  await resend.emails.send({
    from: defaultFrom(),
    to: list,
    subject,
    html
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendAdminFormEmail(input: {
  formType: string;
  payload: Record<string, unknown>;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  submissionId: string;
  leadId?: string | null;
  caseId?: string | null;
}) {
  const recipients = getAdminNotifyRecipients();
  if (recipients.length === 0) return;

  const lines: string[] = [
    `<p><strong>Form:</strong> ${escapeHtml(input.formType)}</p>`,
    `<p><strong>Submission ID:</strong> ${escapeHtml(input.submissionId)}</p>`
  ];
  if (input.name) lines.push(`<p><strong>Name:</strong> ${escapeHtml(input.name)}</p>`);
  if (input.email) lines.push(`<p><strong>Email:</strong> ${escapeHtml(input.email)}</p>`);
  if (input.phone) lines.push(`<p><strong>Phone:</strong> ${escapeHtml(input.phone)}</p>`);
  if (input.leadId) lines.push(`<p><strong>Lead ID:</strong> ${escapeHtml(input.leadId)}</p>`);
  if (input.caseId) lines.push(`<p><strong>Case ID:</strong> ${escapeHtml(input.caseId)}</p>`);
  lines.push("<hr/><p><strong>Full payload (JSON)</strong></p>");
  lines.push(`<pre style="background:#f4f4f5;padding:12px;border-radius:8px;overflow:auto;font-size:12px;">${escapeHtml(
    JSON.stringify(input.payload, null, 2)
  )}</pre>`);
  lines.push(
    `<p style="font-size:12px;color:#64748b">View all submissions in Admin → Inbox.</p>`
  );

  await sendTransactionalEmail({
    to: recipients,
    subject: `[${brand.name}] New form: ${input.formType.replace(/_/g, " ")}`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:640px">${lines.join("\n")}</div>`
  });
}
