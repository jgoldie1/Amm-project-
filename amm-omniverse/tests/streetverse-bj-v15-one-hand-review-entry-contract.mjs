import fs from 'node:fs'
import assert from 'node:assert/strict'
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const viewer=fs.readFileSync(new URL('../src/components/BJStubbsV7Viewer.tsx',import.meta.url),'utf8')
assert.ok(world.includes("(['bj-view','🎭 BJ V15 FACE / PHOTO'],")||world.includes("([['bj-view','🎭 BJ V15 FACE / PHOTO'],"),'BJ review must be the first one-hand menu action')
assert.ok(world.includes("if(target==='bj-view'){const match=new URLSearchParams(window.location.search).get('svBJModel')==='meshy'"),'BJ review must open the dedicated viewer and preserve Meshy source selection')
assert.ok(viewer.includes("name:'V15'"),'Photo review must prioritize actual V15 model')
assert.ok(viewer.includes("data-bj-render-comparison"),'Viewer must present real front and profile captures')
assert.ok(!world.includes("['bj-view','🎭 BJ V12 VIEW']"),'Menu must not advertise outdated V12')
console.log('BJ ONE-HAND FACE REVIEW ENTRY PASS: first menu item, single-WebGL viewer, V15 rendered photo comparison')
