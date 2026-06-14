import { describe, expect, it } from "vitest";
import { analyze } from "../lib/analyze";
import { readFixture } from "./helpers";

describe("generated fixtures", () => {
  it("the clean 834 parses with no error-severity findings", () => {
    const { enrollment, report, transactionCodes } = analyze(readFixture("clean-834.edi"));
    expect(transactionCodes).toContain("834");
    expect(enrollment).toBeDefined();
    expect(enrollment!.members.length).toBeGreaterThan(0);
    // Envelope math is correct, so no errors — warnings/info may still appear.
    expect(report.counts.error).toBe(0);
    // Control total matches the parsed member count.
    expect(enrollment!.declaredMemberCount).toBe(enrollment!.members.length);
    expect(enrollment!.counts.additions).toBeGreaterThan(0);
  });

  it("the corrupt 834 trips the expected validation findings", () => {
    const { report } = analyze(readFixture("corrupt-834.edi"));
    const msgs = report.findings.map((f) => f.message);

    // Broken interchange control number (ISA13 vs IEA02).
    expect(msgs.some((m) => m.includes("interchange control numbers don't match"))).toBe(true);
    // Broken SE segment count.
    expect(msgs.some((m) => m.includes("segment count is off"))).toBe(true);
    // Bad QTY control total.
    expect(msgs.some((m) => m.includes("control total says"))).toBe(true);
    // Malformed (non-D8) birth date injected by --corrupt.
    expect(msgs.some((m) => m.includes("isn't a valid calendar date"))).toBe(true);
    expect(report.counts.error).toBeGreaterThan(0);
  });

  it("the diff v1/v2 pair both parse cleanly as 834s", () => {
    const v1 = analyze(readFixture("diff-v1-834.edi"));
    const v2 = analyze(readFixture("diff-v2-834.edi"));
    expect(v1.enrollment!.members.length).toBeGreaterThan(0);
    expect(v2.enrollment!.members.length).toBeGreaterThan(v1.enrollment!.members.length - 1);
    // v2 was derived with terminations/changes, so its mix differs from v1.
    expect(v2.enrollment!.counts.terminations).toBeGreaterThan(0);
  });
});
