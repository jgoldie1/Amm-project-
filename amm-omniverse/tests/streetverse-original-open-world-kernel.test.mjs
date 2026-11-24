import test from 'node:test'
import assert from 'node:assert/strict'
import ts from 'typescript'
import {readFileSync} from 'node:fs'
const source=readFileSync(new URL('../src/runtime/StreetVerseOriginalOpenWorldKernel.ts',import.meta.url),'utf8')
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText
const {createStreetVerseWorldKernel,STREETVERSE_KERNEL_DT}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))
test('60Hz kernel controls state transitions and brake before exit',()=>{
 const k=createStreetVerseWorldKernel()
 assert.equal(k.snapshot().mode,'on-foot')
 k.step({enter:true});assert.equal(k.snapshot().mode,'parked')
 for(let i=0;i<180;i++)k.step({throttle:1,steer:.2})
 assert.equal(k.snapshot().mode,'driving')
 assert.ok(k.snapshot().speedMps>0)
 assert.equal(k.step({exit:true}).mode,'driving','cannot leave moving vehicle')
 for(let i=0;i<180;i++)k.step({brake:1})
 assert.equal(k.snapshot().speedMps,0)
 assert.equal(k.step({exit:true}).mode,'on-foot')
 assert.ok(k.snapshot().distanceMeters>0)
 assert.ok(Math.abs(k.snapshot().timeSeconds-k.snapshot().tick*STREETVERSE_KERNEL_DT)<1e-10)
})
test('mission finish is on foot, exact once, cannot duplicate reward',()=>{
 const k=createStreetVerseWorldKernel()
 assert.equal(k.finishMission(),false)
 assert.equal(k.startMission(),true)
 assert.equal(k.startMission(),false)
 k.step({enter:true})
 assert.equal(k.finishMission(),false)
 k.step({exit:true})
 assert.equal(k.finishMission(),true)
 assert.equal(k.finishMission(),false)
 assert.equal(k.snapshot().missionRewards,1)
 assert.equal(k.eventHistory().filter(e=>e.type==='mission-finish').length,1)
})
test('invalid controls are clamped without NaN or infinite world positions',()=>{
 const k=createStreetVerseWorldKernel()
 k.step({enter:true})
 for(let i=0;i<300;i++)k.step({throttle:Number.POSITIVE_INFINITY,brake:NaN,steer:200})
 const s=k.snapshot()
 assert.ok(Number.isFinite(s.x)&&Number.isFinite(s.z))
 assert.ok(s.speedMps>=0&&s.speedMps<=22)
})
test('actual 3D renderer retains visual asset placement bridge, separate from simulation kernel',()=>{
 const world=readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
 const forge=readFileSync(new URL('../src/runtime/StreetVerseVisibleForgeBridge.ts',import.meta.url),'utf8')
 assert.match(world,/installStreetVerseVisibleForgeBridge/)
 assert.match(forge,/worldBuilderPlaced:true/)
 assert.match(forge,/tryamm:streetverse-forge-placement-result/)
})
