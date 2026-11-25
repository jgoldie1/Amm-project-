import test from 'node:test'
import assert from 'node:assert/strict'
import {build} from 'esbuild'
import {readFileSync} from 'node:fs'
const code=await build({entryPoints:['src/runtime/StreetVerseAutoBuild.ts'],bundle:true,format:'esm',write:false})
const {validateRequest,draftWorldRequest,applyWorldRequests,requestLink}=await import('data:text/javascript;base64,'+Buffer.from(code.outputFiles[0].text).toString('base64'))
test('HoloGPT request matches the committed build and previews only the named site',()=>{
 const req=draftWorldRequest('Put a bench and a lamp outside Greenville Student Union')
 assert.deepEqual(req,JSON.parse(readFileSync('src/world-requests/student-union-bench-lamp.json')))
 assert.deepEqual(JSON.parse(new URL(requestLink(req)).searchParams.get('value')),req)
 const anchor={x:18,z:2.8,front:-1},base=[{asset:'tree',position:[1,0,1],label:'existing'}]
 const placements=applyWorldRequests(base,'student-union',anchor,[req,req])
 assert.equal(placements.length,3);assert.deepEqual(placements[1].position,[10,0,-3.2]);assert.equal(base.length,1)
 assert.deepEqual(applyWorldRequests(base,'laflin',anchor,[req]),base)
 assert.throws(()=>validateRequest({site:'laflin',assets:['unknown']}))
})
