import { premiumReference } from "../codelists/premium820";
import { paymentMethod } from "../codelists/remittance";
import { decode } from "../codelists/types";
import type { Interchange, RawSegment, TransactionSet } from "../x12/types";
import { displayDate } from "../util/dates";

/** One premium remittance line (loop 2300, RMR). */
export interface PremiumLine {
  referenceCode: string; // RMR01
  referenceType: string; // decoded
  reference: string; // RMR02 — policy/account number
  amountPaid: number; // RMR04
  premiumAmount?: number; // RMR05 (total premium, when given)
  name: string; // NM1 individual / organization on the line
  sourceSegmentIndices: number[];
}

/** A whole 820 reduced to what an analyst needs. */
export interface Premium820 {
  totalPaid: number; // BPR02
  paymentMethodCode: string; // BPR04
  paymentMethod: string; // decoded
  paymentDate?: string; // BPR16 ISO
  traceNumber: string; // TRN02
  payerName?: string; // 1000A N1*PR
  payeeName?: string; // 1000B N1*PE
  lines: PremiumLine[];
  totals: { lines: number; paid: number };
}

function el(seg: RawSegment, n: number): string {
  return seg.elements[n - 1] ?? "";
}
function amt(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Find the first 820 transaction set in an interchange, if any. */
export function first820(ic: Interchange): TransactionSet | undefined {
  for (const group of ic.groups) {
    const txn = group.transactions.find((t) => t.code === "820");
    if (txn) return txn;
  }
  return undefined;
}

/** Transform a parsed 820 transaction set into the readable premium model. */
export function transform820(txn: TransactionSet): Premium820 {
  const doc: Premium820 = {
    totalPaid: 0,
    paymentMethodCode: "",
    paymentMethod: "",
    traceNumber: "",
    lines: [],
    totals: { lines: 0, paid: 0 },
  };

  let line: PremiumLine | undefined;
  let pendingName = ""; // an NM1 seen just before its RMR

  const closeLine = () => {
    if (line) doc.lines.push(line);
    line = undefined;
  };

  for (const seg of txn.segments) {
    if (seg.tag === "SE") break;

    if (!line) {
      switch (seg.tag) {
        case "BPR":
          doc.totalPaid = amt(el(seg, 2));
          doc.paymentMethodCode = el(seg, 4);
          doc.paymentMethod = decode(paymentMethod, el(seg, 4));
          doc.paymentDate = displayDate(el(seg, 16));
          break;
        case "TRN":
          doc.traceNumber = el(seg, 2);
          break;
        case "N1":
          if (el(seg, 1) === "PR") doc.payerName = el(seg, 2);
          else if (el(seg, 1) === "PE") doc.payeeName = el(seg, 2);
          break;
      }
    }

    if (seg.tag === "NM1") {
      // Remember the most recent individual/org name to attach to the next RMR.
      pendingName = `${el(seg, 3)}${el(seg, 4) ? `, ${el(seg, 4)}` : ""}`.trim();
      if (line) line.name ||= pendingName;
    }

    if (seg.tag === "RMR") {
      closeLine();
      const refCode = el(seg, 1);
      line = {
        referenceCode: refCode,
        referenceType: decode(premiumReference, refCode),
        reference: el(seg, 2),
        amountPaid: amt(el(seg, 4)),
        premiumAmount: el(seg, 5) ? amt(el(seg, 5)) : undefined,
        name: pendingName,
        sourceSegmentIndices: [seg.index],
      };
      pendingName = "";
      continue;
    }

    if (line && seg.tag !== "RMR") line.sourceSegmentIndices.push(seg.index);
  }

  closeLine();

  doc.totals = {
    lines: doc.lines.length,
    paid: round(doc.lines.reduce((s, l) => s + l.amountPaid, 0)),
  };
  return doc;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
