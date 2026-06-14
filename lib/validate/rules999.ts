import type { Acknowledgment999, AckTransaction } from "../transform/ack999";
import type { Finding } from "./types";

/**
 * 999-specific validation (spec §6). For an acknowledgment, the findings ARE the
 * point: surface every rejected or errored transaction in plain English so the
 * analyst sees what the payer kicked back, and cross-check the group counts.
 * All wording is our own.
 */

const REJECTED = new Set(["R", "M", "W", "X"]);

function txnLabel(t: AckTransaction): string {
  return `${t.setId} #${t.controlNumber}`;
}

export function rules999(doc: Acknowledgment999): Finding[] {
  const findings: Finding[] = [];

  // Group-level outcome.
  if (REJECTED.has(doc.groupStatusCode)) {
    findings.push({
      severity: "error",
      message: `The whole functional group was rejected (${doc.groupStatus}).`,
    });
  } else if (doc.groupStatusCode === "P") {
    findings.push({
      severity: "warning",
      message: "Part of the functional group was accepted, but some transactions were rejected.",
    });
  }

  // Per-transaction outcomes — the heart of the report.
  for (const t of doc.transactions) {
    const ref = txnLabel(t);
    const detail = t.syntaxErrors.length ? ` — ${t.syntaxErrors.join("; ")}` : "";
    if (REJECTED.has(t.statusCode)) {
      findings.push({
        severity: "error",
        message: `Transaction ${ref} was rejected${detail}.`,
        memberRef: ref,
      });
    } else if (t.statusCode === "E") {
      findings.push({
        severity: "warning",
        message: `Transaction ${ref} was accepted but has ${t.segmentErrors.length} flagged segment(s)${detail}.`,
        memberRef: ref,
      });
    }
  }

  // Count cross-checks against AK9.
  if (doc.counts.included && doc.counts.included !== doc.transactions.length) {
    findings.push({
      severity: "warning",
      message: `The acknowledgment says ${doc.counts.included} transaction(s) were included, but ${doc.transactions.length} were found.`,
    });
  }
  if (doc.counts.accepted && doc.counts.accepted !== doc.totals.accepted) {
    findings.push({
      severity: "warning",
      message: `The acknowledgment says ${doc.counts.accepted} transaction(s) were accepted, but ${doc.totals.accepted} show an accepted status.`,
    });
  }

  return findings;
}
