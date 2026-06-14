import { statusCategory, statusCode, statusOutcome, type StatusOutcome } from "../codelists/claimStatus";
import { decode } from "../codelists/types";
import type { Interchange, RawSegment, TransactionSet } from "../x12/types";
import { displayDate } from "../util/dates";

export type ClaimStatusVariant = "request" | "response" | "acknowledgment"; // 276 / 277 / 277CA

/** One STC status line on a claim. */
export interface StatusLine {
  categoryCode: string;
  category: string;
  statusCode: string;
  statusText: string;
  date?: string;
  amount?: number;
}

export interface ClaimStatusRow {
  claimId: string; // REF*EJ patient control, or TRN trace
  payerClaimId?: string; // REF*1K
  patientName: string;
  memberId: string;
  totalCharge?: number; // AMT
  statuses: StatusLine[];
  primaryStatus: string; // headline (first STC), or "Status requested" for 276
  outcome: StatusOutcome;
  sourceSegmentIndices: number[];
}

export interface ClaimStatus {
  variant: ClaimStatusVariant;
  payerName?: string;
  providerName?: string;
  claims: ClaimStatusRow[];
  totals: { claims: number; accepted: number; rejected: number; pending: number };
}

function el(seg: RawSegment, n: number): string {
  return seg.elements[n - 1] ?? "";
}
function comp(seg: RawSegment, n: number): string[] {
  return seg.components?.[n - 1] ?? [el(seg, n)];
}
function amt(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function nm1Name(seg: RawSegment): string {
  return `${el(seg, 3)}${el(seg, 4) ? `, ${el(seg, 4)}` : ""}`.trim();
}

function finder(code: string) {
  return (ic: Interchange): TransactionSet | undefined => {
    for (const g of ic.groups) {
      const t = g.transactions.find((t) => t.code === code);
      if (t) return t;
    }
    return undefined;
  };
}
export const first276 = finder("276");
export const first277 = finder("277");

/** Whether a 277 transaction set is really a 277CA (claim acknowledgment). */
export function is277CA(txn: TransactionSet): boolean {
  return (txn.st.elements[2] ?? "").includes("X214");
}

/** Transform a 276/277/277CA into the shared claim-status model. */
export function transformClaimStatus(txn: TransactionSet, variant: ClaimStatusVariant): ClaimStatus {
  const doc: ClaimStatus = { variant, claims: [], totals: { claims: 0, accepted: 0, rejected: 0, pending: 0 } };

  type Scope = "source" | "receiver" | "provider" | "patient" | undefined;
  let scope: Scope;
  let patientName = "";
  let memberId = "";
  let claim: ClaimStatusRow | undefined;

  const closeClaim = () => {
    if (claim) doc.claims.push(claim);
    claim = undefined;
  };

  for (const seg of txn.segments) {
    if (seg.tag === "SE") break;

    if (seg.tag === "HL") {
      const level = el(seg, 3);
      if (level === "20") scope = "source";
      else if (level === "21") scope = "receiver";
      else if (level === "19") scope = "provider";
      else {
        // Subscriber (22), dependent (23), or patient (PT) — a new patient.
        closeClaim();
        scope = "patient";
        patientName = "";
        memberId = "";
      }
      continue;
    }

    if (claim) claim.sourceSegmentIndices.push(seg.index);

    switch (seg.tag) {
      case "NM1": {
        const role = el(seg, 1);
        if (scope === "source" && (role === "PR" || role === "AY")) doc.payerName = nm1Name(seg);
        else if ((scope === "receiver" || scope === "provider") && ["41", "1P", "85"].includes(role)) {
          doc.providerName ||= nm1Name(seg);
        } else if (scope === "patient" && ["IL", "QC"].includes(role)) {
          patientName = nm1Name(seg);
          if (el(seg, 9)) memberId = el(seg, 9);
        }
        break;
      }
      case "TRN":
        // Opens a claim-status loop.
        closeClaim();
        claim = {
          claimId: el(seg, 2),
          patientName,
          memberId,
          statuses: [],
          primaryStatus: variant === "request" ? "Status requested" : "Unknown",
          outcome: variant === "request" ? "requested" : "other",
          sourceSegmentIndices: [seg.index],
        };
        break;
      case "STC": {
        if (!claim) break;
        const c1 = comp(seg, 1);
        const categoryCode = c1[0] ?? "";
        const sCode = c1[1] ?? "";
        const line: StatusLine = {
          categoryCode,
          category: decode(statusCategory, categoryCode),
          statusCode: sCode,
          statusText: decode(statusCode, sCode),
          date: el(seg, 2) ? displayDate(el(seg, 2)) : undefined,
          amount: el(seg, 4) ? amt(el(seg, 4)) : undefined,
        };
        claim.statuses.push(line);
        if (claim.statuses.length === 1) {
          claim.primaryStatus = line.category || line.statusText;
          claim.outcome = statusOutcome(categoryCode);
        }
        break;
      }
      case "REF": {
        if (!claim) break;
        const qual = el(seg, 1);
        if (qual === "EJ" || qual === "D9") claim.claimId = el(seg, 2);
        else if (qual === "1K") claim.payerClaimId = el(seg, 2);
        break;
      }
      case "AMT":
        if (claim && el(seg, 1) === "T3") claim.totalCharge = amt(el(seg, 2));
        break;
    }
  }

  closeClaim();

  doc.totals = {
    claims: doc.claims.length,
    accepted: doc.claims.filter((c) => c.outcome === "accepted" || c.outcome === "finalized").length,
    rejected: doc.claims.filter((c) => c.outcome === "rejected" || c.outcome === "denied").length,
    pending: doc.claims.filter((c) => c.outcome === "pending").length,
  };
  return doc;
}
