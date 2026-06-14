import type { CodeList } from "./types";

/**
 * HD03 — the kind of coverage a health-coverage record carries.
 * Wording is our own plain-English phrasing.
 */
export const insuranceLine: CodeList = {
  HLT: "Health",
  DEN: "Dental",
  VIS: "Vision",
  PDG: "Pharmacy",
  MM: "Major medical",
  HMO: "HMO plan",
  PPO: "PPO plan",
  POS: "Point-of-service plan",
  EPO: "Exclusive-provider plan",
  AP: "Accidental injury",
  LTD: "Long-term disability",
  STD: "Short-term disability",
  LIF: "Life",
  AK: "Mental health",
  DCP: "Dependent care",
  FAC: "Facility coverage",
  HSA: "Health savings account",
};
