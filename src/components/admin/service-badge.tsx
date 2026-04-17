import { getService, formatServiceLabel, divisions } from "@/lib/services/catalogue";
import { cn } from "@/lib/utils/cn";

/**
 * Pill-style badge that renders a service's friendly label with a subtle
 * colour cue derived from its division.
 */
export function ServiceBadge({
  serviceType,
  className,
  short = false
}: {
  serviceType: string | null | undefined;
  className?: string;
  short?: boolean;
}) {
  const svc = getService(serviceType);
  const label = short && svc ? svc.shortLabel : formatServiceLabel(serviceType);
  const division = svc ? divisions[svc.division] : null;

  const tone =
    division?.key === "IMMIGRATION"
      ? "bg-blue-50 text-blue-700 border-blue-100"
      : division?.key === "TRAVEL"
        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
        : division?.key === "CORPORATE_EVENTS"
          ? "bg-violet-50 text-violet-700 border-violet-100"
          : division?.key === "CONSULTATION"
            ? "bg-amber-50 text-amber-700 border-amber-100"
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
