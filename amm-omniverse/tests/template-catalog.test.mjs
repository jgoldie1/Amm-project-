import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
const source=fs.readFileSync(new URL('../src/business/templateCatalog.ts',import.meta.url),'utf8')
const exports={};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021}}).outputText,{exports})
const base={name:'Test Shop',headline:'Welcome',description:'Our work',email:'owner@example.com',phone:'+1 (312) 555-0100',location:'Chicago',services:'Hair\nNails',color:'#174a39',photo:''}
test('customer content cannot introduce scripts or style injections',()=>{
 const html=exports.generateWebsite({...base,name:'<script>alert(1)</script>',color:'red;}body{display:none}',photo:'data:image/svg+xml,<svg onload=alert(1)>'})
 assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('onload='));assert.ok(!html.includes('display:none'))
})
test('generated draft preserves customer details and phone/email links',()=>{
 const html=exports.generateWebsite(base);assert.ok(html.includes('mailto:owner@example.com'));assert.ok(html.includes('tel:+13125550100'));assert.ok(html.includes('<li>Hair</li><li>Nails</li>'));assert.ok(html.includes('checkout and AI are not activated'))
})
test('catalog contains unique stable template numbers and bounded package prices',()=>{
 assert.equal(exports.TEMPLATE_CATALOG.length,10);assert.equal(new Set(exports.TEMPLATE_CATALOG.map(t=>t.id)).size,10)
 assert.equal(exports.WEBSITE_PACKAGES.find(p=>p.id==='template').price,49)
 assert.equal(exports.AI_PACKAGES.find(p=>p.id==='none').monthly,0)
})
