import type { CodeList } from "./types";

/**
 * Code lists for the 835 (Health Care Claim Payment/Advice). All prose is our
 * own plain-English wording (spec §1.3) — including the CARC/RARC descriptions,
 * which we author rather than copy even though the code lists are published.
 */

/** CLP02 — how the payer adjudicated the claim. */
export const claimStatus: CodeList = {
  "1": "Paid as primary",
  "2": "Paid as secondary",
  "3": "Paid as tertiary",
  "4": "Denied",
  "5": "Pended — more information needed",
  "19": "Paid as primary, forwarded to the next payer",
  "20": "Paid as secondary, forwarded to the next payer",
  "21": "Paid as tertiary, forwarded to the next payer",
  "22": "Reversal of a previous payment",
  "23": "Not this payer's claim — forwarded elsewhere",
  "25": "Pricing only — no payment made",
};

/** BPR04 — how the payment was sent. */
export const paymentMethod: CodeList = {
  ACH: "ACH / electronic funds transfer",
  BOP: "Financial institution's choice",
  CHK: "Paper check",
  FWT: "Federal Reserve wire transfer",
  NON: "No payment — zero-dollar advice",
};

/** CLP06 — the kind of coverage that paid the claim. */
export const filingIndicator: CodeList = {
  MA: "Medicare Part A",
  MB: "Medicare Part B",
  MC: "Medicaid",
  HM: "HMO plan",
  CI: "Commercial insurance",
  BL: "Blue Cross / Blue Shield",
  CH: "TRICARE / CHAMPUS",
  WC: "Workers' compensation",
  VA: "Veterans Affairs plan",
  ZZ: "Other coverage",
};

/** CAS01 — who bears the adjusted amount. */
export const adjustmentGroup: CodeList = {
  CO: "Contractual — provider write-off, not billable to the patient",
  CR: "Correction or reversal of a prior decision",
  OA: "Other adjustment",
  PI: "Payer-initiated reduction",
  PR: "Patient responsibility",
};

/**
 * CARC — Claim Adjustment Reason Codes (the codes inside CAS segments). A
 * curated subset of the ones analysts see most. Wording is our own.
 */
export const carc: CodeList = {
  "1": "Applied to the deductible",
  "2": "Applied to coinsurance",
  "3": "Applied to the copay",
  "16": "Missing or incomplete information on the claim",
  "18": "Duplicate of a claim or service already submitted",
  "22": "Care may be covered by another payer first",
  "23": "Reflects a prior payer's payment or adjustment",
  "45": "Charge above the allowed or contracted amount",
  "50": "Payer judged the service not medically necessary",
  "96": "Service is not covered",
  "97": "Payment is bundled into another service's allowance",
  "109": "Not covered by this payer — submit to the correct one",
  "119": "A benefit maximum has been reached",
  "197": "Required pre-authorization was not obtained",
  "204": "Not covered under the patient's current plan",
};

/**
 * RARC — Remittance Advice Remark Codes (carried in LQ segments). A small,
 * commonly-seen subset. Wording is our own.
 */
export const rarc: CodeList = {
  M15: "Billed as separate services that should be combined into one",
  M80: "Service not covered when performed with another on the same day",
  N130: "Check the plan documents for the applicable coverage rules",
  N362: "More days or units billed than the plan allows",
  MA01: "You may appeal this decision within the plan's time limit",
  MA130: "The claim has missing information and cannot be processed yet",
  N30: "Patient was not eligible for this service on that date",
  N522: "Duplicate of a claim already processed",
};
