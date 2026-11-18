import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
const code=fs.readFileSync(path.resolve('src/runtime/StreetVerseVehicleDynamics.ts'),'utf8')
const js=ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText
const {newVehicle,stepVehicle,fixedStepVehicle,collisionStop,VEHICLE_CONFIG}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))
const input=(throttle=0,brake=0,steer=0)=>({throttle,brake,steer})
let car=newVehicle('car'),motorbike=newVehicle('motorcycle')
const advance=(state,controls,seconds=3,surface='dry',assist=false)=>{
 let x=state;for(let t=0;t<seconds*60;t++)x=stepVehicle(x,controls,1/60,surface,assist);return x
}
const carMove=advance(car,input(1,0,0))
assert.ok(carMove.x>0&&carMove.speed>5,'car should accelerate forward')
const bikeMove=advance(motorbike,input(1,0,0))
assert.ok(bikeMove.x>0&&bikeMove.speed>5,'motorcycle should accelerate forward')
assert.notEqual(carMove.speed,bikeMove.speed,'vehicle types use distinct physics configs')
assert.equal(advance(newVehicle('motorcycle'),input(-1,0,0)).speed,0,'motorcycle should not reverse as a car')
assert.ok(advance(newVehicle('car'),input(-1,0,0)).speed<0,'car reverse gear should work')
assert.ok(advance(carMove,input(0,1,0)).speed<carMove.speed,'brake should slow the car')
assert.ok(advance(bikeMove,input(0,1,0)).speed<bikeMove.speed,'brake should slow bike')
let corner=advance(newVehicle('motorcycle'),input(1,0,.7),3)
assert.ok(Math.abs(corner.lean)>.05&&Math.abs(corner.lean)<=VEHICLE_CONFIG.motorcycle.maxLean,'motorcycle should visibly lean')
const wet=advance(newVehicle('car'),input(1,0,.6),3,'wet')
const dry=advance(newVehicle('car'),input(1,0,.6),3,'dry')
assert.ok(wet.speed<dry.speed,'wet road should reduce grip/acceleration')
const assist=advance(newVehicle('car'),input(1,0,1),5,'dry',true)
assert.ok(assist.speed<=VEHICLE_CONFIG.car.maxForward*.66+.01,'one-hand assist limits speed')
let impact=collisionStop(bikeMove)
assert.equal(impact.speed,0,'collision must stop motorcycle')
assert.ok(impact.damage>0,'collision damage should be finite and nonzero for moving vehicle')
assert.equal(fixedStepVehicle(car,input(1,0,.2),1).speed>0,true,'fixed-step drive should run')
let repeated=advance(newVehicle('car'),input(1,0,.2))
assert.deepEqual(repeated,advance(newVehicle('car'),input(1,0,.2)),'physics must be deterministic')
const world=fs.readFileSync(path.resolve('src/components/StreetVerseMobileWorld.tsx'),'utf8')
for(const part of ["makeMotorcycle=()","starterMotorcycle=makeMotorcycle()","vehicleDynamics=newVehicle","stepVehicle(vehicleDynamics","collisionStop(next)","vehicleKind==='motorcycle'","activeCar.rotation.z=isMotorcycle","oneHandDriveAssist"])
 assert.ok(world.includes(part),'missing StreetVerse live integration: '+part)
const engine=fs.readFileSync(path.resolve('src/components/StreetVerseGamepadBridge.tsx'),'utf8')
assert.ok(engine.includes('navigator.getGamepads'),'standard gamepad API must remain supported')
console.log('PASS: car/motorcycle physics, surface grip, reverse, leaning, collision, determinism, live integration, controller and accessibility')
