import type { StaffRole } from "@/types/domain";

export const permissionKeys = [
  "dashboard.view",
  "crm.view",
  "crm.create",
  "crm.edit",
  "crm.assign",
  "crm.convert",
  "leads.view", // legacy alias used by existing pages
  "leads.edit", // legacy alias used by existing pages
  "cases.view",
  "cases.create",
  "cases.edit",
  "cases.status.change_owner",
  "cases.approve",
  "documents.view",
  "documents.upload",
  "documents.review",
  "documents.approve",
  "documents.reject",
  "appointments.manage",
  "tours.manage",
  "content.manage",
  "messages.manage",
  "audit.view", // legacy alias used by existing pages
  "settings.audit.view",
  "staff.manage", // legacy alias used by existing pages
  "settings.manage",
  "settings.rbac.manage",
  "finance.view",
  "finance.invoice.create",
  "finance.payment.record",
  "finance.expense.approve",
  "finance.refund.process",
  "hr.view",
  "hr.staff.manage",
  "hr.leave.approve",
  "hr.payroll.manage",
  "hr.performance.manage",
  "reports.view",
  "reports.export",
  "reports.scheduled"
] as const;

export type PermissionKey = (typeof permissionKeys)[number];

export const roleDefaultPermissions: Record<StaffRole, PermissionKey[]> = {
  super_admin: [...permissionKeys],
  operations_manager: [
    "dashboard.view",
    "crm.view",
    "crm.assign",
    "cases.view",
    "cases.edit",
    "cases.status.change_owner",
    "documents.view",
    "documents.review",
    "appointments.manage",
    "messages.manage",
    "reports.view"
  ],
  case_manager: [
    "dashboard.view",
    "crm.view",
    "crm.edit",
    "crm.assign",
    "crm.convert",
    "leads.view",
    "leads.edit",
    "cases.view",
    "cases.create",
    "cases.edit",
    "documents.view",
    "documents.review",
    "appointments.manage",
    "messages.manage",
    "reports.view"
  ],
  visa_officer: ["dashboard.view", "cases.view", "cases.edit", "documents.view", "documents.review", "appointments.manage"],
  recruitment_officer: ["dashboard.view", "cases.view", "cases.edit", "documents.view", "messages.manage"],
  study_abroad_officer: ["dashboard.view", "cases.view", "cases.edit", "documents.view", "documents.review", "messages.manage"],
  tours_officer: ["dashboard.view", "cases.view", "cases.edit", "tours.manage", "appointments.manage"],
  finance_manager: [
    "dashboard.view",
    "finance.view",
    "finance.invoice.create",
    "finance.payment.record",
    "finance.expense.approve",
    "finance.refund.process",
    "reports.view",
    "reports.export"
  ],
  accountant: ["dashboard.view", "finance.view", "finance.invoice.create", "finance.payment.record", "reports.view"],
  hr_manager: ["dashboard.view", "hr.view", "hr.staff.manage", "hr.leave.approve", "hr.payroll.manage", "hr.performance.manage", "reports.view"],
  hr_officer: ["dashboard.view", "hr.view", "hr.leave.approve", "hr.performance.manage"],
  customer_support: ["dashboard.view", "crm.view", "leads.view", "messages.manage"],
  auditor: ["dashboard.view", "reports.view", "settings.audit.view", "audit.view"],
  read_only_analyst: ["dashboard.view", "crm.view", "cases.view", "documents.view", "finance.view", "hr.view", "reports.view"],
  finance: ["dashboard.view", "finance.view"]
};
