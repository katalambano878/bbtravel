/**
 * Shared admin table class strings so density, hover, and sticky headers stay
 * consistent across every page in the admin console.
 */
export const adminTable = {
  wrap: "overflow-x-auto",
  table: "w-full text-sm",
  thead:
    "sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500",
  th: "px-4 py-2.5 text-left font-semibold",
  thRight: "px-4 py-2.5 text-right font-semibold",
  body: "divide-y divide-slate-100",
  row: "align-top transition-colors hover:bg-slate-50/60",
  td: "px-4 py-3"
};
