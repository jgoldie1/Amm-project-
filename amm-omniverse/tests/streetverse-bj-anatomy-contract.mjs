import fs from 'node:fs'
import assert from 'node:assert/strict'
const anatomy=fs.readFileSync(new URL('../src/runtime/StreetVerseBJAnatomyRuntime.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
for(const organ of ['heart','left-lung','right-lung','liver','stomach','left-kidney','right-kidney']){
  assert.ok(anatomy.includes("name:'"+organ+"'"),'Missing BJ anatomy organ: '+organ)
}
assert.match(anatomy,/root\.visible=false/,'Internal organs must remain hidden during ordinary gameplay')
assert.match(anatomy,/setCondition:condition=>/,'Anatomy must support explicit condition updates')
assert.match(anatomy,/dispose:\(\)=>/,'Anatomy must dispose meshes and materials')
assert.match(world,/installStreetVerseBJAnatomy\(nativeHero\)/,'Mobile BJ hero must receive the anatomy overlay')
assert.match(world,/!nativeHero\.getObjectByName\('bj-anatomy-overlay'\)/,'Repeated frames must not duplicate organs')
assert.match(anatomy,/setExploded:enabled=>/,'Tear-apart must be reversible')
assert.match(anatomy,/setXRay:enabled=>/,'X-ray must be reversible')
assert.match(anatomy,/tick:elapsedSeconds=>/,'Organs must animate on the game clock')
assert.match(anatomy,/organ\.mesh\.position\.lerp\(target,\.16\)/,'Exploded organs must interpolate rather than teleport')
assert.match(anatomy,/root\.userData\.condition=condition/,'Injury state must remain inspectable')
assert.match(world,/tryamm:streetverse-bj-anatomy-mode/,'World must expose anatomy-mode control event')
assert.match(world,/bjAnatomy\?\.tick\(now\*\.001\)/,'World animation must tick the anatomy')
assert.match(world,/bjAnatomy\?\.dispose\(\)/,'World must release anatomy when unmounted')
assert.match(world,/nativeHero!==anatomyHero/,'Avatar replacement must rebind anatomy to the new hero')
console.log('BJ fictional anatomy overlay contract PASS')
