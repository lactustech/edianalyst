import { benefitStatus, gender as genderCodes, maintenanceReason as maintenanceReasonCodes, transactionPurpose } from "../codelists/misc";
import { COVERAGE_DATE_QUALIFIERS, MEMBER_DATE_QUALIFIERS } from "../codelists/dtpQualifiers";
import { insuranceLine } from "../codelists/insuranceLine";
import { maintenanceTone, maintenanceType, type BadgeTone } from "../codelists/maintenanceType";
import { relationship } from "../codelists/relationship";
import { coverageLevel } from "../codelists/misc";
import { decode } from "../codelists/types";
import type { Interchange, RawSegment, TransactionSet } from "../x12/types";
import { displayDate } from "../util/dates";

/** One coverage line for a member (from a 2300 HD + its dates). */
export interface CoverageView {
  line: string; // decoded HD03 ("Health", "Dental"…)
  lineCode: string; // raw HD03
  level?: string; // decoded HD05
  begin?: string; // DTP*348 ISO
  end?: string; // DTP*349 ISO
}

/** The flat, analyst-friendly member row (spec §5) — the reason the product exists. */
export interface MemberRow {
  subscriberId: string; // REF*0F
  memberId: string; // REF*23 / NM109
  lastName: string;
  firstName: string;
  middle?: string;
  isSubscriber: boolean;
  relationship: string; // decoded INS02
  maintenanceType: string; // decoded INS03
  maintenanceTypeCode: string; // raw INS03
  maintenanceTone: BadgeTone; // badge color hint
  maintenanceReason?: string; // decoded INS04
  benefitStatus?: string; // decoded INS05
  dob?: string; // ISO
  gender?: string; // decoded DMG03
  eligibilityBegin?: string; // DTP*356 ISO
  eligibilityEnd?: string; // DTP*357 ISO
  coverages: CoverageView[];
  address?: { street?: string; city?: string; state?: string; zip?: string };
  /** Indices of the raw segments that produced this row — powers "show the bytes". */
  sourceSegmentIndices: number[];
}

/** A whole 834 reduced to what an analyst needs at a glance. */
export interface Document834 {
  purposeCode: string; // BGN08
  purpose: string; // decoded
  fileEffectiveDate?: string; // header DTP*007 ISO
  declaredMemberCount?: number; // QTY*DT
  sponsorName?: string; // 1000A N1*P5
  payerName?: string; // 1000B N1*IN
  members: MemberRow[];
  counts: {
    additions: number;
    terminations: number;
    changes: number;
    other: number;
  };
}

function el(seg: RawSegment, n: number): string {
  return seg.elements[n - 1] ?? "";
}

/** Find the first 834 transaction set in an interchange, if any. */
export function first834(ic: Interchange): TransactionSet | undefined {
  for (const group of ic.groups) {
    const txn = group.transactions.find((t) => t.code === "834");
    if (txn) return txn;
  }
  return undefined;
}

const MAINTENANCE_BUCKET: Record<string, keyof Document834["counts"]> = {
  "021": "additions",
  "024": "terminations",
  "001": "changes",
};

/** Transform a parsed 834 transaction set into the readable document model. */
export function transform834(txn: TransactionSet): Document834 {
  const doc: Document834 = {
    purposeCode: "",
    purpose: "",
    members: [],
    counts: { additions: 0, terminations: 0, changes: 0, other: 0 },
  };

  const members: MemberRow[] = [];
  let current: MemberRow | undefined;
  let currentCoverage: CoverageView | undefined;

  for (const seg of txn.segments) {
    // The SE trailer ends the member section; never fold it into a member row.
    if (seg.tag === "SE") break;

    // Header-level segments (before the first INS).
    if (!current) {
      switch (seg.tag) {
        case "BGN":
          doc.purposeCode = el(seg, 8);
          doc.purpose = decode(transactionPurpose, el(seg, 8));
          break;
        case "DTP":
          if (el(seg, 1) === "007") doc.fileEffectiveDate = displayDate(el(seg, 3));
          break;
        case "QTY":
          if (el(seg, 1) === "DT") doc.declaredMemberCount = Number(el(seg, 2)) || undefined;
          break;
        case "N1":
          if (el(seg, 1) === "P5") doc.sponsorName = el(seg, 2);
          if (el(seg, 1) === "IN") doc.payerName = el(seg, 2);
          break;
      }
    }

    if (seg.tag === "INS") {
      if (current) members.push(current);
      currentCoverage = undefined;
      const code = el(seg, 3);
      current = {
        subscriberId: "",
        memberId: "",
        lastName: "",
        firstName: "",
        isSubscriber: el(seg, 1) === "Y",
        relationship: decode(relationship, el(seg, 2)),
        maintenanceType: decode(maintenanceType, code),
        maintenanceTypeCode: code,
        maintenanceTone: maintenanceTone[code] ?? "grey",
        maintenanceReason: undefined,
        benefitStatus: decode(benefitStatus, el(seg, 5)) || undefined,
        coverages: [],
        sourceSegmentIndices: [seg.index],
      };
      current.maintenanceReason = el(seg, 4)
        ? decode(maintenanceReasonCodes, el(seg, 4))
        : undefined;
      continue;
    }

    if (!current) continue;
    current.sourceSegmentIndices.push(seg.index);

    switch (seg.tag) {
      case "REF": {
        const qual = el(seg, 1);
        if (qual === "0F") current.subscriberId = el(seg, 2);
        else if (qual === "23" && !current.memberId) current.memberId = el(seg, 2);
        break;
      }
      case "NM1": {
        if (el(seg, 1) === "IL") {
          current.lastName = el(seg, 3);
          current.firstName = el(seg, 4);
          current.middle = el(seg, 5) || undefined;
          if (!current.memberId) current.memberId = el(seg, 9);
        }
        break;
      }
      case "DMG": {
        if (el(seg, 1) === "D8") current.dob = displayDate(el(seg, 2));
        current.gender = decode(genderCodes, el(seg, 3)) || undefined;
        break;
      }
      case "N3": {
        current.address = { ...current.address, street: el(seg, 1) };
        break;
      }
      case "N4": {
        current.address = {
          ...current.address,
          city: el(seg, 1),
          state: el(seg, 2),
          zip: el(seg, 3),
        };
        break;
      }
      case "DTP": {
        const qual = el(seg, 1);
        const value = displayDate(el(seg, 3));
        if (qual === MEMBER_DATE_QUALIFIERS.eligibilityBegin) current.eligibilityBegin = value;
        else if (qual === MEMBER_DATE_QUALIFIERS.eligibilityEnd) current.eligibilityEnd = value;
        else if (qual === COVERAGE_DATE_QUALIFIERS.begin && currentCoverage) currentCoverage.begin = value;
        else if (qual === COVERAGE_DATE_QUALIFIERS.end && currentCoverage) currentCoverage.end = value;
        break;
      }
      case "HD": {
        const lineCode = el(seg, 3);
        currentCoverage = {
          line: decode(insuranceLine, lineCode),
          lineCode,
          level: decode(coverageLevel, el(seg, 5)) || undefined,
        };
        current.coverages.push(currentCoverage);
        break;
      }
    }
  }

  if (current) members.push(current);

  // Tally maintenance buckets for the summary bar.
  for (const m of members) {
    const bucket = MAINTENANCE_BUCKET[m.maintenanceTypeCode] ?? "other";
    doc.counts[bucket]++;
  }

  doc.members = members;
  return doc;
}
