import { describe, expect, it } from "vitest";
import { tokenize } from "../lib/x12/tokenizer";
import type { Delimiters } from "../lib/x12/types";

const D: Delimiters = { element: "*", component: ":", repetition: "^", segment: "~" };

describe("tokenize", () => {
  it("splits segments and elements, tag excluded from elements", () => {
    const segs = tokenize("INS*Y*18*021~NM1*IL*1*DOE*JANE~", D);
    expect(segs).toHaveLength(2);
    expect(segs[0]).toMatchObject({ tag: "INS", elements: ["Y", "18", "021"], index: 0 });
    expect(segs[1]).toMatchObject({ tag: "NM1", elements: ["IL", "1", "DOE", "JANE"], index: 1 });
  });

  it("handles all three file shapes identically (one-line, per-line, CRLF)", () => {
    const oneLine = "INS*Y*18~NM1*IL*1*DOE~";
    const perLine = "INS*Y*18~\nNM1*IL*1*DOE~\n";
    const crlf = "INS*Y*18~\r\nNM1*IL*1*DOE~\r\n";
    const a = tokenize(oneLine, D);
    expect(tokenize(perLine, D).map((s) => s.raw)).toEqual(a.map((s) => s.raw));
    expect(tokenize(crlf, D).map((s) => s.raw)).toEqual(a.map((s) => s.raw));
  });

  it("splits components only where the component separator appears", () => {
    const [seg] = tokenize("HD*021**HLT:DEN~", D);
    expect(seg!.elements[2]).toBe("HLT:DEN");
    expect(seg!.components?.[2]).toEqual(["HLT", "DEN"]);
    expect(seg!.components?.[0]).toBeUndefined();
  });

  it("trims trailing empty elements but keeps interior ones", () => {
    const [seg] = tokenize("DMG*D8**M***~", D);
    // interior empties kept; trailing empties dropped
    expect(seg!.elements).toEqual(["D8", "", "M"]);
  });

  it("assigns sequential indices and preserves raw text", () => {
    const segs = tokenize("ST*834*0001~SE*2*0001~", D);
    expect(segs.map((s) => s.index)).toEqual([0, 1]);
    expect(segs[0]!.raw).toBe("ST*834*0001");
  });
});
