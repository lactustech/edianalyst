/**
 * A single validation finding. The *voice* of these messages is the product's
 * personality (spec §6): plain-English, specific, actionable — never raw codes.
 * All message text is originally authored, never copied from a TR3 guide.
 */
export interface Finding {
  severity: "error" | "warning" | "info";
  /** Plain-English, original wording. */
  message: string;
  /** Index into the raw segment list, for "jump to" in the developer view. */
  segmentIndex?: number;
  /** Which member this concerns, if applicable (subscriber or member id). */
  memberRef?: string;
}
