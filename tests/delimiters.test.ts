import { describe, expect, it } from "vitest";
import { detectDelimiters, X12FormatError } from "../lib/x12/delimiters";

// A minimal valid ISA (105 content chars) with standard delimiters, built so
// the fixed offsets line up exactly.
function isa(element = "*", component = ":", repetition = "^", segment = "~"): string {
  const pad = (s: string, n: number) => s.padEnd(n, " ").slice(0, n);
  return [
    "ISA", "00", pad("", 10), "00", pad("", 10), "ZZ", pad("SENDER", 15),
    "ZZ", pad("RECEIVER", 15), "210901", "1200", repetition, "00501",
    "000000001", "0", "T", component,
  ].join(element) + segment;
}

describe("detectDelimiters", () => {
  it("reads the four delimiters from the fixed-width ISA", () => {
    const d = detectDelimiters(isa());
    expect(d).toEqual({ element: "*", component: ":", repetition: "^", segment: "~" });
  });

  it("detects non-standard delimiters without assuming defaults", () => {
    const d = detectDelimiters(isa("|", "/", "U", "\n"));
    expect(d).toEqual({ element: "|", component: "/", repetition: "U", segment: "\n" });
  });

  it("tolerates leading whitespace and a BOM before ISA", () => {
    const d = detectDelimiters("﻿\n  " + isa());
    expect(d.element).toBe("*");
  });

  it("rejects a file that does not start with ISA", () => {
    expect(() => detectDelimiters("GS*BE*...")).toThrow(X12FormatError);
  });

  it("rejects a file truncated inside the ISA header", () => {
    expect(() => detectDelimiters("ISA*00*")).toThrow(X12FormatError);
  });
});
