import test from 'node:test'
import assert from 'node:assert/strict'
import {build} from 'esbuild'
const bundle=await build({entryPoints:['src/runtime/StreetVerseLaflinTrips.ts'],bundle:true,platform:'node',format:'esm',write:false})
const api=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'))
test('signed connectors are continuous and a pedestrian or skipped checkpoint cannot complete a delivery',()=>{
 for(const side of [-1,1])for(let i=0;i<=100;i++)assert.ok(api.onTripRoad(side*(48-6*i/100),-65-8*i/100))
 assert.equal(api.advanceDelivery('ramp',48,-65,true),'ramp')
 assert.equal(api.advanceDelivery('ramp',-48,-65,false),'ramp')
})
test('one-button rail and delivery trips each finish with a confirmed local save',()=>{
 class Element{children=[];style={};append(...els){this.children.push(...els)}setAttribute(){}remove(){}}
 globalThis.document={createElement:()=>new Element()};globalThis.window=new EventTarget()
 for(const route of ['Ride the L','Drive a delivery']){
  const host=new Element(),p={x:-38,z:31};let ridingCar=false,saves=0,cam
  const trips=api.installLaflinTrips(host,{position:()=>p,vehicle:()=>ridingCar,groundVehicle:()=>ridingCar,move:(x,z)=>Object.assign(p,{x,z}),save:()=>++saves>1,rideCamera:x=>cam=x})
  const panel=host.children[0],button=label=>panel.children.find(e=>e.textContent===label&&e.onclick&&!e.hidden)
  trips.frame(0);button(route).onclick()
  if(route==='Ride the L'){
   assert.equal(p.x,-72);button('Board train').onclick()
   assert.equal(trips.frame(11000),true);assert.ok(cam>-72&&cam<72)
   trips.frame(24010);button('Exit train').onclick();assert.deepEqual(p,api.tripStops.arrival)
  }else{
   ridingCar=true
   for(const [i,key] of ['ramp','highway','exit','drop'].entries()){Object.assign(p,api.tripStops[key]);trips.frame(i*1000)}
  }
  button('Save arrival').onclick();button('Save arrival').onclick();assert.equal(saves,2)
  assert.ok(panel.children.some(e=>e.textContent?.includes('Arrival saved')))
  trips.dispose()
 }
})
