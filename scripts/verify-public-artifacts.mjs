import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve('frontend/dist');
const forbidden=[/mongodb(?:\+srv)?:\/\//i,/WEBSITE_KEY/,/site-fixture-key/,/X-Api-Key/i];
async function scan(path){for(const entry of await readdir(path,{withFileTypes:true})){const file=resolve(path,entry.name);if(entry.isDirectory()){await scan(file);continue;}const body=await readFile(file,'utf8');if(forbidden.some(pattern=>pattern.test(body)))throw new Error('Server-only configuration in public asset: '+entry.name);}}
await scan(root);console.log('Public assets contain no server credentials or fixture secrets.');
