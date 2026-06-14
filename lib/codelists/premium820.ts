import type { CodeList } from "./types";

/**
 * Code lists for the 820 (Premium Payment for Insurance Products). Prose is our
 * own plain-English wording (spec §1.3). Payment method (BPR04) reuses the
 * remittance list.
 */

/** RMR01 — what the reference number on a premium line identifies. */
export const premiumReference: CodeList = {
  "11": "Account number",
  "12": "Billing account",
  "1L": "Group or policy number",
  AZ: "Health insurance policy number",
  CT: "Contract number",
  IK: "Invoice number",
  PO: "Purchase order number",
  ZZ: "Mutually defined reference",
};

/** ADX01/ADX02 — why a premium line was adjusted (when present). */
export const premiumAdjustmentReason: CodeList = {
  "52": "Credit for a prior overpayment",
  "53": "Premium for an added member",
  "AA": "Coverage change",
  "PB": "Late or partial payment",
  "RU": "Retroactive adjustment",
};
