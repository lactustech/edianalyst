/** Parsing for X12 D8 (CCYYMMDD) dates into ISO, with validity reporting. */

export interface ParsedDate {
  /** ISO YYYY-MM-DD when the value is a real calendar date, else undefined. */
  iso?: string;
  valid: boolean;
  /** The original element value, preserved for display when invalid. */
  raw: string;
}

/** Parse a D8 (CCYYMMDD) date. Validates digit shape and calendar range. */
export function parseD8(raw: string | undefined): ParsedDate {
  const value = raw ?? "";
  if (!/^\d{8}$/.test(value)) return { valid: false, raw: value };

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { valid: false, raw: value };
  }
  // Reject impossible days (e.g. Feb 30) by round-tripping through Date in UTC.
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) {
    return { valid: false, raw: value };
  }

  const iso = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  return { iso, valid: true, raw: value };
}

/** Convenience: ISO string if valid, otherwise the raw value (never empty-lies). */
export function displayDate(raw: string | undefined): string {
  const parsed = parseD8(raw);
  return parsed.iso ?? parsed.raw;
}
