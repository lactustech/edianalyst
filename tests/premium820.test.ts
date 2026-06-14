import { describe, expect, it } from "vitest";
import { analyze } from "../lib/analyze";
import { isa, readFixture } from "./helpers";

function file(...lineBlocks: string[][]): string {
  const txn = [
    "ST*820*0001*005010X218",
    "BPR*I*700.00*C*ACH*CCP*01*1*DA*1*1**01*2*DA*2*20210901",
    "TRN*1*PREMIT0001",
    "N1*PR*ACME EMPLOYER GROUP*FI*991234567",
    "N1*PE*BLUE SAMPLE INSURANCE*FI*880011223",
    ...lineBlocks.flat(),
  ];
  txn.push(`SE*${txn.length + 1}*0001`);
  return [
    isa(),
    "GS*RA*E*I*20210901*1200*6001*X*005010X218",
    ...txn,
    "GE*1*6001",
    "IEA*1*000000001",
  ].join("~") + "~";
}

const LINE_A = ["ENT*1", "NM1*IL*1*DOE*JANE****34*111", "RMR*1L*POL00001**300.00*300.00", "DTM*582*20210901"];
const LINE_B = ["ENT*2", "NM1*IL*1*SMITH*BOB****34*222", "RMR*1L*POL00002**400.00*400.00", "DTM*582*20210901"];

describe("transform820", () => {
  it("routes an 820 and reads the payment summary", () => {
    const r = analyze(file(LINE_A, LINE_B));
    expect(r.kind).toBe("820");
    expect(r.premium!.totalPaid).toBe(700);
    expect(r.premium!.paymentMethod).toBe("ACH / electronic funds transfer");
    expect(r.premium!.payerName).toBe("ACME EMPLOYER GROUP");
    expect(r.premium!.payeeName).toBe("BLUE SAMPLE INSURANCE");
  });

  it("builds one row per premium line with decoded reference and name", () => {
    const { premium } = analyze(file(LINE_A, LINE_B));
    expect(premium!.lines).toHaveLength(2);
    expect(premium!.lines[0]).toMatchObject({
      referenceType: "Group or policy number",
      reference: "POL00001",
      amountPaid: 300,
      name: "DOE, JANE",
    });
    expect(premium!.totals.paid).toBe(700);
  });
});

describe("820 validation", () => {
  it("stays silent when the summary matches the lines", () => {
    const { report } = analyze(file(LINE_A, LINE_B));
    expect(report.findings.filter((f) => f.severity !== "info")).toEqual([]);
  });

  it("flags a payment-summary mismatch on the corrupt fixture", () => {
    const msgs = analyze(readFixture("corrupt-820.edi")).report.findings.map((f) => f.message);
    expect(msgs.some((m) => m.includes("payment summary says"))).toBe(true);
  });

  it("parses the clean 820 fixture, balanced", () => {
    const { kind, premium, report } = analyze(readFixture("clean-820.edi"));
    expect(kind).toBe("820");
    expect(premium!.lines.length).toBeGreaterThan(0);
    expect(report.findings.some((f) => f.message.includes("payment summary says"))).toBe(false);
  });
});
