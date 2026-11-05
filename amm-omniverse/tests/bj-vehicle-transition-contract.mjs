import fs from 'node:fs'
import assert from 'node:assert/strict'

const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const check=(ok,description)=>assert.ok(ok,'BJ VEHICLE TRANSITION: '+description)

check(runtime.includes("playVehicleTransition:(phase:'enter'|'exit')=>boolean"),'runtime handle must expose the vehicle animation action')
check(runtime.includes("const playVehicleTransition=(phase:'enter'|'exit'):boolean=>"),'runtime must implement vehicle transitions')
check(runtime.includes("/enter.?car/i")&&runtime.includes("/exit.?car/i"),'should resolve optional authored GLB entry and exit clips')
check(runtime.includes("if(!mixer||!clip)return false"),'missing clips must leave existing world vehicle fallback working')
check(runtime.includes("action.setLoop(THREE.LoopOnce,1)"),'vehicle transition clips should play once')
check(runtime.includes("gestureUntil=performance.now()+Math.max(0,clip.duration)*1000+120"),'locomotion should resume after vehicle animation')
check(runtime.includes("'tryamm:bj-vehicle-animation'"),'runtime must report successfully selected authored clip')
check(runtime.includes("      playVehicleTransition,\n      tick,"),'loaded BJ handle must expose the transition method')
check(world.includes("activeCar=car;bjMeshyHero?.playVehicleTransition('enter')"),'enter interaction must request BJ animation')
check(world.includes("activeCar=null;bjMeshyHero?.playVehicleTransition('exit')"),'exit interaction must request BJ animation')
check(runtime.includes("state.seated?'sit':state.running?'run'"),'finished entry animation should resolve to seated')
console.log('BJ VEHICLE TRANSITION CONTRACT PASS: enter/exit request optional GLB clips and retain fallback')
