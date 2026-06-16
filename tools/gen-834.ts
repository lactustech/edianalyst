/**
 * Synthetic 834 generator (spec §12).
 *
 * We can never test on real files (spec §1.4), so this emits valid, fully fake
 * 834 interchanges. Everything is faked with @faker-js/faker and the run is
 * seeded, so fixtures are deterministic and safe to commit. The generator owns
 * the envelope math (SE01 segment counts, control numbers) so clean files pass
 * and `--corrupt` files fail predictably.
 *
 * Usage:
 *   tsx tools/gen-834.ts                       # writes the standard fixture set
 *   tsx tools/gen-834.ts --members 50          # one clean file to stdout
 *   tsx tools/gen-834.ts --members 50 --corrupt
 */
import { faker } from "@faker-js/faker";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Generation-time delimiters. The parser DETECTS these; it never assumes them.
const D = { element: "*", component: ":", repetition: "^", segment: "~" };

const MAINTENANCE = {
  addition: "021",
  termination: "024",
  change: "001",
  audit: "030",
} as const;
type MaintenanceKind = keyof typeof MAINTENANCE;

const COVERAGE_LEVELS = ["EMP", "ESP", "ECH", "FAM"] as const;

interface GenOptions {
  members: number;
  mix: Record<MaintenanceKind, number>;
  dependentRatio: number;
  coverageLines: readonly string[];
  corrupt: boolean;
  /** Lets v1/v2 share a population while differing in maintenance/dates. */
  seed: number;
  interchangeControl: string;
  groupControl: string;
  stControl: string;
  purpose: string; // BGN01 transaction set purpose
  action: string; // BGN08 action code (2 = change file, 4 = full file)
}

interface CoverageModel {
  line: string;
  level: string;
  begin: string;
  end?: string;
}

interface MemberModel {
  isSubscriber: boolean;
  subscriberId: string;
  memberId: string;
  relationship: string;
  maintenanceType: string;
  maintenanceReason: string;
  benefitStatus: string;
  last: string;
  first: string;
  middle: string;
  dob: string;
  gender: string;
  eligBegin: string;
  eligEnd?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  coverages: CoverageModel[];
}

// ---------- deterministic helpers (no Date, so fixtures never drift) ----------

function d8(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}${mm}${dd}`;
}

function fakeBirthDate(): string {
  const year = 1945 + faker.number.int({ max: 60 });
  return d8(year, faker.number.int({ min: 1, max: 12 }), faker.number.int({ min: 1, max: 28 }));
}

function fakeCoverageBegin(): string {
  return d8(2021, faker.number.int({ min: 1, max: 12 }), 1);
}

function weightedKind(mix: Record<MaintenanceKind, number>): MaintenanceKind {
  const total = Object.values(mix).reduce((a, b) => a + b, 0);
  let roll = faker.number.float({ min: 0, max: total });
  for (const kind of Object.keys(mix) as MaintenanceKind[]) {
    roll -= mix[kind];
    if (roll <= 0) return kind;
  }
  return "addition";
}

// ---------- population model ----------

function buildMember(
  isSubscriber: boolean,
  subscriberId: string,
  relationshipCode: string,
  kind: MaintenanceKind,
  opts: GenOptions,
): MemberModel {
  const maintenanceType = MAINTENANCE[kind];
  const begin = fakeCoverageBegin();
  const coverages: CoverageModel[] = opts.coverageLines.map((line) => ({
    line,
    level: faker.helpers.arrayElement(COVERAGE_LEVELS),
    begin,
    end: kind === "termination" ? d8(2021, 12, 31) : undefined,
  }));

  return {
    isSubscriber,
    subscriberId,
    memberId: faker.string.numeric(9),
    relationship: relationshipCode,
    maintenanceType,
    maintenanceReason: kind === "termination" ? "07" : "28",
    benefitStatus: "A",
    last: faker.person.lastName().toUpperCase(),
    first: faker.person.firstName().toUpperCase(),
    middle: faker.helpers.maybe(() => faker.person.firstName().charAt(0), { probability: 0.4 }) ?? "",
    dob: fakeBirthDate(),
    gender: faker.helpers.arrayElement(["M", "F"]),
    eligBegin: begin,
    eligEnd: kind === "termination" ? d8(2021, 12, 31) : undefined,
    street: faker.location.streetAddress().toUpperCase(),
    city: faker.location.city().toUpperCase(),
    state: faker.location.state({ abbreviated: true }),
    zip: faker.location.zipCode("#####"),
    coverages,
  };
}

export function buildPopulation(opts: GenOptions): MemberModel[] {
  faker.seed(opts.seed);
  const members: MemberModel[] = [];
  let subscribers = 0;

  while (members.length < opts.members) {
    const subscriberId = faker.string.numeric(9);
    const kind = weightedKind(opts.mix);
    members.push(buildMember(true, subscriberId, "18", kind, opts));
    subscribers++;

    // Attach dependents per the ratio, without overshooting the member count.
    let depRoll = opts.dependentRatio;
    while (depRoll > 0 && members.length < opts.members) {
      if (faker.number.float({ min: 0, max: 1 }) > depRoll) break;
      const relationshipCode = faker.helpers.arrayElement(["01", "19", "19"]);
      members.push(buildMember(false, subscriberId, relationshipCode, kind, opts));
      depRoll -= 1;
    }
  }

  void subscribers;
  return members;
}

// ---------- serialization to X12 ----------

function seg(tag: string, ...elements: (string | undefined)[]): string {
  // Drop trailing empties so segments look like real-world output.
  const els = elements.map((e) => e ?? "");
  let last = els.length - 1;
  while (last >= 0 && els[last] === "") last--;
  return [tag, ...els.slice(0, last + 1)].join(D.element);
}

function memberSegments(m: MemberModel, corrupt: boolean): string[] {
  const out: string[] = [];
  // ASSUMPTION: INS08 employment status "FT" / dependent "" is enough for v1.
  out.push(seg("INS", m.isSubscriber ? "Y" : "N", m.relationship, m.maintenanceType, m.maintenanceReason, m.benefitStatus, "", "", m.isSubscriber ? "FT" : ""));
  out.push(seg("REF", "0F", m.subscriberId));
  out.push(seg("REF", "1L", "GRP" + m.subscriberId.slice(0, 5)));
  out.push(seg("REF", "23", m.memberId));
  out.push(seg("DTP", "356", "D8", m.eligBegin));
  if (m.eligEnd) out.push(seg("DTP", "357", "D8", m.eligEnd));

  // Member name loop 2100A. A corrupt file uses an unknown relationship code
  // and a malformed (non-D8) birth date to exercise the validator.
  out.push(seg("NM1", "IL", "1", m.last, m.first, m.middle, "", "", "34", m.memberId));
  out.push(seg("N3", m.street));
  out.push(seg("N4", m.city, m.state, m.zip));
  out.push(seg("DMG", "D8", corrupt ? m.dob.slice(0, 4) : m.dob, m.gender));

  for (const c of m.coverages) {
    out.push(seg("HD", m.maintenanceType, "", c.line, `${c.line} PLAN`, c.level));
    out.push(seg("DTP", "348", "D8", c.begin));
    if (c.end) out.push(seg("DTP", "349", "D8", c.end));
  }
  return out;
}

function isaSegment(opts: GenOptions): string {
  // Fixed-width ISA: each element padded so the delimiter offsets line up.
  const pad = (s: string, n: number) => s.padEnd(n, " ").slice(0, n);
  const num = (s: string, n: number) => s.padStart(n, "0").slice(0, n);
  return [
    "ISA",
    "00",
    pad("", 10),
    "00",
    pad("", 10),
    "ZZ",
    pad("SENDERID", 15),
    "ZZ",
    pad("RECEIVERID", 15),
    "210901",
    "1200",
    D.repetition,
    "00501",
    num(opts.interchangeControl, 9),
    "0",
    "T",
    D.component,
  ].join(D.element);
}

export function serialize(members: MemberModel[], opts: GenOptions): string {
  const body: string[] = [];

  // Header / control.
  body.push(seg("ST", "834", opts.stControl));
  body.push(seg("BGN", opts.purpose, "REF" + opts.stControl, "20210901", "1200", "", "", "", opts.action));
  body.push(seg("REF", "38", "MASTER" + opts.groupControl));
  body.push(seg("DTP", "007", "D8", "20210901"));
  // QTY control total. Corrupt files deliberately miscount.
  const declaredCount = opts.corrupt ? members.length + 3 : members.length;
  body.push(seg("QTY", "DT", String(declaredCount)));

  // Sponsor / payer.
  body.push(seg("N1", "P5", "ACME EMPLOYER GROUP", "FI", "991234567"));
  body.push(seg("N1", "IN", "BLUE SAMPLE INSURANCE", "FI", "880011223"));

  for (const m of members) body.push(...memberSegments(m, opts.corrupt));

  // ST..SE segment count includes ST and SE.
  const segmentCount = body.length + 1;
  const declaredSe = opts.corrupt ? segmentCount + 2 : segmentCount;
  body.push(seg("SE", String(declaredSe), opts.stControl));

  // Envelope. A corrupt file mismatches the interchange control number on IEA.
  const ieaControl = opts.corrupt ? "999999999" : opts.interchangeControl;
  const segments = [
    isaSegment(opts),
    seg("GS", "BE", "SENDERID", "RECEIVERID", "20210901", "1200", opts.groupControl, "X", "005010X220A1"),
    ...body,
    seg("GE", "1", opts.groupControl),
    seg("IEA", "1", ieaControl.padStart(9, "0")),
  ];

  return segments.join(D.segment) + D.segment + "\n";
}

// ---------- v1/v2 delta pair (for the future diff engine, spec §12) ----------

function deriveV2(members: MemberModel[]): MemberModel[] {
  // Same population, mutated: terminate some, change a few, leave the rest,
  // and append a couple of brand-new subscribers.
  faker.seed(4242);
  const next = members.map((m, i): MemberModel => {
    if (i % 7 === 0) {
      return { ...m, maintenanceType: MAINTENANCE.termination, maintenanceReason: "07", eligEnd: d8(2022, 6, 30), coverages: m.coverages.map((c) => ({ ...c, end: d8(2022, 6, 30) })) };
    }
    if (i % 5 === 0) {
      return { ...m, maintenanceType: MAINTENANCE.change, maintenanceReason: "25", coverages: m.coverages.map((c) => ({ ...c, level: "FAM" })) };
    }
    return { ...m, maintenanceType: MAINTENANCE.audit, maintenanceReason: "28" };
  });

  const extraOpts = baseOptions({ members: 2, seed: 9001 });
  const additions = buildPopulation(extraOpts).map((m): MemberModel => ({ ...m, maintenanceType: MAINTENANCE.addition }));
  return [...next, ...additions];
}

// ---------- option presets & CLI ----------

function baseOptions(over: Partial<GenOptions> = {}): GenOptions {
  return {
    members: 40,
    mix: { addition: 5, termination: 2, change: 2, audit: 1 },
    dependentRatio: 0.8,
    coverageLines: ["HLT", "DEN", "VIS"],
    corrupt: false,
    seed: 1234,
    interchangeControl: "100000001",
    groupControl: "1001",
    stControl: "0001",
    purpose: "00",
    action: "4",
    ...over,
  };
}

function writeFixture(relPath: string, contents: string): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const full = resolve(here, "..", relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents, "utf8");
  // eslint-disable-next-line no-console
  console.log(`wrote ${relPath} (${contents.length} bytes)`);
}

function parseArgs(argv: string[]): { members?: number; corrupt: boolean; standard: boolean } {
  const corrupt = argv.includes("--corrupt");
  const mIdx = argv.indexOf("--members");
  const members = mIdx >= 0 ? Number(argv[mIdx + 1]) : undefined;
  return { members, corrupt, standard: members === undefined };
}

function main(): void {
  const { members, corrupt, standard } = parseArgs(process.argv.slice(2));

  if (!standard) {
    const opts = baseOptions({ members, corrupt });
    process.stdout.write(serialize(buildPopulation(opts), opts));
    return;
  }

  // Standard committed fixture set.
  const cleanOpts = baseOptions();
  const clean = buildPopulation(cleanOpts);
  writeFixture("fixtures/clean-834.edi", serialize(clean, cleanOpts));

  const corruptOpts = baseOptions({ corrupt: true, stControl: "0002", interchangeControl: "100000002" });
  writeFixture("fixtures/corrupt-834.edi", serialize(buildPopulation(corruptOpts), corruptOpts));

  const v1Opts = baseOptions({ members: 30, seed: 7777, stControl: "0010", interchangeControl: "100000010" });
  const v1 = buildPopulation(v1Opts);
  writeFixture("fixtures/diff-v1-834.edi", serialize(v1, v1Opts));

  const v2Opts = baseOptions({ seed: 7777, stControl: "0011", interchangeControl: "100000011" });
  writeFixture("fixtures/diff-v2-834.edi", serialize(deriveV2(v1), v2Opts));
}

main();
