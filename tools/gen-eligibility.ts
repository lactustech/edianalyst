/**
 * Synthetic 270/271 generator (spec §11/§12). Emits a fake eligibility inquiry
 * (270) and a matching response (271) with a mix of active and inactive members.
 * Seeded for determinism.
 *
 *   tsx tools/gen-eligibility.ts                  # write the fixture set
 *   tsx tools/gen-eligibility.ts --type 271 --members 20
 */
import { faker } from "@faker-js/faker";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const D = { element: "*", component: ":", repetition: "^", segment: "~" };

interface Member {
  last: string;
  first: string;
  memberId: string;
  dob: string;
  gender: string;
  active: boolean;
}

interface GenOptions {
  type: "270" | "271";
  members: number;
  seed: number;
  interchangeControl: string;
  groupControl: string;
  stControl: string;
}

function buildMembers(opts: GenOptions): Member[] {
  faker.seed(opts.seed);
  return Array.from({ length: opts.members }, () => ({
    last: faker.person.lastName().toUpperCase(),
    first: faker.person.firstName().toUpperCase(),
    memberId: faker.string.alphanumeric(9).toUpperCase(),
    dob: `19${faker.number.int({ min: 50, max: 99 })}0615`,
    gender: faker.helpers.arrayElement(["M", "F"]),
    active: faker.number.float({ min: 0, max: 1 }) > 0.2,
  }));
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

export function serialize(members: Member[], opts: GenOptions): string {
  const is271 = opts.type === "271";
  const body: string[] = [];
  body.push(seg("ST", opts.type, opts.stControl, "005010X279A1"));
  body.push(seg("BHT", "0022", is271 ? "11" : "13", "REF" + opts.stControl, "20210901", "1200"));

  body.push(seg("HL", "1", "", "20", "1"));
  body.push(seg("NM1", "PR", "2", "BLUE SAMPLE INSURANCE", "", "", "", "", "PI", "PAYER01"));
  body.push(seg("HL", "2", "1", "21", "1"));
  body.push(seg("NM1", "1P", "2", "GOOD HEALTH CLINIC", "", "", "", "", "XX", "1234567893"));

  members.forEach((m, i) => {
    body.push(seg("HL", String(i + 3), "2", "22", "0"));
    body.push(seg("NM1", "IL", "1", m.last, m.first, "", "", "", "MI", m.memberId));
    body.push(seg("DMG", "D8", m.dob, m.gender));
    if (is271) {
      if (m.active) {
        body.push(seg("EB", "1", "FAM", "30", "", "GOLD PPO PLAN"));
        body.push(seg("EB", "B", "", "98", "", "", "", "25"));
        body.push(seg("EB", "C", "FAM", "30", "", "", "", "1500"));
      } else {
        body.push(seg("EB", "6", "", "30"));
      }
    } else {
      body.push(seg("EQ", "30"));
      body.push(seg("EQ", "98"));
    }
  });

  const segmentCount = body.length + 1;
  body.push(seg("SE", String(segmentCount), opts.stControl));

  const segments = [
    isaSegment(opts),
    seg("GS", is271 ? "HB" : "HS", "PROVIDER", "PAYER", "20210901", "1200", opts.groupControl, "X", "005010X279A1"),
    ...body,
    seg("GE", "1", opts.groupControl),
    seg("IEA", "1", opts.interchangeControl.padStart(9, "0")),
  ];
  return segments.join(D.segment) + D.segment + "\n";
}

function baseOptions(over: Partial<GenOptions> = {}): GenOptions {
  return { type: "271", members: 18, seed: 7070, interchangeControl: "700000001", groupControl: "7001", stControl: "0001", ...over };
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
  const mIdx = argv.indexOf("--members");
  const members = mIdx >= 0 ? Number(argv[mIdx + 1]) : undefined;

  if (tIdx >= 0) {
    const type = (argv[tIdx + 1] === "270" ? "270" : "271") as "270" | "271";
    const opts = baseOptions({ type, members: members ?? 18 });
    process.stdout.write(serialize(buildMembers(opts), opts));
    return;
  }

  const o270 = baseOptions({ type: "270", stControl: "0001", interchangeControl: "700000001", groupControl: "7001" });
  writeFixture("fixtures/clean-270.edi", serialize(buildMembers(o270), o270));
  const o271 = baseOptions({ type: "271", stControl: "0002", interchangeControl: "700000002", groupControl: "7002" });
  writeFixture("fixtures/clean-271.edi", serialize(buildMembers(o271), o271));
}

main();
