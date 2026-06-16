/**
 * Claim status code reference data for /edi/277/status-codes. One entry per code
 * drives one statically-generated page (see
 * app/edi/[code]/status-codes/[stc]/page.tsx), because AR and denial analysts
 * search individual status codes — "claim status code 21", "STC A3" — one at a
 * time, the same way they search CARC/RARC on an 835.
 *
 * A 277 (and the 277CA acknowledgment) reports where a claim stands using the
 * STC segment, which pairs two code systems:
 *   - Claim Status CATEGORY Codes: the broad bucket (A1 received, A3 rejected,
 *     F1 paid, F2 denied, P1 pending). Letter + digit.
 *   - Claim Status Codes: the specific detail (21 missing/invalid info, etc.).
 *     Numeric.
 * An STC reads category:status, e.g. "A3:21" = returned as unprocessable
 * because of missing or invalid information.
 *
 * All prose is our own plain-English wording — nothing is copied from the
 * official X12/WPC code lists. This is a curated set of the codes analysts hit
 * most; the official lists are maintained by X12 and entries can be appended.
 */
export type StatusKind = "category" | "status";

export type OutcomeKey =
  | "received"
  | "accepted"
  | "rejected"
  | "pending"
  | "paid"
  | "denied"
  | "finalized"
  | "eligibility";

export interface StatusCode {
  code: string; // "A3", "21"
  kind: StatusKind;
  /** One-line paraphrase of the standard description. */
  short: string;
  /** What it actually means, in plain English. */
  plain: string;
  /** When/why a payer or clearinghouse sends it. */
  why: string;
  /** What a billing team typically does about it. */
  fix: string;
  outcome: OutcomeKey;
}

export const OUTCOMES: Record<OutcomeKey, { label: string; blurb: string }> = {
  received: { label: "Received", blurb: "The claim arrived but hasn't been adjudicated yet." },
  accepted: { label: "Accepted", blurb: "The claim passed front-end checks and moved into processing." },
  rejected: { label: "Rejected", blurb: "The claim was returned unprocessed — fix and resubmit, no appeal." },
  pending: { label: "Pending", blurb: "Adjudication is in progress or waiting on information." },
  paid: { label: "Paid", blurb: "The claim finalized with a payment." },
  denied: { label: "Denied", blurb: "The claim finalized with no payment — appeal if warranted." },
  finalized: { label: "Finalized", blurb: "Adjudication is complete (see the detail for the result)." },
  eligibility: { label: "Eligibility / coverage", blurb: "A coverage, eligibility, or policy condition affected the claim." },
};

export const STATUS_CODES: StatusCode[] = [
  // ---- Category codes (A* / P* / F*) ----
  {
    code: "A0",
    kind: "category",
    short: "Acknowledgement / Forwarded.",
    plain: "Your claim was received and forwarded on to another entity for processing.",
    why: "The receiving payer or clearinghouse isn't the final processor and routed the claim to the correct one.",
    fix: "No action — track the claim at the entity it was forwarded to. Watch for the next 277 from that processor.",
    outcome: "accepted",
  },
  {
    code: "A1",
    kind: "category",
    short: "Acknowledgement / Receipt — received, not yet processed.",
    plain: "The claim was received but hasn't entered adjudication yet.",
    why: "A clearinghouse or payer is confirming receipt before it processes the claim.",
    fix: "No action needed — this is a normal receipt confirmation. Wait for the next status.",
    outcome: "received",
  },
  {
    code: "A2",
    kind: "category",
    short: "Acknowledgement / Acceptance into adjudication.",
    plain: "The claim passed acceptance edits and has moved into the payer's adjudication system.",
    why: "Front-end validation succeeded, so the claim is now being processed for payment.",
    fix: "No action — the claim is in process. Expect a finalized (F-series) status next.",
    outcome: "accepted",
  },
  {
    code: "A3",
    kind: "category",
    short: "Acknowledgement / Returned as unprocessable.",
    plain: "The claim was rejected before adjudication — it couldn't be processed as submitted.",
    why: "A structural or data problem (named by the accompanying status code) stopped the claim from being adjudicated.",
    fix: "Read the paired status code for the specific problem, correct it, and resubmit a new claim. A3 rejections are not appealed — they're corrected.",
    outcome: "rejected",
  },
  {
    code: "A4",
    kind: "category",
    short: "Acknowledgement / Not Found.",
    plain: "The entity could not find the claim you asked about.",
    why: "Often a response to a 276 status request where the claim was never received, or the identifiers didn't match.",
    fix: "Confirm the claim was actually submitted and that the IDs/dates in your status request match; resubmit the claim if it never arrived.",
    outcome: "rejected",
  },
  {
    code: "A5",
    kind: "category",
    short: "Acknowledgement / Split Claim.",
    plain: "The claim was split into more than one claim for processing.",
    why: "Payers split claims that cross benefit periods, providers, or other boundaries.",
    fix: "No action — track each resulting claim separately as it finalizes.",
    outcome: "accepted",
  },
  {
    code: "A6",
    kind: "category",
    short: "Acknowledgement / Rejected for Missing Information.",
    plain: "The claim was rejected because required information was missing.",
    why: "A mandatory field or segment wasn't supplied; the paired status code names it.",
    fix: "Add the missing information identified by the status code and resubmit.",
    outcome: "rejected",
  },
  {
    code: "A7",
    kind: "category",
    short: "Acknowledgement / Rejected for Invalid Information.",
    plain: "The claim was rejected because submitted information was invalid.",
    why: "A field was present but failed validation (bad code, format, or value); the paired status code names it.",
    fix: "Correct the invalid value identified by the status code and resubmit.",
    outcome: "rejected",
  },
  {
    code: "A8",
    kind: "category",
    short: "Acknowledgement / Rejected for relational field in error.",
    plain: "The claim was rejected because two fields that must agree didn't.",
    why: "A relational edit failed — e.g. a value that must match another field on the claim was inconsistent.",
    fix: "Reconcile the conflicting fields named by the status code and resubmit.",
    outcome: "rejected",
  },
  {
    code: "P1",
    kind: "category",
    short: "Pending / In Process.",
    plain: "The claim is being processed — no decision yet.",
    why: "Normal adjudication is underway.",
    fix: "No action — wait for a finalized status. Avoid resubmitting, which can create a duplicate.",
    outcome: "pending",
  },
  {
    code: "P2",
    kind: "category",
    short: "Pending / Payer Review.",
    plain: "The claim is held for the payer's manual or clinical review.",
    why: "Something on the claim triggered review (medical necessity, high dollar, audit, etc.).",
    fix: "No action yet — respond promptly if the payer requests records. Don't resubmit.",
    outcome: "pending",
  },
  {
    code: "P3",
    kind: "category",
    short: "Pending / Provider Requested Information.",
    plain: "Processing is paused waiting on information from the provider.",
    why: "The payer needs documentation or data from you to continue.",
    fix: "Send the requested information as soon as possible so adjudication can resume.",
    outcome: "pending",
  },
  {
    code: "P4",
    kind: "category",
    short: "Pending / Patient Requested Information.",
    plain: "Processing is paused waiting on information from the patient.",
    why: "The payer needs something from the member — often a coordination-of-benefits or accident questionnaire.",
    fix: "Prompt the patient to respond to the payer's request, then the claim can continue.",
    outcome: "pending",
  },
  {
    code: "P5",
    kind: "category",
    short: "Pending / Payer Administrative or System Hold.",
    plain: "The claim is held for an administrative or system reason on the payer's side.",
    why: "A payer-side hold (system, batch, or administrative) is delaying the claim.",
    fix: "No action — wait for the hold to clear. Follow up if it persists beyond normal timeframes.",
    outcome: "pending",
  },
  {
    code: "F0",
    kind: "category",
    short: "Finalized.",
    plain: "Adjudication is complete — see the paired status code for the result.",
    why: "The payer finished processing; the specific outcome is in the status code.",
    fix: "Read the paired status code to see whether it paid, denied, or adjusted, then reconcile.",
    outcome: "finalized",
  },
  {
    code: "F1",
    kind: "category",
    short: "Finalized / Payment.",
    plain: "The claim was adjudicated and a payment was made.",
    why: "The claim was approved for payment.",
    fix: "Reconcile against the 835 remittance to confirm the paid amount and any adjustments.",
    outcome: "paid",
  },
  {
    code: "F2",
    kind: "category",
    short: "Finalized / Denial.",
    plain: "The claim was adjudicated and denied — no payment.",
    why: "The payer processed the claim and decided not to pay it; the status code (and later the 835 CARC) gives the reason.",
    fix: "Find the denial reason, then correct and resubmit, appeal, or bill the patient as appropriate.",
    outcome: "denied",
  },
  {
    code: "F3",
    kind: "category",
    short: "Finalized / Revised — adjudication information changed.",
    plain: "A previously finalized claim was reprocessed and its result changed.",
    why: "The payer adjusted a prior adjudication (correction, reversal, or reprocessing).",
    fix: "Compare against the original and the corresponding 835 to see what changed; reconcile the difference.",
    outcome: "finalized",
  },
  {
    code: "F4",
    kind: "category",
    short: "Finalized / Adjudication Complete — no payment forthcoming.",
    plain: "Processing is done and no payment will be issued for this claim.",
    why: "The claim finalized in a way that yields no payment (e.g. fully patient responsibility or zero allowed).",
    fix: "Reconcile against the 835; bill the patient or write off per the adjustment reasons.",
    outcome: "finalized",
  },

  // ---- Status codes (numeric detail) ----
  {
    code: "1",
    kind: "status",
    short: "For more detailed information, see remittance advice.",
    plain: "The detail you need is on the remittance (835), not in this status response.",
    why: "The payer points you to the ERA/EOB for the specifics of how the claim was handled.",
    fix: "Pull the matching 835 remittance and read its CARC/RARC adjustments for the full detail.",
    outcome: "finalized",
  },
  {
    code: "16",
    kind: "status",
    short: "Claim/encounter has been forwarded to entity.",
    plain: "The claim was passed along to another entity for handling.",
    why: "Used with a forwarded (A0) status when the claim is routed to the correct processor or a secondary payer.",
    fix: "Track the claim at the entity it was forwarded to; no resubmission needed.",
    outcome: "accepted",
  },
  {
    code: "19",
    kind: "status",
    short: "Entity acknowledges receipt of claim/encounter.",
    plain: "The entity confirms it received the claim.",
    why: "A receipt confirmation, usually with an A1 category — the claim is in hand but not yet adjudicated.",
    fix: "No action — wait for the next status update.",
    outcome: "received",
  },
  {
    code: "20",
    kind: "status",
    short: "Accepted for processing.",
    plain: "The claim was accepted and is being processed.",
    why: "Front-end edits passed and the claim entered adjudication.",
    fix: "No action — expect a finalized status next. Don't resubmit.",
    outcome: "accepted",
  },
  {
    code: "21",
    kind: "status",
    short: "Missing or invalid information.",
    plain: "Required information on the claim is missing or invalid.",
    why: "The single most common rejection detail. It pairs with a rejection category (A3/A6/A7) and is usually accompanied by an entity identifier code pointing at the field at fault.",
    fix: "Identify the missing or invalid field (the STC entity code narrows it down), correct it, and resubmit a corrected claim.",
    outcome: "rejected",
  },
  {
    code: "23",
    kind: "status",
    short: "Returned to entity.",
    plain: "The claim was sent back to the submitter.",
    why: "The claim couldn't be processed and was returned for correction.",
    fix: "Review the accompanying detail, correct the claim, and resubmit.",
    outcome: "rejected",
  },
  {
    code: "24",
    kind: "status",
    short: "Entity not approved as an electronic submitter.",
    plain: "The submitter isn't set up to send claims electronically to this payer.",
    why: "EDI enrollment or trading-partner setup with the payer is missing or incomplete.",
    fix: "Complete the payer's EDI enrollment / trading-partner agreement, then resubmit.",
    outcome: "rejected",
  },
  {
    code: "26",
    kind: "status",
    short: "Entity not found.",
    plain: "An entity referenced on the claim (provider, subscriber, payer) couldn't be found.",
    why: "An identifier didn't match the payer's records.",
    fix: "Verify and correct the identifier flagged by the entity code and resubmit.",
    outcome: "rejected",
  },
  {
    code: "27",
    kind: "status",
    short: "Policy canceled.",
    plain: "The member's policy was canceled.",
    why: "Coverage wasn't active — the policy had been canceled for the date of service.",
    fix: "Verify eligibility for the date of service; bill the correct payer or the patient if there was no active coverage.",
    outcome: "eligibility",
  },
  {
    code: "37",
    kind: "status",
    short: "Predetermination is on file, awaiting completion of services.",
    plain: "A predetermination exists; the payer is waiting for the services to be completed/billed.",
    why: "Common for dental/ortho or staged treatment where a predetermination precedes the actual claim.",
    fix: "Submit the claim once services are rendered, referencing the predetermination.",
    outcome: "pending",
  },
  {
    code: "40",
    kind: "status",
    short: "Waiting for final approval.",
    plain: "The claim is nearly done but awaiting a final approval step.",
    why: "Adjudication is essentially complete but pending a final sign-off.",
    fix: "No action — wait for the finalized status.",
    outcome: "pending",
  },
  {
    code: "45",
    kind: "status",
    short: "Awaiting benefit determination.",
    plain: "The payer is still determining the member's benefits for this claim.",
    why: "Benefit or coverage determination is in progress.",
    fix: "No action — wait. Respond promptly to any benefit/eligibility information requests.",
    outcome: "pending",
  },
  {
    code: "65",
    kind: "status",
    short: "Claim/line has been paid.",
    plain: "The claim or service line was paid.",
    why: "Confirms payment at the claim or line level.",
    fix: "Reconcile against the 835 to confirm the amount and post the payment.",
    outcome: "paid",
  },
  {
    code: "72",
    kind: "status",
    short: "Claim contains split payment.",
    plain: "The claim was paid across more than one payment.",
    why: "Payment was divided — for example across payers, dates, or funding sources.",
    fix: "Match each payment portion to the corresponding 835 entries when reconciling.",
    outcome: "paid",
  },
  {
    code: "88",
    kind: "status",
    short: "Entity not eligible for benefits for submitted dates of service.",
    plain: "The member wasn't eligible for benefits on the dates billed.",
    why: "Coverage wasn't in force for the service dates.",
    fix: "Verify eligibility for the dates of service; bill the correct payer or the patient if coverage didn't apply.",
    outcome: "eligibility",
  },
  {
    code: "97",
    kind: "status",
    short: "Patient eligibility not found with entity.",
    plain: "The payer couldn't find the patient's eligibility.",
    why: "The member/policy identifiers didn't match an eligible record at this payer.",
    fix: "Re-verify the member ID and demographics against the ID card, correct, and resubmit.",
    outcome: "eligibility",
  },
  {
    code: "101",
    kind: "status",
    short: "Claim was processed as an adjustment to a previous claim.",
    plain: "This claim adjusted an earlier one rather than being processed as new.",
    why: "The payer treated it as a correction/replacement of a prior claim.",
    fix: "Reconcile the adjustment against the original claim and its 835; confirm the net result.",
    outcome: "finalized",
  },
  {
    code: "102",
    kind: "status",
    short: "Newborn's charges processed on mother's claim.",
    plain: "The newborn's services were processed under the mother's claim.",
    why: "Early newborn care is often adjudicated on the mother's coverage/claim.",
    fix: "No action if expected; if the newborn has separate coverage, confirm enrollment and bill accordingly.",
    outcome: "finalized",
  },
  {
    code: "104",
    kind: "status",
    short: "Processed according to plan provisions.",
    plain: "The claim was adjudicated per the member's plan rules.",
    why: "Informational — the outcome reflects the specific plan's benefits and provisions.",
    fix: "Reconcile against the 835; if the result looks wrong, check the plan's benefit documents before appealing.",
    outcome: "finalized",
  },
  {
    code: "107",
    kind: "status",
    short: "Claim/line is capitated.",
    plain: "This service is covered under a capitation arrangement, not paid per claim.",
    why: "The provider is paid a fixed per-member amount for these services, so no fee-for-service payment is issued.",
    fix: "No fee-for-service payment is due; confirm the capitation arrangement and don't bill the patient.",
    outcome: "finalized",
  },
  {
    code: "109",
    kind: "status",
    short: "Entity not eligible.",
    plain: "An entity on the claim isn't eligible (often the member or provider).",
    why: "Eligibility failed for the referenced entity — coverage, enrollment, or participation.",
    fix: "Identify which entity (the entity code) and why; correct eligibility/enrollment or bill the correct payer.",
    outcome: "eligibility",
  },
  {
    code: "454",
    kind: "status",
    short: "Procedure code for services rendered — additional information requested.",
    plain: "The payer needs the procedure code or more detail about the services rendered.",
    why: "Adjudication is paused pending procedure-level information or documentation.",
    fix: "Provide the requested procedure detail/documentation and resubmit or respond as the payer directs.",
    outcome: "pending",
  },
];

/** Slug used in the URL — lowercased code, e.g. "a3" or "21". */
export function codeSlug(c: StatusCode): string {
  return c.code.toLowerCase();
}

/** Display label, e.g. "A3" or "21". */
export function codeLabel(c: StatusCode): string {
  return c.code.toUpperCase();
}

export function getStatusCode(slug: string): StatusCode | undefined {
  return STATUS_CODES.find((c) => codeSlug(c) === slug.toLowerCase());
}

/** Related codes — same outcome first, then fill from the same kind. */
export function relatedCodes(c: StatusCode, n = 6): StatusCode[] {
  const others = STATUS_CODES.filter((x) => x.code !== c.code);
  const sameOutcome = others.filter((x) => x.outcome === c.outcome);
  const rest = others.filter((x) => x.outcome !== c.outcome && x.kind === c.kind);
  return [...sameOutcome, ...rest].slice(0, n);
}
