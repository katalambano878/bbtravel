"use client";

import { useEffect, useState } from "react";
import { BellDot } from "lucide-react";

const POLL_MS = 20_000;

type Snapshot = { case: string | null; documents: Record<string, string> };

export function RealtimeCaseFeed({ caseId }: { caseId: string }) {
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    let previous: Snapshot | null = null;
    let cancelled = false;

    async function poll() {
      if (document.visibilityState === "hidden") return;
      try {
        const res = await fetch(`/api/portal/case-updates?caseId=${encodeURIComponent(caseId)}`, { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const next = (await res.json()) as Snapshot;
        if (previous) {
          const found: string[] = [];
          const time = new Date().toLocaleTimeString();
          if (next.case !== previous.case) found.push(`${time} - Case status updated`);
          const prevDocs = previous.documents;
          const docChanged = Object.entries(next.documents).some(([id, value]) => id in prevDocs && prevDocs[id] !== value);
          if (docChanged) found.push(`${time} - Document decision received`);
          if (found.length) setEvents((prev) => [...found, ...prev].slice(0, 8));
        }
        previous = next;
      } catch {
        // offline or navigating away: try again on the next tick
      }
    }

    poll();
    const timer = window.setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [caseId]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-bb-navy">
        <BellDot className="h-4 w-4 text-bb-gold" />
        Live Updates
      </div>
      {events.length === 0 ? (
        <p className="text-xs text-slate-500">No new updates yet.</p>
      ) : (
        <ul className="space-y-2 text-xs text-slate-600">
          {events.map((event) => (
            <li key={event} className="rounded-lg bg-slate-50 px-3 py-2">
              {event}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
