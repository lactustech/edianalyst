import type { CodeList } from "../codelists/types";

/**
 * Schema definition types (spec §4.1). The 834 structure is modeled as *data*
 * so future transaction sets (837P/837I/835) are added as new schema files, not
 * new code paths. All `name` strings are originally authored plain English.
 */

export type ElementFormat = "date8" | "date6" | "text" | "num";

export interface ElementDef {
  /** X12 element reference id, e.g. "1069" — kept for the reference pages. */
  ref: string;
  /** Our plain-English name for the element. */
  name: string;
  /** Optional code list giving readable values for this element. */
  codes?: CodeList;
  format?: ElementFormat;
}

export interface SegmentDef {
  tag: string;
  /** Our plain-English name for the segment. */
  name: string;
  /** Max repeats within its loop, if bounded. */
  max?: number;
  required?: boolean;
  elements: ElementDef[];
}

export interface LoopDef {
  id: string;
  /** Our plain-English name for the loop. */
  name: string;
  /** The segment tag (optionally tag+qualifier) that opens a new loop iteration. */
  trigger: string;
  repeat: boolean;
  segments: SegmentDef[];
  loops?: LoopDef[];
}

export interface TransactionSchema {
  /** Transaction set code, e.g. "834", "835". */
  code: string;
  version: string;
  header: SegmentDef[];
  loops: LoopDef[];
}
