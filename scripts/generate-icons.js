/**
 * PWA Icon Generator
 * Converts public/icon-source.svg into all required PWA icon sizes.
 *
 * Usage:
 *   node scripts/generate-icons.js
 *
 * Requires: sharp  (npm install -D sharp)
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const sharp = require("sharp");
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC_SVG = resolve(ROOT, "public", "icon-source.svg");
const svgBuffer = readFileSync(SRC_SVG);

const targets = [
  { out: "public/pwa-192x192.png", size: 192 },
  { out: "public/pwa-512x512.png", size: 512 },
  { out: "public/apple-touch-icon.png", size: 180 },
];

// Generate PNGs
for (const { out, size } of targets) {
  await sharp(svgBuffer).resize(size, size).png().toFile(resolve(ROOT, out));
  console.log(`✅  ${out} (${size}x${size})`);
}

// favicon.ico - embed 16, 32 and 48 px PNGs via manual ICO construction
async function buildIco(sizes) {
  const images = await Promise.all(
    sizes.map((s) => sharp(svgBuffer).resize(s, s).png().toBuffer()),
  );

  // ICO header: 2 reserved, 2 type (1=icon), 2 count
  const count = images.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = headerSize + dirEntrySize * count;

  let offset = dirSize;
  const entries = images.map((buf, i) => {
    const size = sizes[i];
    const entry = { buf, size, offset };
    offset += buf.length;
    return entry;
  });

  const totalSize = offset;
  const ico = Buffer.alloc(totalSize);

  // ICONDIR
  ico.writeUInt16LE(0, 0); // reserved
  ico.writeUInt16LE(1, 2); // type: ICO
  ico.writeUInt16LE(count, 4); // image count

  // ICONDIRENTRY x count
  entries.forEach(({ buf, size, offset: imgOffset }, i) => {
    const base = headerSize + i * dirEntrySize;
    const dim = size >= 256 ? 0 : size; // 0 means 256+
    ico.writeUInt8(dim, base + 0); // width
    ico.writeUInt8(dim, base + 1); // height
    ico.writeUInt8(0, base + 2); // colour count (0=no palette)
    ico.writeUInt8(0, base + 3); // reserved
    ico.writeUInt16LE(1, base + 4); // colour planes
    ico.writeUInt16LE(32, base + 6); // bits per pixel
    ico.writeUInt32LE(buf.length, base + 8); // image data size
    ico.writeUInt32LE(imgOffset, base + 12); // image data offset
  });

  // Image data
  entries.forEach(({ buf, offset: imgOffset }) => {
    buf.copy(ico, imgOffset);
  });

  return ico;
}

const icoBuffer = await buildIco([16, 32, 48]);
const icoPath = resolve(ROOT, "public", "favicon.ico");
writeFileSync(icoPath, icoBuffer);
console.log("✅  public/favicon.ico (16x16, 32x32, 48x48)");

console.log("\n🎉  All PWA icons generated successfully!");
