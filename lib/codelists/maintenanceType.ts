import type { CodeList } from "./types";

/**
 * INS03 (and HD01 at the coverage level) — what kind of change this record
 * represents. This is the single most important field for an analyst, so the
 * UI renders it as a colored badge. Wording is our own.
 */
export const maintenanceType: CodeList = {
  "001": "Change",
  "002": "Delete",
  "021": "Addition",
  "024": "Termination",
  "025": "Reinstatement",
  "030": "Audit or comparison",
};

/** Badge color hint per maintenance type (spec §5). */
export type BadgeTone = "green" | "red" | "amber" | "blue" | "grey";

export const maintenanceTone: Record<string, BadgeTone> = {
  "021": "green", // Addition
  "024": "red", // Termination
  "001": "amber", // Change
  "025": "blue", // Reinstatement
  "030": "grey", // Audit / comparison
  "002": "red", // Delete
};
