import { describe, expect, it } from "vitest";
import { parseX12 } from "../lib/x12";
import { isa } from "./helpers";

/** Assemble a one-transaction interchange with overridable control values. */
function interchange(opts: {
  ieaControl?: string;
  seCount?: number;
  seControl?: string;
  geCount?: number;
} = {}): string {
  const body = [
    isa("000000001"),
    "GS*BE*S*R*20210901*1200*1001*X*005010X220A1",
    "ST*834*0001",
    "BGN*00*REF*20210901*1200****00",
    "INS*Y*18*021*28*A",
    "NM1*IL*1*DOE*JANE",
    `SE*${opts.seCount ?? 5}*${opts.seControl ?? "0001"}`,
    `GE*${opts.geCount ?? 1}*1001`,
    `IEA*1*${opts.ieaControl ?? "000000001"}`,
  ];
  return body.join("~") + "~";
}

describe("envelope control totals", () => {
  it("a well-formed interchange produces no envelope findings", () => {
    const { findings } = parseX12(interchange());
    expect(findings).toEqual([]);
  });

  it("flags an interchange control number mismatch (ISA13 vs IEA02)", () => {
    const { findings } = parseX12(interchange({ ieaControl: "000000999" }));
    expect(findings.some((f) => f.message.includes("interchange control numbers don't match"))).toBe(true);
  });

  it("flags an SE segment-count mismatch", () => {
    const { findings } = parseX12(interchange({ seCount: 99 }));
    expect(findings.some((f) => f.message.includes("segment count is off"))).toBe(true);
  });

  it("flags an SE control-number mismatch (ST02 vs SE02)", () => {
    const { findings } = parseX12(interchange({ seControl: "9999" }));
    expect(findings.some((f) => f.message.includes("transaction set's control numbers don't match"))).toBe(true);
  });

  it("flags a GE transaction-count mismatch", () => {
    const { findings } = parseX12(interchange({ geCount: 7 }));
    expect(findings.some((f) => f.message.includes("expects 7 transaction set"))).toBe(true);
  });

  it("builds the interchange -> group -> transaction tree", () => {
    const { interchange: ic } = parseX12(interchange());
    expect(ic.groups).toHaveLength(1);
    expect(ic.groups[0]!.transactions[0]!.code).toBe("834");
  });
});
