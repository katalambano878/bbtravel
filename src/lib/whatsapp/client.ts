/**
 * WhatsApp click-to-chat helper tuned for Ghana numbers (+233 / 0xxxxxxxxx).
 *
 * We do not maintain a WhatsApp Business API integration here — the pattern
 * is "open wa.me with a pre-filled message" plus a log entry written to
 * `whatsapp_messages` so staff has a send-history audit trail.
 */

export function normalizeGhanaPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return null;
  // 233XXXXXXXXX (already international)
  if (digits.startsWith("233") && digits.length >= 11) return digits;
  // 0XXXXXXXXX  → drop the leading 0 and prefix 233
  if (digits.startsWith("0") && digits.length === 10) return `233${digits.slice(1)}`;
  // XXXXXXXXX (9 digits) → prefix 233
  if (digits.length === 9) return `233${digits}`;
  // Fallback: assume caller provided already-international digits
  return digits;
}

/** Build a click-to-chat URL. Renders `{{placeholders}}` with the given `vars`. */
export function buildWhatsappUrl(params: {
  phone: string | null | undefined;
  body: string;
  vars?: Record<string, string | number | null | undefined>;
}): string | null {
  const phone = normalizeGhanaPhone(params.phone);
  if (!phone) return null;
  const rendered = renderTemplate(params.body, params.vars ?? {});
  const encoded = encodeURIComponent(rendered);
  return `https://wa.me/${phone}?text=${encoded}`;
}

/** Render `{{placeholders}}` — unknown keys are left as `{{key}}`. */
export function renderTemplate(body: string, vars: Record<string, string | number | null | undefined>): string {
  return body.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key: string) => {
    const value = vars[key];
    if (value === null || value === undefined || value === "") return `{{${key}}}`;
    return String(value);
  });
}
