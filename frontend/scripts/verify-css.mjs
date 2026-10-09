import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let postcss;
try {
  postcss = require("postcss");
} catch {
  postcss = require("/opt/nvm/versions/node/v22.16.0/lib/node_modules/postcss");
}
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".css")) files.push(full);
  }
}
walk("src");
let failed = false;
for (const file of files) {
  try {
    postcss.parse(fs.readFileSync(file, "utf8"), { from: file });
  } catch (error) {
    failed = true;
    console.error(`${file}: ${error.reason ?? error.message}`);
  }
}
if (failed) process.exit(1);
console.log(`CSS OK: ${files.length} files parsed.`);
