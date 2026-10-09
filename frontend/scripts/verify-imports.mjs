import fs from "node:fs";
import path from "node:path";

const ROOTS = ["src", "tests"];
const SOURCE_EXTENSIONS = new Set([".js", ".jsx"]);
const RESOLVE_EXTENSIONS = ["", ".js", ".jsx", ".css", ".json"];
const importPattern = /(?:from\s+|import\s*\()(["'])([^"']+)\1/g;

function walk(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function resolves(importer, specifier) {
  const basePath = path.resolve(path.dirname(importer), specifier);
  const candidates = [
    ...RESOLVE_EXTENSIONS.map((extension) => `${basePath}${extension}`),
    ...RESOLVE_EXTENSIONS.slice(1).map((extension) =>
      path.join(basePath, `index${extension}`),
    ),
  ];

  return candidates.some((candidate) => fs.existsSync(candidate));
}

const failures = [];
let importCount = 0;

for (const root of ROOTS) {
  for (const filePath of walk(root)) {
    if (!SOURCE_EXTENSIONS.has(path.extname(filePath))) continue;

    const source = fs.readFileSync(filePath, "utf8");
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[2];
      if (!specifier.startsWith(".")) continue;

      importCount += 1;
      if (!resolves(filePath, specifier)) {
        failures.push(`${filePath}: ${specifier}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Unresolved relative imports:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Imports OK: ${importCount} relative imports resolved.`);
