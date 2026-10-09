import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { messageLabels } from "../src/i18n/labelCatalog.js";

const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultOutput = path.resolve(frontend, "../docs/cms/prosperya-labels.json");

/** Static export only: the public site never registers or writes CMS translations. */
export function buildLabelCatalog(root = path.join(frontend, "src")) {
  const catalog = new Map(messageLabels().map((entry) => [entry.key, entry]));
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (/\.(jsx|copy\.js)$/.test(entry.name)) files.push(file);
    }
  }
  walk(root);
  for (const file of files.sort()) {
    const source = fs.readFileSync(file, "utf8");
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true,
      file.endsWith(".jsx") ? ts.ScriptKind.JSX : ts.ScriptKind.JS);
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.getText(tree) === "t"
        && ts.isStringLiteral(node.arguments[0])) {
        const original = node.arguments[0].text;
        const key = original.startsWith("prosperya.") ? original : `prosperya.${original}`;
        const fallback = node.arguments[1];
        if (!fallback) {
          if (!catalog.has(key)) throw new Error(`Missing source fallback: ${key} in ${file}`);
        } else {
          if (!ts.isObjectLiteralExpression(fallback)) throw new Error(`Fallback must be literal: ${key}`);
          const values = {};
          for (const property of fallback.properties) {
            if (!ts.isPropertyAssignment(property) || !ts.isStringLiteral(property.initializer)) continue;
            values[property.name.getText(tree).replace(/^['"]|['"]$/g, "")] = property.initializer.text;
          }
          if (typeof values.en !== "string" || typeof values.fr !== "string") {
            throw new Error(`Both EN and FR source text are required: ${key}`);
          }
          const entry = { key, group: /(?:pages|sections)[/\\]/.test(file) ? "pages" : "ui",
            source: values.en, translations: values };
          const existing = catalog.get(key);
          if (existing && JSON.stringify(existing.translations) !== JSON.stringify(values)) {
            throw new Error(`Conflicting source text: ${key}`);
          }
          if (key.length > 255 || Object.values(values).some(value => value.length > 2000)) {
            throw new Error(`Label exceeds CMS limits: ${key}`);
          }
          catalog.set(key, entry);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(tree);
  }
  return [...catalog.values()].sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = process.argv[2] ? path.resolve(process.argv[2]) : defaultOutput;
  const labels = buildLabelCatalog();
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(labels, null, 2)}\n`);
  console.log(`Exported ${labels.length} labels to ${output}`);
}
