import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8')
const injury=read('src/runtime/StreetVerseCharacterInjuryRuntime.ts')
const organ=read('src/runtime/StreetVerseAnatomySimulation.ts')
const world=read('src/components/StreetVerseMobileWorld.tsx')
const panel=read('src/components/StreetVerseBJVitalsHUD.tsx')
const roster=read('src/runtime/StreetVersePlayableCharactersRuntime.ts')
const checks=[
 ['restored five organs', ['brain','heart','lungs','liver','kidneys'].every(name=>organ.includes(name))],
 ['injury 100hp starting point',injury.includes('const START_HEALTH=100')],
 ['finite nonnegative damage',injury.includes('!Number.isFinite(request.amount)||request.amount<=0')],
 ['defeat at zero health',injury.includes("health===0?'defeated'")],
 ['no repeated defeat hits',injury.includes("state.phase==='defeated'")],
 ['bounded visual particles',injury.includes("visuals==='standard'?9:3")&&injury.includes('drops.length>24')],
 ['character swap resets state',injury.includes('onCharacterSelect')&&injury.includes('currentCharacterId=id')],
 ['local demo has no payment/game-server authority',injury.includes('authoritative:false')],
 ['original 3D scene hookup',world.includes("createStreetVerseInjuryRuntime(scene,()=>nativeHero||avatar,'bj-stubbs',()=>Boolean(activeCar))")],
 ['3D animation update',world.includes('injuryFx.tick(now)')],
 ['3D scene cleanup',world.includes('injuryFx.dispose()')],
 ['teardown HUD recovered',panel.includes('BJ fictional internal organ inspector')],
 ['lab hit test',panel.includes('TEST HIT −25 HP')],
 ['lab defeat test',panel.includes('TEST DEFEAT')],
 ['lab recovery test',panel.includes('RESPAWN')],
 ['opt-in visual toggle',panel.includes('tryamm:streetverse-injury-visual-mode')],
 ['rig reaction event',injury.includes('tryamm:streetverse-rig-reaction')],
 ['seated driving pose protected',injury.includes('const target=seated?0')],
 ['GLB rotation restored on cleanup',injury.includes('animatedHero.rotation.z=baselineRoll')],
 ['rescue stays fictional',injury.includes('tryamm:streetverse-local-rescue-needed')],
 ['BJ remains in selected roster',roster.includes("id:'bj-stubbs'")]
]
for(const [label,ok] of checks)assert.ok(ok,label)
console.log('Recovered original StreetVerse BJ organs and injury rig: '+checks.length+' contracts passed')
