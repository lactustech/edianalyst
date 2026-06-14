/**
 * Shared X12 AST types.
 *
 * An X12 interchange is a flat stream of *segments*. Each segment is a tag
 * (e.g. "INS", "NM1") followed by positional *elements*; an element may be
 * split into *components* (sub-elements). The delimiters separating segments,
 * elements, components, and repetitions are not fixed — they are declared in
 * the opening ISA segment, so they are always detected, never hardcoded.
 */

/** The four delimiters that govern how a raw X12 string is tokenized. */
export interface Delimiters {
  /** Separates elements within a segment. ISA index 3. Commonly "*". */
  element: string;
  /** Separates components within an element. ISA element 16. Commonly ":". */
  component: string;
  /** Separates repeated occurrences of one element. ISA element 11. Commonly "^". */
  repetition: string;
  /** Terminates each segment. The char after the ISA's component separator. Commonly "~". */
  segment: string;
}

/** A single tokenized segment. Transaction-agnostic: it knows nothing about 834. */
export interface RawSegment {
  /** Segment identifier, e.g. "INS", "NM1". */
  tag: string;
  /** Elements in positional order, excluding the tag. `elements[0]` is element 01. */
  elements: string[];
  /**
   * Sub-elements, present only for elements that contained the component
   * separator. `components[i]` aligns with `elements[i]`; entries are omitted
   * (undefined) where an element had no components.
   */
  components?: (string[] | undefined)[];
  /** Ordinal position of this segment in the file (0-based) — used for error locations. */
  index: number;
  /** Original segment text (without the terminator) — powers the developer view. */
  raw: string;
}

/** A transaction set: ST … SE, carrying its own slice of raw segments. */
export interface TransactionSet {
  /** Transaction set identifier code, ST01 (e.g. "834"). */
  code: string;
  /** Transaction set control number, ST02. */
  controlNumber: string;
  st: RawSegment;
  se?: RawSegment;
  /** All segments from ST through SE inclusive. */
  segments: RawSegment[];
}

/** A functional group: GS … GE. */
export interface FunctionalGroup {
  /** Functional identifier code, GS01 (e.g. "BE" for 834 benefit enrollment). */
  functionalCode: string;
  /** Group control number, GS06. */
  controlNumber: string;
  gs: RawSegment;
  ge?: RawSegment;
  transactions: TransactionSet[];
}

/** The full interchange tree: ISA … IEA. */
export interface Interchange {
  /** Interchange control number, ISA13. */
  controlNumber: string;
  isa: RawSegment;
  iea?: RawSegment;
  groups: FunctionalGroup[];
  delimiters: Delimiters;
}
