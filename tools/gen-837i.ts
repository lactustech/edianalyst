/**
 * Synthetic 837I generator (spec §11/§12). Emits valid, fully fake institutional
 * claims — the same HL hierarchy as 837P, but with SV2 service lines (revenue
 * codes), a type-of-bill, statement dates, and an attending provider. Seeded for
 * determinism; each clean claim's CLM02 equals the sum of its SV2 charges.
 *
 *   tsx tools/gen-837i.ts                 # write the fixture set
 *   tsx tools/gen-837i.ts --claims 15     # one clean file to stdout
 *   tsx tools/gen-837i.ts --claims 15 --corrupt
 */
import { faker } from "@faker-js/faker";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const D = { element: "*", component: ":", repetition: "^", segment: "~" };

const DIAGNOSES = ["I509", "J189", "N179", "K8590", "A419", "I214", "E1110"];
const FILING = ["MA", "MB", "CI", "BL"];
const FACILITY = ["11", "13", "85"]; // inpatient, outpatient, critical access
// [revenue, optional procedure, unit basis]
const REV_LINES: [string, string, string][] = [
  ["0120", "", "DA"],
  ["0250", "", "UN"],
  ["0300", "80053", "UN"],
  ["0320", "71046", "UN"],
  ["0450", "99283", "UN"],
  ["0360", "47562", "UN"],
];

interface GenOptions {
  claims: number;
  corrupt: boolean;
  seed: number;
  interchangeControl: string;
  groupControl: string;
  stControl: string;
}

interface Line {
  revenue: string;
  proc: string;
  unitBasis: string;
  chargeC: number;
  units: number;
}
interface Claim {
  patientControl: string;
  facility: string;
  last: string;
  first: string;
  memberId: string;
  dob: string;
  gender: string;
  payerName: string;
  filing: string;
  diagnoses: string[];
  admit: string;
  fromDate: string;
  toDate: string;
  lines: Line[];
}

const money = (cents: number) => (cents / 100).toFixed(2);

function buildClaims(opts: GenOptions): Claim[] {
  faker.seed(opts.seed);
  const claims: Claim[] = [];
  for (let i = 0; i < opts.claims; i++) {
    const dxCount = faker.number.int({ min: 1, max: 3 });
    const diagnoses = faker.helpers.arrayElements(DIAGNOSES, dxCount);
    const lineDefs = faker.helpers.arrayElements(REV_LINES, faker.number.int({ min: 1, max: 3 }));
    const lines: Line[] = lineDefs.map(([revenue, proc, unitBasis]) => ({
      revenue,
      proc,
      unitBasis,
      chargeC: faker.helpers.arrayElement([40000, 85000, 120000, 250000, 500000]),
      units: unitBasis === "DA" ? faker.number.int({ min: 1, max: 5 }) : 1,
    }));
    const month = String(faker.number.int({ min: 1, max: 11 })).padStart(2, "0");
    claims.push({
      patientControl: `IP${String(i + 1).padStart(5, "0")}`,
      facility: faker.helpers.arrayElement(FACILITY),
      last: faker.person.lastName().toUpperCase(),
      first: faker.person.firstName().toUpperCase(),
      memberId: faker.string.alphanumeric(9).toUpperCase(),
      dob: `19${faker.number.int({ min: 40, max: 95 })}0615`,
      gender: faker.helpers.arrayElement(["M", "F"]),
      payerName: faker.helpers.arrayElement(["MEDICARE NATIONAL", "BLUE SAMPLE INSURANCE", "STATE MEDICAID"]),
      filing: faker.helpers.arrayElement(FILING),
      diagnoses,
      admit: `2021${month}02`,
      fromDate: `2021${month}02`,
      toDate: `2021${month}05`,
      lines,
    });
  }
  return claims;
}

function seg(tag: string, ...elements: (string | undefined)[]): string {
  const els = elements.map((e) => e ?? "");
  let last = els.length - 1;
  while (last >= 0 && els[last] === "") last--;
  return [tag, ...els.slice(0, last + 1)].join(D.element);
}

function isaSegment(opts: GenOptions): string {
  const pad = (s: string, n: number) => s.padEnd(n, " ").slice(0, n);
  const num = (s: string, n: number) => s.padStart(n, "0").slice(0, n);
  return [
    "ISA", "00", pad("", 10), "00", pad("", 10), "ZZ", pad("PROVIDER", 15),
    "ZZ", pad("PAYER", 15), "210901", "1200", D.repetition, "00501",
    num(opts.interchangeControl, 9), "0", "T", D.component,
  ].join(D.element);
}

function claimSegments(claim: Claim, hl: number, corrupt: { inflate: boolean; dropDx: boolean; dropRev: boolean }): string[] {
  const out: string[] = [];
  out.push(seg("HL", String(hl), "1", "22", "0"));
  out.push(seg("SBR", "P", "18", "GRP0001", "", "", "", "", "", claim.filing));
  out.push(seg("NM1", "IL", "1", claim.last, claim.first, "", "", "", "MI", claim.memberId));
  out.push(seg("N3", "1 MEMBER WAY"));
  out.push(seg("N4", "AUSTIN", "TX", "78701"));
  out.push(seg("DMG", "D8", claim.dob, claim.gender));
  out.push(seg("NM1", "PR", "2", claim.payerName, "", "", "", "", "PI", "PAYER01"));

  const totalC = claim.lines.reduce((s, l) => s + l.chargeC, 0);
  const declaredC = corrupt.inflate ? totalC + 7500 : totalC;
  // CLM05 = facility type : facility-code qualifier (A) : claim frequency.
  out.push(seg("CLM", claim.patientControl, money(declaredC), "", "", `${claim.facility}${D.component}A${D.component}1`, "Y", "A", "Y", "Y"));
  out.push(seg("DTP", "434", "RD8", `${claim.fromDate}-${claim.toDate}`));
  out.push(seg("DTP", "435", "DT", `${claim.admit}1200`));

  if (!corrupt.dropDx) {
    out.push(seg("HI", `ABK${D.component}${claim.diagnoses[0]}`));
    if (claim.diagnoses.length > 1) {
      out.push(seg("HI", ...claim.diagnoses.slice(1).map((dx) => `ABF${D.component}${dx}`)));
    }
  }
  // Attending provider (loop 2310A).
  out.push(seg("NM1", "71", "1", "ATTENDING", "PHYSICIAN", "", "", "", "XX", "1999999994"));

  claim.lines.forEach((line, idx) => {
    out.push(seg("LX", String(idx + 1)));
    const revenue = corrupt.dropRev && idx === 0 ? "" : line.revenue;
    const proc = line.proc ? `HC${D.component}${line.proc}` : "";
    out.push(seg("SV2", revenue, proc, money(line.chargeC), line.unitBasis, String(line.units)));
    out.push(seg("DTP", "472", "D8", claim.fromDate));
  });
  return out;
}

export function serialize(claims: Claim[], opts: GenOptions): string {
  const body: string[] = [];
  body.push(seg("ST", "837", opts.stControl, "005010X223A2"));
  body.push(seg("BHT", "0019", "00", "BATCH" + opts.stControl, "20210901", "1200", "CH"));
  body.push(seg("NM1", "41", "2", "SUBMITTER CLEARINGHOUSE", "", "", "", "", "46", "SUB001"));
  body.push(seg("PER", "IC", "CLAIMS DESK", "TE", "8005551212"));
  body.push(seg("NM1", "40", "2", "MEDICARE NATIONAL", "", "", "", "", "46", "PAYER01"));

  body.push(seg("HL", "1", "", "20", "1"));
  body.push(seg("NM1", "85", "2", "MERCY GENERAL HOSPITAL", "", "", "", "", "XX", "1234567893"));
  body.push(seg("N3", "500 HOSPITAL DR"));
  body.push(seg("N4", "AUSTIN", "TX", "78701"));
  body.push(seg("REF", "EI", "741234567"));

  claims.forEach((claim, i) => {
    const corrupt = {
      inflate: opts.corrupt && i === 0,
      dropDx: opts.corrupt && i === 1,
      dropRev: opts.corrupt && i === 0,
    };
    body.push(...claimSegments(claim, i + 2, corrupt));
  });

  const segmentCount = body.length + 1;
  body.push(seg("SE", String(segmentCount), opts.stControl));

  const segments = [
    isaSegment(opts),
    seg("GS", "HC", "PROVIDER", "PAYER", "20210901", "1200", opts.groupControl, "X", "005010X223A2"),
    ...body,
    seg("GE", "1", opts.groupControl),
    seg("IEA", "1", opts.interchangeControl.padStart(9, "0")),
  ];
  return segments.join(D.segment) + D.segment + "\n";
}

function baseOptions(over: Partial<GenOptions> = {}): GenOptions {
  return { claims: 15, corrupt: false, seed: 4040, interchangeControl: "400000001", groupControl: "4001", stControl: "0001", ...over };
}

function writeFixture(relPath: string, contents: string): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const full = resolve(here, "..", relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents, "utf8");
  // eslint-disable-next-line no-console
  console.log(`wrote ${relPath} (${contents.length} bytes)`);
}

function main(): void {
  const argv = process.argv.slice(2);
  const corrupt = argv.includes("--corrupt");
  const cIdx = argv.indexOf("--claims");
  const claims = cIdx >= 0 ? Number(argv[cIdx + 1]) : undefined;

  if (claims !== undefined) {
    const opts = baseOptions({ claims, corrupt });
    process.stdout.write(serialize(buildClaims(opts), opts));
    return;
  }
  const clean = baseOptions();
  writeFixture("fixtures/clean-837i.edi", serialize(buildClaims(clean), clean));
  const bad = baseOptions({ corrupt: true, stControl: "0002", interchangeControl: "400000002" });
  writeFixture("fixtures/corrupt-837i.edi", serialize(buildClaims(bad), bad));
}

main();
