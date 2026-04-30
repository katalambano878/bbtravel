"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

import { syncFeaturedToursFromMockAction } from "@/app/actions";

export function SyncMockToursButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function run() {
    if (
      !window.confirm(
        "Sync the six featured tours from the marketing mock catalogue into this database? Any tour with the same URL slug will be updated (text, prices, itinerary, images as URLs from mock)."
      )
    ) {
      return;
    }
    setPending(true);
    try {
      const result = await syncFeaturedToursFromMockAction();
      if (result.ok) {
        alert(result.message);
        router.refresh();
      } else {
        alert(result.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:border-bb-navy/30 hover:text-bb-navy disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
      Sync from mock
    </button>
  );
}
