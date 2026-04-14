export type ServiceType =
  | "VISA_ASSISTANCE"
  | "INTERNATIONAL_RECRUITMENT"
  | "STUDY_ABROAD"
  | "TOUR_PACKAGE"
  | "BUSINESS_EXPORT"
  | "FLIGHT_RESERVATION";

export type LeadStage = "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "CLOSED";

export type CaseStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "AWAITING_DOCUMENTS"
  | "APPOINTMENT_BOOKED"
  | "PROCESSING"
  | "DECISION_RECEIVED"
  | "COMPLETED"
  | "ON_HOLD";

export type StaffRole =
  | "super_admin"
  | "operations_manager"
  | "case_manager"
  | "visa_officer"
  | "recruitment_officer"
  | "study_abroad_officer"
  | "tours_officer"
  | "finance_manager"
  | "accountant"
  | "hr_manager"
  | "hr_officer"
  | "customer_support"
  | "auditor"
  | "read_only_analyst"
  | "finance";

export interface NavLink {
  label: string;
  href: string;
}
