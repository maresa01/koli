import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const path = `${root}/src/lib/strings.ts`;
const nl = readFileSync(path, "utf8").includes("\r\n") ? "\r\n" : "\n";
const lines = readFileSync(path, "utf8").split(/\r?\n/);

const howIdx = lines.findIndex((l) => l === "  reactionHowTo:");
if (howIdx === -1) throw new Error("reactionHowTo: line not found");
if (!lines[howIdx + 1]?.trimStart().startsWith('"')) {
  throw new Error("reactionHowTo value line missing");
}

/** Multi-line template for `strings.ts` (must end with `,` after closing backtick). */
const howBlock = [
  "  reactionHowTo: `Սա խաղ է, որտեղ պետք է ցույց տաս, թե որքան արագ ես։",
  "Ինչպե՞ս խաղալ։",
  "",
  "Սպասիր, մինչև էկրանը դառնա կանաչ",
  "Հենց կանաչ գույնը տեսնես՝ արագ սեղմիր",
  "",
  "Շուտ չսեղմես",
  "",
  "Այս խաղը օգնում է արագ մտածել և արագ արձագանքել",
];

lines.splice(howIdx, 2, ...howBlock);

const roIdx = lines.findIndex((l) => l.startsWith("  reactionOptional:"));
const cdIdx = lines.findIndex((l) => l.startsWith("  reactionCardDesc:"));
if (roIdx === -1 || cdIdx === -1 || cdIdx !== roIdx + 1) {
  throw new Error("reactionOptional / reactionCardDesc block not found");
}
lines[roIdx] = '  reactionOptional: "Արագ ար��ագանքի խաղ",';
lines[cdIdx] =
  '  reactionCardDesc: "Սա խաղ է, որտեղ պետք է ցույց տաս, թե որքան արագ ես",';

const tourIdx = lines.findIndex((l) => l.includes("«Ռեակցիայի ժամանակ»"));
if (tourIdx !== -1) {
  lines[tourIdx] = lines[tourIdx].replace(
    "«Ռեակցիայի ժամանակ»",
    "«Արագ արձագանքման խաղ»"
  );
}

writeFileSync(path, lines.join(nl), "utf8");
console.log("Updated reaction copy in src/lib/strings.ts");
