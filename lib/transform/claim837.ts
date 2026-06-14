import { claimFrequency, diagnosisQualifier, facilityType, placeOfService, revenueCode } from "../codelists/claim837";
import { filingIndicator } from "../codelists/remittance";
import { decode } from "../codelists/types";
import type { Interchange, RawSegment, TransactionSet } from "../x12/types";
import { displayDate } from "../util/dates";

export interface Diagnosis {
  code: string; // ICD code (no decimal, as transmitted)
  qualifier: string; // ABK / ABF …
  qualifierLabel: string;
  primary: boolean;
}

export interface ServiceLine837 {
  lineNumber: string; // LX01
  procedure: string; // SV101 / SV202 procedure
  modifiers: string[]; // SV101 components 3+
  charge: number; // SV102 / SV203
  units: number; // SV104 / SV205
  diagnosisPointers: string[]; // SV107 (professional only)
  revenueCode?: string; // SV201 (institutional only)
  revenueDescription?: string; // decoded
  serviceDate?: string; // DTP*472 ISO
}

export type Claim837Variant = "professional" | "institutional";

export interface ClaimRow837 {
  claimId: string; // CLM01 patient control number
  totalCharge: number; // CLM02
  variant: Claim837Variant;
  placeOfService: string; // CLM05-1 decoded (professional)
  /** Generic care-setting label: place of service (P) or type of bill (I). */
  setting: string;
  /** What the setting represents — "Place of service" or "Type of bill". */
  settingType: string;
  frequency: string; // CLM05-3 decoded
  patientName: string;
  subscriberName: string;
  payerName: string;
  billingProviderName: string;
  billingProviderNpi: string;
  filing: string; // SBR09 decoded
  diagnoses: Diagnosis[];
  serviceLines: ServiceLine837[];
  sourceSegmentIndices: number[];
}

export interface Claims837 {
  variant: Claim837Variant;
  submitterName?: string; // NM1*41
  receiverName?: string; // NM1*40
  claims: ClaimRow837[];
  totals: { claims: number; charged: number; serviceLines: number };
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
function name(seg: RawSegment): string {
  return `${el(seg, 3)}, ${el(seg, 4)}`.replace(/^, |, $/g, "").trim();
}

/** Find the first 837 transaction set in an interchange, if any. */
export function first837(ic: Interchange): TransactionSet | undefined {
  for (const group of ic.groups) {
    const txn = group.transactions.find((t) => t.code === "837");
    if (txn) return txn;
  }
  return undefined;
}

/**
 * Transform a parsed 837P transaction set into the readable claims model. The
 * 837 is hierarchical, so we carry forward context (billing provider →
 * subscriber → optional patient) and stamp each claim with it.
 */
export function transform837(txn: TransactionSet): Claims837 {
  // Professional claims carry SV1 service lines; institutional claims carry SV2.
  const institutional = txn.segments.some((s) => s.tag === "SV2");
  const variant: Claim837Variant = institutional ? "institutional" : "professional";
  const doc: Claims837 = { variant, claims: [], totals: { claims: 0, charged: 0, serviceLines: 0 } };

  // Carried-forward hierarchy context.
  let billingName = "";
  let billingNpi = "";
  let subscriberName = "";
  let payerName = "";
  let patientName = "";
  let filing = "";

  let claim: ClaimRow837 | undefined;
  let line: ServiceLine837 | undefined;

  const closeClaim = () => {
    if (claim) doc.claims.push(claim);
    claim = undefined;
    line = undefined;
  };

  for (const seg of txn.segments) {
    if (seg.tag === "SE") break;

    switch (seg.tag) {
      case "HL": {
        const level = el(seg, 3);
        if (level === "20") {
          closeClaim();
          billingName = billingNpi = subscriberName = payerName = patientName = filing = "";
        } else if (level === "22") {
          closeClaim();
          subscriberName = payerName = patientName = filing = "";
        } else if (level === "23") {
          closeClaim();
          patientName = "";
        }
        break;
      }
      case "SBR":
        filing = decode(filingIndicator, el(seg, 9));
        break;
      case "NM1": {
        const role = el(seg, 1);
        if (role === "41") doc.submitterName = el(seg, 3);
        else if (role === "40") doc.receiverName = el(seg, 3);
        else if (role === "85") {
          billingName = el(seg, 3);
          if (el(seg, 8) === "XX") billingNpi = el(seg, 9);
        } else if (role === "IL") subscriberName = name(seg);
        else if (role === "PR") payerName = el(seg, 3);
        else if (role === "QC") patientName = name(seg);
        break;
      }
      case "CLM": {
        closeClaim();
        const c5 = comp(seg, 5);
        const settingCode = c5[0] ?? "";
        claim = {
          claimId: el(seg, 1),
          totalCharge: amt(el(seg, 2)),
          variant,
          placeOfService: institutional ? "" : decode(placeOfService, settingCode),
          setting: institutional ? decode(facilityType, settingCode) : decode(placeOfService, settingCode),
          settingType: institutional ? "Type of bill" : "Place of service",
          frequency: decode(claimFrequency, c5[2] ?? ""),
          patientName: patientName || subscriberName,
          subscriberName,
          payerName,
          billingProviderName: billingName,
          billingProviderNpi: billingNpi,
          filing,
          diagnoses: [],
          serviceLines: [],
          sourceSegmentIndices: [seg.index],
        };
        break;
      }
      case "HI": {
        if (!claim) break;
        claim.sourceSegmentIndices.push(seg.index);
        seg.elements.forEach((_, i) => {
          const parts = comp(seg, i + 1);
          const qualifier = parts[0] ?? "";
          const code = parts[1] ?? "";
          if (!code) return;
          claim!.diagnoses.push({
            code,
            qualifier,
            qualifierLabel: decode(diagnosisQualifier, qualifier),
            primary: qualifier === "ABK" || qualifier === "BK",
          });
        });
        break;
      }
      case "LX": {
        if (!claim) break;
        claim.sourceSegmentIndices.push(seg.index);
        line = {
          lineNumber: el(seg, 1),
          procedure: "",
          modifiers: [],
          charge: 0,
          units: 1,
          diagnosisPointers: [],
        };
        claim.serviceLines.push(line);
        break;
      }
      case "SV1": {
        if (!claim || !line) break;
        claim.sourceSegmentIndices.push(seg.index);
        const proc = comp(seg, 1);
        line.procedure = proc[1] ?? proc[0] ?? "";
        line.modifiers = proc.slice(2).filter(Boolean);
        line.charge = amt(el(seg, 2));
        line.units = amt(el(seg, 4)) || 1;
        line.diagnosisPointers = comp(seg, 7).filter(Boolean);
        break;
      }
      case "SV2": {
        // Institutional service line: SV201 revenue code, SV202 optional
        // procedure, SV203 charge, SV205 units.
        if (!claim || !line) break;
        claim.sourceSegmentIndices.push(seg.index);
        line.revenueCode = el(seg, 1);
        line.revenueDescription = decode(revenueCode, el(seg, 1));
        const proc = comp(seg, 2);
        line.procedure = proc[1] ?? "";
        line.modifiers = proc.slice(2).filter(Boolean);
        line.charge = amt(el(seg, 3));
        line.units = amt(el(seg, 5)) || 1;
        break;
      }
      case "DTP": {
        if (claim && line && el(seg, 1) === "472") {
          claim.sourceSegmentIndices.push(seg.index);
          line.serviceDate = displayDate(el(seg, 3));
        }
        break;
      }
    }
  }

  closeClaim();

  doc.totals = {
    claims: doc.claims.length,
    charged: round(doc.claims.reduce((s, c) => s + c.totalCharge, 0)),
    serviceLines: doc.claims.reduce((s, c) => s + c.serviceLines.length, 0),
  };
  return doc;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
