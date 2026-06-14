import type { CodeList } from "./types";

/**
 * DTP01 — what a date in a DTP segment means. Covers the member-level and
 * coverage-level qualifiers the 834 viewer surfaces. Wording is our own.
 */
export const dtpQualifiers: CodeList = {
  "007": "File effective date",
  "050": "Received date",
  "286": "Retirement date",
  "300": "Enrollment signature date",
  "303": "Maintenance effective date",
  "336": "Employment begin date",
  "337": "Employment end date",
  "338": "Medicare begin date",
  "339": "Medicare end date",
  "340": "COBRA begin date",
  "341": "COBRA end date",
  "343": "Premium-paid-to-date begin",
  "348": "Coverage begin date",
  "349": "Coverage end date",
  "356": "Eligibility begin date",
  "357": "Eligibility end date",
  "473": "Medicaid begin date",
};

/** DTP qualifiers that describe member-level eligibility/employment dates. */
export const MEMBER_DATE_QUALIFIERS = {
  eligibilityBegin: "356",
  eligibilityEnd: "357",
  employmentBegin: "336",
  employmentEnd: "337",
  retirement: "286",
  maintenanceEffective: "303",
} as const;

/** DTP qualifiers that describe coverage-level dates (loop 2300). */
export const COVERAGE_DATE_QUALIFIERS = {
  begin: "348",
  end: "349",
} as const;
