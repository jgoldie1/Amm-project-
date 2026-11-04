import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {
 STANDARD_GRAVITY,HOLOCAD_PHYSICS_LESSONS,
 simulateHoloCADJointTorque,simulateHoloCADStaticBalance,
 simulateHoloCADCircularOrbit,simulateHoloCADEnergyBudget,
 suggestedHoloCADPhysicsExperiment
} from '../src/game/holocad/holocadPhysicsSandbox.ts'

const close=(actual,expected,tolerance=1e-4)=>assert.ok(
 Math.abs(actual-expected)<=tolerance,
 'Expected '+actual+' to be within '+tolerance+' of '+expected
)

test('robotic arm static gravity torque has correct units and zero-angle boundary',()=>{
 const load=simulateHoloCADJointTorque({
  loadMassKg:10,leverArmMeters:.5,jointAngleDegrees:90,
  angularSpeedDegreesPerSecond:90
 })
 close(load.torqueNm,10*STANDARD_GRAVITY*.5)
 close(load.angularSpeedRadPerSecond,Math.PI/2,1e-6)
 close(load.idealMechanicalPowerWatts,load.torqueNm*Math.PI/2,1e-4)
 assert.equal(load.validForRealMotorSelection,false)
 const zero=simulateHoloCADJointTorque({
  loadMassKg:10,leverArmMeters:.5,jointAngleDegrees:0,
  angularSpeedDegreesPerSecond:0
 })
 assert.equal(zero.torqueNm,0)
 assert.equal(zero.idealMechanicalPowerWatts,0)
})

test('static balance estimates support projection, not true gait stability',()=>{
 const still=simulateHoloCADStaticBalance({
  chassisMassKg:50,payloadMassKg:10,payloadOffsetMeters:.3,
  centerOfMassHeightMeters:.8,supportHalfWidthMeters:.45,leanDegrees:0
 })
 close(still.centerOfMassOffsetMeters,.05)
 close(still.signedMarginMeters,.4)
 assert.equal(still.projectionWithinSupport,true)
 assert.equal(still.verifiedRealWorldStability,false)
 const lean=simulateHoloCADStaticBalance({
  chassisMassKg:50,payloadMassKg:10,payloadOffsetMeters:.3,
  centerOfMassHeightMeters:.8,supportHalfWidthMeters:.45,leanDegrees:35
 })
 assert.equal(lean.projectionWithinSupport,false)
 assert.ok(lean.signedMarginMeters<0)
})

test('ideal 400 km circular orbit is about 7.67 km/s and 92 minutes',()=>{
 const orbit=simulateHoloCADCircularOrbit({altitudeKm:400})
 assert.ok(orbit.circularSpeedKmPerSecond>7.6&&orbit.circularSpeedKmPerSecond<7.8)
 assert.ok(orbit.orbitalPeriodMinutes>90&&orbit.orbitalPeriodMinutes<94)
 assert.equal(orbit.operationalNavigation,false)
 const high=simulateHoloCADCircularOrbit({altitudeKm:1500})
 assert.ok(high.circularSpeedKmPerSecond<orbit.circularSpeedKmPerSecond)
 assert.ok(high.orbitalPeriodMinutes>orbit.orbitalPeriodMinutes)
})

test('energy budget handles solar offset without claiming perpetual energy',()=>{
 const budget=simulateHoloCADEnergyBudget({
  batteryWattHours:500,steadyLoadWatts:90,solarInputWatts:30,conversionEfficiency:.8
 })
 close(budget.usableSolarWatts,24)
 close(budget.netBatteryDrawWatts,66)
 close(budget.idealRuntimeHours,500/66,1e-4)
 assert.equal(budget.solarMeetsSteadyLoad,false)
 assert.equal(budget.perpetualEnergyClaim,false)
 const surplus=simulateHoloCADEnergyBudget({
  batteryWattHours:500,steadyLoadWatts:90,solarInputWatts:100,conversionEfficiency:1
 })
 assert.equal(surplus.idealRuntimeHours,null,'Never report infinite duration')
 assert.equal(surplus.netBatteryDrawWatts,0)
 assert.equal(surplus.solarMeetsSteadyLoad,true)
})

test('invalid, unsafe or nonsensical input is rejected',()=>{
 assert.throws(()=>simulateHoloCADJointTorque({
  loadMassKg:-1,leverArmMeters:.5,jointAngleDegrees:20,angularSpeedDegreesPerSecond:5
 }),/mass/)
 assert.throws(()=>simulateHoloCADJointTorque({
  loadMassKg:1,leverArmMeters:999,jointAngleDegrees:20,angularSpeedDegreesPerSecond:5
 }),/arm/)
 assert.throws(()=>simulateHoloCADStaticBalance({
  chassisMassKg:20,payloadMassKg:10,payloadOffsetMeters:0,
  centerOfMassHeightMeters:0,supportHalfWidthMeters:.3,leanDegrees:0
 }),/height/)
 assert.throws(()=>simulateHoloCADCircularOrbit({altitudeKm:0}),/altitude/)
 assert.throws(()=>simulateHoloCADCircularOrbit({altitudeKm:Number.NaN}),/altitude/)
 assert.throws(()=>simulateHoloCADEnergyBudget({
  batteryWattHours:100,steadyLoadWatts:10,solarInputWatts:20,conversionEfficiency:1.5
 }),/efficiency/)
})

test('lesson routing covers aerospace, robotics and existing subjects',()=>{
 assert.deepEqual(HOLOCAD_PHYSICS_LESSONS.map(x=>x.id),[
  'joint-torque','static-balance','circular-orbit','energy-budget'
 ])
 assert.equal(suggestedHoloCADPhysicsExperiment('robotic-arm'),'joint-torque')
 assert.equal(suggestedHoloCADPhysicsExperiment('exoskeleton'),'joint-torque')
 assert.equal(suggestedHoloCADPhysicsExperiment('rover'),'static-balance')
 assert.equal(suggestedHoloCADPhysicsExperiment('spacecraft'),'circular-orbit')
 assert.equal(suggestedHoloCADPhysicsExperiment('satellite'),'circular-orbit')
 assert.equal(suggestedHoloCADPhysicsExperiment('drone'),'energy-budget')
 assert.equal(suggestedHoloCADPhysicsExperiment('human'),'static-balance')
})

test('interactive panel stays local, does not operate physical devices or impersonate certified physics',()=>{
 const viewer=fs.readFileSync(new URL('../src/components/StreetVerseHoloCADLivingSystemsLab.tsx',import.meta.url),'utf8')
 const panel=fs.readFileSync(new URL('../src/components/HoloCADPhysicsSandboxPanel.tsx',import.meta.url),'utf8')
 for(const needle of [
  "lazy(()=>import('./HoloCADPhysicsSandboxPanel'))",
  '⚙️ PHYSICS LAB',
  'showPhysics&&<Suspense',
  'selectedPart={part.label}',
 ]){
  assert.ok(viewer.includes(needle),'Physics lab missing from HoloCAD viewer: '+needle)
 }
 for(const needle of [
  'RUN PHYSICS SIMULATION','RESET PARAMETERS',
  'simulateHoloCADJointTorque','simulateHoloCADStaticBalance',
  'simulateHoloCADCircularOrbit','simulateHoloCADEnergyBudget',
  'No physical device is controlled',
  'Educational only'
 ]){
  assert.ok(panel.includes(needle),'Missing math/safety UI: '+needle)
 }
 assert.equal(panel.includes('fetch('),false,'Physics lab must not call arbitrary remote hardware endpoints')
 assert.equal(panel.includes('localStorage'),false,'Physics training should not grant or persist gameplay ownership')
})
