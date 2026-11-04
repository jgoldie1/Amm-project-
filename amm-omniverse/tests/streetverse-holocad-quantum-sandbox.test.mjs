import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {
 HOLOCAD_QUANTUM_LESSONS,simulateHoloCADQuantumCircuit,suggestedHoloCADQuantumLesson
} from '../src/game/holocad/holocadQuantumSandbox.ts'

const src=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const deterministic=()=>0.12

test('Hadamard superposition returns 50/50 probability with bounded shots',()=>{
 const v=simulateHoloCADQuantumCircuit({qubits:1,gates:[{type:'H',target:0}],shots:256},deterministic)
 assert.equal(v.backend,'classical-statevector-simulator')
 assert.equal(v.physicalQuantumHardware,false)
 assert.equal(v.realQuantumProviderConnected,false)
 assert.deepEqual(v.results.map(x=>x.state),['0','1'])
 assert.deepEqual(v.results.map(x=>x.probability),[.5,.5])
 assert.equal(v.results.reduce((n,x)=>n+x.counts,0),256)
})
test('entangled Bell classroom circuit only produces 00/11',()=>{
 const v=simulateHoloCADQuantumCircuit({qubits:2,gates:[
  {type:'H',target:0},{type:'CX',control:0,target:1}
 ],shots:128},deterministic)
 assert.deepEqual(v.results.map(x=>x.probability),[.5,0,0,.5])
 assert.equal(v.results[1].counts+v.results[2].counts,0)
 assert.equal(v.results.reduce((n,x)=>n+x.counts,0),128)
})
test('interference and phase gates alter probability, without physical device claims',()=>{
 const inverted=simulateHoloCADQuantumCircuit({qubits:1,gates:[
  {type:'H',target:0},{type:'Z',target:0},{type:'H',target:0}
 ],shots:20},deterministic)
 assert.deepEqual(inverted.results.map(x=>x.probability),[0,1])
 const phase=simulateHoloCADQuantumCircuit({qubits:1,gates:[
  {type:'H',target:0},{type:'T',target:0},{type:'H',target:0}
 ],shots:50},deterministic)
 assert.ok(Math.abs(phase.results[0].probability-.853553390593)<1e-10)
 assert.ok(Math.abs(phase.results[1].probability-.146446609407)<1e-10)
 const s=simulateHoloCADQuantumCircuit({qubits:1,gates:[{type:'X',target:0},{type:'S',target:0}],shots:16},deterministic)
 assert.equal(s.results[1].probability,1)
})
test('enforce limits, shot costs, control safety and rng range',()=>{
 assert.throws(()=>simulateHoloCADQuantumCircuit({qubits:5,gates:[],shots:8}),/qubits/)
 assert.throws(()=>simulateHoloCADQuantumCircuit({qubits:1,gates:[],shots:0}),/shots/)
 assert.throws(()=>simulateHoloCADQuantumCircuit({qubits:1,gates:[],shots:2049}),/shots/)
 assert.throws(()=>simulateHoloCADQuantumCircuit({qubits:1,gates:[{type:'CX',target:0,control:0}],shots:8}),/control/)
 assert.throws(()=>simulateHoloCADQuantumCircuit({qubits:2,gates:[{type:'X',target:3}],shots:8}),/target/)
 assert.throws(()=>simulateHoloCADQuantumCircuit({qubits:1,gates:[{type:'Q',target:0}],shots:8}),/gate/)
 assert.throws(()=>simulateHoloCADQuantumCircuit({qubits:1,gates:[],shots:8},()=>1),/sample/)
})
test('four selectable lessons and engineering subjects use local simulation only',()=>{
 assert.deepEqual(HOLOCAD_QUANTUM_LESSONS.map(l=>l.id),
  ['superposition','bell','interference','phase'])
 assert.equal(suggestedHoloCADQuantumLesson('spacecraft'),'bell')
 assert.equal(suggestedHoloCADQuantumLesson('robotic-arm'),'superposition')
 assert.equal(suggestedHoloCADQuantumLesson('building'),'interference')
 const panel=src('../src/components/HoloCADQuantumSandboxPanel.tsx')
 const view=src('../src/components/StreetVerseHoloCADLivingSystemsLab.tsx')
 for(const needle of ['RUN LOCAL SIMULATION','QUANTUM SANDBOX','simulateHoloCADQuantumCircuit',
   'does not send API requests','NO REAL QUANTUM HARDWARE']){
  assert.ok((panel+'\n'+view).includes(needle),'Missing safeguard or UI '+needle)
 }
 for(const needle of ['lazy(()=>import','showQuantum&&<Suspense','affectedParts={diagnostic.affectedParts}']){
  assert.ok(view.includes(needle),'Quantum Sandbox must be loaded lazily and read only the diagnosis '+needle)
 }
 assert.equal(panel.includes('fetch('),false,'Browser quantum sandbox must not call unprotected server directly')
 assert.equal(panel.includes('localStorage'),false,'No persistent health or game equipment stored')
})
