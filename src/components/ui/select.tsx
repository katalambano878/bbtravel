import type { ChangeEvent } from "react";
import { cn } from "@/lib/utils/cn";

type Option = { label: string; value: string };

export function Select({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  className
}: {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={cn(
        "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-sky/40",
        className
      )}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
