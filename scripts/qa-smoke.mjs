import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import puppeteer from "puppeteer-core";

const BASE_URL = process.env.QA_BASE_URL ?? "http://localhost:5174/";
const OUT_DIR = path.resolve("qa-artifacts");
const CHROME_EXE =
  process.env.QA_CHROME_EXE ??
  "C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe";

const VIEWPORTS = [
  { name: "mobile-375", width: 375, height: 812 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1280", width: 1280, height: 800 },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function slug(s) {
  return s.replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "").toLowerCase();
}

async function checkPage(page, label) {
  const issues = [];

  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(String(err?.message ?? err)));

  await page.goto(BASE_URL, { waitUntil: "networkidle2" });

  // Basic client-side routing smoke
  const routes = ["/", "/about", "/login", "/register", "/games", "/tasks", "/focus"];
  for (const r of routes) {
    await page.goto(new URL(r, BASE_URL).toString(), { waitUntil: "networkidle2" });
    const title = await page.title();
    if (!title) issues.push(Missing document title on route ${r});
  }

  const overflow = await page.evaluate(() => {
    const de = document.documentElement;
    const b = document.body;
    const clientW = de.clientWidth;
    const scrollW = Math.max(de.scrollWidth, b?.scrollWidth ?? 0);
    return { clientW, scrollW, hasOverflowX: scrollW - clientW > 1 };
  });
  if (overflow.hasOverflowX) {
    issues.push(Horizontal overflow detected: scrollWidth=${overflow.scrollW} clientWidth=${overflow.clientW});
  }

  // Give any late errors a moment
  await sleep(250);
  if (pageErrors.length) issues.push(Page errors: ${pageErrors.join(" | ")});
  if (consoleErrors.length) issues.push(Console errors: ${consoleErrors.join(" | ")});

  const screenshotPath = path.join(OUT_DIR, ${slug(label)}.png);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  return { issues, screenshotPath };
}

async function main() {
  ensureDir(OUT_DIR);

  const browser = await puppeteer.launch({
    executablePath: CHROME_EXE,
    headless: true,
    args: ["--no-sandbox"],
  });

  const all = [];
  try {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
      const label = ${vp.name};
      const res = await checkPage(page, label);
      all.push({ viewport: vp, ...res });
      await page.close();
    }
  } finally {
    await browser.close();
  }

  const failing = all.filter((x) => x.issues.length > 0);
  const reportPath = path.join(OUT_DIR, "report.json");
  fs.writeFileSync(reportPath, JSON.stringify(all, null, 2), "utf8");

  if (failing.length) {
    // eslint-disable-next-line no-console
    console.error("QA smoke found issues. See qa-artifacts/report.json");
    for (const f of failing) {
      // eslint-disable-next-line no-console
      console.error(- ${f.viewport.name}: ${f.issues.join("; ")});
    }
    process.exitCode = 1;
  } else {
    // eslint-disable-next-line no-console
    console.log("QA smoke OK. See qa-artifacts/ for screenshots and report.");
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});