import { describe, expect, it } from "vitest";
import { analyze } from "../lib/analyze";
import { isa, readFixture } from "./helpers";

function file(code: "276" | "277", version: string, gs: string, body: string[]): string {
  const txn = [`ST*${code}*0001*${version}`, `BHT*0010*${code === "276" ? "13" : "08"}*REF*20210901*1200`, ...body];
  txn.push(`SE*${txn.length + 1}*0001`);
  return [
    isa(),
    `GS*${gs}*P*R*20210901*1200*8001*X*${version}`,
    ...txn,
    "GE*1*8001",
    "IEA*1*000000001",
  ].join("~") + "~";
}

const HEADER = [
  "HL*1**20*1",
  "NM1*PR*2*BLUE SAMPLE INSURANCE*****PI*PAYER01",
  "HL*2*1*21*1",
  "NM1*41*2*GOOD HEALTH CLINIC*****46*RCV01",
];

function claim(hl: number, claimId: string, stc?: string): string[] {
  const block = [
    `HL*${hl}*2*22*0`,
    "NM1*QC*1*DOE*JANE****MI*MEM001",
    "TRN*2*9990001",
  ];
  if (stc) block.push(`STC*${stc}*20210901*WQ*250.00`);
  block.push(`REF*EJ*${claimId}`, "REF*1K*9990001", "AMT*T3*250.00");
  return block;
}

describe("276 claim status request", () => {
  it("routes as a request with no asserted status", () => {
    const r = analyze(file("276", "005010X212", "HR", [...HEADER, ...claim(3, "CLM001")]));
    expect(r.kind).toBe("276");
    expect(r.claimStatus!.variant).toBe("request");
    const c = r.claimStatus!.claims[0]!;
    expect(c.claimId).toBe("CLM001");
    expect(c.patientName).toBe("DOE, JANE");
    expect(c.primaryStatus).toBe("Status requested");
    expect(r.report.findings).toEqual([]);
  });
});

describe("277 claim status response", () => {
  it("decodes finalized/denied statuses and surfaces denials", () => {
    const body = [...HEADER, ...claim(3, "CLM001", "F1:107"), ...claim(4, "CLM002", "F2:65")];
    const r = analyze(file("277", "005010X212", "HN", body));
    expect(r.kind).toBe("277");
    expect(r.claimStatus!.variant).toBe("response");
    expect(r.claimStatus!.claims[0]!.primaryStatus).toBe("Finalized — paid");
    expect(r.claimStatus!.claims[0]!.outcome).toBe("finalized");
    expect(r.report.findings.some((f) => f.message.includes("CLM002 was denied"))).toBe(true);
  });
});

describe("277CA claim acknowledgment", () => {
  it("detects 277CA from the X214 version and flags rejections", () => {
    const body = [...HEADER, ...claim(3, "CLM001", "A2:20"), ...claim(4, "CLM002", "A3:21")];
    const r = analyze(file("277", "005010X214", "HN", body));
    expect(r.kind).toBe("277CA");
    expect(r.claimStatus!.variant).toBe("acknowledgment");
    expect(r.claimStatus!.claims[0]!.outcome).toBe("accepted");
    expect(r.report.findings.some((f) => f.severity === "error" && f.message.includes("CLM002 was rejected"))).toBe(true);
  });
});

describe("claim-status fixtures", () => {
  it("parses the generated 276/277/277CA fixtures", () => {
    expect(analyze(readFixture("clean-276.edi")).kind).toBe("276");
    const r277 = analyze(readFixture("clean-277.edi"));
    expect(r277.kind).toBe("277");
    expect(r277.claimStatus!.totals.claims).toBeGreaterThan(0);
    const rca = analyze(readFixture("clean-277ca.edi"));
    expect(rca.kind).toBe("277CA");
    expect(rca.claimStatus!.totals.accepted + rca.claimStatus!.totals.rejected).toBeGreaterThan(0);
  });
});
