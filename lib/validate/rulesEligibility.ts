import type { Eligibility } from "../transform/eligibility";
import type { Finding } from "./types";

/**
 * 270/271 validation (spec §6). For an inquiry, check each member actually asks
 * something; for a response, surface inactive coverage — the answer an analyst
 * most wants to spot. Wording is our own.
 */
export function rulesEligibility(doc: Eligibility): Finding[] {
  const findings: Finding[] = [];

  for (const m of doc.members) {
    const who = m.name || m.memberId || "A member";
    if (doc.variant === "inquiry") {
      if (m.lines.length === 0) {
        findings.push({
          severity: "info",
          message: `${who} is listed but asks about no specific service.`,
          memberRef: m.memberId || m.name,
        });
      }
    } else {
      if (m.coverageStatus === "Inactive") {
        findings.push({
          severity: "warning",
          message: `${who}'s coverage came back inactive.`,
          memberRef: m.memberId || m.name,
        });
      } else if (m.coverageStatus === "Unknown") {
        findings.push({
          severity: "info",
          message: `${who} has no clear active/inactive benefit line in the response.`,
          memberRef: m.memberId || m.name,
        });
      }
    }
  }

  return findings;
}
