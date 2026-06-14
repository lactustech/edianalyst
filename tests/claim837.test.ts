import { describe, expect, it } from "vitest";
import { analyze } from "../lib/analyze";
import { isa, readFixture } from "./helpers";

function file(...claimBlocks: string[][]): string {
  const txn = [
    "ST*837*0001",
    "BHT*0019*00*BATCH0001*20210901*1200*CH",
    "NM1*41*2*SUBMITTER CLEARINGHOUSE*****46*SUB001",
    "NM1*40*2*BLUE SAMPLE INSURANCE*****46*PAYER01",
    "HL*1**20*1",
    "NM1*85*2*GOOD HEALTH CLINIC*****XX*1234567893",
    "N3*100 CARE BLVD",
    "N4*AUSTIN*TX*78701",
    "REF*EI*741234567",
    ...claimBlocks.flat(),
  ];
  txn.push(`SE*${txn.length + 1}*0001`);
  return [
    isa(),
    "GS*HC*P*R*20210901*1200*3001*X*005010X222A1",
    ...txn,
    "GE*1*3001",
    "IEA*1*000000001",
  ].join("~") + "~";
}

// A balanced claim with two diagnoses and two lines summing to 300.00.
function subscriberClaim(hl: number, ctrl: string, opts: { total?: string; pointer?: string; dropDx?: boolean } = {}): string[] {
  const block = [
    `HL*${hl}*1*22*0`,
    "SBR*P*18*GRP0001******CI",
    "NM1*IL*1*DOE*JANE****MI*MEM001",
    "DMG*D8*19800101*F",
    "NM1*PR*2*BLUE SAMPLE INSURANCE*****PI*PAYER01",
    `CLM*${ctrl}*${opts.total ?? "300.00"}***11:B:1*Y*A*Y*Y`,
  ];
  if (!opts.dropDx) block.push("HI*ABK:E1165*ABF:I10");
  block.push(
    "LX*1",
    `SV1*HC:99213*100.00*UN*1***${opts.pointer ?? "1"}`,
    "DTP*472*D8*20210610",
    "LX*2",
    "SV1*HC:80053*200.00*UN*1***2",
    "DTP*472*D8*20210610",
  );
  return block;
}

describe("transform837 + routing", () => {
  it("routes an 837 to the claims model", () => {
    const r = analyze(file(subscriberClaim(2, "PT001")));
    expect(r.kind).toBe("837");
    expect(r.transactionCodes).toContain("837");
    expect(r.claims).toBeDefined();
  });

  it("carries hierarchy context onto each claim", () => {
    const claim = analyze(file(subscriberClaim(2, "PT001"))).claims!.claims[0]!;
    expect(claim).toMatchObject({
      claimId: "PT001",
      totalCharge: 300,
      placeOfService: "Doctor's office",
      frequency: "Original claim",
      subscriberName: "DOE, JANE",
      payerName: "BLUE SAMPLE INSURANCE",
      billingProviderName: "GOOD HEALTH CLINIC",
      billingProviderNpi: "1234567893",
      filing: "Commercial insurance",
    });
    expect(claim.diagnoses.map((d) => d.code)).toEqual(["E1165", "I10"]);
    expect(claim.diagnoses[0]!.primary).toBe(true);
    expect(claim.serviceLines).toHaveLength(2);
    expect(claim.serviceLines[0]).toMatchObject({ procedure: "99213", charge: 100, diagnosisPointers: ["1"] });
  });

  it("keeps multiple subscribers/claims separate", () => {
    const r = analyze(file(subscriberClaim(2, "PT001"), subscriberClaim(3, "PT002")));
    expect(r.claims!.claims.map((c) => c.claimId)).toEqual(["PT001", "PT002"]);
    expect(r.claims!.totals.claims).toBe(2);
  });
});

describe("837 validation", () => {
  it("stays silent on a clean, balanced claim", () => {
    const { report } = analyze(file(subscriberClaim(2, "PT001")));
    expect(report.findings.filter((f) => f.severity !== "info")).toEqual([]);
  });

  it("flags an unbalanced claim total", () => {
    const { report } = analyze(file(subscriberClaim(2, "PT001", { total: "999.00" })));
    expect(report.findings.some((f) => f.message.includes("PT001 doesn't balance"))).toBe(true);
  });

  it("flags a diagnosis pointer that isn't on the claim", () => {
    const { report } = analyze(file(subscriberClaim(2, "PT001", { pointer: "9" })));
    expect(report.findings.some((f) => f.message.includes("points to diagnosis #9"))).toBe(true);
  });

  it("flags a claim with no diagnosis", () => {
    const { report } = analyze(file(subscriberClaim(2, "PT001", { dropDx: true })));
    expect(report.findings.some((f) => f.message.includes("has no diagnosis"))).toBe(true);
  });

  it("trips balancing, pointer, and missing-diagnosis checks on the corrupt fixture", () => {
    const { report } = analyze(readFixture("corrupt-837.edi"));
    const msgs = report.findings.map((f) => f.message);
    expect(msgs.some((m) => m.includes("doesn't balance"))).toBe(true);
    expect(msgs.some((m) => m.includes("points to diagnosis #9"))).toBe(true);
    expect(msgs.some((m) => m.includes("has no diagnosis"))).toBe(true);
  });

  it("parses the clean 837 fixture with balanced claims", () => {
    const { kind, claims, report } = analyze(readFixture("clean-837.edi"));
    expect(kind).toBe("837");
    expect(claims!.claims.length).toBeGreaterThan(0);
    expect(report.findings.some((f) => f.message.includes("doesn't balance"))).toBe(false);
  });
});
