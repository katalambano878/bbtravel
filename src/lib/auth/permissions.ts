import type { StaffRole } from "@/types/domain";

export const permissionKeys = [
  "dashboard.view",
  "leads.view",
  "leads.edit",
  "cases.view",
  "cases.edit",
  "documents.review",
  "appointments.manage",
  "tours.manage",
  "content.manage",
  "messages.manage",
  "audit.view",
  "staff.manage",
  "finance.view"
] as const;

export type PermissionKey = (typeof permissionKeys)[number];

export const roleDefaultPermissions: Record<StaffRole, PermissionKey[]> = {
  super_admin: [...permissionKeys],
  case_manager: ["dashboard.view", "leads.view", "cases.view", "cases.edit", "appointments.manage", "messages.manage"],
  visa_officer: ["dashboard.view", "cases.view", "cases.edit", "documents.review", "appointments.manage"],
  recruitment_officer: ["dashboard.view", "cases.view", "cases.edit", "messages.manage"],
  study_abroad_officer: ["dashboard.view", "cases.view", "cases.edit", "documents.review", "messages.manage"],
  tours_officer: ["dashboard.view", "cases.view", "cases.edit", "tours.manage"],
  customer_support: ["dashboard.view", "leads.view", "messages.manage"],
  finance: ["dashboard.view", "finance.view"]
};
