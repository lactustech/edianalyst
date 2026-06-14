import { isKnown } from "../codelists/types";
import { claimStatus } from "../codelists/remittance";
import type { Adjustment, ClaimRow, Remittance835 } from "../transform/remittance835";
import type { Finding } from "./types";

/**
 * 835-specific validation rules (spec §6/§11). The headline check is *balancing*
 * — the property analysts most want confirmed on a remittance: every claim's
 * charge must equal what was paid plus all adjustments, and the payment summary
 * must equal the claims. All wording is our own, plain-English.
 */

const TOLERANCE = 0.005; // half a cent — guards against float noise

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function allAdjustments(claim: ClaimRow): Adjustment[] {
  return [...claim.adjustments, ...claim.serviceLines.flatMap((s) => s.adjustments)];
}

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function rules835(doc: Remittance835): Finding[] {
  const findings: Finding[] = [];

  // Payment-summary cross-check: BPR02 vs the sum of claim payments.
  if (Math.abs(doc.totalPaid - doc.totals.paid) > TOLERANCE) {
    findings.push({
      severity: "warning",
      message: `The payment summary says ${money(doc.totalPaid)} was paid, but the claims add up to ${money(doc.totals.paid)}.`,
    });
  }

  for (const claim of doc.claims) {
    // Unknown claim status — show it, don't fail.
    if (claim.statusCode && !isKnown(claimStatus, claim.statusCode)) {
      findings.push({
        severity: "warning",
        message: `Claim ${claim.claimId} has an unfamiliar status code "${claim.statusCode}", shown as-is.`,
        memberRef: claim.claimId,
      });
    }

    // A denial is the analyst's key signal — surface it with the decoded
    // adjustment reasons (CARC) so the finding itself explains the "why".
    if (claim.statusCode === "4") {
      const reasons = Array.from(new Set(allAdjustments(claim).map((a) => a.reason))).filter(Boolean);
      findings.push({
        severity: "warning",
        message: `Claim ${claim.claimId} was denied${reasons.length ? ` — ${reasons.join("; ")}` : ""}.`,
        memberRef: claim.claimId,
      });
    }

    // A reversal is worth calling out — it backs out an earlier payment.
    if (claim.statusCode === "22") {
      findings.push({
        severity: "info",
        message: `Claim ${claim.claimId} is a reversal of a previous payment.`,
        memberRef: claim.claimId,
      });
    }

    // Balancing: charge − paid must equal the sum of all adjustments.
    const adjustmentsTotal = round(allAdjustments(claim).reduce((s, a) => s + a.amount, 0));
    const expected = round(claim.totalCharge - claim.totalPaid);
    if (Math.abs(expected - adjustmentsTotal) > TOLERANCE) {
      findings.push({
        severity: "warning",
        message: `Claim ${claim.claimId} doesn't balance: charged minus paid is ${money(expected)}, but its adjustments total ${money(adjustmentsTotal)}.`,
        memberRef: claim.claimId,
      });
    }

    // Patient-responsibility cross-check against the PR-group adjustments.
    const prTotal = round(
      allAdjustments(claim)
        .filter((a) => a.groupCode === "PR")
        .reduce((s, a) => s + a.amount, 0),
    );
    if (Math.abs(prTotal - claim.patientResponsibility) > TOLERANCE) {
      findings.push({
        severity: "info",
        message: `Claim ${claim.claimId} lists ${money(claim.patientResponsibility)} as patient responsibility, but its patient-owed adjustments total ${money(prTotal)}.`,
        memberRef: claim.claimId,
      });
    }
  }

  return findings;
}
