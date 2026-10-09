import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require=createRequire(import.meta.url);
let ts;
try { ts=require("typescript"); } catch { ts=require("/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js"); }
const roots=["src","tests"];
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(/\.(jsx?|mjs)$/.test(entry.name))files.push(full)}}
for(const root of roots){if(fs.existsSync(root))walk(root)}
let failed=false;
for(const file of files){const text=fs.readFileSync(file,"utf8");const kind=file.endsWith(".jsx")?ts.ScriptKind.JSX:ts.ScriptKind.JS;const sf=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,kind);for(const diag of sf.parseDiagnostics){failed=true;const pos=sf.getLineAndCharacterOfPosition(diag.start??0);console.error(`${file}:${pos.line+1}:${pos.character+1} ${ts.flattenDiagnosticMessageText(diag.messageText," ")}`)}}
if(failed)process.exit(1);
console.log(`Syntax OK: ${files.length} JS/JSX files parsed.`);
