// Builds the favicon, touch icon and social image from the mark. Run: node scripts/brand.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

/** Reads an exported array literal out of a data file. */
const grab = (file, name) => {
  const t = readFileSync(new URL(`../lib/${file}`, import.meta.url), "utf8");
  const from = t.indexOf("= [", t.indexOf(`export const ${name}`)) + 2;
  return new Function(`return ${t.slice(from, t.indexOf("];", from) + 1)}`)();
};
const path = (p) => `<path d="${p.d}" transform="translate(${p.x} ${p.y})"/>`;
const mark = grab("mark.ts", "SHARDS").map((s) => `<g fill="${s.color}">${s.paths.map(path).join("")}</g>`).join("");
const word = grab("wordmark.ts", "WORDMARK").map(path).join("");
const file = (f) => fileURLToPath(new URL(`../public/brand/${f}`, import.meta.url));

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-7 0 125 125">${mark}</svg>`;
writeFileSync(file("icon.svg"), icon);
await sharp(Buffer.from(icon), { density: 200 })
  .resize(148, 148)
  .extend({ top: 16, bottom: 16, left: 16, right: 16, background: "#fff" })
  .flatten({ background: "#fff" })
  .png()
  .toFile(file("apple.png"));

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#fff"/><g transform="translate(690 40) scale(4.4)">${mark}</g><g transform="translate(64 140) scale(1.75)" fill="#101114">${word}</g><g font-family="Segoe UI, Arial" font-weight="700" font-size="42" fill="#101114"><text x="64" y="420">Order branding, film</text><text x="64" y="474">and web from a menu</text></g></svg>`;
await sharp(Buffer.from(og)).png().toFile(file("og.png"));
