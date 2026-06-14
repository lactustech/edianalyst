import { isKnown } from "../codelists/types";
import { insuranceLine } from "../codelists/insuranceLine";
import { maintenanceType } from "../codelists/maintenanceType";
import { relationship } from "../codelists/relationship";
import type { Document834 } from "../transform/member834";
import type { TransactionSet } from "../x12/types";
import { parseD8 } from "../util/dates";
import type { Finding } from "./types";

/**
 * 834-specific validation rules (spec §6). Every message is originally worded,
 * plain-English, and actionable. Rules flag problems; they never throw.
 */

function el(elements: string[], n: number): string {
  return elements[n - 1] ?? "";
}

/** Structural and code-sanity rules that read the raw transaction segments. */
export function structuralRules(txn: TransactionSet): Finding[] {
  const findings: Finding[] = [];

  const hasBgn = txn.segments.some((s) => s.tag === "BGN");
  if (!hasBgn) {
    findings.push({
      severity: "error",
      message: "This 834 is missing its beginning (BGN) segment, so the file's purpose can't be determined.",
      segmentIndex: txn.st.index,
    });
  }

  // Walk member loops: each INS should be followed (before the next INS) by a
  // member name (NM1) and a maintenance type; coverages need a begin date.
  let insSeg: { index: number; elements: string[]; ref?: string } | undefined;
  let sawName = false;
  const closeMember = () => {
    if (insSeg && !sawName) {
      findings.push({
        severity: "warning",
        message: "A member record has no name segment — the row will show as blank until that's corrected.",
        segmentIndex: insSeg.index,
        memberRef: insSeg.ref,
      });
    }
  };

  for (const seg of txn.segments) {
    if (seg.tag === "INS") {
      closeMember();
      insSeg = { index: seg.index, elements: seg.elements };
      sawName = false;

      const maint = el(seg.elements, 3);
      if (!maint) {
        findings.push({
          severity: "warning",
          message: "A member record is missing its change type (addition, termination, change…), so it can't be categorized.",
          segmentIndex: seg.index,
        });
      } else if (!isKnown(maintenanceType, maint)) {
        findings.push({
          severity: "warning",
          message: `A member record uses an unfamiliar change-type code "${maint}". It's shown as-is so you can investigate the unexpected value.`,
          segmentIndex: seg.index,
        });
      }

      const rel = el(seg.elements, 2);
      if (rel && !isKnown(relationship, rel)) {
        findings.push({
          severity: "warning",
          message: `A member record uses an unfamiliar relationship code "${rel}". It's shown as-is rather than translated.`,
          segmentIndex: seg.index,
        });
      }
    } else if (seg.tag === "REF" && insSeg && el(seg.elements, 1) === "0F") {
      insSeg.ref = el(seg.elements, 2);
    } else if (seg.tag === "NM1" && el(seg.elements, 1) === "IL") {
      sawName = true;
    } else if (seg.tag === "HD") {
      const line = el(seg.elements, 3);
      if (line && !isKnown(insuranceLine, line)) {
        findings.push({
          severity: "info",
          message: `A coverage line uses an unfamiliar code "${line}". It's listed as-is so you can confirm what it means.`,
          segmentIndex: seg.index,
          memberRef: insSeg?.ref,
        });
      }
    }
  }
  closeMember();

  return findings;
}

/** Date- and total-sanity rules that read the readable document model. */
export function semanticRules(doc: Document834, txn: TransactionSet): Finding[] {
  const findings: Finding[] = [];

  // Date sanity: non-D8 values in date qualifiers / demographics, future DOB.
  const todayIso = new Date().toISOString().slice(0, 10);
  for (const seg of txn.segments) {
    if (seg.tag === "DTP") {
      const value = el(seg.elements, 3);
      if (el(seg.elements, 2) === "D8" && !parseD8(value).valid) {
        findings.push({
          severity: "warning",
          message: `A date reads "${value}", which isn't a valid calendar date in CCYYMMDD form.`,
          segmentIndex: seg.index,
        });
      }
    } else if (seg.tag === "DMG") {
      const value = el(seg.elements, 2);
      if (el(seg.elements, 1) === "D8") {
        const parsed = parseD8(value);
        if (!parsed.valid) {
          findings.push({
            severity: "warning",
            message: `A birth date reads "${value}", which isn't a valid calendar date in CCYYMMDD form.`,
            segmentIndex: seg.index,
          });
        } else if (parsed.iso! > todayIso) {
          findings.push({
            severity: "warning",
            message: `A birth date (${parsed.iso}) is in the future, which usually signals a data-entry error.`,
            segmentIndex: seg.index,
          });
        }
      }
    }
  }

  for (const m of doc.members) {
    if (m.eligibilityBegin && m.eligibilityEnd) {
      const begin = parseD8(m.eligibilityBegin.replaceAll("-", ""));
      const end = parseD8(m.eligibilityEnd.replaceAll("-", ""));
      if (begin.valid && end.valid && m.eligibilityEnd < m.eligibilityBegin) {
        findings.push({
          severity: "warning",
          message: `${memberLabel(m)} has an eligibility end date that falls before its begin date.`,
          memberRef: m.subscriberId || m.memberId,
        });
      }
    }
    for (const c of m.coverages) {
      if (!c.begin) {
        findings.push({
          severity: "info",
          message: `${memberLabel(m)} has a ${c.line} coverage with no begin date.`,
          memberRef: m.subscriberId || m.memberId,
        });
      }
    }
  }

  // Control-total cross-check: declared QTY total vs. members actually parsed.
  if (doc.declaredMemberCount !== undefined && doc.declaredMemberCount !== doc.members.length) {
    findings.push({
      severity: "warning",
      message: `The file's control total says ${doc.declaredMemberCount} member record(s), but ${doc.members.length} were found.`,
    });
  }

  return findings;
}

function memberLabel(m: { firstName: string; lastName: string; memberId: string }): string {
  const name = `${m.firstName} ${m.lastName}`.trim();
  return name || `Member ${m.memberId}` || "A member";
}
