/**
 * Content for the per-transaction reference pages (/edi/<code>). These are the
 * site's SEO surface: one indexable page per transaction. All prose is our own
 * plain-English wording (spec §1.3) — nothing copied from a TR3 guide.
 */
export interface RefPage {
  code: string; // "835"
  slug: string; // url segment, lowercase of code
  name: string; // "Electronic Remittance Advice (ERA)"
  summary: string[]; // 1–2 short paragraphs
  points: { h: string; b: string }[]; // key segments / fields
  sample?: string; // sample file the CTA loads
  related: string[]; // related codes
}

export const REFERENCE: RefPage[] = [
  {
    code: "835",
    slug: "835",
    name: "Electronic Remittance Advice (ERA)",
    summary: [
      "An 835 is the electronic explanation of how a payer settled a batch of claims — what was paid, what was adjusted, and why. It travels with the payment (usually an ACH/EFT) and tells a billing team exactly how every claim and service line was resolved.",
      "The hard part is the adjustment codes. Every dollar that wasn't paid is explained by a CARC (claim adjustment reason code) and sometimes a RARC remark, packed into terse CAS and LQ segments. EDIAnalyst decodes those into plain English and flags every denied claim for you.",
    ],
    points: [
      { h: "BPR / TRN", b: "The payment total, method, and check or EFT trace number." },
      { h: "CLP", b: "One per claim: charge, paid, patient responsibility, and status — paid, denied, or reversed." },
      { h: "CAS + CARC / RARC", b: "The reason each amount was adjusted, decoded into plain English." },
      { h: "Balancing", b: "Charge should equal paid plus all adjustments; mismatches are flagged automatically." },
    ],
    sample: "sample-835.edi",
    related: ["837", "834", "277"],
  },
  {
    code: "837",
    slug: "837",
    name: "Health Care Claim (Professional & Institutional)",
    summary: [
      "An 837 is the claim a provider sends a payer to get paid. The professional variant (837P) carries CPT/HCPCS procedures and diagnosis pointers; the institutional variant (837I) carries NUBC revenue codes and a type of bill for facility billing.",
      "It's a hierarchy: billing provider → subscriber → claim → service lines, with diagnoses attached at the claim. EDIAnalyst flattens that into one row per claim and checks the essentials a payer would reject on — balancing, a billing NPI, at least one diagnosis, and in-range diagnosis pointers.",
    ],
    points: [
      { h: "Hierarchy (HL)", b: "Billing provider, subscriber, patient, and claim, carried forward as context." },
      { h: "CLM", b: "Patient control number, total charge, and place of service or type of bill." },
      { h: "HI", b: "ICD-10 diagnoses — the principal diagnosis plus any additional ones." },
      { h: "SV1 / SV2", b: "Professional procedure lines versus institutional revenue lines." },
    ],
    sample: "sample-837.edi",
    related: ["835", "277", "999"],
  },
  {
    code: "834",
    slug: "834",
    name: "Benefit Enrollment and Maintenance",
    summary: [
      "An 834 moves member enrollment between an employer or sponsor and a health plan — who is being added, terminated, or changed, and what coverage they carry.",
      "For an enrollment analyst the key field is the maintenance type on each member (addition, termination, change), buried in the INS segment. EDIAnalyst surfaces it as a color-coded badge, builds a member-level table, and can diff this week's file against last week's.",
    ],
    points: [
      { h: "INS", b: "Relationship to the subscriber and the all-important maintenance type." },
      { h: "NM1 / DMG", b: "Member name, ID, date of birth, and gender." },
      { h: "HD + DTP", b: "Health-coverage lines and their effective dates." },
      { h: "Diff", b: "Compare two 834s to see who was added, removed, or changed." },
    ],
    sample: "sample-834.edi",
    related: ["820", "270", "271"],
  },
  {
    code: "270",
    slug: "270",
    name: "Eligibility & Benefit Inquiry",
    summary: [
      "A 270 asks a payer whether a patient is covered and which benefits apply — sent before a visit to avoid surprises at the desk.",
      "It names the payer, the provider asking, and the patient, then lists the service types in question. EDIAnalyst lists each member and exactly what was asked about.",
    ],
    points: [
      { h: "HL hierarchy", b: "Information source (payer), receiver (provider), and subscriber." },
      { h: "NM1 / DMG", b: "Who the inquiry is about." },
      { h: "EQ", b: "The service types being checked, such as plan coverage or an office visit." },
    ],
    sample: "sample-270.edi",
    related: ["271", "276"],
  },
  {
    code: "271",
    slug: "271",
    name: "Eligibility & Benefit Response",
    summary: [
      "A 271 is the payer's answer to a 270: is the patient active, and what are the copays, deductibles, and limits?",
      "The headline an analyst wants is active versus inactive. EDIAnalyst derives that per member, decodes each benefit line, and flags coverage that came back inactive.",
    ],
    points: [
      { h: "EB", b: "The benefit lines: active/inactive status, copay, deductible, and plan." },
      { h: "Coverage status", b: "A derived active/inactive headline for each member." },
      { h: "Findings", b: "Inactive coverage is surfaced automatically." },
    ],
    sample: "sample-271.edi",
    related: ["270", "276"],
  },
  {
    code: "276",
    slug: "276",
    name: "Claim Status Request",
    summary: [
      "A 276 asks a payer what is happening with a claim after it has been submitted.",
      "It identifies the claim, patient, and provider. EDIAnalyst lists each claim being chased so you can track the batch.",
    ],
    points: [
      { h: "HL hierarchy", b: "Payer, provider, patient, and claim." },
      { h: "TRN / REF", b: "The trace and claim-control numbers that identify each claim." },
    ],
    sample: "sample-276.edi",
    related: ["277", "837"],
  },
  {
    code: "277",
    slug: "277",
    name: "Claim Status Response (and 277CA Acknowledgment)",
    summary: [
      "A 277 reports where a claim stands — received, accepted, finalized/paid, denied, or pending. The 277CA variant is a claim acknowledgment a clearinghouse returns right after an 837, accepting or rejecting each claim before adjudication.",
      "The status lives in STC category and status codes. EDIAnalyst decodes them into an outcome, color-codes each claim, and flags every rejection and denial in plain English.",
    ],
    points: [
      { h: "STC", b: "The claim status category and detail, decoded." },
      { h: "Outcome", b: "Accepted, paid, denied, rejected, or pending." },
      { h: "277CA", b: "An early accept/reject acknowledgment of an 837 batch." },
    ],
    sample: "sample-277.edi",
    related: ["276", "837", "999"],
  },
  {
    code: "999",
    slug: "999",
    name: "Implementation Acknowledgment",
    summary: [
      "A 999 tells you whether a functional group you sent — say an 837 batch — was accepted or rejected, and pinpoints the syntax errors.",
      "It answers the question 'did my batch go through?' EDIAnalyst reads the accept/reject status for each transaction and lists every flagged segment and element error in plain English.",
    ],
    points: [
      { h: "AK1 / AK9", b: "What was acknowledged and the overall group result." },
      { h: "IK5", b: "Per-transaction accepted, accepted-with-errors, or rejected." },
      { h: "IK3 / IK4", b: "The exact segment and element errors, decoded." },
    ],
    sample: "sample-999.edi",
    related: ["837", "277"],
  },
  {
    code: "820",
    slug: "820",
    name: "Premium Payment",
    summary: [
      "An 820 carries a group premium payment from an employer to an insurer — the total paid and how it breaks down by policy or member.",
      "EDIAnalyst shows the payment summary and one row per premium line, and checks that the lines add up to the stated total.",
    ],
    points: [
      { h: "BPR / TRN", b: "The payment total, method, and trace number." },
      { h: "RMR", b: "Each premium line: its policy or account reference and amount." },
      { h: "Balancing", b: "Line amounts should sum to the payment total." },
    ],
    sample: "sample-820.edi",
    related: ["834"],
  },
];

export function getRef(slug: string): RefPage | undefined {
  return REFERENCE.find((r) => r.slug === slug);
}
