"use client";

import { useState, useMemo } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { MESSAGE_TEMPLATES, TEMPLATE_GROUPS } from "@/lib/notifications/templates";
import { buildWhatsappUrl, normalizeGhanaPhone, renderTemplate } from "@/lib/whatsapp/client";
import { logWhatsappSendAction } from "@/app/actions";

interface WhatsappButtonProps {
  phone: string | null | undefined;
  name?: string | null;
  clientId?: string;
  caseId?: string;
  leadId?: string;
  /** Pre-selected template key. */
  defaultTemplateKey?: string;
  /** Default placeholders for rendering. */
  defaultVars?: Record<string, string | number | null | undefined>;
  variant?: "ghost" | "solid" | "chip";
  label?: string;
}

export function WhatsappButton({
  phone,
  name,
  clientId,
  caseId,
  leadId,
  defaultTemplateKey,
  defaultVars,
  variant = "ghost",
  label
}: WhatsappButtonProps) {
  const normalized = normalizeGhanaPhone(phone);
  const [open, setOpen] = useState(false);
  const [templateKey, setTemplateKey] = useState(defaultTemplateKey ?? "LEAD_ACK_WHATSAPP");
  const [body, setBody] = useState<string>(() => {
    const tpl = MESSAGE_TEMPLATES.find((t) => t.key === (defaultTemplateKey ?? "LEAD_ACK_WHATSAPP"));
    if (!tpl) return "";
    return renderTemplate(tpl.body, {
      client_name: name ?? "",
      staff_name: "",
      ...(defaultVars ?? {})
    });
  });
  const [subject, setSubject] = useState<string>("");

  const waTemplates = useMemo(() => MESSAGE_TEMPLATES.filter((t) => t.channel === "WHATSAPP"), []);
  const groups = useMemo(
    () => TEMPLATE_GROUPS.filter((g) => waTemplates.some((t) => t.group === g)),
    [waTemplates]
  );

  if (!normalized) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-400">
        <MessageCircle className="h-3 w-3" /> No phone
      </span>
    );
  }

  const className =
    variant === "solid"
      ? "inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
      : variant === "chip"
        ? "inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700 hover:bg-green-100"
        : "inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-800 hover:underline";

  const applyTemplate = (key: string) => {
    const tpl = MESSAGE_TEMPLATES.find((t) => t.key === key);
    setTemplateKey(key);
    if (tpl) {
      setBody(renderTemplate(tpl.body, {
        client_name: name ?? "",
        staff_name: "",
        ...(defaultVars ?? {})
      }));
      setSubject(tpl.subject ?? "");
    }
  };

  const launch = async () => {
    const url = buildWhatsappUrl({ phone: normalized, body });
    if (url) window.open(url, "_blank");
    try {
      const fd = new FormData();
      fd.set("to_phone", normalized);
      if (name) fd.set("to_name", name);
      if (clientId) fd.set("client_id", clientId);
      if (caseId) fd.set("case_id", caseId);
      if (leadId) fd.set("lead_id", leadId);
      fd.set("template_key", templateKey);
      fd.set("subject", subject);
      fd.set("body", body);
      await logWhatsappSendAction(fd);
    } catch {
      // non-blocking
    }
    setOpen(false);
  };

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        <MessageCircle className={variant === "solid" ? "h-3.5 w-3.5" : "h-3 w-3"} />
        {label ?? "WhatsApp"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-bb-navy">WhatsApp — {name || normalized}</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  +{normalized} · We'll open wa.me and log the send to history.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Template
            </label>
            <select
              value={templateKey}
              onChange={(e) => applyTemplate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {groups.map((g) => (
                <optgroup key={g} label={g}>
                  {waTemplates
                    .filter((t) => t.group === g)
                    .map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>

            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Unfilled {"{{placeholders}}"} will remain as-is — edit the text before sending.
            </p>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                onClick={launch}
              >
                <Send className="h-3.5 w-3.5" /> Open WhatsApp & log
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
