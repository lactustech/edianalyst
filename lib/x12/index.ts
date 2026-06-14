import type { Finding } from "../validate/types";
import { detectDelimiters } from "./delimiters";
import { buildInterchange } from "./envelope";
import { tokenize } from "./tokenizer";
import type { Interchange, RawSegment } from "./types";

export type { Delimiters, RawSegment, Interchange, FunctionalGroup, TransactionSet } from "./types";
export { detectDelimiters, X12FormatError } from "./delimiters";
export { tokenize } from "./tokenizer";
export { buildInterchange } from "./envelope";

export interface ParseResult {
  interchange: Interchange;
  /** Flat segment list, in file order — used by the developer view. */
  segments: RawSegment[];
  /** Envelope-level findings (control totals, structure). */
  findings: Finding[];
}

/** Detect delimiters, tokenize, and build the interchange tree in one call. */
export function parseX12(text: string): ParseResult {
  const delimiters = detectDelimiters(text);
  const segments = tokenize(text, delimiters);
  const { interchange, findings } = buildInterchange(segments, delimiters);
  return { interchange, segments, findings };
}
