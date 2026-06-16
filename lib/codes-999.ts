/**
 * 999 acknowledgment / error code reference for /edi/999/error-codes. One entry
 * per code drives one statically-generated page (see
 * app/edi/[code]/error-codes/[ec]/page.tsx), because EDI developers look up
 * individual 999 codes — "IK403 7", "AK9 R" — one at a time.
 *
 * A 999 (Implementation Acknowledgment) reports whether a functional group was
 * accepted or rejected and pinpoints syntax errors. Three code systems matter:
 *   - Acknowledgment codes (IK501 transaction-set / AK901 group): A/E/R…
 *   - Segment syntax error codes (IK304): a segment-level problem.
 *   - Data element syntax error codes (IK403): an element-level problem.
 *
 * Segment and element codes reuse the same small numbers (a segment "1" and an
 * element "1" are different errors), so slugs are prefixed by kind.
 *
 * All prose is our own plain-English wording — nothing is copied from the X12
 * lists. Curated to the codes developers hit most; append as needed.
 */
export type AckKind = "ack" | "segment" | "element";

export interface AckCode {
  code: string; // "A", "7"
  kind: AckKind;
  short: string;
  plain: string;
  /** When a 999 reports it. */
  why: string;
  /** What to do about it. */
  fix: string;
}

export const ACK_KINDS: Record<AckKind, { label: string; noun: string; segment: string; blurb: string }> = {
  ack: {
    label: "Acknowledgment",
    noun: "acknowledgment code",
    segment: "IK5 / AK9",
    blurb: "The overall accept/reject result for a transaction set or functional group.",
  },
  segment: {
    label: "Segment error",
    noun: "segment syntax error",
    segment: "IK304",
    blurb: "A segment-level problem — missing, misplaced, or unrecognized segments.",
  },
  element: {
    label: "Element error",
    noun: "data element syntax error",
    segment: "IK403",
    blurb: "A data-element-level problem — missing, invalid, or malformed values.",
  },
};

export const ACK_CODES: AckCode[] = [
  // ---- Acknowledgment codes (IK501 / AK901 / AK9) ----
  {
    code: "A",
    kind: "ack",
    short: "Accepted.",
    plain: "The transaction set or functional group was accepted with no errors.",
    why: "Everything passed the implementation guide's syntax and structure checks.",
    fix: "No action — the file was accepted. Move on to the business acknowledgment (e.g. a 277CA) for claim-level results.",
  },
  {
    code: "E",
    kind: "ack",
    short: "Accepted, but errors were noted.",
    plain: "The transaction set was accepted even though some errors were found.",
    why: "The errors weren't severe enough to reject, but they're reported so you can clean them up.",
    fix: "Review the IK3/IK4 error details and correct them on future submissions to avoid escalation to a rejection.",
  },
  {
    code: "P",
    kind: "ack",
    short: "Partially accepted — at least one transaction set was rejected.",
    plain: "At the functional-group level, some transaction sets were accepted and at least one was rejected.",
    why: "A mixed result: part of the group is fine, part failed.",
    fix: "Find the rejected transaction set(s) via the IK5 statuses, correct them, and resubmit just those.",
  },
  {
    code: "R",
    kind: "ack",
    short: "Rejected.",
    plain: "The transaction set or functional group was rejected and won't be processed.",
    why: "One or more errors severe enough to stop processing were found.",
    fix: "Read the IK3 segment and IK4 element errors, fix everything flagged, and resubmit the corrected file.",
  },
  {
    code: "M",
    kind: "ack",
    short: "Rejected — message authentication code (MAC) failed.",
    plain: "The file was rejected because its message authentication check failed.",
    why: "A security/authentication failure at the envelope level.",
    fix: "This is a security configuration issue — work with the trading partner / EDI team on the MAC setup, then resubmit.",
  },
  {
    code: "W",
    kind: "ack",
    short: "Rejected — assurance failed validity tests.",
    plain: "The file was rejected because security assurance validity tests failed.",
    why: "A security-assurance failure at the envelope level.",
    fix: "Escalate to the EDI/security team to resolve the assurance configuration, then resubmit.",
  },
  {
    code: "X",
    kind: "ack",
    short: "Rejected — content after decryption could not be analyzed.",
    plain: "After decryption, the content couldn't be read or analyzed, so it was rejected.",
    why: "A decryption or content-integrity problem prevented processing.",
    fix: "Work with the trading partner on the encryption setup; confirm the payload, then resubmit.",
  },

  // ---- Segment syntax error codes (IK304) ----
  {
    code: "1",
    kind: "segment",
    short: "Unrecognized segment ID.",
    plain: "A segment was used whose ID the receiver doesn't recognize.",
    why: "The segment tag isn't valid for this transaction, or there's a typo/corruption in the segment ID.",
    fix: "Remove or correct the unrecognized segment so only valid segment IDs are sent, and resubmit.",
  },
  {
    code: "2",
    kind: "segment",
    short: "Unexpected segment.",
    plain: "A valid segment appeared where it wasn't expected.",
    why: "The segment is allowed in the transaction but not at that position.",
    fix: "Move the segment to its correct position per the implementation guide and resubmit.",
  },
  {
    code: "3",
    kind: "segment",
    short: "Required (mandatory) segment missing.",
    plain: "A segment the transaction requires wasn't sent.",
    why: "A mandatory segment for this loop/transaction is absent.",
    fix: "Add the required segment named by the IK3 error and resubmit.",
  },
  {
    code: "4",
    kind: "segment",
    short: "Loop occurs over maximum times.",
    plain: "A loop repeated more times than the guide allows.",
    why: "The number of loop iterations exceeded the maximum.",
    fix: "Reduce the loop to within its allowed maximum (or split the file) and resubmit.",
  },
  {
    code: "5",
    kind: "segment",
    short: "Segment exceeds maximum use.",
    plain: "A segment was used more times than allowed.",
    why: "The segment's repeat count is over its maximum.",
    fix: "Cut the segment back to its allowed number of uses and resubmit.",
  },
  {
    code: "6",
    kind: "segment",
    short: "Segment not in defined transaction set.",
    plain: "A segment was sent that isn't part of this transaction set.",
    why: "The segment doesn't belong to this transaction's definition.",
    fix: "Remove the segment that doesn't belong in this transaction and resubmit.",
  },
  {
    code: "7",
    kind: "segment",
    short: "Segment not in proper sequence.",
    plain: "A segment appeared out of its required order.",
    why: "Segments must follow the guide's sequence; this one is out of place.",
    fix: "Reorder the segments to match the implementation guide and resubmit.",
  },
  {
    code: "8",
    kind: "segment",
    short: "Segment has data element errors.",
    plain: "The segment was recognized but one or more of its data elements has an error.",
    why: "A pointer to element-level problems — the specific issues are in the IK4 (element) errors.",
    fix: "Read the paired IK403 element error codes for the exact fields, correct them, and resubmit.",
  },

  // ---- Data element syntax error codes (IK403) ----
  {
    code: "1",
    kind: "element",
    short: "Required (mandatory) data element missing.",
    plain: "A data element the segment requires wasn't provided.",
    why: "A mandatory element position is empty.",
    fix: "Supply the required element value and resubmit.",
  },
  {
    code: "2",
    kind: "element",
    short: "Conditional required data element missing.",
    plain: "An element required by a condition wasn't provided.",
    why: "A syntax/relational rule made the element required given other values, and it was missing.",
    fix: "Add the conditionally required element (check the rule that triggered it) and resubmit.",
  },
  {
    code: "3",
    kind: "element",
    short: "Too many data elements.",
    plain: "The segment had more data elements than defined.",
    why: "Extra elements were sent beyond the segment's definition.",
    fix: "Remove the extra trailing elements and resubmit.",
  },
  {
    code: "4",
    kind: "element",
    short: "Data element too short.",
    plain: "An element's value was shorter than its minimum length.",
    why: "The value didn't meet the element's minimum length.",
    fix: "Provide a value of valid length and resubmit.",
  },
  {
    code: "5",
    kind: "element",
    short: "Data element too long.",
    plain: "An element's value exceeded its maximum length.",
    why: "The value was longer than the element allows.",
    fix: "Truncate or correct the value to within the maximum length and resubmit.",
  },
  {
    code: "6",
    kind: "element",
    short: "Invalid character in data element.",
    plain: "The element contained a character not allowed for its type.",
    why: "A disallowed character (e.g. a letter in a numeric element, or a stray delimiter) was present.",
    fix: "Remove the invalid character(s) and resubmit with a clean value.",
  },
  {
    code: "7",
    kind: "element",
    short: "Invalid code value.",
    plain: "The element used a code the implementation guide doesn't allow.",
    why: "The most common element error — a code value outside the allowed set for that element.",
    fix: "Replace it with a valid code from the element's allowed list and resubmit.",
  },
  {
    code: "8",
    kind: "element",
    short: "Invalid date.",
    plain: "A date element wasn't a valid calendar date.",
    why: "The date was malformed or not a real date (wrong format, impossible day, etc.).",
    fix: "Correct the date to a valid CCYYMMDD value and resubmit.",
  },
  {
    code: "9",
    kind: "element",
    short: "Invalid time.",
    plain: "A time element wasn't a valid time.",
    why: "The time was malformed or out of range.",
    fix: "Correct the time to a valid value and resubmit.",
  },
  {
    code: "10",
    kind: "element",
    short: "Exclusion condition violated.",
    plain: "Two or more elements were present that aren't allowed together.",
    why: "A syntax rule says these elements are mutually exclusive, but more than one was sent.",
    fix: "Remove the conflicting element so only one of the mutually exclusive set is sent, and resubmit.",
  },
  {
    code: "12",
    kind: "element",
    short: "Too many repetitions.",
    plain: "A repeating element repeated more times than allowed.",
    why: "The element's repeat count exceeded its maximum.",
    fix: "Reduce the repetitions to within the allowed maximum and resubmit.",
  },
  {
    code: "13",
    kind: "element",
    short: "Too many components.",
    plain: "A composite element had more components than defined.",
    why: "Extra sub-elements were sent in a composite beyond its definition.",
    fix: "Remove the extra components from the composite and resubmit.",
  },
];

/**
 * Slug — prefixed by the IK element the code is reported in, so the URL mirrors
 * the on-page label (IK403:13 → ik403-13) and matches how developers search.
 * The prefix also disambiguates the shared numbers (a segment "1" and an element
 * "1" are different codes). Acknowledgment codes live in IK5/AK9, so they keep a
 * generic "ack-" prefix.
 */
export function codeSlug(c: AckCode): string {
  const prefix = c.kind === "ack" ? "ack" : ACK_KINDS[c.kind].segment; // IK304 / IK403
  return `${prefix}-${c.code}`.toLowerCase();
}

/** Short display token for lists, e.g. "R", "IK304:7", "IK403:7". */
export function codeLabel(c: AckCode): string {
  if (c.kind === "ack") return c.code;
  return `${ACK_KINDS[c.kind].segment}:${c.code}`;
}

/** Phrase for the H1 / title — uses the IK code developers search, e.g.
 *  "acknowledgment code R", "IK304 segment error 7", "IK403 element error 7". */
export function codePhrase(c: AckCode): string {
  if (c.kind === "ack") return `acknowledgment code ${c.code}`;
  const part = c.kind === "segment" ? "segment" : "element";
  return `${ACK_KINDS[c.kind].segment} ${part} error ${c.code}`;
}

export function getAckCode(slug: string): AckCode | undefined {
  return ACK_CODES.find((c) => codeSlug(c) === slug.toLowerCase());
}

/** Related codes — same kind first, then the rest. */
export function relatedCodes(c: AckCode, n = 6): AckCode[] {
  const others = ACK_CODES.filter((x) => codeSlug(x) !== codeSlug(c));
  const sameKind = others.filter((x) => x.kind === c.kind);
  const rest = others.filter((x) => x.kind !== c.kind);
  return [...sameKind, ...rest].slice(0, n);
}
