"use client";

import type { ExportBundle } from "./types";

/** Excel sheet names cap at 31 chars and forbid a few characters. */
function sheetName(name: string, used: Set<string>): string {
  const base = name.replace(/[\\/?*[\]:]/g, " ").slice(0, 31).trim() || "Sheet";
  let candidate = base;
  let i = 2;
  while (used.has(candidate)) candidate = `${base.slice(0, 28)} ${i++}`;
  used.add(candidate);
  return candidate;
}

/**
 * Build and download a multi-sheet workbook (spec §10 — SheetJS, client-side).
 * SheetJS is loaded on demand so it stays out of the initial bundle; it writes
 * the file directly in the browser, so no bytes leave the device.
 */
export async function downloadWorkbook(bundle: ExportBundle): Promise<void> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const used = new Set<string>();
  for (const table of bundle.tables) {
    const ws = XLSX.utils.aoa_to_sheet([table.columns, ...table.rows]);
    XLSX.utils.book_append_sheet(wb, ws, sheetName(table.name, used));
  }
  XLSX.writeFile(wb, `${bundle.fileBase}.xlsx`);
}
