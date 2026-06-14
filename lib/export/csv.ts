import type { ExportTable } from "./types";

/** Escape one CSV cell: quote when it contains a comma, quote, or newline. */
function cell(value: string | number): string {
  const s = String(value ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Render a table as RFC-4180 CSV text (dependency-free). */
export function toCsv(table: ExportTable): string {
  const lines = [table.columns, ...table.rows].map((row) => row.map(cell).join(","));
  // Lead with a UTF-8 BOM so Excel opens accented characters correctly.
  return "﻿" + lines.join("\r\n") + "\r\n";
}
