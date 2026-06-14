import type { Premium820 } from "../transform/premium820";
import type { Finding } from "./types";

/**
 * 820-specific validation (spec §6). The key check is that the payment summary
 * total (BPR02) equals the sum of the individual premium lines. Wording is ours.
 */
const TOLERANCE = 0.005;

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function rules820(doc: Premium820): Finding[] {
  const findings: Finding[] = [];

  if (Math.abs(doc.totalPaid - doc.totals.paid) > TOLERANCE) {
    findings.push({
      severity: "warning",
      message: `The payment summary says ${money(doc.totalPaid)} was paid, but the premium lines add up to ${money(doc.totals.paid)}.`,
    });
  }

  for (const line of doc.lines) {
    if (line.amountPaid === 0) {
      findings.push({
        severity: "info",
        message: `Premium line ${line.reference || "(no reference)"} has a zero payment amount.`,
        memberRef: line.reference,
      });
    }
  }

  return findings;
}
