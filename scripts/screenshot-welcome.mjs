import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

function firstExisting(paths) {
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      // ignore
    }
  }
  return null;
}

const executablePath = firstExisting([
  "C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
  "C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
  "C:\\\\Program Files\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe",
  "C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe",
]);

if (!executablePath) {
  throw new Error(
    "Չգտա տեղադրված Chrome/Edge բրաուզեր՝ screenshot ստեղծելու համար։"
  );
}

const url = process.env.SCREENSHOT_URL ?? "http://127.0.0.1:4173/";
const outFile =
  process.env.SCREENSHOT_OUT ??
  path.resolve(process.cwd(), "welcome-screen.png");

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60_000 });
  await page.waitForSelector(".welcome-v2__actions", { timeout: 20_000 });
  await new Promise((r) => setTimeout(r, 350));
  await page.screenshot({ path: outFile, fullPage: true });
  // eslint-disable-next-line no-console
  console.log(Saved: ${outFile});
} finally {
  await browser.close();
}