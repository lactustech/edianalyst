import { describe, expect, it } from "vitest";
import { analyze } from "../lib/analyze";
import { isa } from "./helpers";

function file(opts: { qty?: number; members: string[][] }): string {
  const memberSegs = opts.members.flat();
  const txn = [
    "ST*834*0001",
    "BGN*00*REF*20210901*1200****00",
    `QTY*DT*${opts.qty ?? opts.members.length}`,
    ...memberSegs,
  ];
  // SE01 counts ST..SE inclusive — compute it so the envelope check stays quiet.
  txn.push(`SE*${txn.length + 1}*0001`);
  const body = [
    isa(),
    "GS*BE*S*R*20210901*1200*1001*X*005010X220A1",
    ...txn,
    "GE*1*1001",
    "IEA*1*000000001",
  ];
  return body.join("~") + "~";
}

const clean = [
  "INS*Y*18*021*28*A",
  "REF*0F*100200300",
  "NM1*IL*1*DOE*JANE",
  "DTP*356*D8*20210101",
  "HD*021**HLT*HLT PLAN*FAM",
  "DTP*348*D8*20210101",
];

function findMessages(text: string): string[] {
  return analyze(text).report.findings.map((f) => f.message);
}

describe("834 rules", () => {
  it("stays silent on a clean member", () => {
    const warnings = analyze(file({ members: [clean] })).report.findings.filter(
      (f) => f.severity !== "info",
    );
    expect(warnings).toEqual([]);
  });

  it("flags an unknown relationship code but still shows the member", () => {
    const member = ["INS*Y*77*021*28*A", "REF*0F*1", "NM1*IL*1*DOE*JANE"];
    const msgs = findMessages(file({ members: [member] }));
    expect(msgs.some((m) => m.includes('unfamiliar relationship code "77"'))).toBe(true);
  });

  it("flags a missing maintenance type", () => {
    const member = ["INS*Y*18**28*A", "REF*0F*1", "NM1*IL*1*DOE*JANE"];
    const msgs = findMessages(file({ members: [member] }));
    expect(msgs.some((m) => m.includes("missing its change type"))).toBe(true);
  });

  it("flags a member loop with no name segment", () => {
    const member = ["INS*Y*18*021*28*A", "REF*0F*1"];
    const msgs = findMessages(file({ members: [member] }));
    expect(msgs.some((m) => m.includes("no name segment"))).toBe(true);
  });

  it("flags an invalid (non-D8) date", () => {
    const member = ["INS*Y*18*021*28*A", "REF*0F*1", "NM1*IL*1*DOE*JANE", "DTP*356*D8*2021"];
    const msgs = findMessages(file({ members: [member] }));
    expect(msgs.some((m) => m.includes("isn't a valid calendar date"))).toBe(true);
  });

  it("flags eligibility end before begin", () => {
    const member = [
      "INS*Y*18*021*28*A", "REF*0F*1", "NM1*IL*1*DOE*JANE",
      "DTP*356*D8*20211231", "DTP*357*D8*20210101",
    ];
    const msgs = findMessages(file({ members: [member] }));
    expect(msgs.some((m) => m.includes("before its begin date"))).toBe(true);
  });

  it("flags an invalid birth date in a DMG segment", () => {
    const member = ["INS*Y*18*021*28*A", "REF*0F*1", "NM1*IL*1*DOE*JANE", "DMG*D8*2021*F"];
    const msgs = findMessages(file({ members: [member] }));
    expect(msgs.some((m) => m.includes("birth date reads"))).toBe(true);
  });

  it("cross-checks the QTY control total against the member count", () => {
    const msgs = findMessages(file({ qty: 9, members: [clean] }));
    expect(msgs.some((m) => m.includes("control total says 9"))).toBe(true);
  });
});
