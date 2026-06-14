import type { CoverageView, MemberRow } from "../transform/member834";

/**
 * Member diff — the Pro killer feature (spec §9). Key members on REF*0F + member
 * id across two 834s, classify each as added / terminated / changed / unchanged,
 * and for changed members surface the field-level before→after.
 *
 * "Terminated" here means *gone from the newer file* (key present before, absent
 * after) — distinct from a member still listed with a termination maintenance
 * code, which the readable table already shows.
 */

export type MemberChangeKind = "added" | "terminated" | "changed" | "unchanged";

export interface FieldChange {
  field: string;
  label: string;
  before: string;
  after: string;
}

export interface MemberDiff {
  key: string;
  kind: MemberChangeKind;
  /** A human label for the row (name + member id), taken from whichever side exists. */
  display: string;
  before?: MemberRow;
  after?: MemberRow;
  changes: FieldChange[];
}

export interface DiffSummary {
  added: number;
  terminated: number;
  changed: number;
  unchanged: number;
}

export interface DiffResult {
  diffs: MemberDiff[];
  summary: DiffSummary;
}

/** Stable identity for a member across two files: subscriber + member id. */
export function memberKey(m: Pick<MemberRow, "subscriberId" | "memberId">): string {
  return `${m.subscriberId}|${m.memberId}`;
}

function coverageSummary(coverages: CoverageView[]): string {
  return coverages
    .map((c) => `${c.lineCode}${c.level ? `/${c.level}` : ""}${c.begin ? `:${c.begin}` : ""}${c.end ? `-${c.end}` : ""}`)
    .sort()
    .join(", ");
}

function addressSummary(row: MemberRow): string {
  const a = row.address;
  if (!a) return "";
  return [a.street, a.city, a.state, a.zip].filter(Boolean).join(", ");
}

/**
 * The member-state fields the diff compares. Deliberately excludes the
 * maintenance type/reason — those describe the *transaction intent* of a file,
 * not the member's standing, so they'd flag every row as "changed".
 */
const FIELDS: { field: string; label: string; get: (m: MemberRow) => string }[] = [
  { field: "lastName", label: "Last name", get: (m) => m.lastName },
  { field: "firstName", label: "First name", get: (m) => m.firstName },
  { field: "middle", label: "Middle", get: (m) => m.middle ?? "" },
  { field: "relationship", label: "Relationship", get: (m) => m.relationship },
  { field: "benefitStatus", label: "Benefit status", get: (m) => m.benefitStatus ?? "" },
  { field: "dob", label: "Date of birth", get: (m) => m.dob ?? "" },
  { field: "gender", label: "Gender", get: (m) => m.gender ?? "" },
  { field: "eligibilityBegin", label: "Eligible from", get: (m) => m.eligibilityBegin ?? "" },
  { field: "eligibilityEnd", label: "Eligible to", get: (m) => m.eligibilityEnd ?? "" },
  { field: "address", label: "Address", get: addressSummary },
  { field: "coverages", label: "Coverage", get: (m) => coverageSummary(m.coverages) },
];

function fieldChanges(before: MemberRow, after: MemberRow): FieldChange[] {
  const changes: FieldChange[] = [];
  for (const f of FIELDS) {
    const b = f.get(before);
    const a = f.get(after);
    if (b !== a) changes.push({ field: f.field, label: f.label, before: b, after: a });
  }
  return changes;
}

function displayName(row: MemberRow): string {
  const name = `${row.lastName}, ${row.firstName}`.replace(/^, |, $/g, "").trim();
  return name ? `${name} · ${row.memberId}` : row.memberId || row.subscriberId;
}

/** Build the diff between two member populations (before = older file). */
export function diffMembers(before: MemberRow[], after: MemberRow[]): DiffResult {
  const beforeByKey = new Map(before.map((m) => [memberKey(m), m]));
  const afterByKey = new Map(after.map((m) => [memberKey(m), m]));

  const diffs: MemberDiff[] = [];
  const summary: DiffSummary = { added: 0, terminated: 0, changed: 0, unchanged: 0 };

  // Every key from both sides, preserving a stable order: before first, then
  // any after-only keys.
  const keys = new Set<string>([...beforeByKey.keys(), ...afterByKey.keys()]);

  for (const key of keys) {
    const b = beforeByKey.get(key);
    const a = afterByKey.get(key);

    if (b && !a) {
      diffs.push({ key, kind: "terminated", display: displayName(b), before: b, changes: [] });
      summary.terminated++;
    } else if (!b && a) {
      diffs.push({ key, kind: "added", display: displayName(a), after: a, changes: [] });
      summary.added++;
    } else if (b && a) {
      const changes = fieldChanges(b, a);
      if (changes.length > 0) {
        diffs.push({ key, kind: "changed", display: displayName(a), before: b, after: a, changes });
        summary.changed++;
      } else {
        diffs.push({ key, kind: "unchanged", display: displayName(a), before: b, after: a, changes: [] });
        summary.unchanged++;
      }
    }
  }

  return { diffs, summary };
}
