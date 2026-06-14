import type { Acknowledgment999 } from "../transform/ack999";
import type { ClaimStatus } from "../transform/claimStatus";
import type { Claims837 } from "../transform/claim837";
import type { Eligibility } from "../transform/eligibility";
import type { Document834 } from "../transform/member834";
import type { Premium820 } from "../transform/premium820";
import type { Remittance835 } from "../transform/remittance835";
import type { TransactionSet } from "../x12/types";
import { semanticRules, structuralRules } from "./rules834";
import { rules820 } from "./rules820";
import { rulesClaimStatus } from "./rulesClaimStatus";
import { rulesEligibility } from "./rulesEligibility";
import { rules835 } from "./rules835";
import { rules837 } from "./rules837";
import { rules999 } from "./rules999";
import type { Finding } from "./types";

export interface ValidationReport {
  findings: Finding[];
  counts: { error: number; warning: number; info: number };
}

/**
 * Run the 834 rule set over a transaction set plus its readable model, merging
 * in the envelope findings already produced by the parser. Returns plain-English
 * findings and a severity tally (the free tier shows counts; the full per-member
 * report is the Pro lever, spec §6).
 */
export function validate834(
  txn: TransactionSet,
  doc: Document834,
  envelopeFindings: Finding[] = [],
): ValidationReport {
  const findings = [
    ...envelopeFindings,
    ...structuralRules(txn),
    ...semanticRules(doc, txn),
  ];

  return tally(findings);
}

/** Run the 835 rule set, merged with the parser's envelope findings. */
export function validate835(
  doc: Remittance835,
  envelopeFindings: Finding[] = [],
): ValidationReport {
  return tally([...envelopeFindings, ...rules835(doc)]);
}

/** Run the 837P rule set, merged with the parser's envelope findings. */
export function validate837(
  doc: Claims837,
  envelopeFindings: Finding[] = [],
): ValidationReport {
  return tally([...envelopeFindings, ...rules837(doc)]);
}

/** Run the 999 rule set, merged with the parser's envelope findings. */
export function validate999(
  doc: Acknowledgment999,
  envelopeFindings: Finding[] = [],
): ValidationReport {
  return tally([...envelopeFindings, ...rules999(doc)]);
}

/** Run the 820 rule set, merged with the parser's envelope findings. */
export function validate820(
  doc: Premium820,
  envelopeFindings: Finding[] = [],
): ValidationReport {
  return tally([...envelopeFindings, ...rules820(doc)]);
}

/** Run the 270/271 rule set, merged with the parser's envelope findings. */
export function validateEligibility(
  doc: Eligibility,
  envelopeFindings: Finding[] = [],
): ValidationReport {
  return tally([...envelopeFindings, ...rulesEligibility(doc)]);
}

/** Run the 276/277/277CA rule set, merged with the parser's envelope findings. */
export function validateClaimStatus(
  doc: ClaimStatus,
  envelopeFindings: Finding[] = [],
): ValidationReport {
  return tally([...envelopeFindings, ...rulesClaimStatus(doc)]);
}

function tally(findings: Finding[]): ValidationReport {
  const counts = { error: 0, warning: 0, info: 0 };
  for (const f of findings) counts[f.severity]++;
  return { findings, counts };
}
