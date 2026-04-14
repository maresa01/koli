import sharp from "sharp";
import { fileURLToPath } from "node:url";

const input = fileURLToPath(new URL("../public/koli-coin.png", import.meta.url));
const output = fileURLToPath(
  new URL("../public/koli-coin-transparent.png", import.meta.url)
);

// Remove near-black background (solid black) by turning it transparent.
const threshold = 18; // 0..255, higher removes more dark pixels

const img = sharp(input, { failOn: "none" }).ensureAlpha();
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += info.channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (r <= threshold && g <= threshold && b <= threshold) {
    data[i + 3] = 0;
  } else {
    data[i + 3] = 255;
  }
}

await sharp(data, {
  raw: { width: info.width, height: info.height, channels: info.channels },
})
  .png()
  .toFile(output);

// eslint-disable-next-line no-console
console.log("Saved:", output);