/**
 * Synthetic 820 generator (spec §11/§12). Emits a fully fake group-premium
 * payment. Seeded; BPR02 equals the sum of the RMR premium lines, so clean
 * files balance and `--corrupt` files don't.
 *
 *   tsx tools/gen-820.ts            # write the fixture set
 *   tsx tools/gen-820.ts --lines 20 [--corrupt]
 */
import { faker } from "@faker-js/faker";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const D = { element: "*", component: ":", repetition: "^", segment: "~" };

interface GenOptions {
  lines: number;
  corrupt: boolean;
  seed: number;
  interchangeControl: string;
  groupControl: string;
  stControl: string;
}

interface Line {
  last: string;
  first: string;
  policy: string;
  amountC: number;
  premiumC: number;
}

const money = (cents: number) => (cents / 100).toFixed(2);

function buildLines(opts: GenOptions): Line[] {
  faker.seed(opts.seed);
  return Array.from({ length: opts.lines }, (_, i) => {
    const amountC = faker.helpers.arrayElement([25000, 38000, 42500, 51000, 67500]);
    return {
      last: faker.person.lastName().toUpperCase(),
      first: faker.person.firstName().toUpperCase(),
      policy: `POL${String(i + 1).padStart(5, "0")}`,
      amountC,
      premiumC: amountC,
    };
  });
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
    "ISA", "00", pad("", 10), "00", pad("", 10), "ZZ", pad("EMPLOYER", 15),
    "ZZ", pad("INSURER", 15), "210901", "1200", D.repetition, "00501",
    num(opts.interchangeControl, 9), "0", "T", D.component,
  ].join(D.element);
}

export function serialize(lines: Line[], opts: GenOptions): string {
  const totalC = lines.reduce((s, l) => s + l.amountC, 0);
  const declaredC = opts.corrupt ? totalC + 5000 : totalC;

  const body: string[] = [];
  body.push(seg("ST", "820", opts.stControl, "005010X218"));
  body.push(seg("BPR", "I", money(declaredC), "C", "ACH", "CCP", "01", "111111111", "DA", "1111", "1234567890", "", "01", "222222222", "DA", "2222", "20210901"));
  body.push(seg("TRN", "1", "PREMIT" + opts.stControl));
  body.push(seg("N1", "PR", "ACME EMPLOYER GROUP", "FI", "991234567"));
  body.push(seg("N1", "PE", "BLUE SAMPLE INSURANCE", "FI", "880011223"));

  for (const l of lines) {
    body.push(seg("ENT", "1"));
    body.push(seg("NM1", "IL", "1", l.last, l.first, "", "", "", "34", faker.string.numeric(9)));
    body.push(seg("RMR", "1L", l.policy, "", money(l.amountC), money(l.premiumC)));
    body.push(seg("DTM", "582", "20210901"));
  }

  const segmentCount = body.length + 1;
  body.push(seg("SE", String(segmentCount), opts.stControl));

  const segments = [
    isaSegment(opts),
    seg("GS", "RA", "EMPLOYER", "INSURER", "20210901", "1200", opts.groupControl, "X", "005010X218"),
    ...body,
    seg("GE", "1", opts.groupControl),
    seg("IEA", "1", opts.interchangeControl.padStart(9, "0")),
  ];
  return segments.join(D.segment) + D.segment + "\n";
}

function baseOptions(over: Partial<GenOptions> = {}): GenOptions {
  return { lines: 20, corrupt: false, seed: 6060, interchangeControl: "600000001", groupControl: "6001", stControl: "0001", ...over };
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
  const lIdx = argv.indexOf("--lines");
  const lines = lIdx >= 0 ? Number(argv[lIdx + 1]) : undefined;

  if (lines !== undefined) {
    const opts = baseOptions({ lines, corrupt });
    process.stdout.write(serialize(buildLines(opts), opts));
    return;
  }
  const clean = baseOptions();
  writeFixture("fixtures/clean-820.edi", serialize(buildLines(clean), clean));
  const bad = baseOptions({ corrupt: true, stControl: "0002", interchangeControl: "600000002" });
  writeFixture("fixtures/corrupt-820.edi", serialize(buildLines(bad), bad));
}

main();
