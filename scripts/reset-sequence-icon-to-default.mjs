/**
 * Writes a default abstract sequence-memory icon (4 tiles) to public/game-icon-sequence.png.
 * Use when the original PNG is not available in version control.
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "..", "public", "game-icon-sequence.png");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#1e1b4b" flood-opacity="0.18"/>
    </filter>
  </defs>
  <g filter="url(#s)">
    <rect x="120" y="120" width="360" height="360" rx="56" fill="#f4d03f" stroke="#1a2340" stroke-width="14"/>
    <rect x="544" y="120" width="360" height="360" rx="56" fill="#8eedb9" stroke="#1a2340" stroke-width="14"/>
    <rect x="120" y="544" width="360" height="360" rx="56" fill="#5dade2" stroke="#1a2340" stroke-width="14"/>
    <rect x="544" y="544" width="360" height="360" rx="56" fill="#ffb4a8" stroke="#1a2340" stroke-width="14"/>
  </g>
  <text x="300" y="310" text-anchor="middle" fill="#1a2340" font-family="Arial Black, Arial, sans-serif" font-size="120" font-weight="900" opacity="0.35">1</text>
  <text x="724" y="310" text-anchor="middle" fill="#1a2340" font-family="Arial Black, Arial, sans-serif" font-size="120" font-weight="900" opacity="0.35">2</text>
  <text x="300" y="734" text-anchor="middle" fill="#1a2340" font-family="Arial Black, Arial, sans-serif" font-size="120" font-weight="900" opacity="0.35">3</text>
  <text x="724" y="734" text-anchor="middle" fill="#1a2340" font-family="Arial Black, Arial, sans-serif" font-size="120" font-weight="900" opacity="0.35">4</text>
</svg>`;

await sharp(Buffer.from(svg))
  .resize(1024, 1024)
  .png({ compressionLevel: 9, palette: false })
  .toFile(out);

console.log("Wrote", out);
