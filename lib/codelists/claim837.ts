import type { CodeList } from "./types";

/**
 * Code lists for the 837P (Health Care Claim — Professional). All prose is our
 * own plain-English wording (spec §1.3). Claim-filing-indicator (SBR09) reuses
 * the remittance list, and relationship reuses the enrollment list.
 */

/** CLM05-1 — place of service (where care was delivered). */
export const placeOfService: CodeList = {
  "02": "Telehealth",
  "11": "Doctor's office",
  "12": "Patient's home",
  "19": "Off-campus outpatient hospital",
  "20": "Urgent care",
  "21": "Inpatient hospital",
  "22": "Hospital outpatient",
  "23": "Emergency room",
  "24": "Ambulatory surgery center",
  "31": "Skilled nursing facility",
  "32": "Nursing home",
  "41": "Ambulance — land",
  "49": "Independent clinic",
  "50": "Federally qualified health center",
  "81": "Laboratory",
};

/** CLM05-3 — claim frequency (is this an original, a replacement, or a void?). */
export const claimFrequency: CodeList = {
  "1": "Original claim",
  "6": "Corrected claim",
  "7": "Replacement of a prior claim",
  "8": "Void of a prior claim",
};

/** HI qualifier — which diagnosis code set and whether it's the principal one. */
export const diagnosisQualifier: CodeList = {
  ABK: "Principal diagnosis (ICD-10)",
  ABF: "Additional diagnosis (ICD-10)",
  APR: "Admitting diagnosis (ICD-10)",
  BK: "Principal diagnosis (ICD-9)",
  BF: "Additional diagnosis (ICD-9)",
};

/** SBR01 — where this payer sits in the payment order. */
export const payerResponsibility: CodeList = {
  P: "Primary payer",
  S: "Secondary payer",
  T: "Tertiary payer",
  A: "Payer responsibility not yet determined",
};

/**
 * CLM05-1 on an institutional (837I) claim — the facility portion of the type
 * of bill (which kind of facility, and inpatient vs outpatient). Wording is ours.
 */
export const facilityType: CodeList = {
  "11": "Hospital — inpatient",
  "12": "Hospital — inpatient (Medicare Part B)",
  "13": "Hospital — outpatient",
  "14": "Hospital — other",
  "18": "Hospital — swing bed",
  "21": "Skilled nursing — inpatient",
  "22": "Skilled nursing — outpatient",
  "23": "Skilled nursing — other",
  "32": "Home health — inpatient",
  "33": "Home health — outpatient",
  "71": "Clinic — rural health",
  "72": "Clinic — dialysis",
  "73": "Clinic — freestanding",
  "77": "Clinic — federally qualified health center",
  "81": "Hospice",
  "83": "Ambulatory surgery center",
  "85": "Critical access hospital",
};

/**
 * SV201 — NUBC revenue code on an institutional service line (what department
 * or kind of charge it is). A curated subset; wording is our own.
 */
export const revenueCode: CodeList = {
  "0100": "All-inclusive room and board",
  "0110": "Room & board — private",
  "0120": "Room & board — semi-private",
  "0200": "Intensive care",
  "0250": "Pharmacy",
  "0260": "IV therapy",
  "0270": "Medical & surgical supplies",
  "0300": "Laboratory",
  "0320": "Radiology — diagnostic",
  "0360": "Operating room",
  "0370": "Anesthesia",
  "0410": "Respiratory therapy",
  "0420": "Physical therapy",
  "0450": "Emergency room",
  "0480": "Cardiology",
  "0636": "Drugs requiring detailed coding",
  "0730": "EKG / ECG",
};
