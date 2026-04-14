import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const BLACK_TH = 34;
const COLOR_TOL = 48;

function processBuffer(bytes, w, h) {
  const inBounds = (x, y) => x >= 0 && x < w && y >= 0 && y < h;
  const idx = (x, y) => (y * w + x) * 4;

  const isBlack = (i) =>
    bytes[i] <= BLACK_TH && bytes[i + 1] <= BLACK_TH && bytes[i + 2] <= BLACK_TH;

  // Pass 1: flood black from image edges
  const seen = new Uint8Array(w * h);
  const q = [];
  function tryBlack(x, y) {
    if (!inBounds(x, y)) return;
    const k = y * w + x;
    if (seen[k]) return;
    const i = idx(x, y);
    if (!isBlack(i)) return;
    seen[k] = 1;
    q.push(x, y);
  }
  for (let x = 0; x < w; x++) {
    tryBlack(x, 0);
    tryBlack(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    tryBlack(0, y);
    tryBlack(w - 1, y);
  }
  for (let p = 0; p < q.length; p += 2) {
    const x = q[p];
    const y = q[p + 1];
    const i = idx(x, y);
    bytes[i + 3] = 0;
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(nx, ny)) continue;
      const nk = ny * w + nx;
      if (seen[nk]) continue;
      const ni = idx(nx, ny);
      if (isBlack(ni)) {
        seen[nk] = 1;
        q.push(nx, ny);
      }
    }
  }

  // Pass 2: mean color of visible edge → flood similar from edges
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let count = 0;
  for (let x = 0; x < w; x++) {
    for (const y of [0, h - 1]) {
      const i = idx(x, y);
      if (bytes[i + 3] > 128) {
        sumR += bytes[i];
        sumG += bytes[i + 1];
        sumB += bytes[i + 2];
        count++;
      }
    }
  }
  for (let y = 0; y < h; y++) {
    for (const x of [0, w - 1]) {
      const i = idx(x, y);
      if (bytes[i + 3] > 128) {
        sumR += bytes[i];
        sumG += bytes[i + 1];
        sumB += bytes[i + 2];
        count++;
      }
    }
  }
  if (count === 0) return;

  const mr = sumR / count;
  const mg = sumG / count;
  const mb = sumB / count;
  const near = (i) => {
    const r = bytes[i];
    const g = bytes[i + 1];
    const b = bytes[i + 2];
    return Math.hypot(r - mr, g - mg, b - mb) <= COLOR_TOL;
  };

  const seen2 = new Uint8Array(w * h);
  const q2 = [];
  function tryColor(x, y) {
    if (!inBounds(x, y)) return;
    const k = y * w + x;
    if (seen2[k]) return;
    const i = idx(x, y);
    if (bytes[i + 3] < 64) return;
    if (!near(i)) return;
    seen2[k] = 1;
    q2.push(x, y);
  }
  for (let x = 0; x < w; x++) {
    tryColor(x, 0);
    tryColor(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    tryColor(0, y);
    tryColor(w - 1, y);
  }
  for (let p = 0; p < q2.length; p += 2) {
    const x = q2[p];
    const y = q2[p + 1];
    const i = idx(x, y);
    bytes[i + 3] = 0;
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(nx, ny)) continue;
      const nk = ny * w + nx;
      if (seen2[nk]) continue;
      const ni = idx(nx, ny);
      if (bytes[ni + 3] < 64) continue;
      if (near(ni)) {
        seen2[nk] = 1;
        q2.push(nx, ny);
      }
    }
  }
}

const root = fileURLToPath(new URL("..", import.meta.url));
const assetsDir = path.join(
  "C:",
  "Users",
  "mariamy",
  ".cursor",
  "projects",
  "c-Users-mariamy-Downloads-Koli-app",
  "assets"
);

const jobs = [
  {
    src: "c_Users_mariamy_AppData_Roaming_Cursor_User_workspaceStorage_423627cd22c57672776d455899c8185f_images_Designer19-3454717e-0cf3-41c9-9bbb-8ea57ce213c9.png",
    out: "game-icon-visual.png",
  },
  {
    src: "c_Users_mariamy_AppData_Roaming_Cursor_User_workspaceStorage_423627cd22c57672776d455899c8185f_images_Designer22-5c27532e-1f1f-49e2-951c-355f3574c4da.png",
    out: "game-icon-number.png",
  },
  {
    src: "c_Users_mariamy_AppData_Roaming_Cursor_User_workspaceStorage_423627cd22c57672776d455899c8185f_images_Designer25-93e385db-0911-4bfb-925d-27d01507426d.png",
    out: "game-icon-sequence.png",
  },
  {
    src: "c_Users_mariamy_AppData_Roaming_Cursor_User_workspaceStorage_423627cd22c57672776d455899c8185f_images_Designer26-a349edb1-84f1-459c-8353-393230bf6064.png",
    out: "game-icon-reaction.png",
  },
];

for (const { src, out } of jobs) {
  const inputPath = path.join(assetsDir, src);
  const outputPath = path.join(root, "public", out);
  const img = sharp(inputPath, { failOn: "none" }).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const bytes = new Uint8ClampedArray(data);
  processBuffer(bytes, info.width, info.height);
  await sharp(Buffer.from(bytes), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(outputPath);
  console.log("Saved:", outputPath);
}