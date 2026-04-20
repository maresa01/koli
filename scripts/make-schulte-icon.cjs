/**
 * Flood-fill the AI-generated checkerboard "transparency" background from the
 * edges, crop to the content, pad to a square and resize to 1024x1024 RGBA PNG
 * (matches the existing game icons). Works with both light and dark checker
 * patterns (anything that is ~greyscale and reachable from the image border).
 *
 * Usage: node scripts/make-schulte-icon.cjs <src> <dst>
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const [, , SRC_ARG, DST_ARG] = process.argv;
const SRC = SRC_ARG ||
  path.join(
    "C:/Users/Minas/.cursor/projects/c-Users-Minas-Documents-Koli-app/assets",
    "game-icon-schulte.png"
  );
const DST = DST_ARG || path.join("public", "game-icon-schulte.png");

(async () => {
  const raw = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  const { width: W, height: H, channels } = info; // channels = 4

  // Background detector: the AI's "transparency checkerboard" is made of
  // greyscale tiles (r≈g≈b). We accept any greyscale pixel regardless of
  // brightness — flood-fill from the border will stop at the colored outline
  // of the sticker, so lighter greys inside the icon are safe.
  const isBg = (r, g, b) => {
    const avg = (r + g + b) / 3;
    const maxDiff = Math.max(Math.abs(r - avg), Math.abs(g - avg), Math.abs(b - avg));
    return maxDiff < 10;
  };

  const alpha = new Uint8Array(W * H).fill(255);
  const visited = new Uint8Array(W * H);

  // Iterative flood-fill from every edge pixel that qualifies as background.
  const stack = [];
  const pushIfBg = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const idx = y * W + x;
    if (visited[idx]) return;
    const p = idx * channels;
    if (!isBg(data[p], data[p + 1], data[p + 2])) return;
    visited[idx] = 1;
    alpha[idx] = 0;
    stack.push(x, y);
  };
  for (let x = 0; x < W; x++) {
    pushIfBg(x, 0);
    pushIfBg(x, H - 1);
  }
  for (let y = 0; y < H; y++) {
    pushIfBg(0, y);
    pushIfBg(W - 1, y);
  }
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    pushIfBg(x + 1, y);
    pushIfBg(x - 1, y);
    pushIfBg(x, y + 1);
    pushIfBg(x, y - 1);
  }

  // Write alpha back + find bbox of kept pixels.
  let minX = W, minY = H, maxX = -1, maxY = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = y * W + x;
      const p = idx * channels;
      data[p + 3] = alpha[idx];
      if (alpha[idx] !== 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error("Nothing left after background removal");

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  console.log(`Source ${W}x${H}, content bbox ${cw}x${ch} at (${minX},${minY})`);

  // Pad to square around the bbox, then resize to 1024.
  const side = Math.max(cw, ch);
  const padX = Math.floor((side - cw) / 2);
  const padY = Math.floor((side - ch) / 2);

  const cropped = await sharp(Buffer.from(data), { raw: { width: W, height: H, channels } })
    .extract({ left: minX, top: minY, width: cw, height: ch })
    .extend({
      top: padY,
      bottom: side - ch - padY,
      left: padX,
      right: side - cw - padX,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize(1024, 1024, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(DST, cropped);
  const stat = fs.statSync(DST);
  console.log(`Wrote ${DST} (${stat.size} bytes)`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
