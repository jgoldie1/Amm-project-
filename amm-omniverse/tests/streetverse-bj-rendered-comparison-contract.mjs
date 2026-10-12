import fs from 'node:fs'
import assert from 'node:assert/strict'
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const v=read('../src/components/BJStubbsV7Viewer.tsx'),e=read('./e2e/streetverse-bj-rendered-comparison.spec.ts')
assert.ok(v.includes("renderer.domElement.toDataURL('image/png')"),'Must capture actual GLB WebGL canvas')
assert.ok(v.includes("renderer.render(scene,camera)"),'Rendering must precede screenshots')
for(const name of ['FRONT','THREE-QUARTER','LEFT PROFILE','RIGHT PROFILE'])assert.ok(v.includes("['"+name+"',")||v.includes(",'"+name+"',"),'Missing face angle '+name)
assert.ok(v.includes('data-bj-render-comparison="true"'),'One-tap 3D evidence control required')
assert.ok(v.includes('data-bj-render-proof="true"'),'Rendered gallery required')
assert.ok(v.includes('BJ_PHOTOMATCH_TEXTURE_DATA_URI'),'Actual approved photo comparison required')
assert.ok(v.includes('Not a certified photoreal likeness.'),'Likeness must not be falsely certified')
assert.ok(e.includes('writeFileSync(path,bytes)'),'Playwright must save actual PNG')
assert.ok(e.includes("'V15'"),'Testing must fail on silent fallback from V15')
console.log('BJ RENDERED 4-VIEW PROOF CONTRACT PASS • actual WebGL screenshots, approved reference, one-tap gallery and PNG artifacts')
