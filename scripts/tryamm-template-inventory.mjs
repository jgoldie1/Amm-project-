#!/usr/bin/env node
// TRYAMM Website OS: read-only local catalog inventory.
// Run: node scripts/tryamm-template-inventory.mjs
// Does not scrape websites, mutate files, or claim an audited count.
import fs from 'node:fs';
import path from 'node:path';
const roots=['templates','public/templates','src/templates','amm-omniverse/src/templates','amm-omniverse/public/templates','website-templates'];
const allowed=new Set(['.html','.htm','.tsx','.jsx','.json','.vue','.svelte']);
const exclude=new Set(['node_modules','.git','dist','build','.next','.vercel','coverage']);
const files=[];
function walk(dir){if(!fs.existsSync(dir))return;for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(exclude.has(ent.name))continue;const full=path.join(dir,ent.name);if(ent.isDirectory())walk(full);else if(allowed.has(path.extname(ent.name).toLowerCase()))files.push(full.replaceAll(path.sep,'/'));}}
for(const root of roots)walk(root);
const unique=[...new Set(files)].sort();
const byRoot=Object.fromEntries(roots.map(root=>[root,unique.filter(f=>f===root||f.startsWith(root+'/')).length]));
const report={generatedAt:new Date().toISOString(),scope:'KNOWN CANDIDATE TEMPLATE DIRECTORIES ONLY',candidateFileCount:unique.length,verifiedDistinctTemplates:null,liveSites:null,customers:null,byRoot,files:unique,warning:'A file is not necessarily a complete template; dynamic registries, other repos, duplicates and hosted sites may be missing. Do not market this number as verified templates.'};
process.stdout.write(JSON.stringify(report,null,2)+'\n');
