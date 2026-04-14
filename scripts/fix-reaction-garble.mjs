import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const path = fileURLToPath(new URL("../src/lib/strings.ts", import.meta.url));
let s = readFileSync(path, "utf8");

const pairs = [
  ["��ինչեւ", "մինչև"],
  ["դարնա", "դառնա"],
  ["գունը", "գույնը"],
  ["շւտ", "��ու��"],
 �ե��"],
  ["տսավել", "մտածել"],
  [" եվ ", " և "],
  ["ար��ագանքի��ել", "ար��ագանքել�ագանք�ագանքի"],
];

for (const [a, b] of pairs) {
  if (!s.includes(a)) {
    console.warn("skip (not found):", [...a].map((c) => c.codePointAt(0).toString(16)).join(" "));
  } else {
    s = s.split(a).join(b);
  }
}

writeFileSync(path, s, "utf8");
console.log("Fixed garbled reaction strings.");
