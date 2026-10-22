'use strict';
// Read-only local inventory for release readiness. No deployment or network access.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const siteRoot=path.join(root,'sites');
const results=[];
if(fs.existsSync(siteRoot)){
 for(const ent of fs.readdirSync(siteRoot,{withFileTypes:true}).filter(e=>e.isDirectory())){
  const dir=path.join(siteRoot,ent.name);
  const files=fs.readdirSync(dir);
  const html=files.filter(x=>/\.html?$/i.test(x));
  const index=path.join(dir,'index.html');
  let text=fs.existsSync(index)?fs.readFileSync(index,'utf8'):'';
  results.push({id:ent.name,hasHomepage:!!text,htmlPages:html.length,hasViewport:/name=["']viewport["']/i.test(text),hasTitle:/<title>[^<]+<\/title>/i.test(text),hasForm:/<form\b/i.test(text),hasPaymentCode:/stripe|checkout|payment/i.test(text),hasPrivacyPage:files.some(f=>/^privacy\.html$/i.test(f)),status:'source-inventory-only'});
 }
}
const street=[];
function walk(dir,depth=0){if(depth>3||!fs.existsSync(dir))return;for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name==='node_modules'||e.name==='.git'||e.name==='dist'||e.name==='build')continue;const p=path.join(dir,e.name);if(e.isDirectory()){if(/streetverse|game|world|city/i.test(e.name))street.push(path.relative(root,p));walk(p,depth+1)}}}
walk(root);
const report={generatedAt:new Date().toISOString(),websiteFolders:results.length,sitesWithHomepage:results.filter(r=>r.hasHomepage).length,first20CandidateFolders:results.slice(0,20).map(r=>r.id),sites:results,streetverseCandidateDirectories:[...new Set(street)].slice(0,100),note:'Static inventory only; does not prove functionality, payments, mobile compatibility, production deployment, or completed StreetVerse features.'};
console.log(JSON.stringify(report,null,2));
