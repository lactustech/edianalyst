/**
 * Synthetic 835 generator (spec §11/§12). Emits valid, fully fake Health Care
 * Claim Payment/Advice files. Seeded, so fixtures are deterministic. The
 * generator owns the money math: every clean claim balances
 * (charge = paid + adjustments) and BPR02 equals the sum of claim payments, so
 * clean files reconcile and `--corrupt` files fail the balancing checks.
 *
 *   tsx tools/gen-835.ts                 # write the fixture set
 *   tsx tools/gen-835.ts --claims 30     # one clean file to stdout
 *   tsx tools/gen-835.ts --claims 30 --corrupt
 */
import { faker } from "@faker-js/faker";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const D = { element: "*", component: ":", repetition: "^", segment: "~" };

const PROCEDURES = ["99213", "99214", "99203", "99396", "80053", "85025", "93000", "71046"];
const FILING = ["MC", "MB", "CI", "HM", "BL"];
const REMARKS = ["M15", "N130", "MA01", "N362"];

interface GenOptions {
  claims: number;
  corrupt: boolean;
  seed: number;
  interchangeControl: string;
  groupControl: string;
  stControl: string;
}

interface Adjustment {
  group: string; // CAS01
  reason: string; // CARC
  cents: number;
}
interface ServiceLine {
  proc: string;
  chargeC: number;
  paidC: number;
  units: number;
  adjustments: Adjustment[];
  remark?: string;
  date: string;
}
interface Claim {
  id: string;
  statusCode: string;
  filing: string;
  payerClaimControl: string;
  patientLast: string;
  patientFirst: string;
  memberId: string;
  lines: ServiceLine[];
}

const money = (cents: number) => (cents / 100).toFixed(2);

function makeService(denied: boolean): ServiceLine {
  const proc = faker.helpers.arrayElement(PROCEDURES);
  const chargeC = faker.helpers.arrayElement([8000, 12000, 15000, 20000, 25000, 30000]);
  const date = `2021${String(faker.number.int({ min: 1, max: 12 })).padStart(2, "0")}15`;

  if (denied) {
    return {
      proc,
      chargeC,
      paidC: 0,
      units: 1,
      adjustments: [{ group: "CO", reason: "96", cents: chargeC }],
      remark: faker.helpers.arrayElement(REMARKS),
      date,
    };
  }
  const contractualC = Math.round(chargeC * 0.25); // CO/45 — above contracted
  const allowedC = chargeC - contractualC;
  const coinsC = Math.round(allowedC * 0.2); // PR/2 — coinsurance
  const paidC = allowedC - coinsC;
  return {
    proc,
    chargeC,
    paidC,
    units: 1,
    adjustments: [
      { group: "CO", reason: "45", cents: contractualC },
      { group: "PR", reason: "2", cents: coinsC },
    ],
    date,
  };
}

function buildClaims(opts: GenOptions): Claim[] {
  faker.seed(opts.seed);
  const claims: Claim[] = [];
  for (let i = 0; i < opts.claims; i++) {
    const denied = faker.number.float({ min: 0, max: 1 }) < 0.15;
    const lines = Array.from({ length: faker.number.int({ min: 1, max: 2 }) }, () => makeService(denied));
    claims.push({
      id: `CLAIM${String(i + 1).padStart(5, "0")}`,
      statusCode: denied ? "4" : "1",
      filing: faker.helpers.arrayElement(FILING),
      payerClaimControl: faker.string.numeric(10),
      patientLast: faker.person.lastName().toUpperCase(),
      patientFirst: faker.person.firstName().toUpperCase(),
      memberId: faker.string.numeric(9),
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
    "ISA", "00", pad("", 10), "00", pad("", 10), "ZZ", pad("PAYER", 15),
    "ZZ", pad("PROVIDER", 15), "210901", "1200", D.repetition, "00501",
    num(opts.interchangeControl, 9), "0", "T", D.component,
  ].join(D.element);
}

function claimSegments(claim: Claim, corruptUnbalance: boolean): string[] {
  const out: string[] = [];
  const chargeC = claim.lines.reduce((s, l) => s + l.chargeC, 0);
  const paidC = claim.lines.reduce((s, l) => s + l.paidC, 0);
  const prC = claim.lines.reduce(
    (s, l) => s + l.adjustments.filter((a) => a.group === "PR").reduce((x, a) => x + a.cents, 0),
    0,
  );

  out.push(seg("CLP", claim.id, claim.statusCode, money(chargeC), money(paidC), money(prC), claim.filing, claim.payerClaimControl, "11"));
  out.push(seg("NM1", "QC", "1", claim.patientLast, claim.patientFirst, "", "", "", "MI", claim.memberId));

  claim.lines.forEach((line, idx) => {
    out.push(seg("SVC", `HC${D.component}${line.proc}`, money(line.chargeC), money(line.paidC), "", String(line.units)));
    out.push(seg("DTM", "472", line.date));
    // Understate the first adjustment on the first line of the first claim when
    // corrupting, so charge != paid + adjustments and the balancing check fires.
    line.adjustments.forEach((a, ai) => {
      const cents = corruptUnbalance && idx === 0 && ai === 0 ? a.cents - 1000 : a.cents;
      out.push(seg("CAS", a.group, a.reason, money(cents)));
    });
    if (line.remark) out.push(seg("LQ", "HE", line.remark));
  });
  return out;
}

export function serialize(claims: Claim[], opts: GenOptions): string {
  const totalPaidC = claims.reduce(
    (s, c) => s + c.lines.reduce((x, l) => x + l.paidC, 0),
    0,
  );
  const declaredTotalC = opts.corrupt ? totalPaidC + 10000 : totalPaidC;

  const body: string[] = [];
  body.push(seg("ST", "835", opts.stControl));
  body.push(seg("BPR", "I", money(declaredTotalC), "C", "ACH", "CCP", "01", "111111111", "DA", "1111", "1234567890", "", "01", "222222222", "DA", "2222", "20210901"));
  body.push(seg("TRN", "1", "EFT" + opts.stControl + "9981", "1999888777"));
  body.push(seg("DTM", "405", "20210901"));
  body.push(seg("N1", "PR", "BLUE SAMPLE INSURANCE"));
  body.push(seg("N1", "PE", "GOOD HEALTH CLINIC", "XX", "1234567890"));
  body.push(seg("LX", "1"));

  claims.forEach((claim, i) => {
    // When corrupting: unbalance claim #1 and give claim #2 an unknown status.
    const unbalance = opts.corrupt && i === 0;
    const segs = claimSegments(claim, unbalance);
    if (opts.corrupt && i === 1) segs[0] = segs[0]!.replace(`${D.element}${claim.statusCode}${D.element}`, `${D.element}99${D.element}`);
    body.push(...segs);
  });

  const segmentCount = body.length + 1;
  body.push(seg("SE", String(segmentCount), opts.stControl));

  const segments = [
    isaSegment(opts),
    seg("GS", "HP", "PAYER", "PROVIDER", "20210901", "1200", opts.groupControl, "X", "005010X221A1"),
    ...body,
    seg("GE", "1", opts.groupControl),
    seg("IEA", "1", opts.interchangeControl.padStart(9, "0")),
  ];
  return segments.join(D.segment) + D.segment + "\n";
}

function baseOptions(over: Partial<GenOptions> = {}): GenOptions {
  return {
    claims: 25,
    corrupt: false,
    seed: 2025,
    interchangeControl: "200000001",
    groupControl: "2001",
    stControl: "0001",
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
  writeFixture("fixtures/clean-835.edi", serialize(buildClaims(clean), clean));

  const bad = baseOptions({ corrupt: true, stControl: "0002", interchangeControl: "200000002" });
  writeFixture("fixtures/corrupt-835.edi", serialize(buildClaims(bad), bad));
}

main();
