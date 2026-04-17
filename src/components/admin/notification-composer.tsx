"use client";

import { useState, useMemo } from "react";
import { Bell, Wand2 } from "lucide-react";

import { createNotificationAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MESSAGE_TEMPLATES,
  TEMPLATE_GROUPS,
  type MessageTemplate
} from "@/lib/notifications/templates";

interface StaffUser {
  user_id: string;
  full_name: string;
  role: string;
}

export function NotificationComposer({ staffUsers }: { staffUsers: StaffUser[] }) {
  const [templateKey, setTemplateKey] = useState<string>("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState<MessageTemplate["channel"]>("IN_APP");

  const grouped = useMemo(() => {
    return TEMPLATE_GROUPS.map((group) => ({
      group,
      templates: MESSAGE_TEMPLATES.filter((t) => t.group === group)
    }));
  }, []);

  function applyTemplate(key: string) {
    setTemplateKey(key);
    const template = MESSAGE_TEMPLATES.find((t) => t.key === key);
    if (!template) return;
    setTitle(template.subject ?? template.name);
    setBody(template.body);
    setChannel(template.channel);
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs flex items-center gap-1.5">
          <Wand2 className="h-3.5 w-3.5 text-bb-gold" />
          Start from a template
        </Label>
        <select
          value={templateKey}
          onChange={(e) => applyTemplate(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">— Blank message —</option>
          {grouped.map(({ group, templates }) => (
            <optgroup key={group} label={group}>
              {templates.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {templateKey && (
          <p className="mt-1 text-[11px] text-slate-400">
            Replace <code className="rounded bg-slate-100 px-1 text-slate-600">{"{{placeholders}}"}</code>{" "}
            with the client&apos;s actual details before sending.
          </p>
        )}
      </div>

      <form action={createNotificationAction} className="space-y-3">
        <div>
          <Label className="text-xs">Recipient</Label>
          <select
            name="user_id"
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Select recipient…</option>
            {staffUsers.map((s) => (
              <option key={s.user_id} value={s.user_id}>
                {s.full_name} ({s.role})
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-400">
            Client-destined messages (email, WhatsApp, SMS) are dispatched via their linked
            staff-case thread.
          </p>
        </div>

        <div>
          <Label className="text-xs">Subject / title</Label>
          <Input
            name="title"
            placeholder="e.g. Your UK visa appointment is next Tuesday"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-xs">Body</Label>
          <textarea
            name="body"
            required
            rows={7}
            placeholder="Write or paste your message…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-bb-gold focus:outline-none focus:ring-2 focus:ring-bb-gold/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Channel</Label>
            <select
              name="channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value as MessageTemplate["channel"])}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="IN_APP">In-app</option>
              <option value="EMAIL">Email</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="SMS">SMS</option>
            </select>
          </div>
          <div>
            <Label className="text-xs">Link to (optional)</Label>
            <Input name="entity_type" placeholder="case / lead / invoice" />
          </div>
        </div>

        <Input name="entity_id" placeholder="Entity ID (e.g. case id)" />

        <Button type="submit" className="w-full">
          <Bell className="mr-1.5 h-4 w-4" />
          Send notification
        </Button>
      </form>
    </div>
  );
}
