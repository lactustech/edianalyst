/**
 * A code list maps an X12 code value to an originally-authored, plain-English
 * label (spec §1.3 — never copy TR3 / Washington Publishing prose). The code
 * values themselves are facts; only our wording is ours.
 */
export type CodeList = Record<string, string>;

/** Look up a code, returning a readable "Label" or a clear unknown marker. */
export function decode(list: CodeList, code: string | undefined): string {
  if (!code) return "";
  return list[code] ?? `Unknown code (${code})`;
}

/** Whether a code is recognised by the list (drives "unknown code" findings). */
export function isKnown(list: CodeList, code: string | undefined): boolean {
  return !!code && code in list;
}
