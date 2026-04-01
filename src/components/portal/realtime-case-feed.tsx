"use client";

import { useEffect, useState } from "react";
import { BellDot } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function RealtimeCaseFeed({ caseId }: { caseId: string }) {
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`case-updates-${caseId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "cases", filter: `id=eq.${caseId}` }, () => {
        setEvents((prev) => [`${new Date().toLocaleTimeString()} - Case status updated`, ...prev].slice(0, 8));
      })
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "documents", filter: `case_id=eq.${caseId}` },
        () => {
          setEvents((prev) => [`${new Date().toLocaleTimeString()} - Document decision received`, ...prev].slice(0, 8));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
