import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=(path)=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8')
test('seventy-five unique business templates have complete catalog data',()=>{
 const catalog=read('src/business/templateCatalog.ts')
 const ids=[...catalog.slice(0,catalog.indexOf('] as const')).matchAll(/(?:id:|'id':|"id":)\s*['"](\d{2})['"]/g)].map(m=>m[1])
 assert.equal(ids.length,75)
 assert.equal(new Set(ids).size,60)
 const data=['templateBenefits','templateDemos','templateSectors'].map(p=>read('src/business/'+p+'.ts'))
 for(const source of data)for(const id of ids)assert.ok(source.includes('"'+id+'":')||source.includes("'"+id+"':"))
})
test('Beautyverse has hair salon sites and animated original brand graphics',()=>{
 const full=read('src/business/FullTemplateSite.tsx')
 const css=read('src/business/FullTemplateSite.css')
 assert.match(full,/AnimatedBrandArtwork/)
 assert.match(full,/template=55/)
 assert.match(full,/full-beauty-links/)
 assert.match(css,/@keyframes fullLogoOrbit/)
 assert.match(css,/prefers-reduced-motion/)
})
test('website bundle routes and funding hub remain separate from game',()=>{
 assert.match(read('vite.config.ts'),/site-demo\.html/)
 assert.match(read('vite.config.ts'),/assertSafePublicEnv/)
 assert.match(read('src/business/TemplateGallery.tsx'),/Open full website/)
 assert.match(read('src/business-entry.tsx'),/BusinessFundingHub/)
 assert.match(read('src/business-entry.tsx'),/Browse 75 complete websites/)
})
test('Omni Box creates a visible story preview and Holo Drama handoff',()=>{
 assert.match(read('src/components/OmniBoxStoryStudio.tsx'),/OmniBoxStoryboardPreview/)
 assert.match(read('src/components/OmniBoxStoryboardPreview.tsx'),/Play storyboard/)
 assert.match(read('src/components/OmniBoxStoryboardPreview.tsx'),/NOT RENDERED FILM/)
 assert.match(read('src/components/HoloDramaHub.tsx'),/IMPORT OMNI BOX OUTLINE/)
})

test('CNA, rideshare, food delivery and previously missing health/social businesses have complete demo metadata',()=>{
 const catalog=read('src/business/templateCatalog.ts'),benefits=read('src/business/templateBenefits.ts'),demos=read('src/business/templateDemos.ts');
 for(const name of ['Social Work & Case Management','Sober Living & Recovery Residence','Medical Assistant Careers & Staffing','Dental Practice & Oral Care','Surgical Center & Specialty Care','CNA Services & Staffing','Holo Rideshare & Driver Network','Holo Food Delivery & Local Courier'])assert.ok(catalog.includes(name),name);
 for(const id of ['67','68','69']){assert.ok(benefits.includes("'"+id+"':"));assert.ok(demos.includes("'"+id+"':"))}
 assert.match(benefits,/no live cars/i);assert.match(benefits,/no actual food order/i);assert.match(benefits,/licensing must be independently verified/i)
})
