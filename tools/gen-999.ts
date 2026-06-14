/**
 * Synthetic 999 generator (spec §11/§12). Emits a fully fake Implementation
 * Acknowledgment for an 837 functional group, with a mix of accepted,
 * accepted-with-errors, and rejected transactions (including segment- and
 * element-level error detail). Seeded for determinism. AK9 counts are correct
 * for clean files; `--corrupt` makes them disagree with what's present.
 *
 *   tsx tools/gen-999.ts                 # write the fixture set
 *   tsx tools/gen-999.ts --sets 12       # one clean file to stdout
 *   tsx tools/gen-999.ts --sets 12 --corrupt
 */
import { faker } from "@faker-js/faker";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const D = { element: "*", component: ":", repetition: "^", segment: "~" };

type Status = "A" | "E" | "R";
interface AckSet {
  setId: string;
  control: string;
  status: Status;
  segError?: { segId: string; pos: string; loop: string; code: string; elemPos: string; elemRef: string; elemCode: string; badValue: string };
}

interface GenOptions {
  sets: number;
  corrupt: boolean;
  seed: number;
  interchangeControl: string;
  groupControl: string;
  stControl: string;
}

const SEG_ERRORS = [
  { segId: "CLM", loop: "2300", code: "8", elemPos: "5", elemRef: "1331", elemCode: "7", badValue: "99" },
  { segId: "SV1", loop: "2400", code: "8", elemPos: "1", elemRef: "234", elemCode: "1", badValue: "" },
  { segId: "DMG", loop: "2010BA", code: "8", elemPos: "2", elemRef: "1251", elemCode: "8", badValue: "20211332" },
  { segId: "NM1", loop: "2010BB", code: "3", elemPos: "9", elemRef: "67", elemCode: "1", badValue: "" },
];

function buildSets(opts: GenOptions): AckSet[] {
  faker.seed(opts.seed);
  const out: AckSet[] = [];
  for (let i = 0; i < opts.sets; i++) {
    const roll = faker.number.float({ min: 0, max: 1 });
    const status: Status = roll < 0.65 ? "A" : roll < 0.85 ? "E" : "R";
    const def = faker.helpers.arrayElement(SEG_ERRORS);
    out.push({
      setId: "837",
      control: String(i + 1).padStart(4, "0"),
      status,
      segError: status === "A" ? undefined : { ...def, pos: String(faker.number.int({ min: 5, max: 40 })) },
    });
  }
  return out;
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

function setSegments(ack: AckSet): string[] {
  const out: string[] = [seg("AK2", ack.setId, ack.control, "005010X222A1")];
  if (ack.segError) {
    const e = ack.segError;
    out.push(seg("IK3", e.segId, e.pos, e.loop, e.code));
    out.push(seg("CTX", `SITUATIONAL TRIGGER${D.component}${e.segId}`, e.segId, e.pos));
    out.push(seg("IK4", e.elemPos, e.elemRef, e.elemCode, e.badValue || undefined));
  }
  // IK5: A accepted, E accepted-with-errors (syntax 5), R rejected (syntax 5).
  if (ack.status === "A") out.push(seg("IK5", "A"));
  else out.push(seg("IK5", ack.status, "5"));
  return out;
}

export function serialize(sets: AckSet[], opts: GenOptions): string {
  const accepted = sets.filter((s) => s.status === "A").length;
  const rejected = sets.filter((s) => s.status === "R").length;
  const groupStatus = rejected === 0 ? (sets.every((s) => s.status === "A") ? "A" : "E") : accepted > 0 ? "P" : "R";

  const body: string[] = [];
  body.push(seg("ST", "999", opts.stControl, "005010X231A1"));
  body.push(seg("AK1", "HC", "17456", "005010X222A1"));
  for (const ack of sets) body.push(...setSegments(ack));

  const included = opts.corrupt ? sets.length + 2 : sets.length;
  const acceptedDeclared = opts.corrupt ? accepted + 1 : accepted;
  body.push(seg("AK9", groupStatus, String(included), String(sets.length), String(acceptedDeclared)));

  const segmentCount = body.length + 1;
  body.push(seg("SE", String(segmentCount), opts.stControl));

  const segments = [
    isaSegment(opts),
    seg("GS", "FA", "PAYER", "PROVIDER", "20210901", "1200", opts.groupControl, "X", "005010X231A1"),
    ...body,
    seg("GE", "1", opts.groupControl),
    seg("IEA", "1", opts.interchangeControl.padStart(9, "0")),
  ];
  return segments.join(D.segment) + D.segment + "\n";
}

function baseOptions(over: Partial<GenOptions> = {}): GenOptions {
  return { sets: 12, corrupt: false, seed: 5050, interchangeControl: "500000001", groupControl: "5001", stControl: "0001", ...over };
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
  const sIdx = argv.indexOf("--sets");
  const sets = sIdx >= 0 ? Number(argv[sIdx + 1]) : undefined;

  if (sets !== undefined) {
    const opts = baseOptions({ sets, corrupt });
    process.stdout.write(serialize(buildSets(opts), opts));
    return;
  }
  const clean = baseOptions();
  writeFixture("fixtures/clean-999.edi", serialize(buildSets(clean), clean));
  const bad = baseOptions({ corrupt: true, stControl: "0002", interchangeControl: "500000002" });
  writeFixture("fixtures/corrupt-999.edi", serialize(buildSets(bad), bad));
}

main();
