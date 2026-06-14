import type { CodeList } from "./types";

/**
 * Code lists for the 276 (Claim Status Request), 277 (Claim Status Response),
 * and 277CA (Claim Acknowledgment). All prose is our own plain-English wording
 * (spec §1.3).
 */

/** STC01-1 — the broad category of a claim's status (X12 list 507). */
export const statusCategory: CodeList = {
  A0: "Acknowledged — forwarded to another entity",
  A1: "Acknowledged — claim received",
  A2: "Acknowledged — accepted into adjudication",
  A3: "Rejected — returned as unprocessable",
  A4: "Rejected — claim not found",
  A6: "Rejected — missing information",
  A7: "Rejected — invalid information",
  A8: "Rejected — relational-field error",
  F0: "Finalized",
  F1: "Finalized — paid",
  F2: "Finalized — denied",
  F3: "Finalized — revised",
  P0: "Pending",
  P1: "Pending — in process",
  P2: "Pending — payer review",
  P3: "Pending — awaiting provider information",
  P4: "Pending — awaiting patient information",
  R1: "Request for additional information",
};

/** STC01-2 — the specific status detail (X12 list 508, common subset). */
export const statusCode: CodeList = {
  "1": "Cannot give further status electronically",
  "3": "Adjudicated — awaiting payment",
  "16": "Claim received",
  "19": "Receipt acknowledged",
  "20": "Accepted for processing",
  "21": "Missing or invalid information",
  "24": "Submitter not approved for electronic claims",
  "35": "Claim not found",
  "65": "Claim or line denied",
  "85": "Adjudicated — see the remittance for details",
  "88": "Awaiting a response from another payer",
  "107": "Processed per the plan's provisions",
  "187": "Date of service",
};

export type StatusOutcome = "accepted" | "finalized" | "denied" | "rejected" | "pending" | "requested" | "other";

/** Map a category code to an outcome bucket for coloring and tallies. */
export function statusOutcome(categoryCode: string): StatusOutcome {
  if (!categoryCode) return "requested";
  if (["A1", "A2", "A0"].includes(categoryCode)) return "accepted";
  if (["A3", "A4", "A6", "A7", "A8"].includes(categoryCode)) return "rejected";
  if (categoryCode === "F1") return "finalized";
  if (categoryCode === "F2") return "denied";
  if (categoryCode.startsWith("F")) return "finalized";
  if (categoryCode.startsWith("P")) return "pending";
  return "other";
}
