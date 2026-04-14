/**
 * Makes near-black pixels transparent on energy + coin PNGs (true alpha, no CSS blend).
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { renameSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const threshold = 28;
const feather = 14;

const files = ["koli-energy-icon.png", "koli-coin.png"];

function processBuffer(data, channels, width, height) {
  const out = Buffer.from(data);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = out[i];
      const g = out[i + 1];
      const b = out[i + 2];
      const m = Math.max(r, g, b);
      let a = 255;
      if (m <= threshold) {
        a = 0;
      } else if (m < threshold + feather) {
        a = Math.round(((m - threshold) / feather) * 255);
      }
      out[i + 3] = a;
    }
  }
  return out;
}

const publicDir = fileURLToPath(new URL("../public/", import.meta.url));

for (const name of files) {
  const inputPath = new URL(`../public/${name}`, import.meta.url);
  const input = fileURLToPath(inputPath);

  const pipeline = sharp(input, { failOn: "none" }).ensureAlpha();
  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });

  const processed = processBuffer(data, info.channels, info.width, info.height);

  const finalPath = join(publicDir, name);
  const tmpPath = join(tmpdir(), `koli-icon-${name}-${Date.now()}.png`);
  await sharp(processed, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .png({ compressionLevel: 9 })
    .toFile(tmpPath);

  try {
    unlinkSync(finalPath);
  } catch {
    /* ignore */
  }
  renameSync(tmpPath, finalPath);

  // eslint-disable-next-line no-console
  console.log("Wrote:", finalPath);
}