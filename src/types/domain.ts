export type ServiceType =
  | "VISA_ASSISTANCE"
  | "INTERNATIONAL_RECRUITMENT"
  | "STUDY_ABROAD"
  | "DOCUMENT_PROCESSING"
  | "TOUR_PACKAGE"
  | "FLIGHT_RESERVATION"
  | "HOTEL_BOOKING"
  | "TRAVEL_INSURANCE"
  | "TRANSPORT_SERVICES"
  | "CORPORATE_TRAVEL"
  | "EVENT_MANAGEMENT"
  | "CONSULTATION"
  | "BUSINESS_EXPORT";

export type LeadStage =
  | "NEW"
  | "CONTACTED"
  | "SCOPED"
  | "QUOTED"
  | "BOOKED"
  | "COMPLETED"
  | "CLOSED"
  | "QUALIFIED"
  | "CONVERTED";

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

export type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "MOBILE_MONEY"
  | "CARD"
  | "OTHER"
  | "MOMO_MTN"
  | "MOMO_VODAFONE"
  | "MOMO_AIRTELTIGO"
  | "POS"
  | "CHEQUE";

export type AppointmentType =
  | "CONSULTATION"
  | "VFS_SUBMISSION"
  | "EMBASSY_INTERVIEW"
  | "BIOMETRICS"
  | "DOCUMENT_DROPOFF"
  | "INTERNAL_REVIEW"
  | "TRAVEL_DEPARTURE"
  | "TRAVEL_RETURN"
  | "OTHER";

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "RESCHEDULED";

export type PartnerType =
  | "EMBASSY"
  | "VFS_CENTER"
  | "AIRLINE"
  | "HOTEL"
  | "RECRUITER"
  | "UNIVERSITY"
  | "INSURANCE"
  | "TRANSPORT"
  | "TRAINING"
  | "OTHER";

export type PettyCashBoxType =
  | "CASH"
  | "MOMO_MTN"
  | "MOMO_VODAFONE"
  | "MOMO_AIRTELTIGO"
  | "BANK"
  | "OTHER";

export type PettyCashMovementType =
  | "IN"
  | "OUT"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "TOPUP"
  | "ADJUSTMENT";

export interface NavLink {
  label: string;
  href: string;
}
