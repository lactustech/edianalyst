/**
 * Place of Service (POS) code reference for /edi/837/place-of-service-codes. One
 * entry per code drives one statically-generated page (see
 * app/edi/[code]/place-of-service-codes/[pos]/page.tsx), because billers look up
 * individual POS codes constantly ("place of service 11", "POS 02 vs 10").
 *
 * NOTE: Place of Service codes are maintained by CMS (not X12). They appear on
 * an 837 professional claim — in CLM05-1 at the claim level and SV105 at the
 * service-line level — to say WHERE a service was rendered. We include them
 * because they're a finite, freely-usable set that's heavily searched; the
 * authoritative list is published by CMS.
 *
 * All prose is our own plain-English wording. Curated to the codes used most.
 */
export interface PosCode {
  code: string; // "11"
  name: string;
  plain: string;
  /** When it's billed. */
  use: string;
  /** A practical note. */
  tip: string;
}

export const POS_CODES: PosCode[] = [
  { code: "01", name: "Pharmacy", plain: "A facility or location where drugs and other medically related items and services are sold or dispensed.", use: "Billed for services rendered at a pharmacy.", tip: "Distinct from the pharmacy benefit itself — this is the location of service." },
  { code: "02", name: "Telehealth Provided Other than in Patient's Home", plain: "A telehealth service where the patient is not located in their home.", use: "Billed when the patient receives telehealth somewhere other than home (e.g. a clinic originating site).", tip: "Contrast with POS 10 (telehealth in the patient's home) — payers reimburse them differently." },
  { code: "03", name: "School", plain: "A facility whose primary purpose is education.", use: "Billed for health services provided in a school setting.", tip: "Common for school-based health and therapy services." },
  { code: "04", name: "Homeless Shelter", plain: "A facility or location providing temporary housing to homeless individuals.", use: "Billed for services rendered at a homeless shelter.", tip: "Used by outreach and mobile health programs." },
  { code: "05", name: "Indian Health Service Free-standing Facility", plain: "A free-standing IHS facility providing care to American Indians and Alaska Natives.", use: "Billed for services at a free-standing IHS facility.", tip: "Pairs with IHS-specific billing rules." },
  { code: "06", name: "Indian Health Service Provider-based Facility", plain: "A provider-based IHS facility providing care to American Indians and Alaska Natives.", use: "Billed for services at a provider-based IHS facility.", tip: "Provider-based status affects how facility and professional components are billed." },
  { code: "09", name: "Prison/Correctional Facility", plain: "A prison, jail, or other correctional facility.", use: "Billed for services rendered to incarcerated individuals.", tip: "Coverage for incarcerated patients is often restricted; verify benefits." },
  { code: "10", name: "Telehealth Provided in Patient's Home", plain: "A telehealth service where the patient is located in their home.", use: "Billed when the patient receives telehealth at home.", tip: "Introduced to distinguish home telehealth from POS 02; check payer reimbursement parity rules." },
  { code: "11", name: "Office", plain: "A location (other than a hospital, SNF, military facility, or other) where the provider routinely provides health services.", use: "The most common POS — a physician's or clinic office.", tip: "If you only remember one, it's 11. Office-visit benefits (and copays) key off this." },
  { code: "12", name: "Home", plain: "A location, other than a hospital or other facility, where the patient receives care in a private residence.", use: "Billed for services rendered in the patient's home.", tip: "Used for home visits; distinct from home health agency billing." },
  { code: "13", name: "Assisted Living Facility", plain: "A congregate residential facility with self-contained living units providing assessment and limited care.", use: "Billed for services at an assisted living facility.", tip: "Not the same as a nursing facility (POS 32)." },
  { code: "14", name: "Group Home", plain: "A residence providing supervised living for individuals needing support.", use: "Billed for services rendered at a group home.", tip: "Common in behavioral health and developmental services." },
  { code: "15", name: "Mobile Unit", plain: "A facility or unit that moves from place to place to provide services.", use: "Billed for services from a mobile clinic or van.", tip: "Used for mobile screening, imaging, and outreach." },
  { code: "17", name: "Walk-in Retail Health Clinic", plain: "A walk-in clinic, located in a retail store, that provides limited services.", use: "Billed for services at a retail health clinic.", tip: "Distinct from urgent care (POS 20)." },
  { code: "18", name: "Place of Employment-Worksite", plain: "A location at a workplace where health services are provided.", use: "Billed for worksite/occupational health services.", tip: "Common for employer on-site clinics and screenings." },
  { code: "19", name: "Off Campus-Outpatient Hospital", plain: "A portion of an off-campus hospital provider-based department providing outpatient services.", use: "Billed for outpatient services at an off-campus hospital location.", tip: "Off-campus vs on-campus (POS 22) changes facility reimbursement." },
  { code: "20", name: "Urgent Care Facility", plain: "A location providing immediate but non-emergency care on a walk-in basis.", use: "Billed for urgent care visits.", tip: "Urgent-care cost shares differ from office (11) and ER (23)." },
  { code: "21", name: "Inpatient Hospital", plain: "A facility providing inpatient hospital services.", use: "Billed for services rendered to an admitted hospital patient.", tip: "Inpatient admissions usually require authorization." },
  { code: "22", name: "On Campus-Outpatient Hospital", plain: "A portion of a hospital's main campus providing outpatient services.", use: "Billed for outpatient services on the hospital campus.", tip: "Contrast with off-campus outpatient (POS 19)." },
  { code: "23", name: "Emergency Room-Hospital", plain: "A portion of a hospital where emergency services are provided.", use: "Billed for emergency department services.", tip: "Emergency benefits often apply regardless of network." },
  { code: "24", name: "Ambulatory Surgical Center", plain: "A free-standing facility providing surgical services not requiring admission.", use: "Billed for outpatient surgery at an ASC.", tip: "ASC reimbursement differs from hospital outpatient." },
  { code: "25", name: "Birthing Center", plain: "A facility providing a setting for labor, delivery, and immediate postpartum care.", use: "Billed for services at a birthing center.", tip: "Distinct from inpatient hospital obstetric care." },
  { code: "26", name: "Military Treatment Facility", plain: "A medical facility operated by a branch of the military.", use: "Billed for services at a military treatment facility.", tip: "Pairs with TRICARE and military health billing rules." },
  { code: "31", name: "Skilled Nursing Facility", plain: "A facility providing skilled nursing or rehabilitation but not the acute level of a hospital.", use: "Billed for SNF-level care.", tip: "SNF benefits are often day-limited per benefit period." },
  { code: "32", name: "Nursing Facility", plain: "A facility providing nursing and related services to residents who need ongoing care.", use: "Billed for nursing facility (custodial-leaning) care.", tip: "Distinct from skilled nursing (POS 31)." },
  { code: "33", name: "Custodial Care Facility", plain: "A facility providing room, board, and personal assistance on a long-term basis.", use: "Billed for custodial care.", tip: "Custodial care is frequently non-covered by medical plans." },
  { code: "34", name: "Hospice", plain: "A facility providing palliative and supportive care for terminally ill patients.", use: "Billed for hospice facility services.", tip: "Hospice election changes how related services are covered." },
  { code: "41", name: "Ambulance-Land", plain: "A land vehicle specifically designed, equipped, and staffed for transporting the sick or injured.", use: "Billed for ground ambulance transport.", tip: "Medical necessity for transport is commonly scrutinized." },
  { code: "42", name: "Ambulance-Air or Water", plain: "An air or water vehicle specifically designed, equipped, and staffed for transporting the sick or injured.", use: "Billed for air or water ambulance transport.", tip: "High-cost; expect documentation and medical-necessity review." },
  { code: "49", name: "Independent Clinic", plain: "A location, not part of a hospital, where outpatient preventive, diagnostic, or treatment services are provided.", use: "Billed for services at an independent clinic.", tip: "Distinct from provider-based hospital clinics." },
  { code: "50", name: "Federally Qualified Health Center", plain: "A federally funded health center providing services in an underserved area.", use: "Billed for FQHC services.", tip: "FQHCs have special encounter-based reimbursement rules." },
  { code: "51", name: "Inpatient Psychiatric Facility", plain: "A facility providing inpatient psychiatric services.", use: "Billed for inpatient psychiatric admissions.", tip: "Behavioral health is often carved out; verify the payer/vendor." },
  { code: "52", name: "Psychiatric Facility-Partial Hospitalization", plain: "A facility providing a partial-hospitalization psychiatric program.", use: "Billed for partial-hospitalization behavioral health.", tip: "PHP sits between inpatient and outpatient — confirm the benefit." },
  { code: "53", name: "Community Mental Health Center", plain: "A facility providing outpatient and community-based mental health services.", use: "Billed for CMHC services.", tip: "Common for publicly funded behavioral health." },
  { code: "54", name: "Intermediate Care Facility/Individuals with Intellectual Disabilities", plain: "A facility providing care to individuals with intellectual disabilities.", use: "Billed for ICF/IID services.", tip: "Often Medicaid-funded with specific rules." },
  { code: "55", name: "Residential Substance Abuse Treatment Facility", plain: "A facility providing residential treatment for substance use.", use: "Billed for residential substance-use treatment.", tip: "Substance-use benefits are frequently carved out; confirm coverage." },
  { code: "57", name: "Non-residential Substance Abuse Treatment Facility", plain: "A facility providing outpatient (non-residential) substance-use treatment.", use: "Billed for outpatient substance-use treatment.", tip: "Distinct from residential (POS 55)." },
  { code: "60", name: "Mass Immunization Center", plain: "A location where mass immunizations are administered.", use: "Billed for mass immunization services.", tip: "Used for large-scale vaccination clinics." },
  { code: "61", name: "Comprehensive Inpatient Rehabilitation Facility", plain: "A facility providing comprehensive inpatient rehabilitation.", use: "Billed for inpatient rehab.", tip: "IRF admissions have intensity-of-therapy requirements." },
  { code: "62", name: "Comprehensive Outpatient Rehabilitation Facility", plain: "A facility providing comprehensive outpatient rehabilitation.", use: "Billed for outpatient rehab (PT/OT/speech).", tip: "Therapy benefits are commonly visit-limited." },
  { code: "65", name: "End-Stage Renal Disease Treatment Facility", plain: "A facility providing dialysis and ESRD-related services.", use: "Billed for dialysis/ESRD treatment.", tip: "ESRD has special Medicare coordination rules." },
  { code: "71", name: "Public Health Clinic", plain: "A facility operated by a public health agency providing ambulatory care.", use: "Billed for public health clinic services.", tip: "Often immunizations, screening, and community services." },
  { code: "72", name: "Rural Health Clinic", plain: "A certified clinic in a rural, underserved area providing outpatient services.", use: "Billed for RHC services.", tip: "RHCs have special encounter-based reimbursement." },
  { code: "81", name: "Independent Laboratory", plain: "A laboratory certified to perform diagnostic tests, independent of a physician's office or hospital.", use: "Billed for lab tests at an independent laboratory.", tip: "Some plans only cover labs from contracted facilities." },
  { code: "99", name: "Other Place of Service", plain: "A place of service not identified by any other code.", use: "Billed when no specific POS code fits.", tip: "Use sparingly — a specific code is almost always preferred and expected." },
];

/** Slug — the numeric code, e.g. "11". */
export function codeSlug(c: PosCode): string {
  return c.code.toLowerCase();
}

/** Display token, e.g. "11". */
export function codeLabel(c: PosCode): string {
  return c.code.toUpperCase();
}

export function getPosCode(slug: string): PosCode | undefined {
  return POS_CODES.find((c) => codeSlug(c) === slug.toLowerCase());
}

/** Related codes — nearest by numeric code, then fill. */
export function relatedCodes(c: PosCode, n = 6): PosCode[] {
  const others = POS_CODES.filter((x) => x.code !== c.code);
  const num = (x: PosCode) => parseInt(x.code, 10) || 0;
  return [...others].sort((a, b) => Math.abs(num(a) - num(c)) - Math.abs(num(b) - num(c))).slice(0, n);
}
