import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
const source=fs.readFileSync(new URL('../src/business/templateCatalog.ts',import.meta.url),'utf8')
const accessible={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/business/accessibleWebsite.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021}}).outputText,{exports:accessible})
const exports={};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021}}).outputText,{exports,require:name=>{assert.equal(name,'./accessibleWebsite');return accessible}})
const base={name:'Test Shop',headline:'Welcome',description:'Our work',email:'owner@example.com',phone:'+1 (312) 555-0100',location:'Chicago',services:'Hair\nNails',color:'#174a39',photo:''}
test('customer content cannot introduce scripts or style injections',()=>{
 const html=exports.generateWebsite({...base,name:'<script>alert(1)</script>',color:'red;}body{display:none}',photo:'data:image/svg+xml,<svg onload=alert(1)>'})
 assert.ok(!html.includes('<script>alert(1)</script>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('onload='));assert.ok(!html.includes('display:none'))
})
test('generated draft preserves customer details and phone/email links',()=>{
 const html=exports.generateWebsite(base);assert.ok(html.includes('mailto:owner@example.com'));assert.ok(html.includes('tel:+13125550100'));assert.ok(html.includes('<li>Hair</li><li>Nails</li>'));assert.ok(html.includes('checkout and AI are not activated'))
})
test('catalog contains unique stable template numbers and bounded package prices',()=>{
 assert.equal(exports.TEMPLATE_CATALOG.length,54);assert.equal(new Set(exports.TEMPLATE_CATALOG.map(t=>t.id)).size,54)
 assert.equal(exports.WEBSITE_PACKAGES.find(p=>p.id==='template').price,49)
 assert.equal(exports.AI_PACKAGES.find(p=>p.id==='none').monthly,0)
})

test('Arabic uses RTL and translated labels with accessible controls',()=>{
 const html=exports.generateWebsite({...base,language:'ar'})
 assert.ok(html.includes('lang="ar" dir="rtl"'));assert.ok(html.includes('خدماتنا'));assert.ok(html.includes('href="#content"'));assert.ok(html.includes('data-access="large"'));assert.ok(html.includes('prefers-reduced-motion'));assert.ok(html.includes('speechSynthesis'))
})
test('invalid and inherited language keys fall back safely',()=>{
 for(const language of ['toString','__proto__','<script>'])assert.ok(exports.generateWebsite({...base,language}).includes('lang="en" dir="ltr"'))
})

test('all 54 starter templates have demos, benefits and a sector without losing the original 16',()=>{
 const modules=[
  ['templateBenefits.ts','TEMPLATE_BENEFITS'],
  ['templateDemos.ts','TEMPLATE_DEMOS'],
  ['templateSectors.ts','TEMPLATE_SECTORS'],
 ].map(([name,key])=>{
  const o={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/business/'+name,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021}}).outputText,{exports:o})
  return o[key]
 })
 const [benefits,demos,sectors]=modules
 assert.equal(Object.keys(benefits).length,54)
 assert.equal(Object.keys(demos).length,54)
 assert.equal(Object.keys(sectors).length,54)
 assert.equal(new Set(Object.values(sectors)).size,10)
 for(const entry of exports.TEMPLATE_CATALOG){
  const id=entry.id
  assert.ok(sectors[id],id+' sector is required')
  assert.ok(benefits[id]?.description?.length>=20,id+' description')
  assert.ok(benefits[id]?.bestFor?.length>=20,id+' intended audience')
  assert.ok(benefits[id]?.benefit?.length>=20,id+' business value')
  assert.ok(benefits[id]?.includes?.length>=20,id+' demo boundary')
  assert.ok(['shop','booking','inquiry'].includes(demos[id]?.type),id+' demo type')
  assert.equal(demos[id].items.length,3,id+' demo examples')
  assert.ok(demos[id].items.every(([name,price])=>typeof name==='string'&&Number.isFinite(price)&&price>=0),id+' safe price')
 }
})
