/**
 * Generate app/favicon.ico and app/apple-icon.png from the brand mark
 * (cobalt square + three white ledger bars), dependency-free. Re-run after a
 * brand change:  node tools/gen-favicon.mjs
 */
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const COBALT = [31, 58, 255];
const WHITE = [255, 255, 255];

/** Render the mark into an RGBA pixel buffer of the given size. */
function render(size) {
  const px = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    px[i * 4] = COBALT[0];
    px[i * 4 + 1] = COBALT[1];
    px[i * 4 + 2] = COBALT[2];
    px[i * 4 + 3] = 255;
  }
  const h = Math.max(1, Math.round(size * 0.085));
  // [yFraction, xFraction, widthFraction]
  const bars = [
    [0.3, 0.21, 0.57],
    [0.47, 0.21, 0.36],
    [0.64, 0.21, 0.46],
  ];
  for (const [yf, xf, wf] of bars) {
    const y0 = Math.round(size * yf);
    const x0 = Math.round(size * xf);
    const w = Math.round(size * wf);
    for (let y = y0; y < y0 + h && y < size; y++) {
      for (let x = x0; x < x0 + w && x < size; x++) {
        const i = (y * size + x) * 4;
        px[i] = WHITE[0];
        px[i + 1] = WHITE[1];
        px[i + 2] = WHITE[2];
        px[i + 3] = 255;
      }
    }
  }
  return px;
}

const crcTable = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function png(size) {
  const px = render(size);
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    px.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}
function ico(size) {
  const p = png(size);
  const dir = Buffer.alloc(6);
  dir.writeUInt16LE(1, 2); // type: icon
  dir.writeUInt16LE(1, 4); // count
  const ent = Buffer.alloc(16);
  ent[0] = size >= 256 ? 0 : size;
  ent[1] = size >= 256 ? 0 : size;
  ent.writeUInt16LE(1, 4); // planes
  ent.writeUInt16LE(32, 6); // bpp
  ent.writeUInt32LE(p.length, 8);
  ent.writeUInt32LE(22, 12); // offset
  return Buffer.concat([dir, ent, p]);
}

const here = dirname(fileURLToPath(import.meta.url));
const out = (rel) => resolve(here, "..", rel);
writeFileSync(out("app/favicon.ico"), ico(32));
writeFileSync(out("app/apple-icon.png"), png(180));
// eslint-disable-next-line no-console
console.log("wrote app/favicon.ico (32) and app/apple-icon.png (180)");
