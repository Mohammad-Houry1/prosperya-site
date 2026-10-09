import fs from "node:fs";
import path from "node:path";
import { builtinModules } from "node:module";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const declared = new Set([
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.devDependencies ?? {}),
]);
const builtins = new Set([
  ...builtinModules,
  ...builtinModules.map((name) => `node:${name}`),
]);
const importPattern = /(?:from\s+|import\s*\()(["'])([^"']+)\1/g;

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function packageName(specifier) {
  if (specifier.startsWith("@")) {
    return specifier.split("/").slice(0, 2).join("/");
  }
  return specifier.split("/")[0];
}

const externalImports = new Set();
const missing = new Set();

for (const filePath of walk("src")) {
  if (!/\.(?:js|jsx)$/.test(filePath)) continue;
  const source = fs.readFileSync(filePath, "utf8");

  for (const match of source.matchAll(importPattern)) {
    const specifier = match[2];
    if (specifier.startsWith(".") || specifier.startsWith("/")) continue;
    if (builtins.has(specifier)) continue;

    const dependency = packageName(specifier);
    externalImports.add(dependency);
    if (!declared.has(dependency)) missing.add(dependency);
  }
}

if (missing.size > 0) {
  console.error("Undeclared runtime dependencies:");
  [...missing].sort().forEach((name) => console.error(`- ${name}`));
  process.exit(1);
}

console.log(
  `Dependencies OK: ${externalImports.size} external runtime packages are declared.`,
);
