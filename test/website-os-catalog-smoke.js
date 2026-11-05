'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const url=pathToFileURL(path.resolve(__dirname,'../scripts/tryamm-generate-starter-templates.mjs')).href;
 const {verticals,render}=await import(url);
 assert.equal(verticals.length,20,'recover the original 20-template set');
 const ids=new Set(verticals.map(v=>v[0]));
 assert.equal(ids.size,20,'template IDs must be distinct');
 for(const entry of verticals){
   const html=render(entry);
   assert.match(html,/No visitor information is collected/);
   assert.match(html,/No live booking or payments enabled/);
   assert.ok(!/sk_live_|service_role|whsec_/.test(html),'No production credentials may leak');
 }
 console.log('Website OS original starter integration: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
