/**
 * 271 eligibility & benefit code reference for /edi/271/eligibility-codes. One
 * entry per code drives one statically-generated page (see
 * app/edi/[code]/eligibility-codes/[ec]/page.tsx).
 *
 * Two X12 code systems sit at the heart of a 270/271 exchange:
 *   - Eligibility/Benefit Information codes (EB01, on the 271 EB segment): what
 *     each benefit line IS — active coverage, copay, deductible, limitation…
 *   - Request Validation / Reject Reason codes (AAA03, on a 270 or 271): why an
 *     eligibility request couldn't be answered.
 *
 * Slugs are kind-prefixed (eb-, aaa-) since the values overlap numerically.
 *
 * All prose is our own plain-English wording. Curated to the values used most;
 * the full lists are maintained by X12.
 */
export type EligKind = "benefit" | "reject";

export interface EligCode {
  code: string; // "1", "C", "42"
  kind: EligKind;
  name: string;
  plain: string;
  /** benefit: how it appears in the 271. reject: why the request was rejected. */
  context: string;
  /** benefit: what to check. reject: how to fix it. */
  action: string;
}

export const ELIG_KINDS: Record<EligKind, { label: string; noun: string; element: string; blurb: string }> = {
  benefit: {
    label: "Benefit info",
    noun: "eligibility/benefit code",
    element: "EB01",
    blurb: "What a 271 benefit line is — active/inactive coverage, copay, deductible, limitation, and so on.",
  },
  reject: {
    label: "Reject reason",
    noun: "reject reason code",
    element: "AAA03",
    blurb: "Why an eligibility request (270) or response (271) couldn't be processed.",
  },
};

export const ELIG_CODES: EligCode[] = [
  // ---- EB01 Eligibility / Benefit Information codes ----
  {
    code: "1",
    kind: "benefit",
    name: "Active Coverage",
    plain: "The member has active coverage for this benefit.",
    context: "The headline most analysts look for — an EB line with EB01=1 means coverage is in force.",
    action: "Confirm the service type (EB03) and dates; this is your 'covered' signal.",
  },
  {
    code: "2",
    kind: "benefit",
    name: "Active - Full Risk Capitation",
    plain: "Active coverage where the provider is paid under full-risk capitation.",
    context: "Coverage is active, but reimbursement is capitated rather than fee-for-service.",
    action: "Expect capitation rather than per-claim payment; verify the capitation arrangement.",
  },
  {
    code: "3",
    kind: "benefit",
    name: "Active - Services Capitated",
    plain: "Active coverage where the listed services are capitated.",
    context: "The specific services are paid under capitation.",
    action: "Don't expect fee-for-service payment for the capitated services.",
  },
  {
    code: "5",
    kind: "benefit",
    name: "Active - Pending Investigation",
    plain: "Coverage appears active but is pending an investigation.",
    context: "Eligibility is provisional while the payer investigates.",
    action: "Treat as tentative; re-verify before relying on it.",
  },
  {
    code: "6",
    kind: "benefit",
    name: "Inactive",
    plain: "The member's coverage is inactive for this benefit.",
    context: "The key 'not covered' signal — EB01=6 means coverage isn't in force.",
    action: "Verify the dates; if inactive, bill the correct payer or the patient.",
  },
  {
    code: "7",
    kind: "benefit",
    name: "Inactive - Primary",
    plain: "Coverage is inactive as the primary payer.",
    context: "Inactive specifically in the primary position.",
    action: "Check whether another payer is primary and coordinate benefits.",
  },
  {
    code: "8",
    kind: "benefit",
    name: "Inactive - Pending Eligibility Update",
    plain: "Coverage is inactive pending an eligibility update.",
    context: "The payer's eligibility record hasn't been updated yet.",
    action: "Re-verify after the update window; the member may actually be eligible.",
  },
  {
    code: "A",
    kind: "benefit",
    name: "Co-Insurance",
    plain: "The benefit line describes a coinsurance amount or percentage.",
    context: "EB01=A lines carry the member's coinsurance share (often a percentage in EB08).",
    action: "Read the percentage/amount and the service type it applies to.",
  },
  {
    code: "B",
    kind: "benefit",
    name: "Co-Payment",
    plain: "The benefit line describes a copay amount.",
    context: "EB01=B lines carry a fixed copay (the amount is in EB07).",
    action: "Collect the stated copay; confirm which service type it applies to.",
  },
  {
    code: "C",
    kind: "benefit",
    name: "Deductible",
    plain: "The benefit line describes a deductible.",
    context: "EB01=C lines carry deductible amounts — often both the total and the remaining amount.",
    action: "Look for remaining vs. total deductible and the time period (EB06).",
  },
  {
    code: "D",
    kind: "benefit",
    name: "Benefit Description",
    plain: "A descriptive benefit line.",
    context: "Provides descriptive benefit information rather than a dollar amount.",
    action: "Read the message text for plan-specific detail.",
  },
  {
    code: "F",
    kind: "benefit",
    name: "Limitations",
    plain: "The benefit line describes a limitation on the benefit.",
    context: "EB01=F lines carry visit, dollar, or frequency limits.",
    action: "Note the limit and how much remains before billing.",
  },
  {
    code: "G",
    kind: "benefit",
    name: "Out of Pocket (Stop Loss)",
    plain: "The benefit line describes the out-of-pocket maximum (stop-loss).",
    context: "EB01=G lines carry the patient's out-of-pocket maximum.",
    action: "Check remaining vs. total; once met, the plan typically pays 100%.",
  },
  {
    code: "I",
    kind: "benefit",
    name: "Non-Covered",
    plain: "The service is not covered.",
    context: "EB01=I marks a benefit/service as non-covered under the plan.",
    action: "If non-covered, the charge is typically patient responsibility (a notice/ABN may apply).",
  },
  {
    code: "L",
    kind: "benefit",
    name: "Primary Care Provider",
    plain: "The benefit line identifies the primary care provider (PCP).",
    context: "EB01=L lines name the member's PCP.",
    action: "Useful for managed-care plans that require a PCP or referral.",
  },
  {
    code: "R",
    kind: "benefit",
    name: "Other or Additional Payor",
    plain: "The benefit line identifies another or additional payer.",
    context: "EB01=R lines point to other coverage the member has.",
    action: "Use for coordination of benefits — identify who's primary.",
  },
  {
    code: "U",
    kind: "benefit",
    name: "Contact Following Entity for Eligibility or Benefit Information",
    plain: "Eligibility/benefit details must be obtained from another entity.",
    context: "The payer is directing you elsewhere for the benefit information.",
    action: "Contact the entity named on the line (often a carve-out vendor).",
  },
  {
    code: "V",
    kind: "benefit",
    name: "Cannot Process",
    plain: "The payer cannot process the eligibility/benefit inquiry.",
    context: "A processing problem prevented a benefit answer.",
    action: "Check any accompanying AAA reject reason and re-inquire once resolved.",
  },

  // ---- AAA03 Request Validation / Reject Reason codes ----
  {
    code: "15",
    kind: "reject",
    name: "Required application data missing",
    plain: "The request was missing data the payer needs to respond.",
    context: "A required field for the inquiry wasn't supplied.",
    action: "Add the missing data and resend the 270.",
  },
  {
    code: "41",
    kind: "reject",
    name: "Authorization/Access Restrictions",
    plain: "The submitter isn't authorized to make this inquiry.",
    context: "An access or authorization restriction blocked the request.",
    action: "Confirm your trading-partner authorization with the payer, then retry.",
  },
  {
    code: "42",
    kind: "reject",
    name: "Unable to Respond at Current Time",
    plain: "The payer's system can't respond right now.",
    context: "A common transient reject — the payer system is busy or down.",
    action: "Wait and resend the inquiry later; this usually isn't a data problem.",
  },
  {
    code: "43",
    kind: "reject",
    name: "Invalid/Missing Provider Identification",
    plain: "The provider identifier was invalid or missing.",
    context: "The inquiring provider's ID didn't validate.",
    action: "Correct the provider NPI/identifier and resend.",
  },
  {
    code: "45",
    kind: "reject",
    name: "Invalid/Missing Provider Specialty",
    plain: "The provider specialty was invalid or missing.",
    context: "The provider's specialty/taxonomy didn't validate.",
    action: "Supply a valid provider specialty/taxonomy and resend.",
  },
  {
    code: "47",
    kind: "reject",
    name: "Invalid/Missing Provider State",
    plain: "The provider's state was invalid or missing.",
    context: "The provider state element didn't validate.",
    action: "Correct the provider state and resend.",
  },
  {
    code: "48",
    kind: "reject",
    name: "Invalid/Missing Referring Provider Identification Number",
    plain: "The referring provider ID was invalid or missing.",
    context: "A referring-provider identifier was required and didn't validate.",
    action: "Add/correct the referring provider ID and resend.",
  },
  {
    code: "49",
    kind: "reject",
    name: "Provider is Not Primary Care Physician",
    plain: "The provider isn't the member's primary care physician.",
    context: "The plan restricts the inquiry to the member's PCP.",
    action: "Have the PCP submit the inquiry, or confirm the correct PCP.",
  },
  {
    code: "50",
    kind: "reject",
    name: "Provider Ineligible for Inquiries",
    plain: "The provider isn't eligible to make eligibility inquiries.",
    context: "The provider's status doesn't permit inquiries with this payer.",
    action: "Resolve the provider's enrollment/eligibility with the payer.",
  },
  {
    code: "51",
    kind: "reject",
    name: "Provider Not on File",
    plain: "The provider isn't on the payer's file.",
    context: "The payer has no record of the inquiring provider.",
    action: "Complete provider enrollment/credentialing with the payer, then retry.",
  },
  {
    code: "56",
    kind: "reject",
    name: "Inappropriate Date",
    plain: "A date on the request was inappropriate.",
    context: "A date element didn't make sense for the inquiry.",
    action: "Correct the date(s) and resend.",
  },
  {
    code: "57",
    kind: "reject",
    name: "Invalid/Missing Date(s) of Service",
    plain: "The date(s) of service were invalid or missing.",
    context: "The service date(s) on the inquiry didn't validate.",
    action: "Supply valid date(s) of service and resend.",
  },
  {
    code: "58",
    kind: "reject",
    name: "Invalid/Missing Date-of-Birth",
    plain: "The patient's date of birth was invalid or missing.",
    context: "The DOB didn't validate against the request.",
    action: "Correct the date of birth and resend.",
  },
  {
    code: "60",
    kind: "reject",
    name: "Date of Birth Follows Date(s) of Service",
    plain: "The date of birth is after the date of service.",
    context: "An impossible date relationship — birth can't follow service.",
    action: "Fix the DOB or the service date and resend.",
  },
  {
    code: "62",
    kind: "reject",
    name: "Date of Service Not Within Allowable Inquiry Period",
    plain: "The date of service is outside the period the payer allows inquiries for.",
    context: "Payers limit how far back/forward eligibility can be checked.",
    action: "Inquire within the allowable period, or contact the payer for historical eligibility.",
  },
  {
    code: "63",
    kind: "reject",
    name: "Date of Service in Future",
    plain: "The date of service is in the future.",
    context: "The inquiry used a future service date the payer won't process.",
    action: "Use a current/valid date of service and resend.",
  },
  {
    code: "72",
    kind: "reject",
    name: "Invalid/Missing Subscriber/Insured ID",
    plain: "The subscriber/insured ID was invalid or missing.",
    context: "The member ID didn't validate — a very common reject.",
    action: "Re-verify the member ID against the ID card and resend.",
  },
  {
    code: "73",
    kind: "reject",
    name: "Invalid/Missing Subscriber/Insured Name",
    plain: "The subscriber/insured name was invalid or missing.",
    context: "The member name didn't match or wasn't provided.",
    action: "Correct the spelling/name to match the payer's records and resend.",
  },
  {
    code: "75",
    kind: "reject",
    name: "Subscriber/Insured Not Found",
    plain: "The payer couldn't find the subscriber/insured.",
    context: "No matching member record was found.",
    action: "Confirm the ID, name, and DOB; the member may be with a different payer/plan.",
  },
  {
    code: "76",
    kind: "reject",
    name: "Duplicate Subscriber/Insured ID Number",
    plain: "The subscriber/insured ID matched more than one record.",
    context: "The ID wasn't unique in the payer's system.",
    action: "Add more identifying detail (name, DOB) to disambiguate and resend.",
  },
  {
    code: "78",
    kind: "reject",
    name: "Subscriber/Insured Not in Group/Plan Identified",
    plain: "The member isn't in the group or plan identified.",
    context: "The member exists but not under the group/plan you named.",
    action: "Correct the group/plan, or inquire without over-specifying it, and resend.",
  },
];

/** Slug — kind-prefixed (eb- / aaa-) since values overlap numerically. */
export function codeSlug(c: EligCode): string {
  const prefix = c.kind === "benefit" ? "eb" : "aaa";
  return `${prefix}-${c.code}`.toLowerCase();
}

/** Display token, e.g. "EB 1", "AAA 42". */
export function codeLabel(c: EligCode): string {
  return `${c.kind === "benefit" ? "EB" : "AAA"} ${c.code.toUpperCase()}`;
}

/** Phrase for the H1 / title, e.g. "eligibility/benefit code 1", "reject reason code 42". */
export function codePhrase(c: EligCode): string {
  return `${ELIG_KINDS[c.kind].noun} ${c.code.toUpperCase()}`;
}

export function getEligCode(slug: string): EligCode | undefined {
  return ELIG_CODES.find((c) => codeSlug(c) === slug.toLowerCase());
}

/** Related codes — same kind first, then the rest. */
export function relatedCodes(c: EligCode, n = 6): EligCode[] {
  const others = ELIG_CODES.filter((x) => codeSlug(x) !== codeSlug(c));
  const sameKind = others.filter((x) => x.kind === c.kind);
  const rest = others.filter((x) => x.kind !== c.kind);
  return [...sameKind, ...rest].slice(0, n);
}
