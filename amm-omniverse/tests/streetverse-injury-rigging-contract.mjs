import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const read=p=>readFileSync(resolve(root,p),'utf8')
const injury=read('src/runtime/StreetVerseCharacterInjuryRuntime.ts')
const world=read('src/components/StreetVerseMobileWorld.tsx')
const panel=read('src/components/StreetVerseTowerConnections.tsx')
const roster=read('src/runtime/StreetVersePlayableCharactersRuntime.ts')
const checks=[
 ['injury 100hp starting point',injury.includes('const START_HEALTH=100')],
 ['finite and nonnegative damage',injury.includes('!Number.isFinite(request.amount)||request.amount<=0')],
 ['defeat at zero health',injury.includes("health===0?'defeated'")],
 ['no repeated defeat hits',injury.includes("state.phase==='defeated'")],
 ['configurable blood particles',injury.includes("visuals:'minimal'")&&injury.includes("visuals==='standard'?9:3")],
 ['mobile effect cap',injury.includes('drops.length>24')],
 ['character swap resets injury',injury.includes('onCharacterSelect')&&injury.includes('currentCharacterId=id')],
 ['local demo only no authoritative damage',injury.includes('authoritative:false')],
 ['scene integration',world.includes('createStreetVerseInjuryRuntime(scene,()=>nativeHero||avatar)')],
 ['frame tick',world.includes('injuryFx.tick(now)')],
 ['world cleanup',world.includes('injuryFx.dispose()')],
 ['panel hit test',panel.includes('TEST HIT −25 HP')],
 ['panel defeat test',panel.includes('TEST DEFEAT')],
 ['panel recovery',panel.includes('RESPAWN')],
 ['selected avatar roster remains',roster.includes("id:'bj-stubbs'")]
]
for(const [name,passed] of checks)assert.ok(passed,name)
console.log('StreetVerse injury rigging source contract: '+checks.length+' PASS (local cosmetic effects, not server-authoritative multiplayer)')
