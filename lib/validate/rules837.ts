import type { Claims837, ClaimRow837 } from "../transform/claim837";
import type { Finding } from "./types";

/**
 * 837P-specific validation rules (spec §6/§11). The headline check is claim
 * balancing — the total charge must equal the sum of the service-line charges —
 * plus the structural essentials a payer would reject on: a billing NPI, at
 * least one diagnosis and service line, and in-range diagnosis pointers.
 * All wording is our own, plain-English.
 */

const TOLERANCE = 0.005;

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

function claimRules(claim: ClaimRow837): Finding[] {
  const findings: Finding[] = [];
  const ref = claim.claimId;

  // Balancing: CLM02 must equal the sum of service-line charges.
  const lineTotal = round(claim.serviceLines.reduce((s, l) => s + l.charge, 0));
  if (claim.serviceLines.length > 0 && Math.abs(claim.totalCharge - lineTotal) > TOLERANCE) {
    findings.push({
      severity: "warning",
      message: `Claim ${ref} doesn't balance: the claim total is ${money(claim.totalCharge)}, but its service lines add up to ${money(lineTotal)}.`,
      memberRef: ref,
    });
  }

  if (!claim.billingProviderNpi) {
    findings.push({
      severity: "warning",
      message: `Claim ${ref} has no billing provider NPI, which a payer will reject.`,
      memberRef: ref,
    });
  }

  if (claim.diagnoses.length === 0) {
    findings.push({
      severity: "warning",
      message: `Claim ${ref} has no diagnosis, so its services have nothing to justify them.`,
      memberRef: ref,
    });
  }

  if (claim.serviceLines.length === 0) {
    findings.push({
      severity: "warning",
      message: `Claim ${ref} has no service lines — there's nothing being billed.`,
      memberRef: ref,
    });
  }

  // Diagnosis pointers must reference a diagnosis that actually exists.
  const dxCount = claim.diagnoses.length;
  for (const line of claim.serviceLines) {
    for (const p of line.diagnosisPointers) {
      const n = Number(p);
      if (!Number.isFinite(n) || n < 1 || n > dxCount) {
        findings.push({
          severity: "warning",
          message: `Claim ${ref}, procedure ${line.procedure || line.lineNumber} points to diagnosis #${p}, which isn't on the claim.`,
          memberRef: ref,
        });
      }
    }
  }

  // Institutional service lines must each carry a revenue code.
  if (claim.variant === "institutional") {
    for (const line of claim.serviceLines) {
      if (!line.revenueCode) {
        findings.push({
          severity: "warning",
          message: `Claim ${ref} has a service line (${line.procedure || line.lineNumber}) with no revenue code, which an institutional claim requires.`,
          memberRef: ref,
        });
      }
    }
  }

  return findings;
}

export function rules837(doc: Claims837): Finding[] {
  return doc.claims.flatMap(claimRules);
}
