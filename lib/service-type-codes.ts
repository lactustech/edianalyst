/**
 * Service Type Code reference data for /edi/270/service-type-codes. One entry
 * per code drives one statically-generated page (see
 * app/edi/[code]/service-type-codes/[st]/page.tsx), because eligibility staff
 * look up individual service type codes — "service type code 30", "EQ 98" — one
 * at a time.
 *
 * Service Type Codes appear in the EQ01 element of a 270 eligibility inquiry
 * (the benefit you're asking about) and the EB03 element of the 271 response
 * (the benefit being described). They name WHAT coverage is in question — e.g.
 * 30 = overall plan coverage, 98 = an office visit, 88 = pharmacy.
 *
 * All prose is our own plain-English wording — nothing is copied from the
 * official X12 code list. This is a curated set of the codes used most; the full
 * list is maintained by X12 and entries can be appended here.
 */
export type GroupKey =
  | "general"
  | "medical"
  | "facility"
  | "diagnostic"
  | "dental"
  | "vision"
  | "pharmacy"
  | "behavioral"
  | "therapy"
  | "preventive"
  | "dme";

export interface ServiceType {
  code: string; // "30", "98", "AL", "MH"
  name: string; // "Health Benefit Plan Coverage"
  /** What the service type covers, in plain English. */
  plain: string;
  /** How it shows up in a 270 inquiry / 271 response. */
  use: string;
  /** A practical note for the analyst. */
  tip: string;
  group: GroupKey;
}

export const GROUPS: Record<GroupKey, { label: string; blurb: string }> = {
  general: { label: "General coverage", blurb: "Overall plan-level benefits." },
  medical: { label: "Medical / professional", blurb: "Physician and general medical services." },
  facility: { label: "Facility / institutional", blurb: "Hospital, home health, and other facility care." },
  diagnostic: { label: "Diagnostic", blurb: "Imaging and lab services." },
  dental: { label: "Dental", blurb: "Dental and oral-surgery benefits." },
  vision: { label: "Vision", blurb: "Eye exams and vision benefits." },
  pharmacy: { label: "Pharmacy", blurb: "Prescription drug benefits." },
  behavioral: { label: "Behavioral health", blurb: "Mental health and substance-use services." },
  therapy: { label: "Therapy / rehab", blurb: "Rehabilitative and ongoing-treatment services." },
  preventive: { label: "Preventive", blurb: "Wellness, screening, and preventive care." },
  dme: { label: "DME", blurb: "Durable medical equipment." },
};

export const SERVICE_TYPES: ServiceType[] = [
  {
    code: "30",
    name: "Health Benefit Plan Coverage",
    plain: "The patient's overall plan coverage — the catch-all that returns general eligibility and benefit information rather than one specific service.",
    use: "By far the most common service type. A 270 with code 30 asks 'is this member covered, and what are the plan-level benefits?'; the 271 returns active/inactive status plus general deductible, copay, and out-of-pocket information.",
    tip: "Start here to confirm eligibility, then send a more specific code (like 98 or 88) when you need benefits for a particular service.",
    group: "general",
  },
  {
    code: "1",
    name: "Medical Care",
    plain: "General medical care benefits — broad medical services not tied to a more specific category.",
    use: "Used to ask about general medical benefits when a narrower code doesn't fit.",
    tip: "Fairly broad; prefer a specific code (office visit, hospital, etc.) when you know the service.",
    group: "medical",
  },
  {
    code: "2",
    name: "Surgical",
    plain: "Surgical procedure benefits.",
    use: "Asks whether surgical services are covered and at what benefit level.",
    tip: "Surgery often requires prior authorization — check the 271 for any authorization message.",
    group: "medical",
  },
  {
    code: "3",
    name: "Consultation",
    plain: "Specialist consultation benefits.",
    use: "Asks about coverage for a consultation, often with a specialist.",
    tip: "Watch for referral requirements on managed-care plans.",
    group: "medical",
  },
  {
    code: "4",
    name: "Diagnostic X-Ray",
    plain: "Diagnostic X-ray imaging benefits.",
    use: "Asks whether diagnostic X-ray services are covered.",
    tip: "Often shares benefits with other diagnostic categories; confirm the specific imaging benefit.",
    group: "diagnostic",
  },
  {
    code: "5",
    name: "Diagnostic Lab",
    plain: "Laboratory test benefits.",
    use: "Asks about coverage for diagnostic lab work.",
    tip: "Some plans only cover labs from in-network or contracted laboratories.",
    group: "diagnostic",
  },
  {
    code: "6",
    name: "Radiation Therapy",
    plain: "Radiation therapy benefits, typically for cancer treatment.",
    use: "Asks whether radiation therapy is covered and at what level.",
    tip: "Frequently requires prior authorization; check the 271 for limits.",
    group: "therapy",
  },
  {
    code: "12",
    name: "Durable Medical Equipment Purchase",
    plain: "Benefits for purchasing durable medical equipment (DME).",
    use: "Asks about coverage to buy DME such as wheelchairs or hospital beds.",
    tip: "Compare against rental (code 18) — plans often prefer one over the other based on duration.",
    group: "dme",
  },
  {
    code: "18",
    name: "Durable Medical Equipment Rental",
    plain: "Benefits for renting durable medical equipment.",
    use: "Asks about coverage to rent DME.",
    tip: "Plans may cap rental months before requiring purchase; check the 271 limits.",
    group: "dme",
  },
  {
    code: "33",
    name: "Chiropractic",
    plain: "Chiropractic care benefits.",
    use: "Asks whether chiropractic services are covered and any visit limits.",
    tip: "Commonly visit-limited per year — look for a benefit-maximum message in the 271.",
    group: "medical",
  },
  {
    code: "35",
    name: "Dental Care",
    plain: "Dental benefits — exams, cleanings, and dental procedures.",
    use: "Asks about dental coverage; often answered by a separate dental plan.",
    tip: "Medical and dental coverage are frequently separate plans; the member may need a dental-specific inquiry.",
    group: "dental",
  },
  {
    code: "40",
    name: "Oral Surgery",
    plain: "Oral surgery benefits.",
    use: "Asks about coverage for oral surgical procedures.",
    tip: "Coverage can fall under medical or dental depending on the procedure — verify which plan applies.",
    group: "dental",
  },
  {
    code: "42",
    name: "Home Health Care",
    plain: "Home health care benefits — skilled care delivered in the home.",
    use: "Asks whether home health services are covered and any visit limits.",
    tip: "Usually requires medical necessity and may need authorization; check limits in the 271.",
    group: "facility",
  },
  {
    code: "45",
    name: "Hospice",
    plain: "Hospice care benefits for terminally ill patients.",
    use: "Asks about hospice coverage.",
    tip: "Hospice election can change how other services are covered for the patient.",
    group: "facility",
  },
  {
    code: "47",
    name: "Hospital",
    plain: "General hospital benefits, without specifying inpatient or outpatient.",
    use: "Asks about overall hospital coverage.",
    tip: "Prefer the specific 48 (inpatient) or 50 (outpatient) when you know the setting.",
    group: "facility",
  },
  {
    code: "48",
    name: "Hospital - Inpatient",
    plain: "Inpatient hospital benefits — admitted stays.",
    use: "Asks about coverage for inpatient admissions, including per-day or per-admission cost shares.",
    tip: "Inpatient admissions almost always require authorization; look for it in the 271.",
    group: "facility",
  },
  {
    code: "50",
    name: "Hospital - Outpatient",
    plain: "Outpatient hospital benefits — services not requiring admission.",
    use: "Asks about coverage for outpatient hospital services.",
    tip: "Outpatient cost shares differ from inpatient; confirm the right setting before billing.",
    group: "facility",
  },
  {
    code: "62",
    name: "MRI/CAT Scan",
    plain: "Advanced imaging benefits — MRI and CT scans.",
    use: "Asks whether MRI/CT imaging is covered.",
    tip: "High-cost imaging frequently requires prior authorization; check the 271.",
    group: "diagnostic",
  },
  {
    code: "65",
    name: "Newborn Care",
    plain: "Benefits for care of a newborn.",
    use: "Asks about coverage for newborn services.",
    tip: "Early newborn care is often handled under the mother's coverage; confirm the newborn's own enrollment.",
    group: "preventive",
  },
  {
    code: "68",
    name: "Well Baby Care",
    plain: "Routine well-baby and well-child visit benefits.",
    use: "Asks about preventive pediatric visit coverage.",
    tip: "Usually a preventive benefit with little or no cost share; verify the schedule of covered visits.",
    group: "preventive",
  },
  {
    code: "73",
    name: "Diagnostic Medical",
    plain: "General diagnostic medical service benefits.",
    use: "Asks about diagnostic services not covered by a more specific code.",
    tip: "Use a narrower code (X-ray, lab, MRI) when you know the exact diagnostic service.",
    group: "diagnostic",
  },
  {
    code: "76",
    name: "Dialysis",
    plain: "Dialysis treatment benefits.",
    use: "Asks whether dialysis is covered and any limits.",
    tip: "End-stage renal disease has special coordination rules with Medicare; verify the primary payer.",
    group: "therapy",
  },
  {
    code: "78",
    name: "Chemotherapy",
    plain: "Chemotherapy treatment benefits.",
    use: "Asks whether chemotherapy is covered and at what level.",
    tip: "Often requires authorization and may have drug benefits handled separately; check the 271.",
    group: "therapy",
  },
  {
    code: "80",
    name: "Immunizations",
    plain: "Immunization and vaccine benefits.",
    use: "Asks about coverage for immunizations.",
    tip: "Many vaccines are covered as preventive at no cost share; confirm which are included.",
    group: "preventive",
  },
  {
    code: "81",
    name: "Routine Physical",
    plain: "Routine physical exam benefits.",
    use: "Asks about preventive physical/annual exam coverage.",
    tip: "Usually a preventive benefit; watch the frequency limit (often one per year).",
    group: "preventive",
  },
  {
    code: "82",
    name: "Family Planning",
    plain: "Family planning service benefits.",
    use: "Asks about coverage for family planning services.",
    tip: "Often covered with little cost share; benefits can vary by plan and state.",
    group: "preventive",
  },
  {
    code: "86",
    name: "Emergency Services",
    plain: "Emergency service benefits.",
    use: "Asks about coverage for emergency care.",
    tip: "Emergency benefits often apply regardless of network; verify the emergency cost share.",
    group: "medical",
  },
  {
    code: "88",
    name: "Pharmacy",
    plain: "Prescription drug benefits.",
    use: "Asks whether pharmacy/prescription coverage applies and the drug-benefit details.",
    tip: "Pharmacy benefits are frequently administered by a separate PBM; the medical 271 may not show them.",
    group: "pharmacy",
  },
  {
    code: "93",
    name: "Podiatry",
    plain: "Podiatry (foot care) benefits.",
    use: "Asks whether podiatry services are covered.",
    tip: "Routine foot care is excluded by many plans unless tied to a qualifying diagnosis.",
    group: "medical",
  },
  {
    code: "98",
    name: "Professional (Physician) Visit - Office",
    plain: "Office-visit benefits with a physician or professional provider.",
    use: "One of the most-used codes — asks for the office-visit copay/coinsurance and whether the visit is covered.",
    tip: "Great for confirming the office copay before a visit; pair with 30 for overall eligibility.",
    group: "medical",
  },
  {
    code: "99",
    name: "Professional (Physician) Visit - Inpatient",
    plain: "Physician visit benefits in an inpatient setting.",
    use: "Asks about coverage for a physician's inpatient visit.",
    tip: "Distinct from the facility (hospital) benefit — this is the professional component.",
    group: "medical",
  },
  {
    code: "A4",
    name: "Psychiatric",
    plain: "Psychiatric care benefits.",
    use: "Asks about coverage for psychiatric services.",
    tip: "Behavioral health is often carved out to a separate vendor; the medical 271 may direct you elsewhere.",
    group: "behavioral",
  },
  {
    code: "A6",
    name: "Psychotherapy",
    plain: "Psychotherapy (talk therapy) benefits.",
    use: "Asks about coverage for psychotherapy sessions.",
    tip: "Check for visit limits and whether a separate behavioral-health inquiry is required.",
    group: "behavioral",
  },
  {
    code: "A7",
    name: "Psychiatric - Inpatient",
    plain: "Inpatient psychiatric benefits.",
    use: "Asks about coverage for inpatient psychiatric admissions.",
    tip: "Almost always requires authorization; verify before admission.",
    group: "behavioral",
  },
  {
    code: "A8",
    name: "Psychiatric - Outpatient",
    plain: "Outpatient psychiatric benefits.",
    use: "Asks about coverage for outpatient psychiatric services.",
    tip: "Watch for visit limits and separate behavioral-health administration.",
    group: "behavioral",
  },
  {
    code: "AI",
    name: "Substance Abuse",
    plain: "Substance-use disorder treatment benefits.",
    use: "Asks about coverage for substance-use treatment.",
    tip: "Often managed by the behavioral-health vendor; confirm where to send claims.",
    group: "behavioral",
  },
  {
    code: "MH",
    name: "Mental Health",
    plain: "Mental health service benefits.",
    use: "Asks about overall mental-health coverage.",
    tip: "Behavioral health is frequently carved out; the 271 may point to a separate payer/vendor.",
    group: "behavioral",
  },
  {
    code: "AD",
    name: "Occupational Therapy",
    plain: "Occupational therapy benefits.",
    use: "Asks about coverage for occupational therapy.",
    tip: "Therapy benefits are commonly visit-limited per year; check the 271 maximum.",
    group: "therapy",
  },
  {
    code: "AE",
    name: "Physical Medicine",
    plain: "Physical medicine / physical therapy benefits.",
    use: "Asks about coverage for physical therapy and physical medicine.",
    tip: "Often shares a combined annual visit limit with other therapies.",
    group: "therapy",
  },
  {
    code: "AF",
    name: "Speech Therapy",
    plain: "Speech therapy benefits.",
    use: "Asks about coverage for speech therapy.",
    tip: "May require authorization and is frequently visit-limited.",
    group: "therapy",
  },
  {
    code: "AG",
    name: "Skilled Nursing Care",
    plain: "Skilled nursing facility / skilled nursing care benefits.",
    use: "Asks about coverage for skilled nursing care.",
    tip: "Often has a per-benefit-period day limit; verify the remaining days in the 271.",
    group: "facility",
  },
  {
    code: "BG",
    name: "Cardiac Rehabilitation",
    plain: "Cardiac rehabilitation program benefits.",
    use: "Asks about coverage for cardiac rehab.",
    tip: "Typically session-limited and tied to a qualifying cardiac event; check limits.",
    group: "therapy",
  },
  {
    code: "UC",
    name: "Urgent Care",
    plain: "Urgent care benefits.",
    use: "Asks about the urgent-care cost share and coverage.",
    tip: "Urgent-care copays usually differ from both office-visit and ER cost shares; confirm the specific amount.",
    group: "medical",
  },
  {
    code: "AL",
    name: "Vision (Optometry)",
    plain: "Vision and optometry benefits — eye exams and related services.",
    use: "Asks about vision coverage; often answered by a separate vision plan.",
    tip: "Vision is frequently a standalone plan; the member may need a vision-specific inquiry.",
    group: "vision",
  },
];

/** Slug used in the URL — lowercased code, e.g. "30", "al", "mh". */
export function codeSlug(c: ServiceType): string {
  return c.code.toLowerCase();
}

/** Display label, e.g. "30", "AL", "MH". */
export function codeLabel(c: ServiceType): string {
  return c.code.toUpperCase();
}

export function getServiceType(slug: string): ServiceType | undefined {
  return SERVICE_TYPES.find((c) => codeSlug(c) === slug.toLowerCase());
}

/** Related codes — same group first, then fill from the rest. */
export function relatedCodes(c: ServiceType, n = 6): ServiceType[] {
  const others = SERVICE_TYPES.filter((x) => x.code !== c.code);
  const sameGroup = others.filter((x) => x.group === c.group);
  const rest = others.filter((x) => x.group !== c.group);
  return [...sameGroup, ...rest].slice(0, n);
}
