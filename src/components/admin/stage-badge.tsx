import { getStageMeta, LEAD_PIPELINE_STAGES } from "@/lib/services/catalogue";
import { cn } from "@/lib/utils/cn";

const LEGACY_MAP: Record<string, (typeof LEAD_PIPELINE_STAGES)[number]["key"]> = {
  QUALIFIED: "SCOPED",
  CONVERTED: "BOOKED"
};

export function StageBadge({
  stage,
  className
}: {
  stage: string | null | undefined;
  className?: string;
}) {
  const normalized = stage ? (LEGACY_MAP[stage] ?? stage) : null;
  const meta = getStageMeta(normalized ?? undefined);
  const label = meta?.label ?? (stage ? String(stage).replaceAll("_", " ") : "—");

  const tone =
    normalized === "NEW"
      ? "bg-blue-50 text-blue-700 border-blue-100"
      : normalized === "CONTACTED"
        ? "bg-cyan-50 text-cyan-700 border-cyan-100"
        : normalized === "SCOPED"
          ? "bg-indigo-50 text-indigo-700 border-indigo-100"
          : normalized === "QUOTED"
            ? "bg-amber-50 text-amber-700 border-amber-100"
            : normalized === "BOOKED"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : normalized === "COMPLETED"
                ? "bg-green-50 text-green-700 border-green-100"
                : normalized === "CLOSED"
                  ? "bg-slate-100 text-slate-500 border-slate-200"
                  : "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        tone,
        className
      )}
    >
      {label}
    </span>
  );
}
