import { ACTIVE_BENEFIT_CODES, benefitStatus271, INACTIVE_BENEFIT_CODES, serviceType } from "../codelists/eligibility";
import { coverageLevel, gender as genderCodes } from "../codelists/misc";
import { relationship } from "../codelists/relationship";
import { decode } from "../codelists/types";
import type { Interchange, RawSegment, TransactionSet } from "../x12/types";
import { displayDate } from "../util/dates";

export type EligibilityVariant = "inquiry" | "response"; // 270 vs 271

/** A requested service (270, EQ) or a returned benefit (271, EB). */
export interface BenefitLine {
  statusCode?: string; // EB01 (271 only)
  status?: string; // decoded
  serviceTypeCode: string; // EQ01 / EB03
  serviceType: string; // decoded
  coverageLevel?: string; // EB02 decoded
  planDescription?: string; // EB05
  amount?: number; // EB07
  percent?: string; // EB08
}

export interface EligibilityMember {
  name: string;
  memberId: string;
  relationship: string;
  isSubscriber: boolean;
  dob?: string;
  gender?: string;
  /** "Active" / "Inactive" / "Unknown" — the headline a 271 answers. */
  coverageStatus: string;
  lines: BenefitLine[]; // inquiries (270) or benefits (271)
  sourceSegmentIndices: number[];
}

export interface Eligibility {
  variant: EligibilityVariant;
  payerName?: string;
  providerName?: string;
  members: EligibilityMember[];
  totals: { members: number; active: number; inactive: number };
}

function el(seg: RawSegment, n: number): string {
  return seg.elements[n - 1] ?? "";
}
function amt(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function name(seg: RawSegment): string {
  return `${el(seg, 3)}${el(seg, 4) ? `, ${el(seg, 4)}` : ""}`.trim();
}

export function first270(ic: Interchange): TransactionSet | undefined {
  for (const g of ic.groups) {
    const t = g.transactions.find((t) => t.code === "270");
    if (t) return t;
  }
  return undefined;
}
export function first271(ic: Interchange): TransactionSet | undefined {
  for (const g of ic.groups) {
    const t = g.transactions.find((t) => t.code === "271");
    if (t) return t;
  }
  return undefined;
}

/** Transform a 270 or 271 into the shared eligibility model. */
export function transformEligibility(txn: TransactionSet, variant: EligibilityVariant): Eligibility {
  const doc: Eligibility = { variant, members: [], totals: { members: 0, active: 0, inactive: 0 } };

  type Scope = "source" | "receiver" | "member" | undefined;
  let scope: Scope;
  let member: EligibilityMember | undefined;

  const closeMember = () => {
    if (member) doc.members.push(member);
    member = undefined;
  };

  for (const seg of txn.segments) {
    if (seg.tag === "SE") break;

    if (seg.tag === "HL") {
      const level = el(seg, 3);
      if (level === "20") {
        closeMember();
        scope = "source";
      } else if (level === "21") {
        closeMember();
        scope = "receiver";
      } else if (level === "22" || level === "23") {
        closeMember();
        scope = "member";
        member = {
          name: "",
          memberId: "",
          relationship: level === "22" ? "Self (the subscriber)" : "Dependent",
          isSubscriber: level === "22",
          coverageStatus: variant === "inquiry" ? "—" : "Unknown",
          lines: [],
          sourceSegmentIndices: [seg.index],
        };
      }
      continue;
    }

    if (member) member.sourceSegmentIndices.push(seg.index);

    switch (seg.tag) {
      case "NM1": {
        const role = el(seg, 1);
        if (scope === "source" && role === "PR") doc.payerName = el(seg, 3);
        else if (scope === "receiver" && (role === "1P" || role === "FA")) doc.providerName = el(seg, 3);
        else if (member && (role === "IL" || role === "03" || role === "QC")) {
          member.name = name(seg);
          if (el(seg, 8) && el(seg, 9)) member.memberId = el(seg, 9);
        }
        break;
      }
      case "INS":
        if (member) member.relationship = decode(relationship, el(seg, 2)) || member.relationship;
        break;
      case "DMG":
        if (member && el(seg, 1) === "D8") {
          member.dob = displayDate(el(seg, 2));
          member.gender = decode(genderCodes, el(seg, 3)) || undefined;
        }
        break;
      case "EQ": // 270 inquiry
        if (member) {
          const code = el(seg, 1);
          member.lines.push({ serviceTypeCode: code, serviceType: decode(serviceType, code) });
        }
        break;
      case "EB": // 271 benefit
        if (member) {
          const statusCode = el(seg, 1);
          const stc = el(seg, 3);
          member.lines.push({
            statusCode,
            status: decode(benefitStatus271, statusCode),
            serviceTypeCode: stc,
            serviceType: decode(serviceType, stc),
            coverageLevel: decode(coverageLevel, el(seg, 2)) || undefined,
            planDescription: el(seg, 5) || undefined,
            amount: el(seg, 7) ? amt(el(seg, 7)) : undefined,
            percent: el(seg, 8) || undefined,
          });
          // First active/inactive line sets the member's headline status.
          if (member.coverageStatus === "Unknown") {
            if (ACTIVE_BENEFIT_CODES.has(statusCode)) member.coverageStatus = "Active";
            else if (INACTIVE_BENEFIT_CODES.has(statusCode)) member.coverageStatus = "Inactive";
          }
        }
        break;
    }
  }

  closeMember();

  doc.totals = {
    members: doc.members.length,
    active: doc.members.filter((m) => m.coverageStatus === "Active").length,
    inactive: doc.members.filter((m) => m.coverageStatus === "Inactive").length,
  };
  return doc;
}
