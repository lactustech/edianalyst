import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/** Read a committed (synthetic) fixture by file name. */
export function readFixture(name: string): string {
  return readFileSync(resolve(here, "..", "fixtures", name), "utf8");
}

/** Build a minimal but well-formed ISA (105 content chars) for crafted tests. */
export function isa(control = "000000001"): string {
  const pad = (s: string, n: number) => s.padEnd(n, " ").slice(0, n);
  return [
    "ISA", "00", pad("", 10), "00", pad("", 10), "ZZ", pad("SENDER", 15),
    "ZZ", pad("RECEIVER", 15), "210901", "1200", "^", "00501",
    control.padStart(9, "0"), "0", "T", ":",
  ].join("*");
}
