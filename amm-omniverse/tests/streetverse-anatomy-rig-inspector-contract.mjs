import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8')
const inspector=read('src/runtime/StreetVerseAnatomyRigInspector.ts')
const world=read('src/components/StreetVerseMobileWorld.tsx')
const hud=read('src/components/StreetVerseBJVitalsHUD.tsx')
const injury=read('src/runtime/StreetVerseCharacterInjuryRuntime.ts')
const bj=read('src/runtime/StreetVerseMeshyBJHeroRuntime.ts')
for(const label of ['brain','heart','lungs','liver','kidneys'])assert.ok(inspector.includes("id:'"+label+"'"),'Missing original fictional organ overlay '+label)
assert.ok(inspector.includes('THREE.SkinnedMesh')&&inspector.includes('node.skeleton?.bones'),'Real loaded rig skeleton is the source of joint markers')
assert.ok(!inspector.includes('bone.rotation.set(')&&!inspector.includes('bone.position.set('),'Inspection must never alter original GLB bones')
assert.ok(inspector.includes("requested!=='off'&&requested!=='overlay'&&requested!=='exploded'"),'Only supported non-destructive modes accepted')
assert.ok(inspector.includes('overlay.updateMatrixWorld(true)'),'World space markers require updated overlay matrix')
assert.ok(inspector.includes('rigBoneCount:bones.length'),'Inspector must report actual skeleton bone count')
assert.ok(world.includes("createStreetVerseAnatomyRigInspector(scene,()=>nativeHero||avatar)"),'Inspector must use actual active hero')
assert.ok(world.includes('anatomyInspector.tick()')&&world.includes('anatomyInspector.dispose()'),'Inspector must tick and clean up')
assert.ok(hud.includes('Rig and organ visualization mode')&&hud.includes("get('injuryLab')==='1'"),'Teardown controls must remain owner opt-in')
assert.ok(hud.includes("tryamm:streetverse-anatomy-inspect-toggle"),'HUD must control inspector')
assert.ok(injury.includes('tryamm:streetverse-organ-state')&&injury.includes('tryamm:streetverse-character-vitals'),'Recovered original anatomy must synchronize with HUD')
assert.ok(bj.includes('tryamm:streetverse-rig-reaction')&&bj.includes('injuryClipPatterns'),'BJ GLB animation mixer must observe original injury rig reactions');
assert.ok(bj.includes('if(!mixer||!clip)return'),'Missing BJ injury clips must never be simulated as loaded animations');
assert.ok(injury.includes("reaction:'idle'"),'Recovering BJ must reset the rig to idle');
assert.ok(inspector.includes('tryamm:streetverse-organ-state'),'Organs must react to the original fictional state');
console.log('StreetVerse original BJ organ + reversible skeleton teardown inspection contracts PASS')
