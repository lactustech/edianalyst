"use client";

import type { AnalysisResult } from "../analyze";
import type { MemberDiff } from "../diff/member-diff";
import { buildDiffExport, buildExport } from "./build";
import { toCsv } from "./csv";
import { downloadBlob } from "./download";
import { downloadWorkbook } from "./xlsx";
import type { ExportBundle } from "./types";

export { buildExport, buildDiffExport } from "./build";
export { toCsv } from "./csv";
export type { ExportBundle, ExportTable } from "./types";

/** Download the primary table of a bundle as CSV. */
function downloadCsv(bundle: ExportBundle): void {
  const primary = bundle.tables[0];
  if (!primary) return;
  downloadBlob(new Blob([toCsv(primary)], { type: "text/csv;charset=utf-8" }), `${bundle.fileBase}.csv`);
}

/** Export the analyzed file: CSV is the primary table; XLSX is every sheet. */
export function exportResultCsv(result: AnalysisResult): void {
  downloadCsv(buildExport(result));
}
export function exportResultXlsx(result: AnalysisResult): void {
  downloadWorkbook(buildExport(result));
}

/** Export the member diff (spec §10). */
export function exportDiffCsv(diffs: MemberDiff[]): void {
  downloadCsv(buildDiffExport(diffs));
}
export function exportDiffXlsx(diffs: MemberDiff[]): void {
  downloadWorkbook(buildDiffExport(diffs));
}
