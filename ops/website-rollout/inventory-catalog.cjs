#!/usr/bin/env node
// Generate an auditable inventory from the existing checked-in catalog.
// This never implies client ownership, live deployment, or payment activation.
const fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync('amm-omniverse/src/business/templateCatalog.ts','utf8');
const segment=source.slice(source.indexOf('export const TEMPLATE_CATALOG=['),source.indexOf('\n]',source.indexOf('export const TEMPLATE_CATALOG=['))+2);
if(!segment.startsWith('export const TEMPLATE_CATALOG=['))throw Error('Template catalog missing');
const re=/\{\s*['"]?id['"]?\s*:\s*['"](\d{2,3})['"]\s*,\s*['"]?name['"]?\s*:\s*(['"])(.*?)\2/g;
const entries=[];for(const m of segment.matchAll(re))entries.push({id:m[1],name:m[3]});
const ids=new Set(entries.map(x=>x.id));
if(entries.length!==111||ids.size!==111)throw Error('Expected 111 unique catalog templates; found '+entries.length+' records and '+ids.size+' ids');
fs.mkdirSync('ops/website-rollout/reports',{recursive:true});
const lines=['# Existing TRYAMM website template inventory','','Source: `amm-omniverse/src/business/templateCatalog.ts`.','**111 template catalog entries are source-verified. They are NOT 111 independent live websites.**','','| Catalog ID | Existing template | Website status |','|---|---|---|',...entries.map(e=>'| '+e.id+' | '+e.name.replace(/\|/g,'/')+' | Catalog demo; deployment not verified |'),''];
fs.writeFileSync('ops/website-rollout/reports/template-inventory.md',lines.join('\n'));
console.log('Verified '+entries.length+' catalog entries; inventory report generated.');
