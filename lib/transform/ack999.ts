import {
  elementSyntaxError,
  functionalId,
  groupAckStatus,
  segmentSyntaxError,
  transactionAckStatus,
  transactionSyntaxError,
} from "../codelists/ack999";
import { decode } from "../codelists/types";
import type { Interchange, RawSegment, TransactionSet } from "../x12/types";

/** An element-level error note (IK4) inside a segment error. */
export interface ElementError {
  position: string; // IK401 — element position in the segment
  elementRef: string; // IK402 — X12 data element reference number
  errorCode: string; // IK403
  error: string; // decoded
  badValue?: string; // IK404 — the offending value, when reported
}

/** A segment-level error (IK3), with any element notes and context. */
export interface SegmentError {
  segmentId: string; // IK301
  position: string; // IK302 — segment position in the transaction set
  loopId?: string; // IK303
  errorCode: string; // IK304
  error: string; // decoded
  context: string[]; // CTX context strings
  elementErrors: ElementError[];
}

/** One acknowledged transaction set (AK2 … IK5). */
export interface AckTransaction {
  setId: string; // AK201 (e.g. "837")
  controlNumber: string; // AK202
  statusCode: string; // IK501
  status: string; // decoded
  syntaxErrors: string[]; // IK502-06 decoded
  segmentErrors: SegmentError[];
  sourceSegmentIndices: number[];
}

/** A whole 999 reduced to what an analyst needs. */
export interface Acknowledgment999 {
  functionalIdCode: string; // AK101
  functionalId: string; // decoded — what was acknowledged
  groupControlNumber: string; // AK102
  groupStatusCode: string; // AK901
  groupStatus: string; // decoded
  counts: { included: number; received: number; accepted: number }; // AK902/903/904
  transactions: AckTransaction[];
  totals: { transactions: number; accepted: number; withErrors: number; rejected: number };
}

function el(seg: RawSegment, n: number): string {
  return seg.elements[n - 1] ?? "";
}

/** Find the first 999 transaction set in an interchange, if any. */
export function first999(ic: Interchange): TransactionSet | undefined {
  for (const group of ic.groups) {
    const txn = group.transactions.find((t) => t.code === "999");
    if (txn) return txn;
  }
  return undefined;
}

/** Transform a parsed 999 transaction set into the readable acknowledgment model. */
export function transform999(txn: TransactionSet): Acknowledgment999 {
  const doc: Acknowledgment999 = {
    functionalIdCode: "",
    functionalId: "",
    groupControlNumber: "",
    groupStatusCode: "",
    groupStatus: "",
    counts: { included: 0, received: 0, accepted: 0 },
    transactions: [],
    totals: { transactions: 0, accepted: 0, withErrors: 0, rejected: 0 },
  };

  let txnAck: AckTransaction | undefined;
  let segErr: SegmentError | undefined;

  const closeTxn = () => {
    if (txnAck) doc.transactions.push(txnAck);
    txnAck = undefined;
    segErr = undefined;
  };

  for (const seg of txn.segments) {
    if (seg.tag === "SE") break;

    switch (seg.tag) {
      case "AK1":
        doc.functionalIdCode = el(seg, 1);
        doc.functionalId = decode(functionalId, el(seg, 1));
        doc.groupControlNumber = el(seg, 2);
        break;
      case "AK2":
        closeTxn();
        txnAck = {
          setId: el(seg, 1),
          controlNumber: el(seg, 2),
          statusCode: "",
          status: "",
          syntaxErrors: [],
          segmentErrors: [],
          sourceSegmentIndices: [seg.index],
        };
        break;
      case "IK3":
        if (!txnAck) break;
        txnAck.sourceSegmentIndices.push(seg.index);
        segErr = {
          segmentId: el(seg, 1),
          position: el(seg, 2),
          loopId: el(seg, 3) || undefined,
          errorCode: el(seg, 4),
          error: decode(segmentSyntaxError, el(seg, 4)),
          context: [],
          elementErrors: [],
        };
        txnAck.segmentErrors.push(segErr);
        break;
      case "CTX":
        if (txnAck) txnAck.sourceSegmentIndices.push(seg.index);
        if (segErr) segErr.context.push(seg.elements.filter(Boolean).join(" · "));
        break;
      case "IK4":
        if (!segErr || !txnAck) break;
        txnAck.sourceSegmentIndices.push(seg.index);
        segErr.elementErrors.push({
          // IK401 may be a composite (position:component:repeat); show position.
          position: (seg.components?.[0]?.[0] ?? el(seg, 1)) || "",
          elementRef: el(seg, 2),
          errorCode: el(seg, 3),
          error: decode(elementSyntaxError, el(seg, 3)),
          badValue: el(seg, 4) || undefined,
        });
        break;
      case "IK5":
        if (!txnAck) break;
        txnAck.sourceSegmentIndices.push(seg.index);
        txnAck.statusCode = el(seg, 1);
        txnAck.status = decode(transactionAckStatus, el(seg, 1));
        txnAck.syntaxErrors = [2, 3, 4, 5, 6]
          .map((i) => el(seg, i))
          .filter(Boolean)
          .map((code) => decode(transactionSyntaxError, code));
        break;
      case "AK9":
        doc.groupStatusCode = el(seg, 1);
        doc.groupStatus = decode(groupAckStatus, el(seg, 1));
        doc.counts = {
          included: Number(el(seg, 2)) || 0,
          received: Number(el(seg, 3)) || 0,
          accepted: Number(el(seg, 4)) || 0,
        };
        break;
    }
  }

  closeTxn();

  doc.totals = {
    transactions: doc.transactions.length,
    accepted: doc.transactions.filter((t) => t.statusCode === "A").length,
    withErrors: doc.transactions.filter((t) => t.statusCode === "E").length,
    rejected: doc.transactions.filter((t) => ["R", "M", "W", "X"].includes(t.statusCode)).length,
  };
  return doc;
}
