import { describe, expect, it } from "vitest";
import { analyze } from "../lib/analyze";
import { isa, readFixture } from "./helpers";

function file(...claimSegs: string[]): string {
  const txn = [
    "ST*835*0001",
    "BPR*I*120.00*C*CHK*CCP*01*1*DA*1*1**01*2*DA*2*20210901",
    "TRN*1*CHECK12345*1999",
    "DTM*405*20210901",
    "N1*PR*BLUE SAMPLE INSURANCE",
    "N1*PE*GOOD HEALTH CLINIC*XX*1234567890",
    "LX*1",
    ...claimSegs,
  ];
  txn.push(`SE*${txn.length + 1}*0001`);
  return [
    isa(),
    "GS*HP*P*R*20210901*1200*2001*X*005010X221A1",
    ...txn,
    "GE*1*2001",
    "IEA*1*000000001",
  ].join("~") + "~";
}

// A balanced claim: charge 200 = paid 120 + CO/45 50 + PR/2 30.
const BALANCED = [
  "CLP*CLAIM001*1*200.00*120.00*30.00*MC*PCN999*11",
  "NM1*QC*1*DOE*JANE****MI*MEM001",
  "SVC*HC:99213*200.00*120.00**1",
  "DTM*472*20210815",
  "CAS*CO*45*50.00",
  "CAS*PR*2*30.00",
  "LQ*HE*M15",
];

describe("transform835 + routing", () => {
  it("routes an 835 to the remittance model", () => {
    const r = analyze(file(...BALANCED));
    expect(r.kind).toBe("835");
    expect(r.transactionCodes).toContain("835");
    expect(r.remittance).toBeDefined();
    expect(r.enrollment).toBeUndefined();
  });

  it("reads the payment summary and trace number", () => {
    const { remittance } = analyze(file(...BALANCED));
    expect(remittance!.totalPaid).toBe(120);
    expect(remittance!.paymentMethod).toBe("Paper check");
    expect(remittance!.paymentDate).toBe("2021-09-01");
    expect(remittance!.traceNumber).toBe("CHECK12345");
    expect(remittance!.payerName).toBe("BLUE SAMPLE INSURANCE");
  });

  it("builds a claim row with decoded status, filing, and service line", () => {
    const claim = analyze(file(...BALANCED)).remittance!.claims[0]!;
    expect(claim).toMatchObject({
      claimId: "CLAIM001",
      status: "Paid as primary",
      totalCharge: 200,
      totalPaid: 120,
      patientResponsibility: 30,
      filing: "Medicaid",
      patientName: "DOE, JANE",
    });
    expect(claim.serviceLines).toHaveLength(1);
    const svc = claim.serviceLines[0]!;
    expect(svc.procedure).toBe("99213");
    expect(svc.date).toBe("2021-08-15");
    expect(svc.adjustments.map((a) => a.reason)).toContain("Applied to coinsurance");
    expect(svc.remarks[0]).toMatchObject({ code: "M15" });
  });
});

describe("835 validation", () => {
  it("stays silent on a clean, balanced remittance fixture", () => {
    const { report } = analyze(readFixture("clean-835.edi"));
    expect(report.counts.error).toBe(0);
    // Balancing holds, so no balancing warnings.
    expect(report.findings.some((f) => f.message.includes("doesn't balance"))).toBe(false);
    expect(report.findings.some((f) => f.message.includes("payment summary says"))).toBe(false);
  });

  it("flags an unbalanced claim", () => {
    // Same claim but drop the PR adjustment -> charge-paid (80) != adjustments (50).
    const unbalanced = BALANCED.filter((s) => s !== "CAS*PR*2*30.00");
    const { report } = analyze(file(...unbalanced));
    expect(report.findings.some((f) => f.message.includes("CLAIM001 doesn't balance"))).toBe(true);
  });

  it("flags a payment-summary mismatch and balancing errors in the corrupt fixture", () => {
    const { report } = analyze(readFixture("corrupt-835.edi"));
    const msgs = report.findings.map((f) => f.message);
    expect(msgs.some((m) => m.includes("payment summary says"))).toBe(true);
    expect(msgs.some((m) => m.includes("doesn't balance"))).toBe(true);
    expect(msgs.some((m) => m.includes('unfamiliar status code "99"'))).toBe(true);
  });
});
