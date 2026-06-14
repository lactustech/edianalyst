import type { CodeList } from "./types";

/**
 * Code lists for the 270 (Eligibility Inquiry) and 271 (Eligibility Response).
 * All prose is our own plain-English wording (spec §1.3).
 */

/** EQ01 / EB03 — the kind of service the inquiry or benefit concerns. */
export const serviceType: CodeList = {
  "1": "Medical care",
  "30": "Plan coverage (general benefits)",
  "33": "Chiropractic",
  "35": "Dental care",
  "40": "Oral surgery",
  "42": "Home health care",
  "45": "Hospice",
  "47": "Hospital",
  "48": "Hospital — inpatient",
  "50": "Hospital — outpatient",
  "52": "Hospital — emergency",
  "86": "Emergency services",
  "88": "Pharmacy",
  "98": "Office visit (professional)",
  AL: "Vision",
  MH: "Mental health",
  UC: "Urgent care",
  A4: "Psychiatric",
  A6: "Psychotherapy",
  BG: "Wellness / preventive",
};

/** EB01 — what a benefit line tells you (active, inactive, copay, deductible…). */
export const benefitStatus271: CodeList = {
  "1": "Active coverage",
  "2": "Active — full-risk capitation",
  "3": "Active — services capitated",
  "4": "Active — capitated to a primary care doctor",
  "5": "Active — pending HMO enrollment",
  "6": "Inactive",
  "7": "Inactive — pending an eligibility update",
  "8": "Inactive — pending investigation",
  A: "Co-insurance",
  B: "Co-payment",
  C: "Deductible",
  D: "Benefit description",
  F: "Limitations",
  G: "Out-of-pocket maximum",
  I: "Not covered",
  L: "Primary care provider",
  R: "Other or additional payer",
  U: "Contact the listed entity",
};

/** EB01 values that mean coverage is not currently in force. */
export const INACTIVE_BENEFIT_CODES = new Set(["6", "7", "8", "I"]);
/** EB01 values that mean coverage is in force. */
export const ACTIVE_BENEFIT_CODES = new Set(["1", "2", "3", "4", "5"]);
