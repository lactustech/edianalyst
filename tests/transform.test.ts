import { describe, expect, it } from "vitest";
import { analyze } from "../lib/analyze";
import { isa } from "./helpers";

function file(...memberSegs: string[]): string {
  const txn = [
    "ST*834*0001",
    "BGN*22*REF*20210901*1200****2",
    "DTP*007*D8*20210901",
    "QTY*DT*2",
    "N1*P5*ACME EMPLOYER*FI*99",
    "N1*IN*BLUE SAMPLE*FI*88",
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

const SUBSCRIBER = [
  "INS*Y*18*021*28*A***FT",
  "REF*0F*100200300",
  "REF*23*555000111",
  "DTP*356*D8*20210501",
  "NM1*IL*1*DOE*JANE*Q***34*555000111",
  "N3*1 MAIN ST",
  "N4*AUSTIN*TX*78701",
  "DMG*D8*19800215*F",
  "HD*021**HLT*HLT PLAN*FAM",
  "DTP*348*D8*20210501",
];

const DEPENDENT = [
  "INS*N*19*021*28*A",
  "REF*0F*100200300",
  "REF*23*555000112",
  "NM1*IL*1*DOE*TOMMY****34*555000112",
  "DMG*D8*20150601*M",
  "HD*021**DEN*DEN PLAN*FAM",
  "DTP*348*D8*20210501",
];

describe("transform834", () => {
  it("reads the purpose from BGN01 and the action code from BGN08", () => {
    const { enrollment } = analyze(file(...SUBSCRIBER));
    expect(enrollment?.purposeCode).toBe("22");
    expect(enrollment?.purpose).toBe("Information copy");
    expect(enrollment?.actionCode).toBe("2");
    expect(enrollment?.action).toBe("Change file — updates only");
  });

  it("produces one row per member with decoded fields", () => {
    const { enrollment } = analyze(file(...SUBSCRIBER, ...DEPENDENT));
    expect(enrollment?.members).toHaveLength(2);

    const sub = enrollment!.members[0]!;
    expect(sub).toMatchObject({
      subscriberId: "100200300",
      memberId: "555000111",
      lastName: "DOE",
      firstName: "JANE",
      middle: "Q",
      isSubscriber: true,
      relationship: "Self (the subscriber)",
      maintenanceType: "Addition",
      maintenanceTypeCode: "021",
      maintenanceTone: "green",
      gender: "Female",
    });
    expect(sub.dob).toBe("1980-02-15");
    expect(sub.eligibilityBegin).toBe("2021-05-01");
    expect(sub.address).toEqual({ street: "1 MAIN ST", city: "AUSTIN", state: "TX", zip: "78701" });
    expect(sub.coverages).toEqual([
      { line: "Health", lineCode: "HLT", level: "Family", begin: "2021-05-01", end: undefined },
    ]);
  });

  it("decodes the dependent relationship and falls back to NM109 for member id", () => {
    const { enrollment } = analyze(file(...DEPENDENT));
    const dep = enrollment!.members[0]!;
    expect(dep.relationship).toBe("Child");
    expect(dep.isSubscriber).toBe(false);
    expect(dep.memberId).toBe("555000112");
  });

  it("tallies maintenance buckets for the summary bar", () => {
    const term = SUBSCRIBER.map((s) => s.replace("*021*", "*024*"));
    const { enrollment } = analyze(file(...SUBSCRIBER, ...term));
    expect(enrollment?.counts.additions).toBe(1);
    expect(enrollment?.counts.terminations).toBe(1);
  });

  it("links each row back to its source segment indices", () => {
    const { enrollment } = analyze(file(...SUBSCRIBER));
    const row = enrollment!.members[0]!;
    expect(row.sourceSegmentIndices.length).toBe(SUBSCRIBER.length);
  });
});
