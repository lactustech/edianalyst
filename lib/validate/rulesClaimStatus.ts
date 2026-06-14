import type { ClaimStatus, ClaimStatusRow } from "../transform/claimStatus";
import type { Finding } from "./types";

/**
 * 276/277/277CA validation (spec §6). For a status response or acknowledgment,
 * the findings surface the rejected and denied claims — the rows an analyst must
 * act on. Wording is our own.
 */
function ref(c: ClaimStatusRow): string {
  return c.claimId || c.payerClaimId || c.patientName || "A claim";
}

export function rulesClaimStatus(doc: ClaimStatus): Finding[] {
  if (doc.variant === "request") return []; // a request asserts nothing to check

  const findings: Finding[] = [];
  for (const c of doc.claims) {
    const detail = c.statuses[0]?.statusText ? ` — ${c.statuses[0]!.statusText}` : "";
    if (c.outcome === "rejected") {
      findings.push({
        severity: "error",
        message: `Claim ${ref(c)} was rejected${detail}.`,
        memberRef: ref(c),
      });
    } else if (c.outcome === "denied") {
      findings.push({
        severity: "warning",
        message: `Claim ${ref(c)} was denied${detail}.`,
        memberRef: ref(c),
      });
    } else if (c.outcome === "pending") {
      findings.push({
        severity: "info",
        message: `Claim ${ref(c)} is still pending${detail}.`,
        memberRef: ref(c),
      });
    }
  }
  return findings;
}
