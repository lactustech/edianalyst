/**
 * Content for the per-transaction reference pages (/edi/<code>). These are the
 * site's SEO surface: one substantial, indexable page per transaction. All prose
 * is our own plain-English wording (spec §1.3) — nothing copied from a TR3 guide.
 */
export interface Faq {
  q: string;
  a: string;
}

export interface RefPage {
  code: string; // "835"
  slug: string; // url segment
  name: string; // "Electronic Remittance Advice (ERA)"
  metaTitle: string; // <= ~60 chars
  metaDescription: string; // ~150 chars
  summary: string[]; // intro paragraphs
  reads: string; // "how EDIAnalyst reads it" paragraph
  points: { h: string; b: string }[]; // key segments / fields
  extra: { title: string; items: { k: string; v: string }[] }; // common codes
  faq: Faq[];
  sample?: string;
  related: string[];
}

export const REFERENCE: RefPage[] = [
  {
    code: "835",
    slug: "835",
    name: "Electronic Remittance Advice (ERA)",
    metaTitle: "835 ERA Viewer — Decode Remittance Denials Free",
    metaDescription:
      "Open an 835 remittance (ERA) in your browser. EDIAnalyst decodes CARC/RARC denials into plain English, shows paid vs. adjusted per claim, and checks balancing.",
    summary: [
      "An 835 is the electronic explanation of how a payer settled a batch of claims — what was paid, what was adjusted, and why. It travels with the payment (usually an ACH/EFT) and tells a billing team exactly how every claim and service line was resolved.",
      "The hard part is the adjustment codes. Every dollar that wasn't paid is explained by a CARC (claim adjustment reason code) and sometimes a RARC remark, packed into terse CAS and LQ segments. EDIAnalyst decodes those into plain English and flags every denied claim for you.",
    ],
    reads:
      "EDIAnalyst reads the BPR and TRN to show the payment total and check or EFT number, then turns each CLP into a row — charge, paid, patient responsibility, and status. It expands every CAS adjustment into its CARC reason (and any RARC remark), tallies them per claim, and confirms that charge minus paid equals the adjustments. Denied claims are pulled into the findings list with their reasons spelled out.",
    points: [
      { h: "BPR / TRN", b: "The payment total, method, and check or EFT trace number." },
      { h: "CLP", b: "One per claim: charge, paid, patient responsibility, and status — paid, denied, or reversed." },
      { h: "CAS + CARC / RARC", b: "The reason each amount was adjusted, decoded into plain English." },
      { h: "Balancing", b: "Charge should equal paid plus all adjustments; mismatches are flagged automatically." },
    ],
    extra: {
      title: "Common adjustment reasons in an 835",
      items: [
        { k: "CO-45", v: "Charge exceeds the contracted or allowed amount (a provider write-off)" },
        { k: "CO-97", v: "Payment is bundled into another service's allowance" },
        { k: "CO-96", v: "Non-covered service" },
        { k: "PR-1", v: "Applied to the patient's deductible" },
        { k: "PR-2", v: "Applied to coinsurance" },
        { k: "CO-197", v: "Required pre-authorization was not obtained" },
      ],
    },
    faq: [
      { q: "Is an 835 the same as an ERA?", a: "Yes — 835 is the X12 transaction number and ERA (Electronic Remittance Advice) is the business name. It's the electronic version of the paper EOB a payer sends a provider." },
      { q: "What are CARC and RARC codes?", a: "CARC (Claim Adjustment Reason Codes) explain why an amount wasn't paid; RARC (Remittance Advice Remark Codes) add extra context. EDIAnalyst translates both into plain English." },
      { q: "How do I know if an 835 balances?", a: "For each claim, the charge should equal what was paid plus every adjustment. EDIAnalyst checks this and flags any claim that doesn't reconcile." },
      { q: "Is my 835 file uploaded anywhere?", a: "No. The file is parsed entirely in your browser — no file or PHI is ever sent to a server." },
    ],
    sample: "sample-835.edi",
    related: ["837", "834", "277"],
  },
  {
    code: "837",
    slug: "837",
    name: "Health Care Claim (Professional & Institutional)",
    metaTitle: "837 Claim Viewer — Professional & Institutional",
    metaDescription:
      "Open an 837P or 837I claim in your browser. EDIAnalyst flattens the HL hierarchy into one row per claim, decodes diagnoses and service lines, and checks balancing.",
    summary: [
      "An 837 is the claim a provider sends a payer to get paid. The professional variant (837P) carries CPT/HCPCS procedures and diagnosis pointers; the institutional variant (837I) carries NUBC revenue codes and a type of bill for facility billing.",
      "It's a hierarchy: billing provider → subscriber → claim → service lines, with diagnoses attached at the claim. EDIAnalyst flattens that into one row per claim and checks the essentials a payer would reject on — balancing, a billing NPI, at least one diagnosis, and in-range diagnosis pointers.",
    ],
    reads:
      "Because an 837 is hierarchical, EDIAnalyst walks the HL loops — billing provider, subscriber, then claim — and carries that context onto each CLM. It lists the diagnoses from the HI segment and the service lines from SV1 (professional) or SV2 (institutional), then checks the claim total against the sum of the lines and verifies that every diagnosis pointer references a diagnosis that's actually on the claim.",
    points: [
      { h: "Hierarchy (HL)", b: "Billing provider, subscriber, patient, and claim, carried forward as context." },
      { h: "CLM", b: "Patient control number, total charge, and place of service or type of bill." },
      { h: "HI", b: "ICD-10 diagnoses — the principal diagnosis plus any additional ones." },
      { h: "SV1 / SV2", b: "Professional procedure lines versus institutional revenue lines." },
    ],
    extra: {
      title: "What payers commonly reject 837 claims for",
      items: [
        { k: "Missing NPI", v: "No billing provider NPI on the claim" },
        { k: "No diagnosis", v: "A claim with no ICD-10 diagnosis to justify its services" },
        { k: "Bad pointer", v: "A service line pointing to a diagnosis that isn't on the claim" },
        { k: "Out of balance", v: "Claim total doesn't equal the sum of service-line charges" },
        { k: "No revenue code", v: "An institutional (837I) line missing its NUBC revenue code" },
      ],
    },
    faq: [
      { q: "What's the difference between 837P and 837I?", a: "837P is the professional claim (doctor or clinic) with CPT/HCPCS procedures; 837I is the institutional claim (hospital or facility) with NUBC revenue codes and a type of bill. EDIAnalyst detects which one you dropped automatically." },
      { q: "How is an 837 structured?", a: "As a hierarchy: a billing provider contains subscribers, each subscriber contains claims, and each claim contains diagnoses and service lines. EDIAnalyst flattens that to one row per claim." },
      { q: "Can I check a claim before sending it?", a: "Yes. EDIAnalyst flags what payers typically reject on — missing NPI, no diagnosis, out-of-range diagnosis pointers, and out-of-balance totals." },
      { q: "Is the claim uploaded?", a: "No — it's parsed entirely in your browser; nothing is sent to a server." },
    ],
    sample: "sample-837.edi",
    related: ["835", "277", "999"],
  },
  {
    code: "834",
    slug: "834",
    name: "Benefit Enrollment and Maintenance",
    metaTitle: "834 Enrollment Viewer — Member Table & Diff",
    metaDescription:
      "Open an 834 benefit-enrollment file in your browser. EDIAnalyst builds a member table, badges each add/term/change, and diffs this week's file against last week's.",
    summary: [
      "An 834 moves member enrollment between an employer or sponsor and a health plan — who is being added, terminated, or changed, and what coverage they carry.",
      "For an enrollment analyst the key field is the maintenance type on each member (addition, termination, change), buried in the INS segment. EDIAnalyst surfaces it as a color-coded badge, builds a member-level table, and can diff this week's file against last week's.",
    ],
    reads:
      "EDIAnalyst reads each INS segment to badge the maintenance type, then pulls the member's name, ID, demographics, and coverage lines into a single row. It tallies the file's additions, terminations, and changes for the summary bar, and can compare two 834s to show exactly who joined, left, or changed — with field-level before and after.",
    points: [
      { h: "INS", b: "Relationship to the subscriber and the all-important maintenance type." },
      { h: "NM1 / DMG", b: "Member name, ID, date of birth, and gender." },
      { h: "HD + DTP", b: "Health-coverage lines and their effective dates." },
      { h: "Diff", b: "Compare two 834s to see who was added, removed, or changed." },
    ],
    extra: {
      title: "Maintenance types you'll see in an 834",
      items: [
        { k: "021", v: "Addition — a new member or coverage" },
        { k: "024", v: "Termination — coverage ending" },
        { k: "001", v: "Change — an update to an existing member" },
        { k: "025", v: "Reinstatement" },
        { k: "030", v: "Audit or comparison record" },
      ],
    },
    faq: [
      { q: "What is an 834 file used for?", a: "It moves member enrollment between an employer or sponsor and a health plan — adding, terminating, and changing members and their coverage." },
      { q: "What's the most important field in an 834?", a: "The maintenance type on each member (addition, termination, change). EDIAnalyst shows it as a color-coded badge so you can scan a file in seconds." },
      { q: "Can I compare two 834 files?", a: "Yes. The diff keys members on subscriber and member ID and shows who was added, removed, or changed, with field-level before and after." },
      { q: "Is the file uploaded?", a: "No — parsing happens entirely in your browser." },
    ],
    sample: "sample-834.edi",
    related: ["820", "270", "271"],
  },
  {
    code: "270",
    slug: "270",
    name: "Eligibility & Benefit Inquiry",
    metaTitle: "270 Eligibility Inquiry Viewer — Free Online",
    metaDescription:
      "Open a 270 eligibility and benefit inquiry in your browser. EDIAnalyst lists each member and the service types being checked, parsed locally with no upload.",
    summary: [
      "A 270 asks a payer whether a patient is covered and which benefits apply — sent before a visit to avoid surprises at the desk.",
      "It names the payer, the provider asking, and the patient, then lists the service types in question. EDIAnalyst lists each member and exactly what was asked about.",
    ],
    reads:
      "EDIAnalyst walks the HL hierarchy — payer, then the provider asking, then each subscriber — and lists every member alongside the service types they're asking about from the EQ segments, so you can review the whole inquiry batch at a glance.",
    points: [
      { h: "HL hierarchy", b: "Information source (payer), receiver (provider), and subscriber." },
      { h: "NM1 / DMG", b: "Who the inquiry is about." },
      { h: "EQ", b: "The service types being checked, such as plan coverage or an office visit." },
    ],
    extra: {
      title: "Common service-type codes in a 270",
      items: [
        { k: "30", v: "Plan coverage / general benefits" },
        { k: "98", v: "Office visit (professional)" },
        { k: "35", v: "Dental care" },
        { k: "88", v: "Pharmacy" },
        { k: "47", v: "Hospital" },
        { k: "AL", v: "Vision" },
      ],
    },
    faq: [
      { q: "What is a 270 transaction?", a: "It's an eligibility and benefit inquiry — a provider asking a payer whether a patient is covered and what benefits apply, usually before a visit." },
      { q: "What does a 270 contain?", a: "The payer, the provider making the request, the patient, and the specific service types being checked in the EQ segments." },
      { q: "What comes back from a 270?", a: "A 271 response with the patient's active or inactive status and benefit details. EDIAnalyst reads both the 270 and the 271." },
      { q: "Is it uploaded?", a: "No — everything is parsed in your browser." },
    ],
    sample: "sample-270.edi",
    related: ["271", "276"],
  },
  {
    code: "271",
    slug: "271",
    name: "Eligibility & Benefit Response",
    metaTitle: "271 Eligibility Response Viewer — Active/Inactive",
    metaDescription:
      "Open a 271 eligibility response in your browser. EDIAnalyst shows each member's active/inactive coverage, decodes copays and deductibles, and flags inactive coverage.",
    summary: [
      "A 271 is the payer's answer to a 270: is the patient active, and what are the copays, deductibles, and limits?",
      "The headline an analyst wants is active versus inactive. EDIAnalyst derives that per member, decodes each benefit line, and flags coverage that came back inactive.",
    ],
    reads:
      "EDIAnalyst reads the EB benefit lines to derive a clear active-or-inactive headline for each member, then decodes the details — copays, deductibles, plan, and limits. Members whose coverage came back inactive are flagged in the findings list so you don't miss them.",
    points: [
      { h: "EB", b: "The benefit lines: active/inactive status, copay, deductible, and plan." },
      { h: "Coverage status", b: "A derived active or inactive headline for each member." },
      { h: "Findings", b: "Inactive coverage is surfaced automatically." },
    ],
    extra: {
      title: "What an EB benefit line can tell you",
      items: [
        { k: "Active", v: "Coverage is in force" },
        { k: "Inactive", v: "Coverage is not currently active" },
        { k: "Co-payment", v: "A fixed amount the patient owes per service" },
        { k: "Deductible", v: "Amount the patient pays before coverage applies" },
        { k: "Out-of-pocket", v: "The patient's stop-loss maximum" },
      ],
    },
    faq: [
      { q: "What is a 271 transaction?", a: "It's the eligibility and benefit response a payer returns to a provider's 270 inquiry, stating whether the patient is covered and what the benefits are." },
      { q: "How do I tell if a patient is active?", a: "EDIAnalyst derives an active or inactive headline for each member from the EB lines and flags anyone whose coverage came back inactive." },
      { q: "Does a 271 include copays and deductibles?", a: "Yes — benefit lines can carry copay, coinsurance, deductible, and out-of-pocket amounts, all of which EDIAnalyst decodes." },
      { q: "Is the file uploaded?", a: "No — it's parsed entirely in your browser." },
    ],
    sample: "sample-271.edi",
    related: ["270", "276"],
  },
  {
    code: "276",
    slug: "276",
    name: "Claim Status Request",
    metaTitle: "276 Claim Status Request Viewer — Free Online",
    metaDescription:
      "Open a 276 claim status request in your browser. EDIAnalyst lists every claim being chased, with patient and control numbers, parsed locally with no upload.",
    summary: [
      "A 276 asks a payer what is happening with a claim after it has been submitted.",
      "It identifies the claim, patient, and provider. EDIAnalyst lists each claim being chased so you can track the whole batch.",
    ],
    reads:
      "EDIAnalyst walks the HL hierarchy down to the patient and lists each claim being chased, with its trace and control numbers, so the whole batch of status requests is visible in one table. Pair it with the 277 response to close the loop.",
    points: [
      { h: "HL hierarchy", b: "Payer, provider, patient, and claim." },
      { h: "TRN", b: "The trace number used to match the response." },
      { h: "REF", b: "The provider and payer claim-control numbers." },
    ],
    extra: {
      title: "What a 276 identifies",
      items: [
        { k: "TRN", v: "The trace number used to match the 277 response" },
        { k: "REF", v: "The provider and payer claim-control numbers" },
        { k: "Patient", v: "The subscriber or dependent the claim is for" },
      ],
    },
    faq: [
      { q: "What is a 276 transaction?", a: "It's a claim status request — a provider asking a payer what is happening with a claim after it has been submitted." },
      { q: "What's the difference between a 276 and a 277?", a: "A 276 is the question (what's the status?) and a 277 is the answer (received, paid, denied, etc.). EDIAnalyst reads both." },
      { q: "How are claims matched to the response?", a: "By the TRN trace number and the claim-control numbers in the REF segments." },
      { q: "Is the file uploaded?", a: "No — it's parsed entirely in your browser." },
    ],
    sample: "sample-276.edi",
    related: ["277", "837"],
  },
  {
    code: "277",
    slug: "277",
    name: "Claim Status Response (and 277CA Acknowledgment)",
    metaTitle: "277 / 277CA Claim Status Viewer — Decode STC",
    metaDescription:
      "Open a 277 claim status response or 277CA acknowledgment in your browser. EDIAnalyst decodes STC into paid/denied/rejected/pending and flags rejections.",
    summary: [
      "A 277 reports where a claim stands — received, accepted, finalized/paid, denied, or pending. The 277CA variant is a claim acknowledgment a clearinghouse returns right after an 837, accepting or rejecting each claim before adjudication.",
      "The status lives in STC category and status codes. EDIAnalyst decodes them into an outcome, color-codes each claim, and flags every rejection and denial in plain English.",
    ],
    reads:
      "EDIAnalyst reads each STC status — its category and detail codes — and turns it into a plain-English outcome: received, accepted, paid, denied, rejected, or pending. It color-codes every claim and pulls rejections and denials into the findings list. A 277CA (the X214 acknowledgment) is detected automatically from the version.",
    points: [
      { h: "STC", b: "The claim status category and detail, decoded into an outcome." },
      { h: "Outcome", b: "Accepted, paid, denied, rejected, or pending." },
      { h: "277CA", b: "An early accept/reject acknowledgment of an 837 batch." },
    ],
    extra: {
      title: "Common claim status categories (STC)",
      items: [
        { k: "A1 / A2", v: "Received / accepted into adjudication" },
        { k: "A3", v: "Returned as unprocessable (rejected)" },
        { k: "F1", v: "Finalized — paid" },
        { k: "F2", v: "Finalized — denied" },
        { k: "P1", v: "Pending — in process" },
      ],
    },
    faq: [
      { q: "What's the difference between a 277 and a 277CA?", a: "A 277 is a general claim status response; a 277CA (the X214 implementation) is a claim acknowledgment a clearinghouse returns right after an 837, accepting or rejecting each claim before adjudication. EDIAnalyst detects which one you dropped." },
      { q: "What do STC codes mean?", a: "STC carries a status category and a status code that together say where a claim is. EDIAnalyst decodes them into a simple outcome and color-codes each claim." },
      { q: "Can I see which claims were rejected?", a: "Yes — rejections and denials are pulled into the plain-English findings list." },
      { q: "Is the file uploaded?", a: "No — it's parsed entirely in your browser." },
    ],
    sample: "sample-277.edi",
    related: ["276", "837", "999"],
  },
  {
    code: "999",
    slug: "999",
    name: "Implementation Acknowledgment",
    metaTitle: "999 Acknowledgment Viewer — Decode Rejections",
    metaDescription:
      "Open a 999 implementation acknowledgment in your browser. EDIAnalyst shows whether your 837 batch was accepted or rejected and decodes every segment and element error.",
    summary: [
      "A 999 tells you whether a functional group you sent — say an 837 batch — was accepted or rejected, and pinpoints the syntax errors.",
      "It answers the question 'did my batch go through?' EDIAnalyst reads the accept/reject status for each transaction and lists every flagged segment and element error in plain English.",
    ],
    reads:
      "EDIAnalyst reads the AK1 and AK9 to show what was acknowledged and the overall result, then the IK5 status for each transaction — accepted, accepted-with-errors, or rejected. Every IK3 segment error and IK4 element error is decoded into plain English, so you know exactly which segment and which field to fix.",
    points: [
      { h: "AK1 / AK9", b: "What was acknowledged and the overall group result." },
      { h: "IK5", b: "Per-transaction accepted, accepted-with-errors, or rejected." },
      { h: "IK3 / IK4", b: "The exact segment and element errors, decoded." },
    ],
    extra: {
      title: "Common 999 error types",
      items: [
        { k: "Required segment missing", v: "A mandatory segment wasn't sent" },
        { k: "Invalid code value", v: "An element used a code the guide doesn't allow" },
        { k: "Invalid date", v: "A date wasn't a valid calendar date" },
        { k: "Segment out of order", v: "A segment appeared in the wrong sequence" },
        { k: "Too many repetitions", v: "A segment or element repeated more than allowed" },
      ],
    },
    faq: [
      { q: "What is a 999 transaction?", a: "It's an implementation acknowledgment that tells you whether a functional group you sent — such as an 837 batch — was accepted or rejected, and where the syntax errors are." },
      { q: "What's the difference between a 999 and a 277CA?", a: "A 999 checks syntax (did the file conform to the X12 implementation guide?); a 277CA checks the claim itself (was it accepted for adjudication?). A file can pass the 999 and still be rejected on the 277CA." },
      { q: "How do I find what failed?", a: "EDIAnalyst lists every rejected transaction and decodes its IK3 segment errors and IK4 element errors into plain English." },
      { q: "Is the file uploaded?", a: "No — it's parsed entirely in your browser." },
    ],
    sample: "sample-999.edi",
    related: ["837", "277"],
  },
  {
    code: "820",
    slug: "820",
    name: "Premium Payment",
    metaTitle: "820 Premium Payment Viewer — Free & In-Browser",
    metaDescription:
      "Open an 820 group premium payment in your browser. EDIAnalyst shows the payment total and one row per premium line, and checks that the lines add up. No upload.",
    summary: [
      "An 820 carries a group premium payment from an employer to an insurer — the total paid and how it breaks down by policy or member.",
      "EDIAnalyst shows the payment summary and one row per premium line, and checks that the lines add up to the stated total.",
    ],
    reads:
      "EDIAnalyst reads the BPR and TRN for the payment total, method, and trace number, then lists each RMR premium line with its policy reference and amount, and confirms that the line amounts sum to the stated payment total.",
    points: [
      { h: "BPR / TRN", b: "The payment total, method, and trace number." },
      { h: "RMR", b: "Each premium line: its policy or account reference and amount." },
      { h: "Balancing", b: "Line amounts should sum to the payment total." },
    ],
    extra: {
      title: "What's in an 820 premium line (RMR)",
      items: [
        { k: "Reference", v: "The policy, group, or account number for the line" },
        { k: "Amount paid", v: "The premium paid for that line" },
        { k: "Total (BPR02)", v: "The line amounts should sum to this payment total" },
      ],
    },
    faq: [
      { q: "What is an 820 transaction?", a: "It's a premium payment — typically a group premium an employer pays an insurer, with the total and a breakdown by policy or member." },
      { q: "How is an 820 related to an 834?", a: "An 834 enrolls and maintains members; an 820 pays the premiums for them. They're often handled by the same benefits-administration team." },
      { q: "Does the 820 balance?", a: "The individual premium lines should add up to the payment total. EDIAnalyst checks this and flags a mismatch." },
      { q: "Is the file uploaded?", a: "No — it's parsed entirely in your browser." },
    ],
    sample: "sample-820.edi",
    related: ["834"],
  },
];

export function getRef(slug: string): RefPage | undefined {
  return REFERENCE.find((r) => r.slug === slug);
}
