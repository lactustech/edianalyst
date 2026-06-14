import { describe, expect, it } from "vitest";
import { analyze } from "../lib/analyze";
import { buildExport } from "../lib/export/build";
import { toCsv } from "../lib/export/csv";
import { readFixture } from "./helpers";

describe("toCsv", () => {
  it("escapes commas, quotes, and newlines, and adds a BOM", () => {
    const csv = toCsv({
      name: "T",
      columns: ["a", "b"],
      rows: [["plain", 'has, "comma"'], ["line\nbreak", 42]],
    });
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain('"has, ""comma"""');
    expect(csv).toContain('"line\nbreak"');
    expect(csv).toContain("42");
  });
});

describe("buildExport", () => {
  it("834 enrollment yields a Members table plus Findings", () => {
    const b = buildExport(analyze(readFixture("clean-834.edi")));
    expect(b.fileBase).toBe("edianalyst-834-members");
    expect(b.tables[0]!.name).toBe("Members");
    expect(b.tables[0]!.columns).toContain("Change type");
    expect(b.tables[0]!.rows.length).toBeGreaterThan(0);
    expect(b.tables.at(-1)!.name).toBe("Findings");
  });

  it("835 yields Claims + Service lines + Findings, with denials in findings", () => {
    const b = buildExport(analyze(readFixture("clean-835.edi")));
    expect(b.tables.map((t) => t.name)).toEqual(["Claims", "Service lines", "Findings"]);
    const findings = b.tables.find((t) => t.name === "Findings")!;
    expect(findings.rows.some((r) => String(r[1]).includes("was denied"))).toBe(true);
  });

  it("837 service-line sheet flattens every line across claims", () => {
    const r = analyze(readFixture("clean-837.edi"));
    const b = buildExport(r);
    const lines = b.tables.find((t) => t.name === "Service lines")!;
    const totalLines = r.claims!.claims.reduce((s, c) => s + c.serviceLines.length, 0);
    expect(lines.rows.length).toBe(totalLines);
  });

  it("every row has one cell per column", () => {
    for (const fixture of ["clean-271.edi", "clean-277ca.edi", "clean-820.edi", "clean-999.edi"]) {
      const b = buildExport(analyze(readFixture(fixture)));
      for (const t of b.tables) {
        for (const row of t.rows) expect(row.length).toBe(t.columns.length);
      }
    }
  });
});
