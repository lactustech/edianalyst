import { describe, expect, it } from "vitest";
import { analyze } from "../lib/analyze";
import { isa, readFixture } from "./helpers";

function file(...claimBlocks: string[][]): string {
  const txn = [
    "ST*837*0001*005010X223A2",
    "BHT*0019*00*BATCH0001*20210901*1200*CH",
    "NM1*41*2*SUBMITTER CLEARINGHOUSE*****46*SUB001",
    "NM1*40*2*MEDICARE NATIONAL*****46*PAYER01",
    "HL*1**20*1",
    "NM1*85*2*MERCY GENERAL HOSPITAL*****XX*1234567893",
    "REF*EI*741234567",
    ...claimBlocks.flat(),
  ];
  txn.push(`SE*${txn.length + 1}*0001`);
  return [
    isa(),
    "GS*HC*P*R*20210901*1200*4001*X*005010X223A2",
    ...txn,
    "GE*1*4001",
    "IEA*1*000000001",
  ].join("~") + "~";
}

// Inpatient claim totalling 5000.00 across two SV2 lines.
function inpatientClaim(hl: number, ctrl: string, opts: { total?: string; dropRev?: boolean } = {}): string[] {
  return [
    `HL*${hl}*1*22*0`,
    "SBR*P*18*GRP0001******MA",
    "NM1*IL*1*DOE*JOHN****MI*MEM001",
    "DMG*D8*19500101*M",
    "NM1*PR*2*MEDICARE NATIONAL*****PI*PAYER01",
    `CLM*${ctrl}*${opts.total ?? "5000.00"}***11:A:1*Y*A*Y*Y`,
    "DTP*434*RD8*20210202-20210205",
    "HI*ABK:I509",
    "NM1*71*1*ATTENDING*PHYSICIAN****XX*1999999994",
    "LX*1",
    `SV2*${opts.dropRev ? "" : "0120"}**2000.00*DA*3`,
    "DTP*472*D8*20210202",
    "LX*2",
    "SV2*0300*HC:80053*3000.00*UN*1",
    "DTP*472*D8*20210203",
  ];
}

describe("837I (institutional) variant", () => {
  it("detects the institutional variant from SV2 lines", () => {
    const r = analyze(file(inpatientClaim(2, "IP001")));
    expect(r.kind).toBe("837");
    expect(r.claims!.variant).toBe("institutional");
  });

  it("reads type of bill and revenue codes", () => {
    const claim = analyze(file(inpatientClaim(2, "IP001"))).claims!.claims[0]!;
    expect(claim.variant).toBe("institutional");
    expect(claim.settingType).toBe("Type of bill");
    expect(claim.setting).toBe("Hospital — inpatient");
    expect(claim.totalCharge).toBe(5000);

    const roomLine = claim.serviceLines[0]!;
    expect(roomLine.revenueCode).toBe("0120");
    expect(roomLine.revenueDescription).toBe("Room & board — semi-private");
    expect(roomLine.units).toBe(3);

    const labLine = claim.serviceLines[1]!;
    expect(labLine.revenueCode).toBe("0300");
    expect(labLine.procedure).toBe("80053");
  });

  it("stays silent on a clean, balanced institutional claim", () => {
    const { report } = analyze(file(inpatientClaim(2, "IP001")));
    expect(report.findings.filter((f) => f.severity !== "info")).toEqual([]);
  });

  it("flags a service line with no revenue code", () => {
    const { report } = analyze(file(inpatientClaim(2, "IP001", { dropRev: true })));
    expect(report.findings.some((f) => f.message.includes("no revenue code"))).toBe(true);
  });

  it("parses the clean 837I fixture, all balanced", () => {
    const { kind, claims, report } = analyze(readFixture("clean-837i.edi"));
    expect(kind).toBe("837");
    expect(claims!.variant).toBe("institutional");
    expect(claims!.claims.length).toBeGreaterThan(0);
    expect(report.findings.some((f) => f.message.includes("doesn't balance"))).toBe(false);
    expect(report.findings.some((f) => f.message.includes("no revenue code"))).toBe(false);
  });

  it("trips balancing, missing-diagnosis, and missing-revenue checks on the corrupt fixture", () => {
    const msgs = analyze(readFixture("corrupt-837i.edi")).report.findings.map((f) => f.message);
    expect(msgs.some((m) => m.includes("doesn't balance"))).toBe(true);
    expect(msgs.some((m) => m.includes("has no diagnosis"))).toBe(true);
    expect(msgs.some((m) => m.includes("no revenue code"))).toBe(true);
  });
});
