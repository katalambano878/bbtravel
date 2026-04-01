import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-bb-gold/30 bg-bb-gold/10 px-3 py-1 text-xs font-medium text-bb-navy",
        className
      )}
    >
      {children}
    </span>
  );
}
