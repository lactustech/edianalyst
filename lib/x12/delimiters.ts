import type { Delimiters } from "./types";

/**
 * Delimiter auto-detection (spec §3.1).
 *
 * X12 delimiters are declared positionally in the fixed-width ISA segment, not
 * fixed by the standard. The ISA is exactly 106 characters in 5010 (105 chars
 * of content + the segment terminator), which lets us read every separator by
 * offset *before* we know what the segment terminator even is:
 *
 *   index 3   element separator      (4th char, right after "ISA")
 *   index 82  repetition separator   (ISA element 11, position-fixed in 5010)
 *   index 104 component separator     (ISA element 16, last content char)
 *   index 105 segment terminator      (the char immediately after element 16)
 */
const ISA_CONTENT_LENGTH = 106;

export class X12FormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "X12FormatError";
  }
}

export function detectDelimiters(input: string): Delimiters {
  // Strip a leading UTF-8 BOM and any whitespace before "ISA" so offsets align.
  const raw = input.replace(/^﻿/, "").replace(/^\s+/, "");

  if (raw.slice(0, 3) !== "ISA") {
    throw new X12FormatError(
      "This doesn't look like an X12 file — it should start with ISA.",
    );
  }
  if (raw.length < ISA_CONTENT_LENGTH) {
    throw new X12FormatError(
      "This file is cut off before the end of its ISA header, so it can't be read as X12.",
    );
  }

  const element = raw[3]!;
  const repetition = raw[82]!;
  const component = raw[104]!;
  const segment = raw[105]!;

  // ASSUMPTION: a single space at any of these delimiter offsets means the ISA
  // is malformed (real ISAs never use space as a separator); surface it plainly.
  if (element === " " || component === " " || segment === " ") {
    throw new X12FormatError(
      "The ISA header is malformed — its element, component, or segment separators are missing.",
    );
  }

  return { element, component, repetition, segment };
}
