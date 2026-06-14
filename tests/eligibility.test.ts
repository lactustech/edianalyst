import { describe, expect, it } from "vitest";
import { analyze } from "../lib/analyze";
import { isa, readFixture } from "./helpers";

function file(code: "270" | "271", body: string[]): string {
  const txn = [`ST*${code}*0001*005010X279A1`, `BHT*0022*${code === "271" ? "11" : "13"}*REF*20210901*1200`, ...body];
  txn.push(`SE*${txn.length + 1}*0001`);
  return [
    isa(),
    `GS*${code === "271" ? "HB" : "HS"}*P*R*20210901*1200*7001*X*005010X279A1`,
    ...txn,
    "GE*1*7001",
    "IEA*1*000000001",
  ].join("~") + "~";
}

const SOURCE_RECEIVER = [
  "HL*1**20*1",
  "NM1*PR*2*BLUE SAMPLE INSURANCE*****PI*PAYER01",
  "HL*2*1*21*1",
  "NM1*1P*2*GOOD HEALTH CLINIC*****XX*1234567893",
];

describe("270 eligibility inquiry", () => {
  const body = [
    ...SOURCE_RECEIVER,
    "HL*3*2*22*0",
    "NM1*IL*1*DOE*JANE****MI*MEM001",
    "DMG*D8*19800101*F",
    "EQ*30",
    "EQ*98",
  ];

  it("routes to the eligibility model as an inquiry", () => {
    const r = analyze(file("270", body));
    expect(r.kind).toBe("270");
    expect(r.eligibility!.variant).toBe("inquiry");
    expect(r.eligibility!.payerName).toBe("BLUE SAMPLE INSURANCE");
    expect(r.eligibility!.providerName).toBe("GOOD HEALTH CLINIC");
  });

  it("lists the requested service types per member", () => {
    const m = analyze(file("270", body)).eligibility!.members[0]!;
    expect(m.name).toBe("DOE, JANE");
    expect(m.memberId).toBe("MEM001");
    expect(m.lines.map((l) => l.serviceType)).toEqual(["Plan coverage (general benefits)", "Office visit (professional)"]);
  });
});

describe("271 eligibility response", () => {
  const active = [
    ...SOURCE_RECEIVER,
    "HL*3*2*22*0",
    "NM1*IL*1*ACTIVE*ALICE****MI*MEM001",
    "EB*1*FAM*30**GOLD PPO PLAN",
    "EB*B**98****25",
  ];
  const inactive = [
    ...SOURCE_RECEIVER,
    "HL*3*2*22*0",
    "NM1*IL*1*GONE*GREG****MI*MEM002",
    "EB*6**30",
  ];

  it("derives an Active coverage status and decodes benefit lines", () => {
    const m = analyze(file("271", active)).eligibility!.members[0]!;
    expect(m.coverageStatus).toBe("Active");
    expect(m.lines[0]).toMatchObject({ status: "Active coverage", serviceType: "Plan coverage (general benefits)", planDescription: "GOLD PPO PLAN" });
    expect(m.lines[1]).toMatchObject({ status: "Co-payment", serviceType: "Office visit (professional)", amount: 25 });
  });

  it("flags inactive coverage as a warning", () => {
    const { report } = analyze(file("271", inactive));
    expect(report.findings.some((f) => f.severity === "warning" && f.message.includes("inactive"))).toBe(true);
  });

  it("parses the clean 270 and 271 fixtures", () => {
    const r270 = analyze(readFixture("clean-270.edi"));
    const r271 = analyze(readFixture("clean-271.edi"));
    expect(r270.kind).toBe("270");
    expect(r271.kind).toBe("271");
    expect(r271.eligibility!.totals.active).toBeGreaterThan(0);
    expect(r271.eligibility!.totals.inactive).toBeGreaterThan(0);
  });
});
