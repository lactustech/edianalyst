import type { CodeList } from "./types";

/**
 * Code lists for the 999 (Implementation Acknowledgment). A 999 reports whether
 * a previously sent functional group was accepted or rejected, and pinpoints the
 * syntax errors. All prose is our own plain-English wording (spec §1.3).
 */

/** AK101 — which kind of file is being acknowledged. */
export const functionalId: CodeList = {
  HC: "Health care claim (837)",
  HP: "Claim payment / remittance (835)",
  BE: "Benefit enrollment (834)",
  HS: "Eligibility request (270)",
  HB: "Eligibility response (271)",
  HR: "Claim status request (276)",
  HN: "Claim status response (277)",
  HI: "Services review (278)",
  RA: "Payment order / remittance (820)",
  FA: "Acknowledgment (999 / 997)",
};

/** AK901 — overall result for the whole functional group. */
export const groupAckStatus: CodeList = {
  A: "Accepted",
  E: "Accepted with errors",
  P: "Partially accepted — some transactions rejected",
  R: "Rejected",
  M: "Rejected — sender authentication failed",
  W: "Rejected — validity check failed",
  X: "Rejected — content could not be decrypted",
};

/** IK501 — result for a single acknowledged transaction set. */
export const transactionAckStatus: CodeList = {
  A: "Accepted",
  E: "Accepted with errors",
  R: "Rejected",
  M: "Rejected — authentication failed",
  W: "Rejected — validity check failed",
  X: "Rejected — could not be decrypted",
};

/** IK304 — what's wrong at the segment level (X12 code list 720). */
export const segmentSyntaxError: CodeList = {
  "1": "Unrecognized segment",
  "2": "Unexpected segment",
  "3": "A required segment is missing",
  "4": "Loop used more times than allowed",
  "5": "Segment used more times than allowed",
  "6": "Segment isn't part of this transaction",
  "7": "Segment is out of order",
  "8": "Segment has one or more bad data elements",
  I6: "A required implementation loop is missing",
  I7: "A required implementation segment is missing",
};

/** IK403 — what's wrong with a specific data element (X12 code list 725). */
export const elementSyntaxError: CodeList = {
  "1": "A required element is missing",
  "2": "A conditionally required element is missing",
  "3": "Too many elements",
  "4": "Element is too short",
  "5": "Element is too long",
  "6": "Element contains an invalid character",
  "7": "Element has an invalid code value",
  "8": "Element has an invalid date",
  "9": "Element has an invalid time",
  "10": "An exclusion rule was violated",
  "12": "Too many repetitions",
  "13": "Too many components in the element",
  I9: "Element isn't allowed by the implementation guide",
  I10: "A required implementation element is missing",
  I12: "An implementation pattern was not matched",
};

/** IK502+ / AK905+ — transaction-level syntax problems (X12 code list 715). */
export const transactionSyntaxError: CodeList = {
  "1": "This transaction set isn't supported",
  "2": "The transaction set trailer is missing",
  "3": "Control numbers in the header and trailer don't match",
  "4": "The segment count doesn't match what was received",
  "5": "One or more segments are in error",
  "6": "Missing or invalid transaction set identifier",
  "7": "Missing or invalid transaction set control number",
};
