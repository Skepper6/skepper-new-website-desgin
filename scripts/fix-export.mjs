// Next 16 on Windows writes prefetch files as __next.a/b/__PAGE__.txt, but the browser asks for
// __next.a.b.__PAGE__.txt. This puts them where they are requested. On other systems it finds nothing to do.
import { readdirSync, renameSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const out = fileURLToPath(new URL("../out", import.meta.url));
let moved = 0;

function flatten(base, dir, prefix) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) flatten(base, join(dir, e.name), `${prefix}.${e.name}`);
    else {
      renameSync(join(dir, e.name), join(base, `${prefix}.${e.name}`));
      moved++;
    }
  }
}
function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    if (e.name.startsWith("__next.")) flatten(dir, join(dir, e.name), e.name);
    else if (e.name !== "_next") walk(join(dir, e.name));
  }
}
walk(out);
if (moved) console.log(`Placed ${moved} prefetch files`);
