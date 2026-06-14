import { describe, expect, it } from "vitest";
import { analyze } from "../lib/analyze";
import { isa, readFixture } from "./helpers";

function file(body: string[]): string {
  const txn = ["ST*999*0001*005010X231A1", ...body];
  txn.push(`SE*${txn.length + 1}*0001`);
  return [
    isa(),
    "GS*FA*P*R*20210901*1200*5001*X*005010X231A1",
    ...txn,
    "GE*1*5001",
    "IEA*1*000000001",
  ].join("~") + "~";
}

const BODY = [
  "AK1*HC*17456*005010X222A1",
  "AK2*837*0001*005010X222A1",
  "IK5*A",
  "AK2*837*0002*005010X222A1",
  "IK3*CLM*22*2300*8",
  "CTX*SITUATIONAL TRIGGER:CLM*CLM*22",
  "IK4*5*1331*7*99",
  "IK5*R*5",
  "AK9*P*2*2*1",
];

describe("transform999 + routing", () => {
  it("routes a 999 to the acknowledgment model", () => {
    const r = analyze(file(BODY));
    expect(r.kind).toBe("999");
    expect(r.acknowledgment).toBeDefined();
  });

  it("decodes what was acknowledged and the group outcome", () => {
    const ack = analyze(file(BODY)).acknowledgment!;
    expect(ack.functionalId).toBe("Health care claim (837)");
    expect(ack.groupControlNumber).toBe("17456");
    expect(ack.groupStatus).toBe("Partially accepted — some transactions rejected");
    expect(ack.counts).toEqual({ included: 2, received: 2, accepted: 1 });
    expect(ack.totals).toMatchObject({ transactions: 2, accepted: 1, rejected: 1 });
  });

  it("captures segment- and element-level errors with decoded text", () => {
    const ack = analyze(file(BODY)).acknowledgment!;
    const rejected = ack.transactions[1]!;
    expect(rejected.status).toBe("Rejected");
    expect(rejected.segmentErrors).toHaveLength(1);
    const segErr = rejected.segmentErrors[0]!;
    expect(segErr).toMatchObject({ segmentId: "CLM", position: "22", loopId: "2300", error: "Segment has one or more bad data elements" });
    expect(segErr.context[0]).toContain("CLM");
    expect(segErr.elementErrors[0]).toMatchObject({ elementRef: "1331", error: "Element has an invalid code value", badValue: "99" });
  });
});

describe("999 validation", () => {
  it("surfaces the rejected transaction and the partial group", () => {
    const msgs = analyze(file(BODY)).report.findings;
    expect(msgs.some((f) => f.severity === "error" && f.message.includes("837 #0002 was rejected"))).toBe(true);
    expect(msgs.some((f) => f.message.includes("Part of the functional group"))).toBe(true);
  });

  it("stays clean when everything was accepted", () => {
    const allOk = ["AK1*HC*17456*005010X222A1", "AK2*837*0001*005010X222A1", "IK5*A", "AK9*A*1*1*1"];
    const { report } = analyze(file(allOk));
    expect(report.findings).toEqual([]);
  });

  it("flags AK9 count mismatches on the corrupt fixture", () => {
    const msgs = analyze(readFixture("corrupt-999.edi")).report.findings.map((f) => f.message);
    expect(msgs.some((m) => m.includes("transaction(s) were included, but"))).toBe(true);
  });

  it("parses the clean 999 fixture", () => {
    const { kind, acknowledgment } = analyze(readFixture("clean-999.edi"));
    expect(kind).toBe("999");
    expect(acknowledgment!.transactions.length).toBeGreaterThan(0);
  });
});
