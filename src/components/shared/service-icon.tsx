import {
  BriefcaseBusiness,
  FileBadge2,
  Globe,
  GraduationCap,
  Plane,
  type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  FileBadge2,
  BriefcaseBusiness,
  GraduationCap,
  Plane,
  Globe
};

export function ServiceIcon({ name }: { name: string }) {
  const Icon = iconMap[name] ?? Globe;
  return <Icon className="h-5 w-5 text-bb-navy" />;
}
