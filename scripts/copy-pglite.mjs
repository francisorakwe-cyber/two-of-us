import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const destDir = join(root, ".vercel/output/functions/__server.func/_libs");
const srcDir = join(root, "node_modules/@electric-sql/pglite/dist");
if (!existsSync(destDir)) {
  console.log("[pglite] bundled server dir missing, skip");
  process.exit(0);
}
for (const name of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
  copyFileSync(join(srcDir, name), join(destDir, name));
}
console.log("[pglite] copied wasm data next to the server bundle");
