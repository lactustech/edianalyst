/** A single exportable table — one CSV file, or one worksheet in a workbook. */
export interface ExportTable {
  name: string;
  columns: string[];
  rows: (string | number)[][];
}

/** A set of tables for one analyzed file. The first table is the primary one. */
export interface ExportBundle {
  /** File-name base, e.g. "edianalyst-835". */
  fileBase: string;
  tables: ExportTable[];
}
