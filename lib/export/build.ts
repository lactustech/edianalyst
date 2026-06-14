import type { AnalysisResult } from "../analyze";
import type { MemberDiff } from "../diff/member-diff";
import type { Finding } from "../validate/types";
import type { ExportBundle, ExportTable } from "./types";

/**
 * Turn an analyzed file into exportable tables (spec §10). Each transaction type
 * yields a primary table (its readable rows), optional detail tables, and a
 * findings table — the same data the on-screen tables show, flattened for Excel.
 */
function findingsTable(findings: Finding[]): ExportTable {
  return {
    name: "Findings",
    columns: ["Severity", "Message", "Reference", "Segment"],
    rows: findings.map((f) => [f.severity, f.message, f.memberRef ?? "", f.segmentIndex ?? ""]),
  };
}

const join = (xs: string[]) => xs.filter(Boolean).join("; ");

export function buildExport(result: AnalysisResult): ExportBundle {
  const tables: ExportTable[] = [];
  let fileBase = "edianalyst-export";

  if (result.enrollment) {
    fileBase = "edianalyst-834-members";
    tables.push({
      name: "Members",
      columns: ["Subscriber ID", "Member ID", "Last", "First", "Middle", "Relationship", "Change type", "Reason", "Benefit status", "DOB", "Gender", "Eligibility begin", "Eligibility end", "Coverages", "Street", "City", "State", "ZIP"],
      rows: result.enrollment.members.map((m) => [
        m.subscriberId, m.memberId, m.lastName, m.firstName, m.middle ?? "", m.relationship,
        m.maintenanceType, m.maintenanceReason ?? "", m.benefitStatus ?? "", m.dob ?? "", m.gender ?? "",
        m.eligibilityBegin ?? "", m.eligibilityEnd ?? "",
        join(m.coverages.map((c) => `${c.lineCode}${c.level ? `/${c.level}` : ""}${c.begin ? ` ${c.begin}` : ""}${c.end ? `→${c.end}` : ""}`)),
        m.address?.street ?? "", m.address?.city ?? "", m.address?.state ?? "", m.address?.zip ?? "",
      ]),
    });
  } else if (result.remittance) {
    fileBase = "edianalyst-835-claims";
    const r = result.remittance;
    tables.push({
      name: "Claims",
      columns: ["Claim ID", "Patient", "Status", "Charged", "Paid", "Patient resp", "Filing", "Payer claim #", "Service lines"],
      rows: r.claims.map((c) => [c.claimId, c.patientName, c.status, c.totalCharge, c.totalPaid, c.patientResponsibility, c.filing, c.payerClaimControlNumber, c.serviceLines.length]),
    });
    tables.push({
      name: "Service lines",
      columns: ["Claim ID", "Procedure", "Charge", "Paid", "Adjustments", "Remarks"],
      rows: r.claims.flatMap((c) => c.serviceLines.map((s) => [
        c.claimId, s.procedure, s.charge, s.paid,
        join(s.adjustments.map((a) => `${a.groupCode}/${a.reasonCode} ${a.reason} (${a.amount})`)),
        join(s.remarks.map((rm) => `${rm.code} ${rm.text}`)),
      ])),
    });
  } else if (result.claims) {
    const c837 = result.claims;
    fileBase = `edianalyst-837${c837.variant === "institutional" ? "i" : "p"}-claims`;
    tables.push({
      name: "Claims",
      columns: ["Claim ID", "Patient", "Subscriber", "Payer", "Billing provider", "NPI", "Setting", "Frequency", "Filing", "Total charge", "Diagnoses", "Service lines"],
      rows: c837.claims.map((c) => [
        c.claimId, c.patientName, c.subscriberName, c.payerName, c.billingProviderName, c.billingProviderNpi,
        c.setting, c.frequency, c.filing, c.totalCharge,
        join(c.diagnoses.map((d) => d.code)), c.serviceLines.length,
      ]),
    });
    tables.push({
      name: "Service lines",
      columns: ["Claim ID", "Procedure / Revenue", "Charge", "Units", "Service date", "Dx pointers"],
      rows: c837.claims.flatMap((c) => c.serviceLines.map((s) => [
        c.claimId, s.procedure || s.revenueCode || "", s.charge, s.units, s.serviceDate ?? "", s.diagnosisPointers.join(" "),
      ])),
    });
  } else if (result.acknowledgment) {
    fileBase = "edianalyst-999-acknowledgment";
    const a = result.acknowledgment;
    tables.push({
      name: "Transactions",
      columns: ["Set", "Control #", "Status", "Segment errors"],
      rows: a.transactions.map((t) => [t.setId, t.controlNumber, t.status, t.segmentErrors.length]),
    });
    tables.push({
      name: "Errors",
      columns: ["Set", "Control #", "Segment", "Position", "Loop", "Segment error", "Element errors"],
      rows: a.transactions.flatMap((t) => t.segmentErrors.map((e) => [
        t.setId, t.controlNumber, e.segmentId, e.position, e.loopId ?? "", e.error,
        join(e.elementErrors.map((el) => `el ${el.position} ${el.error}${el.badValue ? ` "${el.badValue}"` : ""}`)),
      ])),
    });
  } else if (result.premium) {
    fileBase = "edianalyst-820-premiums";
    tables.push({
      name: "Premiums",
      columns: ["Reference", "Name", "Type", "Amount paid", "Premium amount"],
      rows: result.premium.lines.map((l) => [l.reference, l.name, l.referenceType, l.amountPaid, l.premiumAmount ?? ""]),
    });
  } else if (result.eligibility) {
    const e = result.eligibility;
    fileBase = `edianalyst-${result.kind}-eligibility`;
    tables.push({
      name: "Members",
      columns: ["Name", "Member ID", "Relationship", "DOB", "Gender", "Coverage", e.variant === "response" ? "Benefits" : "Requested services"],
      rows: e.members.map((m) => [
        m.name, m.memberId, m.relationship, m.dob ?? "", m.gender ?? "", m.coverageStatus,
        join(m.lines.map((l) => (e.variant === "response" ? `${l.serviceType}: ${l.status}` : l.serviceType))),
      ]),
    });
  } else if (result.claimStatus) {
    const s = result.claimStatus;
    fileBase = `edianalyst-${result.kind.toLowerCase()}-status`;
    tables.push({
      name: "Claims",
      columns: ["Claim ID", "Patient", "Member ID", "Payer claim #", "Status", "Charge"],
      rows: s.claims.map((c) => [c.claimId, c.patientName, c.memberId, c.payerClaimId ?? "", c.primaryStatus, c.totalCharge ?? ""]),
    });
  } else {
    tables.push({ name: "Segments", columns: ["Index", "Tag", "Raw"], rows: result.segments.map((s) => [s.index, s.tag, s.raw]) });
  }

  tables.push(findingsTable(result.report.findings));
  return { fileBase, tables };
}

/** Export the member diff (spec §10) — one row per change. */
export function buildDiffExport(diffs: MemberDiff[]): ExportBundle {
  const rows: (string | number)[][] = [];
  for (const d of diffs) {
    if (d.kind === "changed" && d.changes.length) {
      for (const c of d.changes) rows.push([d.kind, d.display, c.label, c.before, c.after]);
    } else {
      rows.push([d.kind, d.display, "", "", ""]);
    }
  }
  return {
    fileBase: "edianalyst-834-diff",
    tables: [{ name: "Diff", columns: ["Change", "Member", "Field", "Before", "After"], rows }],
  };
}
