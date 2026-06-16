/**
 * 834 enrollment code reference for /edi/834/enrollment-codes. One entry per
 * code drives one statically-generated page (see
 * app/edi/[code]/enrollment-codes/[ec]/page.tsx), because enrollment staff look
 * up individual 834 codes one at a time.
 *
 * An 834 moves member enrollment between a sponsor and a health plan. A few key
 * code systems describe each member:
 *   - Maintenance type (INS03): the action — add, terminate, reinstate, change.
 *   - Relationship (INS02): how the member relates to the subscriber.
 *   - Coverage level (HD05): who the coverage covers — employee, family, etc.
 *   - Insurance line (HD03): the kind of coverage — health, dental, vision…
 *
 * Slugs are prefixed by element (ins03-, ins02-, hd05-, hd03-) since the same
 * value can mean different things in different elements.
 *
 * All prose is our own plain-English wording. Curated to the values used most;
 * the full lists are maintained by X12. The deeper INS03 walkthrough lives in
 * the blog (834 maintenance type codes).
 */
export type EnrollKind = "maintenance" | "relationship" | "coverage" | "line";

export interface EnrollCode {
  code: string; // "021", "18", "EMP", "HLT"
  kind: EnrollKind;
  name: string;
  plain: string;
  /** How it's used in the 834. */
  use: string;
  /** A practical note. */
  tip: string;
}

export const ENROLL_KINDS: Record<EnrollKind, { label: string; noun: string; element: string; blurb: string }> = {
  maintenance: {
    label: "Maintenance type",
    noun: "maintenance type code",
    element: "INS03",
    blurb: "The action on the member — add, terminate, reinstate, or change.",
  },
  relationship: {
    label: "Relationship",
    noun: "relationship code",
    element: "INS02",
    blurb: "How the member relates to the subscriber.",
  },
  coverage: {
    label: "Coverage level",
    noun: "coverage level code",
    element: "HD05",
    blurb: "Who the coverage covers — employee only, family, and so on.",
  },
  line: {
    label: "Insurance line",
    noun: "insurance line code",
    element: "HD03",
    blurb: "The kind of coverage — health, dental, vision, and so on.",
  },
};

export const ENROLL_CODES: EnrollCode[] = [
  // ---- Maintenance type (INS03) ----
  {
    code: "021",
    kind: "maintenance",
    name: "Addition",
    plain: "A new member or a new coverage is being added — an enrollment.",
    use: "Sent when enrolling a member who shouldn't already exist on the plan for this coverage; expect effective-date (DTP) and coverage (HD) details to follow.",
    tip: "If you see 021 for someone already enrolled, it's likely a duplicate or a should-have-been-a-change (001).",
  },
  {
    code: "024",
    kind: "maintenance",
    name: "Termination / Cancellation",
    plain: "Coverage is ending — the member is termed off the plan or a specific coverage is dropped.",
    use: "Carries a termination date in the DTP segment. This is the value enrollment teams watch most closely.",
    tip: "A wrong 024 drops someone's coverage — always confirm the termination date and reason before acting.",
  },
  {
    code: "025",
    kind: "maintenance",
    name: "Reinstatement",
    plain: "Previously terminated coverage is being restored.",
    use: "Used to bring a member back after an 024, rather than re-adding them as a brand-new 021.",
    tip: "Reinstatement usually preserves history; a fresh 021 may not — use the right one.",
  },
  {
    code: "001",
    kind: "maintenance",
    name: "Change",
    plain: "An update to an existing member — a demographic correction, plan change, or address update.",
    use: "The member stays enrolled; something about their record changes.",
    tip: "Diff the file against last week's to see exactly which fields changed under a 001.",
  },
  {
    code: "030",
    kind: "maintenance",
    name: "Audit or Compare",
    plain: "A full-file reconciliation record — the current state of a member, for comparison.",
    use: "The sponsor sends the member's current state so the plan can compare against the source of truth.",
    tip: "030 records aren't necessarily adds/changes; treat them as a snapshot to reconcile, not an action.",
  },
  {
    code: "002",
    kind: "maintenance",
    name: "Delete",
    plain: "Removes a record entirely, as opposed to terminating coverage with an end date.",
    use: "Used differently by different trading partners — confirm the companion-guide intent before acting.",
    tip: "Prefer 024 (terminate with a date) over 002 (delete) unless the guide specifically calls for a delete.",
  },

  // ---- Relationship (INS02) ----
  {
    code: "18",
    kind: "relationship",
    name: "Self",
    plain: "The member is the subscriber — the person who holds the policy.",
    use: "INS01 is typically 'Y' (subscriber) with INS02 = 18.",
    tip: "Every member loop should tie back to a subscriber; the subscriber's own record is the 18.",
  },
  {
    code: "01",
    kind: "relationship",
    name: "Spouse",
    plain: "The member is the subscriber's spouse.",
    use: "A dependent loop (INS01 = 'N') with INS02 = 01.",
    tip: "Watch coverage-level codes that include a spouse (ESP, FAM) to confirm the spouse should be enrolled.",
  },
  {
    code: "19",
    kind: "relationship",
    name: "Child",
    plain: "The member is the subscriber's child.",
    use: "A dependent loop with INS02 = 19.",
    tip: "Children often age off coverage — check effective/termination dates and dependent age rules.",
  },
  {
    code: "20",
    kind: "relationship",
    name: "Employee",
    plain: "The member is the employee.",
    use: "Used where the relationship is expressed as employee rather than self.",
    tip: "Some sponsors use 18 (self) and some 20 (employee) for the subscriber — follow the companion guide.",
  },
  {
    code: "53",
    kind: "relationship",
    name: "Life Partner",
    plain: "The member is the subscriber's life partner / domestic partner.",
    use: "A dependent loop with INS02 = 53.",
    tip: "Domestic-partner eligibility varies by plan; confirm the plan covers life partners.",
  },
  {
    code: "G8",
    kind: "relationship",
    name: "Other Relationship",
    plain: "A relationship that doesn't fit the standard categories.",
    use: "A catch-all dependent relationship.",
    tip: "When you see G8, check supporting fields to understand who the dependent actually is.",
  },

  // ---- Coverage level (HD05) ----
  {
    code: "EMP",
    kind: "coverage",
    name: "Employee Only",
    plain: "Coverage applies to the employee alone — no dependents.",
    use: "Reported in HD05 to say who the health-coverage line covers.",
    tip: "Should pair with a single subscriber member and no enrolled dependents.",
  },
  {
    code: "ESP",
    kind: "coverage",
    name: "Employee and Spouse",
    plain: "Coverage applies to the employee and their spouse.",
    use: "HD05 value for two-party employee + spouse coverage.",
    tip: "Expect a spouse (relationship 01) enrolled alongside the subscriber.",
  },
  {
    code: "ECH",
    kind: "coverage",
    name: "Employee and Children",
    plain: "Coverage applies to the employee and their child(ren).",
    use: "HD05 value for employee + children coverage (no spouse).",
    tip: "Expect one or more children (relationship 19) but no spouse.",
  },
  {
    code: "FAM",
    kind: "coverage",
    name: "Family",
    plain: "Coverage applies to the whole family — employee, spouse, and children.",
    use: "HD05 value for full-family coverage.",
    tip: "Reconcile that the enrolled dependents match the family tier you're billing premiums for.",
  },
  {
    code: "IND",
    kind: "coverage",
    name: "Individual",
    plain: "Coverage applies to a single individual.",
    use: "HD05 value for individual coverage.",
    tip: "Common on individual (non-group) plans; confirm the context fits the sponsor.",
  },
  {
    code: "CHD",
    kind: "coverage",
    name: "Children Only",
    plain: "Coverage applies to children only.",
    use: "HD05 value where only child dependents are covered.",
    tip: "Verify the subscriber relationship and that no adult is incorrectly enrolled.",
  },
  {
    code: "SPC",
    kind: "coverage",
    name: "Spouse and Children",
    plain: "Coverage applies to the spouse and children (not the employee).",
    use: "HD05 value for spouse + children coverage.",
    tip: "Less common; double-check the employee isn't meant to be covered too.",
  },
  {
    code: "SPO",
    kind: "coverage",
    name: "Spouse Only",
    plain: "Coverage applies to the spouse only.",
    use: "HD05 value for spouse-only coverage.",
    tip: "Confirm the spouse relationship (01) and that this tier is intended.",
  },

  // ---- Insurance line (HD03) ----
  {
    code: "HLT",
    kind: "line",
    name: "Health",
    plain: "A medical / health coverage line.",
    use: "HD03 value identifying the coverage as health.",
    tip: "The most common line; effective dates and coverage level apply per HD block.",
  },
  {
    code: "DEN",
    kind: "line",
    name: "Dental",
    plain: "A dental coverage line.",
    use: "HD03 value identifying the coverage as dental.",
    tip: "Dental is often a separate plan/administrator from medical — reconcile it on its own.",
  },
  {
    code: "VIS",
    kind: "line",
    name: "Vision",
    plain: "A vision coverage line.",
    use: "HD03 value identifying the coverage as vision.",
    tip: "Vision is frequently standalone; confirm the vision carrier separately.",
  },
  {
    code: "PDG",
    kind: "line",
    name: "Prescription Drug",
    plain: "A prescription drug / pharmacy coverage line.",
    use: "HD03 value identifying the coverage as prescription drug.",
    tip: "Pharmacy is often administered by a PBM; the medical file may not reflect it.",
  },
  {
    code: "MM",
    kind: "line",
    name: "Major Medical",
    plain: "A major medical coverage line.",
    use: "HD03 value identifying the coverage as major medical.",
    tip: "Confirm how the sponsor distinguishes major medical from a general health (HLT) line.",
  },
  {
    code: "LTC",
    kind: "line",
    name: "Long-Term Care",
    plain: "A long-term care coverage line.",
    use: "HD03 value identifying the coverage as long-term care.",
    tip: "LTC has its own eligibility and benefit rules; handle it separately from medical.",
  },
];

/** Slug — element-prefixed since a value can differ by element. */
export function codeSlug(c: EnrollCode): string {
  return `${ENROLL_KINDS[c.kind].element}-${c.code}`.toLowerCase();
}

/** Display token, e.g. "021", "18", "EMP", "HLT". */
export function codeLabel(c: EnrollCode): string {
  return c.code.toUpperCase();
}

/** Phrase for the H1 / title, e.g. "maintenance type code 021". */
export function codePhrase(c: EnrollCode): string {
  return `${ENROLL_KINDS[c.kind].noun} ${codeLabel(c)}`;
}

export function getEnrollCode(slug: string): EnrollCode | undefined {
  return ENROLL_CODES.find((c) => codeSlug(c) === slug.toLowerCase());
}

/** Related codes — same kind first, then the rest. */
export function relatedCodes(c: EnrollCode, n = 6): EnrollCode[] {
  const others = ENROLL_CODES.filter((x) => codeSlug(x) !== codeSlug(c));
  const sameKind = others.filter((x) => x.kind === c.kind);
  const rest = others.filter((x) => x.kind !== c.kind);
  return [...sameKind, ...rest].slice(0, n);
}
