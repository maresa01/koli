/**
 * Railway (and some Node templates) run `node index.mjs` as the container start command.
 * This file serves the Vite production build from `dist/`.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, "dist");

if (!fs.existsSync(dist)) {
  console.error("dist/ not found. Run `npm run build` in the build step before start.");
  process.exit(1);
}

const port = process.env.PORT || "4173";
const serveMain = path.join(root, "node_modules", "serve", "build", "main.js");

const child = spawn(
  process.execPath,
  [serveMain, "-s", "dist", "-l", `tcp://0.0.0.0:${port}`],
  { cwd: root, stdio: "inherit", env: process.env }
);

child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
child.on("exit", (code) => process.exit(code ?? 1));
