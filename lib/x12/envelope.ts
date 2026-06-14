import type { Finding } from "../validate/types";
import type {
  Delimiters,
  FunctionalGroup,
  Interchange,
  RawSegment,
  TransactionSet,
} from "./types";

/** Read element N (1-based, matching X12 naming like ISA13) from a segment. */
function el(seg: RawSegment, n: number): string {
  return seg.elements[n - 1] ?? "";
}

export interface EnvelopeResult {
  interchange: Interchange;
  /** Control-total and structural envelope findings (spec §3.3 / §6). */
  findings: Finding[];
}

/**
 * Build the interchange/group/transaction hierarchy and verify control totals
 * (spec §3.3). Control-number and count mismatches become findings, never
 * crashes — a truncated or malformed envelope still yields a partial tree.
 */
export function buildInterchange(
  segments: RawSegment[],
  delimiters: Delimiters,
): EnvelopeResult {
  const findings: Finding[] = [];

  const isa = segments.find((s) => s.tag === "ISA");
  if (!isa) {
    // detectDelimiters already guarantees an ISA, but guard defensively.
    throw new Error("No ISA segment found.");
  }
  const iea = segments.find((s) => s.tag === "IEA");

  const interchange: Interchange = {
    controlNumber: el(isa, 13),
    isa,
    iea,
    groups: [],
    delimiters,
  };

  // Walk the flat segment list, opening/closing GS…GE and ST…SE as we go.
  let currentGroup: FunctionalGroup | undefined;
  let currentTxn: TransactionSet | undefined;

  for (const seg of segments) {
    switch (seg.tag) {
      case "GS": {
        currentGroup = {
          functionalCode: el(seg, 1),
          controlNumber: el(seg, 6),
          gs: seg,
          transactions: [],
        };
        interchange.groups.push(currentGroup);
        break;
      }
      case "GE": {
        if (currentGroup) {
          currentGroup.ge = seg;
          checkGroupControls(currentGroup, findings);
        }
        currentGroup = undefined;
        break;
      }
      case "ST": {
        currentTxn = {
          code: el(seg, 1),
          controlNumber: el(seg, 2),
          st: seg,
          segments: [seg],
        };
        if (currentGroup) currentGroup.transactions.push(currentTxn);
        break;
      }
      case "SE": {
        if (currentTxn) {
          currentTxn.segments.push(seg);
          currentTxn.se = seg;
          checkTransactionControls(currentTxn, findings);
        }
        currentTxn = undefined;
        break;
      }
      default: {
        // Any non-envelope segment belongs to the open transaction set.
        if (currentTxn && seg.tag !== "ISA" && seg.tag !== "IEA") {
          currentTxn.segments.push(seg);
        }
      }
    }
  }

  checkInterchangeControls(interchange, findings);
  return { interchange, findings };
}

function checkInterchangeControls(ic: Interchange, findings: Finding[]): void {
  if (!ic.iea) {
    findings.push({
      severity: "error",
      message:
        "The interchange never closes — there's an ISA header but no matching IEA trailer.",
      segmentIndex: ic.isa.index,
    });
    return;
  }
  const ieaControl = el(ic.iea, 2);
  if (ieaControl !== ic.controlNumber) {
    findings.push({
      severity: "error",
      message: `The interchange control numbers don't match: the ISA header says ${ic.controlNumber} but the IEA trailer says ${ieaControl}.`,
      segmentIndex: ic.iea.index,
    });
  }
  const declaredGroups = Number(el(ic.iea, 1));
  if (Number.isFinite(declaredGroups) && declaredGroups !== ic.groups.length) {
    findings.push({
      severity: "error",
      message: `The IEA trailer expects ${declaredGroups} functional group(s), but ${ic.groups.length} were found.`,
      segmentIndex: ic.iea.index,
    });
  }
}

function checkGroupControls(group: FunctionalGroup, findings: Finding[]): void {
  if (!group.ge) return;
  const geControl = el(group.ge, 2);
  if (geControl !== group.controlNumber) {
    findings.push({
      severity: "error",
      message: `A functional group's control numbers don't match: the GS header says ${group.controlNumber} but the GE trailer says ${geControl}.`,
      segmentIndex: group.ge.index,
    });
  }
  const declaredTxns = Number(el(group.ge, 1));
  if (
    Number.isFinite(declaredTxns) &&
    declaredTxns !== group.transactions.length
  ) {
    findings.push({
      severity: "error",
      message: `A functional group's GE trailer expects ${declaredTxns} transaction set(s), but ${group.transactions.length} were found.`,
      segmentIndex: group.ge.index,
    });
  }
}

function checkTransactionControls(
  txn: TransactionSet,
  findings: Finding[],
): void {
  if (!txn.se) return;
  const seControl = el(txn.se, 2);
  if (seControl !== txn.controlNumber) {
    findings.push({
      severity: "error",
      message: `A transaction set's control numbers don't match: the ST header says ${txn.controlNumber} but the SE trailer says ${seControl}.`,
      segmentIndex: txn.se.index,
    });
  }
  // SE01 = number of segments in the set, counting both ST and SE.
  const declaredCount = Number(el(txn.se, 1));
  const actualCount = txn.segments.length;
  if (Number.isFinite(declaredCount) && declaredCount !== actualCount) {
    findings.push({
      severity: "error",
      message: `The transaction set's segment count is off: the SE trailer claims ${declaredCount} segments, but ${actualCount} are actually present.`,
      segmentIndex: txn.se.index,
    });
  }
}
