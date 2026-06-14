import { describe, expect, it } from "vitest";
import { analyze } from "../lib/analyze";
import { diffMembers, memberKey } from "../lib/diff/member-diff";
import type { MemberRow } from "../lib/transform/member834";
import { readFixture } from "./helpers";

function member(over: Partial<MemberRow> = {}): MemberRow {
  return {
    subscriberId: "S1",
    memberId: "M1",
    lastName: "DOE",
    firstName: "JANE",
    isSubscriber: true,
    relationship: "Self (the subscriber)",
    maintenanceType: "Addition",
    maintenanceTypeCode: "021",
    maintenanceTone: "green",
    coverages: [],
    sourceSegmentIndices: [],
    ...over,
  };
}

describe("diffMembers", () => {
  it("classifies added, terminated, changed, and unchanged", () => {
    const before = [
      member({ memberId: "M1" }),
      member({ memberId: "M2", firstName: "BOB" }),
      member({ memberId: "M3", firstName: "SUE" }),
    ];
    const after = [
      member({ memberId: "M1" }), // unchanged
      member({ memberId: "M2", firstName: "ROBERT" }), // changed
      // M3 dropped -> terminated
      member({ memberId: "M4", firstName: "NEW" }), // added
    ];

    const { summary } = diffMembers(before, after);
    expect(summary).toEqual({ added: 1, terminated: 1, changed: 1, unchanged: 1 });
  });

  it("reports field-level before -> after for changed members", () => {
    const before = [member({ benefitStatus: "Active", eligibilityEnd: undefined })];
    const after = [member({ benefitStatus: "COBRA continuation", eligibilityEnd: "2022-06-30" })];

    const { diffs } = diffMembers(before, after);
    const changed = diffs.find((d) => d.kind === "changed")!;
    expect(changed).toBeDefined();
    const fields = Object.fromEntries(changed.changes.map((c) => [c.field, c]));
    expect(fields.benefitStatus).toMatchObject({ before: "Active", after: "COBRA continuation" });
    expect(fields.eligibilityEnd).toMatchObject({ before: "", after: "2022-06-30" });
  });

  it("ignores maintenance type when deciding changed vs unchanged", () => {
    // Same member state, different transaction intent — must read as unchanged.
    const before = [member({ maintenanceTypeCode: "021", maintenanceType: "Addition" })];
    const after = [member({ maintenanceTypeCode: "030", maintenanceType: "Audit or comparison" })];
    const { summary } = diffMembers(before, after);
    expect(summary.unchanged).toBe(1);
    expect(summary.changed).toBe(0);
  });

  it("detects a coverage change", () => {
    const before = [member({ coverages: [{ line: "Health", lineCode: "HLT", level: "Employee only", begin: "2021-01-01" }] })];
    const after = [member({ coverages: [{ line: "Health", lineCode: "HLT", level: "Family", begin: "2021-01-01" }] })];
    const { diffs } = diffMembers(before, after);
    expect(diffs[0]!.kind).toBe("changed");
    expect(diffs[0]!.changes.some((c) => c.field === "coverages")).toBe(true);
  });

  it("keys members on subscriber + member id", () => {
    expect(memberKey({ subscriberId: "S9", memberId: "M9" })).toBe("S9|M9");
  });

  it("diffs the generated v1 -> v2 fixture pair", () => {
    const v1 = analyze(readFixture("diff-v1-834.edi")).enrollment!.members;
    const v2 = analyze(readFixture("diff-v2-834.edi")).enrollment!.members;
    const { summary, diffs } = diffMembers(v1, v2);

    // v2 was derived from v1 with appended new subscribers and field edits.
    expect(summary.added).toBeGreaterThan(0);
    expect(diffs.length).toBe(summary.added + summary.terminated + summary.changed + summary.unchanged);
    // Every diff row carries a stable key and a display label.
    expect(diffs.every((d) => d.key.includes("|") && d.display.length > 0)).toBe(true);
  });
});
