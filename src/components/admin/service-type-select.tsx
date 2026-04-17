import { serviceList, divisions, type ServiceDivisionKey } from "@/lib/services/catalogue";

interface ServiceTypeSelectProps {
  name: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
  /** If true, includes an empty option at the top. */
  includeEmpty?: boolean;
  emptyLabel?: string;
  /** Hide specific service keys from the dropdown (e.g. legacy BUSINESS_EXPORT). */
  exclude?: string[];
}

/**
 * Renders a native <select> grouped by business division, using the canonical
 * catalogue so every dropdown across the admin console stays in sync.
 */
export function ServiceTypeSelect({
  name,
  defaultValue,
  required,
  className,
  includeEmpty,
  emptyLabel = "Select service…",
  exclude = []
}: ServiceTypeSelectProps) {
  const divisionOrder: ServiceDivisionKey[] = [
    "IMMIGRATION",
    "TRAVEL",
    "CORPORATE_EVENTS",
    "CONSULTATION"
  ];

  return (
    <select
      name={name}
      defaultValue={defaultValue}
      required={required}
      className={
        className ??
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-bb-navy focus:border-bb-gold focus:outline-none focus:ring-2 focus:ring-bb-gold/20"
      }
    >
      {includeEmpty && <option value="">{emptyLabel}</option>}
      {divisionOrder.map((divisionKey) => {
        const division = divisions[divisionKey];
        const items = serviceList.filter(
          (svc) => svc.division === divisionKey && !exclude.includes(svc.key)
        );
        if (items.length === 0) return null;
        return (
          <optgroup key={divisionKey} label={division.label}>
            {items.map((svc) => (
              <option key={svc.key} value={svc.key}>
                {svc.label}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}
