import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createTransitDisplay,updateTransitDisplay,transitDisplayText} from '../src/runtime/StreetVerseTransitDisplayRuntime.ts'

for(const mode of ['car','bus','el-train','plane','airport-walkway']){
 const start=createTransitDisplay(mode)
 assert.equal(start.fictional,true)
 assert.ok(start.capacity>0)
 assert.ok(start.stops.length>=2)
 assert.equal(start.doorsOpen,true)
 let boarded=updateTransitDisplay(start,{type:'board'})
 assert.equal(boarded.occupancy,1)
 boarded=updateTransitDisplay(boarded,{type:'move',speedMps:8})
 assert.equal(boarded.doorsOpen,false,'doors close on departure')
 assert.equal(boarded.moving,true)
 assert.strictEqual(updateTransitDisplay(boarded,{type:'doors',open:true}),boarded,'doors cannot open in motion')
 assert.strictEqual(updateTransitDisplay(boarded,{type:'board'}),boarded,'no boarding while moving')
 assert.strictEqual(updateTransitDisplay(boarded,{type:'next-stop'}),boarded,'cannot advance stop while moving')
 let stopped=updateTransitDisplay(boarded,{type:'move',speedMps:0})
 stopped=updateTransitDisplay(stopped,{type:'doors',open:true})
 stopped=updateTransitDisplay(stopped,{type:'next-stop'})
 assert.equal(stopped.currentStopIndex,1)
 assert.ok(transitDisplayText(stopped).simulation.includes('NOT REAL-TIME'))
}
const full=createTransitDisplay('car')
let state=full
for(let i=0;i<9;i++)state=updateTransitDisplay(state,{type:'board'})
assert.equal(state.occupancy,6,'car displays never exceed six occupants')
const tower=readFileSync(new URL('../src/components/StreetVerseTowerConnections.tsx',import.meta.url),'utf8')
const lab=readFileSync(new URL('../src/components/StreetVerseTransportScreenLab.tsx',import.meta.url),'utf8')
assert.ok(tower.includes('<StreetVerseTransportScreenLab'),'new screens must be mounted from game')
assert.ok(lab.includes('createStreetVerseCabinDirector'),'car seat manifest must be shared')
assert.ok(lab.includes('FICTIONAL')||lab.includes('Simulated interface only'))
assert.ok(lab.includes('airport-walkway'))
console.log('StreetVerse in-vehicle displays and airport walkway simulator PASS')
