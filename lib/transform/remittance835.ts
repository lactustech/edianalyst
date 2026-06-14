import { adjustmentGroup, carc, claimStatus, filingIndicator, paymentMethod, rarc } from "../codelists/remittance";
import { decode } from "../codelists/types";
import type { Interchange, RawSegment, TransactionSet } from "../x12/types";
import { displayDate } from "../util/dates";

/** One decoded CAS adjustment triplet. */
export interface Adjustment {
  groupCode: string; // CAS01
  group: string; // decoded
  reasonCode: string; // CARC
  reason: string; // decoded plain-English
  amount: number;
}

/** A remark code (RARC) from an LQ segment. */
export interface Remark {
  code: string;
  text: string;
}

/** One service line within a claim (loop 2110). */
export interface ServiceLine {
  procedure: string; // SVC01 procedure code
  charge: number; // SVC02
  paid: number; // SVC03
  units: number; // SVC05
  date?: string; // DTM*472 ISO
  adjustments: Adjustment[];
  remarks: Remark[];
}

/** One claim payment (loop 2100) — the table grain. */
export interface ClaimRow {
  claimId: string; // CLP01
  statusCode: string; // CLP02
  status: string; // decoded
  totalCharge: number; // CLP03
  totalPaid: number; // CLP04
  patientResponsibility: number; // CLP05
  filingCode: string; // CLP06
  filing: string; // decoded
  payerClaimControlNumber: string; // CLP07
  patientName: string;
  memberId: string;
  adjustments: Adjustment[]; // claim-level CAS
  serviceLines: ServiceLine[];
  sourceSegmentIndices: number[];
}

/** A whole 835 reduced to what an analyst needs. */
export interface Remittance835 {
  paymentMethodCode: string; // BPR04
  paymentMethod: string; // decoded
  totalPaid: number; // BPR02
  paymentDate?: string; // BPR16 ISO
  traceNumber: string; // TRN02 check / EFT number
  payerName?: string; // 1000A
  payeeName?: string; // 1000B
  claims: ClaimRow[];
  totals: { claims: number; charged: number; paid: number; patientResponsibility: number; denied: number };
}

function el(seg: RawSegment, n: number): string {
  return seg.elements[n - 1] ?? "";
}
function amt(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Find the first 835 transaction set in an interchange, if any. */
export function first835(ic: Interchange): TransactionSet | undefined {
  for (const group of ic.groups) {
    const txn = group.transactions.find((t) => t.code === "835");
    if (txn) return txn;
  }
  return undefined;
}

/** Parse a CAS segment into its decoded adjustment triplets (up to six). */
function parseCas(seg: RawSegment): Adjustment[] {
  const groupCode = el(seg, 1);
  const group = decode(adjustmentGroup, groupCode);
  const out: Adjustment[] = [];
  // Triplets start at element 2: (reason, amount, quantity), repeating every 3.
  for (let i = 2; i <= 17; i += 3) {
    const reasonCode = el(seg, i);
    if (!reasonCode) continue;
    out.push({
      groupCode,
      group,
      reasonCode,
      reason: decode(carc, reasonCode),
      amount: amt(el(seg, i + 1)),
    });
  }
  return out;
}

/** Transform a parsed 835 transaction set into the readable remittance model. */
export function transform835(txn: TransactionSet): Remittance835 {
  const doc: Remittance835 = {
    paymentMethodCode: "",
    paymentMethod: "",
    totalPaid: 0,
    traceNumber: "",
    claims: [],
    totals: { claims: 0, charged: 0, paid: 0, patientResponsibility: 0, denied: 0 },
  };

  const claims: ClaimRow[] = [];
  let claim: ClaimRow | undefined;
  let service: ServiceLine | undefined;

  for (const seg of txn.segments) {
    if (seg.tag === "SE") break;

    // Header segments (before the first claim).
    if (!claim) {
      switch (seg.tag) {
        case "BPR":
          doc.paymentMethodCode = el(seg, 4);
          doc.paymentMethod = decode(paymentMethod, el(seg, 4));
          doc.totalPaid = amt(el(seg, 2));
          doc.paymentDate = displayDate(el(seg, 16));
          break;
        case "TRN":
          doc.traceNumber = el(seg, 2);
          break;
        case "N1":
          if (el(seg, 1) === "PR") doc.payerName = el(seg, 2);
          if (el(seg, 1) === "PE") doc.payeeName = el(seg, 2);
          break;
      }
    }

    if (seg.tag === "CLP") {
      if (claim) claims.push(claim);
      service = undefined;
      const statusCode = el(seg, 2);
      const filingCode = el(seg, 6);
      claim = {
        claimId: el(seg, 1),
        statusCode,
        status: decode(claimStatus, statusCode),
        totalCharge: amt(el(seg, 3)),
        totalPaid: amt(el(seg, 4)),
        patientResponsibility: amt(el(seg, 5)),
        filingCode,
        filing: decode(filingIndicator, filingCode),
        payerClaimControlNumber: el(seg, 7),
        patientName: "",
        memberId: "",
        adjustments: [],
        serviceLines: [],
        sourceSegmentIndices: [seg.index],
      };
      continue;
    }

    if (!claim) continue;
    claim.sourceSegmentIndices.push(seg.index);

    switch (seg.tag) {
      case "NM1":
        if (el(seg, 1) === "QC") {
          claim.patientName = `${el(seg, 3)}, ${el(seg, 4)}`.replace(/^, |, $/g, "").trim();
          claim.memberId = el(seg, 9);
        }
        break;
      case "SVC": {
        const proc = seg.components?.[0]?.[1] ?? el(seg, 1);
        service = {
          procedure: proc,
          charge: amt(el(seg, 2)),
          paid: amt(el(seg, 3)),
          units: amt(el(seg, 5)) || 1,
          adjustments: [],
          remarks: [],
        };
        claim.serviceLines.push(service);
        break;
      }
      case "CAS": {
        const adjustments = parseCas(seg);
        if (service) service.adjustments.push(...adjustments);
        else claim.adjustments.push(...adjustments);
        break;
      }
      case "DTM": {
        // In the 835, the date sits in DTM02 (no D8 format qualifier element).
        if (el(seg, 1) === "472" && service) service.date = displayDate(el(seg, 2));
        break;
      }
      case "LQ": {
        if (el(seg, 1) === "HE" && service) {
          const code = el(seg, 2);
          service.remarks.push({ code, text: decode(rarc, code) });
        }
        break;
      }
    }
  }

  if (claim) claims.push(claim);

  doc.claims = claims;
  doc.totals = {
    claims: claims.length,
    charged: round(claims.reduce((s, c) => s + c.totalCharge, 0)),
    paid: round(claims.reduce((s, c) => s + c.totalPaid, 0)),
    patientResponsibility: round(claims.reduce((s, c) => s + c.patientResponsibility, 0)),
    denied: claims.filter((c) => c.statusCode === "4").length,
  };
  return doc;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
