import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const read = path=>fs.readFileSync(new URL(path,import.meta.url),'utf8')
const app=read('../src/App.tsx'),home=read('../src/components/TryAMMHome.tsx'),
  hub=read('../src/components/HoloServicesHub.tsx'),drone=read('../src/components/ElectricDroneFleetCenter.tsx'),
  chicago=read('../src/components/ChicagoHoloJourneyStatus.tsx'),
  service=read('../src/services/holoServices.ts')
test('all HoloServices travel and freight routes point to existing hub',()=>{
 for(const route of ['/holo-services','/holo-ride','/holo-delivery','/holo-logistics','/holo-drone']){
  assert.ok(app.includes(route),route)
  if(route!=='/holo-services')assert.ok(home.includes(route),route)
 }
})
test('safe drone pilot reuses existing network planner, explicitly not live flight',()=>{
 assert.match(hub,/ElectricDroneFleetCenter initialTab="drone"/)
 assert.match(drone,/DRONE_SWARM_FLOW/)
 assert.match(drone,/providerConfirmed:false/)
 assert.match(hub,/No real flight, delivery, flight authorization or operator assignment is active/)
 assert.match(hub,/Licensed pilot\/provider/)
})
test('existing ride delivery freight calls remain simulation tagged',()=>{
 for(const token of ['requestHoloRide','createHoloDelivery','createLogisticsJob'])assert.ok(hub.includes(token))
 const matches=[...service.matchAll(/simulation:true/g)]
 assert.ok(matches.length>=3)
 for(const route of ['/holo-ride','/holo-delivery','/holo-logistics','/holo-drone'])assert.ok(chicago.includes(route),route)
})
