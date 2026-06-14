/**
 * Synthetic 837P generator (spec §11/§12). Emits valid, fully fake professional
 * claims with the real HL hierarchy (billing provider → subscriber → claim →
 * service lines). Seeded for determinism. The generator owns the charge math:
 * each clean claim's CLM02 equals the sum of its service-line charges, so clean
 * files balance and `--corrupt` files fail the balancing / structure checks.
 *
 *   tsx tools/gen-837.ts                 # write the fixture set
 *   tsx tools/gen-837.ts --claims 20     # one clean file to stdout
 *   tsx tools/gen-837.ts --claims 20 --corrupt
 */
import { faker } from "@faker-js/faker";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const D = { element: "*", component: ":", repetition: "^", segment: "~" };

const PROCEDURES = ["99213", "99214", "99203", "99396", "20610", "93000", "36415", "85025"];
const DIAGNOSES = ["E1165", "I10", "J069", "M5450", "E785", "K219", "R079", "N390"];
const FILING = ["CI", "MB", "MC", "BL", "HM"];

interface GenOptions {
  claims: number;
  corrupt: boolean;
  seed: number;
  interchangeControl: string;
  groupControl: string;
  stControl: string;
}

interface Line {
  proc: string;
  chargeC: number;
  units: number;
  pointer: string;
  date: string;
}
interface Claim {
  patientControl: string;
  subscriberLast: string;
  subscriberFirst: string;
  memberId: string;
  dob: string;
  gender: string;
  payerName: string;
  filing: string;
  diagnoses: string[];
  lines: Line[];
}

const money = (cents: number) => (cents / 100).toFixed(2);

function buildClaims(opts: GenOptions): Claim[] {
  faker.seed(opts.seed);
  const claims: Claim[] = [];
  for (let i = 0; i < opts.claims; i++) {
    const dxCount = faker.number.int({ min: 1, max: 3 });
    const diagnoses = faker.helpers.arrayElements(DIAGNOSES, dxCount);
    const lineCount = faker.number.int({ min: 1, max: 3 });
    const lines: Line[] = Array.from({ length: lineCount }, () => ({
      proc: faker.helpers.arrayElement(PROCEDURES),
      chargeC: faker.helpers.arrayElement([7500, 12000, 15000, 22000, 30000, 45000]),
      units: 1,
      pointer: String(faker.number.int({ min: 1, max: diagnoses.length })),
      date: `2021${String(faker.number.int({ min: 1, max: 12 })).padStart(2, "0")}10`,
    }));
    claims.push({
      patientControl: `PT${String(i + 1).padStart(5, "0")}`,
      subscriberLast: faker.person.lastName().toUpperCase(),
      subscriberFirst: faker.person.firstName().toUpperCase(),
      memberId: faker.string.alphanumeric(9).toUpperCase(),
      dob: `19${faker.number.int({ min: 50, max: 99 })}${String(faker.number.int({ min: 1, max: 12 })).padStart(2, "0")}15`,
      gender: faker.helpers.arrayElement(["M", "F"]),
      payerName: faker.helpers.arrayElement(["BLUE SAMPLE INSURANCE", "MERIDIAN HEALTH PLAN", "UNITED SAMPLE PPO"]),
      filing: faker.helpers.arrayElement(FILING),
      diagnoses,
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

function claimSegments(claim: Claim, hl: number, corrupt: { inflate: boolean; badPointer: boolean; dropDx: boolean }): string[] {
  const out: string[] = [];
  out.push(seg("HL", String(hl), "1", "22", "0"));
  out.push(seg("SBR", "P", "18", "GRP0001", "", "", "", "", "", claim.filing));
  out.push(seg("NM1", "IL", "1", claim.subscriberLast, claim.subscriberFirst, "", "", "", "MI", claim.memberId));
  out.push(seg("N3", "1 MEMBER WAY"));
  out.push(seg("N4", "AUSTIN", "TX", "78701"));
  out.push(seg("DMG", "D8", claim.dob, claim.gender));
  out.push(seg("NM1", "PR", "2", claim.payerName, "", "", "", "", "PI", "PAYER01"));

  // Claim. CLM05 composite = placeOfService : facilityCodeQualifier : frequency.
  const totalC = claim.lines.reduce((s, l) => s + l.chargeC, 0);
  const declaredC = corrupt.inflate ? totalC + 5000 : totalC;
  out.push(seg("CLM", claim.patientControl, money(declaredC), "", "", `11${D.component}B${D.component}1`, "Y", "A", "Y", "Y"));

  if (!corrupt.dropDx) {
    const hi = claim.diagnoses.map((dx, i) => `${i === 0 ? "ABK" : "ABF"}${D.component}${dx}`);
    out.push(seg("HI", ...hi));
  }

  claim.lines.forEach((line, idx) => {
    out.push(seg("LX", String(idx + 1)));
    const pointer = corrupt.badPointer && idx === 0 ? "9" : line.pointer;
    out.push(seg("SV1", `HC${D.component}${line.proc}`, money(line.chargeC), "UN", String(line.units), "", "", pointer));
    out.push(seg("DTP", "472", "D8", line.date));
  });
  return out;
}

export function serialize(claims: Claim[], opts: GenOptions): string {
  const body: string[] = [];
  body.push(seg("ST", "837", opts.stControl));
  body.push(seg("BHT", "0019", "00", "BATCH" + opts.stControl, "20210901", "1200", "CH"));
  body.push(seg("NM1", "41", "2", "SUBMITTER CLEARINGHOUSE", "", "", "", "", "46", "SUB001"));
  body.push(seg("PER", "IC", "CLAIMS DESK", "TE", "8005551212"));
  body.push(seg("NM1", "40", "2", "BLUE SAMPLE INSURANCE", "", "", "", "", "46", "PAYER01"));

  // Billing provider (2000A / 2010AA).
  body.push(seg("HL", "1", "", "20", "1"));
  body.push(seg("NM1", "85", "2", "GOOD HEALTH CLINIC", "", "", "", "", "XX", "1234567893"));
  body.push(seg("N3", "100 CARE BLVD"));
  body.push(seg("N4", "AUSTIN", "TX", "78701"));
  body.push(seg("REF", "EI", "741234567"));

  claims.forEach((claim, i) => {
    const corrupt = {
      inflate: opts.corrupt && i === 0,
      badPointer: opts.corrupt && i === 0,
      dropDx: opts.corrupt && i === 1,
    };
    body.push(...claimSegments(claim, i + 2, corrupt));
  });

  const segmentCount = body.length + 1;
  body.push(seg("SE", String(segmentCount), opts.stControl));

  const segments = [
    isaSegment(opts),
    seg("GS", "HC", "PROVIDER", "PAYER", "20210901", "1200", opts.groupControl, "X", "005010X222A1"),
    ...body,
    seg("GE", "1", opts.groupControl),
    seg("IEA", "1", opts.interchangeControl.padStart(9, "0")),
  ];
  return segments.join(D.segment) + D.segment + "\n";
}

function baseOptions(over: Partial<GenOptions> = {}): GenOptions {
  return { claims: 20, corrupt: false, seed: 3030, interchangeControl: "300000001", groupControl: "3001", stControl: "0001", ...over };
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
  writeFixture("fixtures/clean-837.edi", serialize(buildClaims(clean), clean));
  const bad = baseOptions({ corrupt: true, stControl: "0002", interchangeControl: "300000002" });
  writeFixture("fixtures/corrupt-837.edi", serialize(buildClaims(bad), bad));
}

main();
