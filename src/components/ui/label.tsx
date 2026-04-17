import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Label({ htmlFor, children, className }: { htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn("mb-2 block text-sm font-medium text-slate-700", className)}>
      {children}
    </label>
  );
}
