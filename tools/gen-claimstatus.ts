/**
 * Synthetic 276/277/277CA generator (spec §11/§12). Emits a claim-status request
 * (276), a status response (277) with a finalized/pending/denied mix, and a claim
 * acknowledgment (277CA) with an accepted/rejected mix. Seeded for determinism.
 *
 *   tsx tools/gen-claimstatus.ts                    # write the fixture set
 *   tsx tools/gen-claimstatus.ts --type 277ca --claims 20
 */
import { faker } from "@faker-js/faker";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const D = { element: "*", component: ":", repetition: "^", segment: "~" };

type Kind = "276" | "277" | "277ca";

interface Claim {
  last: string;
  first: string;
  memberId: string;
  claimId: string;
  payerClaimId: string;
  chargeC: number;
  category: string; // STC category (277/277ca)
  status: string; // STC status code
}

interface GenOptions {
  kind: Kind;
  claims: number;
  seed: number;
  interchangeControl: string;
  groupControl: string;
  stControl: string;
}

const RESPONSE_STATUS: [string, string][] = [
  ["F1", "107"], // finalized — paid
  ["F1", "107"],
  ["P1", "3"], // pending
  ["F2", "65"], // denied
];
const ACK_STATUS: [string, string][] = [
  ["A1", "20"], // received
  ["A2", "20"], // accepted
  ["A2", "20"],
  ["A3", "21"], // rejected — missing info
];

function buildClaims(opts: GenOptions): Claim[] {
  faker.seed(opts.seed);
  const table = opts.kind === "277ca" ? ACK_STATUS : RESPONSE_STATUS;
  return Array.from({ length: opts.claims }, (_, i) => {
    const [category, status] = faker.helpers.arrayElement(table);
    return {
      last: faker.person.lastName().toUpperCase(),
      first: faker.person.firstName().toUpperCase(),
      memberId: faker.string.alphanumeric(9).toUpperCase(),
      claimId: `CLM${String(i + 1).padStart(5, "0")}`,
      payerClaimId: faker.string.numeric(10),
      chargeC: faker.helpers.arrayElement([12000, 25000, 48000, 90000]),
      category,
      status,
    };
  });
}

const money = (c: number) => (c / 100).toFixed(2);

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

export function serialize(claims: Claim[], opts: GenOptions): string {
  const stCode = opts.kind === "276" ? "276" : "277";
  const version = opts.kind === "277ca" ? "005010X214" : opts.kind === "277" ? "005010X212" : "005010X212";
  const gsCode = opts.kind === "276" ? "HR" : "HN";
  const isRequest = opts.kind === "276";

  const body: string[] = [];
  body.push(seg("ST", stCode, opts.stControl, version));
  body.push(seg("BHT", "0010", isRequest ? "13" : "08", "REF" + opts.stControl, "20210901", "1200", isRequest ? "" : "TH"));

  body.push(seg("HL", "1", "", "20", "1"));
  body.push(seg("NM1", "PR", "2", "BLUE SAMPLE INSURANCE", "", "", "", "", "PI", "PAYER01"));
  body.push(seg("HL", "2", "1", "21", "1"));
  body.push(seg("NM1", "41", "2", "GOOD HEALTH CLINIC", "", "", "", "", "46", "RCV01"));

  claims.forEach((c, i) => {
    body.push(seg("HL", String(i + 3), "2", "22", "0"));
    body.push(seg("NM1", "QC", "1", c.last, c.first, "", "", "", "MI", c.memberId));
    body.push(seg("TRN", isRequest ? "1" : "2", c.payerClaimId));
    if (!isRequest) {
      body.push(seg("STC", `${c.category}${D.component}${c.status}`, "20210901", "WQ", money(c.chargeC)));
    }
    body.push(seg("REF", "EJ", c.claimId));
    body.push(seg("REF", "1K", c.payerClaimId));
    body.push(seg("AMT", "T3", money(c.chargeC)));
    body.push(seg("DTP", "472", "RD8", "20210801-20210803"));
  });

  const segmentCount = body.length + 1;
  body.push(seg("SE", String(segmentCount), opts.stControl));

  const segments = [
    isaSegment(opts),
    seg("GS", gsCode, "PAYER", "PROVIDER", "20210901", "1200", opts.groupControl, "X", version),
    ...body,
    seg("GE", "1", opts.groupControl),
    seg("IEA", "1", opts.interchangeControl.padStart(9, "0")),
  ];
  return segments.join(D.segment) + D.segment + "\n";
}

function baseOptions(over: Partial<GenOptions> = {}): GenOptions {
  return { kind: "277", claims: 18, seed: 8080, interchangeControl: "800000001", groupControl: "8001", stControl: "0001", ...over };
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
  const tIdx = argv.indexOf("--type");
  const cIdx = argv.indexOf("--claims");
  const claims = cIdx >= 0 ? Number(argv[cIdx + 1]) : undefined;

  if (tIdx >= 0) {
    const kind = (["276", "277", "277ca"].includes(argv[tIdx + 1] ?? "") ? argv[tIdx + 1] : "277") as Kind;
    const opts = baseOptions({ kind, claims: claims ?? 18 });
    process.stdout.write(serialize(buildClaims(opts), opts));
    return;
  }

  writeFixture("fixtures/clean-276.edi", serialize(buildClaims(baseOptions({ kind: "276", stControl: "0001", interchangeControl: "800000001", groupControl: "8001" })), baseOptions({ kind: "276", stControl: "0001", interchangeControl: "800000001", groupControl: "8001" })));
  writeFixture("fixtures/clean-277.edi", serialize(buildClaims(baseOptions({ kind: "277", stControl: "0002", interchangeControl: "800000002", groupControl: "8002" })), baseOptions({ kind: "277", stControl: "0002", interchangeControl: "800000002", groupControl: "8002" })));
  writeFixture("fixtures/clean-277ca.edi", serialize(buildClaims(baseOptions({ kind: "277ca", stControl: "0003", interchangeControl: "800000003", groupControl: "8003" })), baseOptions({ kind: "277ca", stControl: "0003", interchangeControl: "800000003", groupControl: "8003" })));
}

main();
