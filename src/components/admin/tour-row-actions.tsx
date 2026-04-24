"use client";

import { Trash2 } from "lucide-react";
import type { FormEvent } from "react";

import { deleteTourAction } from "@/app/actions";

export function DeleteTourButton({ id, title }: { id: string; title: string }) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      e.preventDefault();
    }
  }

  return (
    <form action={deleteTourAction} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
        title="Delete tour"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </form>
  );
}
