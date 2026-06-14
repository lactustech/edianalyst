import type { CodeList } from "./types";

/**
 * BGN08 — the purpose of the whole file. Surfaced prominently in the summary
 * bar so the analyst knows what they're holding. Wording is our own.
 */
export const transactionPurpose: CodeList = {
  "00": "Original file",
  "15": "Re-submission",
  "22": "Information copy",
  RX: "Reversal of a prior file",
};

/**
 * INS04 — why the maintenance change was made. A representative subset of the
 * codes an analyst actually sees. Wording is our own.
 */
export const maintenanceReason: CodeList = {
  "01": "Divorce",
  "02": "Birth",
  "03": "Death",
  "04": "Retirement",
  "05": "Adoption",
  "06": "Strike",
  "07": "Loss of benefits",
  "08": "Newly eligible",
  "09": "Eligibility change",
  "10": "Voluntary withdrawal",
  "14": "Voluntary plan change",
  "20": "Active military duty",
  "22": "Plan change",
  "25": "Change in benefits",
  "28": "Initial enrollment",
  "32": "Marriage",
  "33": "Personal data change",
  "37": "Leave of absence",
  "38": "Termination of employment",
  "41": "Re-enrollment",
  "43": "Change of location",
  AI: "No reason given",
  EC: "Member chose to enroll",
  XN: "Notification only",
  XT: "Transfer",
};

/**
 * INS05 — the member's benefit status. Wording is our own.
 */
export const benefitStatus: CodeList = {
  A: "Active",
  C: "COBRA continuation",
  S: "Surviving insured",
  T: "Tax-equity (TEFRA)",
};

/**
 * HD05 — who the coverage covers. Wording is our own.
 */
export const coverageLevel: CodeList = {
  EMP: "Employee only",
  ESP: "Employee and spouse",
  ECH: "Employee and children",
  FAM: "Family",
  DEP: "Dependents only",
  IND: "Individual",
  SPC: "Spouse and children",
  SPO: "Spouse only",
  CHD: "Children only",
  TWO: "Two-party",
};

/**
 * DMG03 — gender as reported on the demographics segment. Wording is our own.
 */
export const gender: CodeList = {
  M: "Male",
  F: "Female",
  U: "Unknown",
};
