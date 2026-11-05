import fs from 'node:fs'
import assert from 'node:assert/strict'

const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const must=(ok,msg)=>assert.ok(ok,'BJ SEATED ANIMATION: '+msg)

must(runtime.includes("type Motion='idle'|'walk'|'run'|'sit'"),'seated motion state missing')
must(runtime.includes("sit:find(["),'sitting clip resolver missing')
must(runtime.includes("state.seated?'sit':state.running?'run'"),'seated must win over walking and running')
must(runtime.includes("animations.sit||animations.idle||null"),'seated rigs must prefer sitting then idle without using walk')
must(runtime.includes("if(motion==='sit'){activeAction?.fadeOut(.12);activeAction=null;activeMotion='sit'}"),'seated transition must stop previous walking clip when no seat-compatible clip exists')
must(runtime.includes("seatedAnimationAvailable:Boolean(animations.sit)"),'runtime diagnostics must distinguish missing seated clip')
must(runtime.includes("actualAnimationClip:activeAction?.getClip().name||null"),'runtime diagnostics must report the clip actually played')
must(world.includes("seated:Boolean(activeCar)"),'vehicle occupancy must reach BJ animation runtime')
console.log('BJ SEATED ANIMATION CONTRACT PASS: drive -> sit or idle -> on foot, with safe missing-clip behavior')
