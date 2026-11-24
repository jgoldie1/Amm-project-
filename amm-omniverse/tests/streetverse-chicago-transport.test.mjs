import test from 'node:test'
import assert from 'node:assert/strict'
import {build} from 'esbuild'
import {Group} from 'three'
const {outputFiles}=await build({entryPoints:['src/runtime/StreetVerseChicagoTransport.ts'],bundle:true,platform:'node',format:'esm',write:false})
const {addChicagoTransport}=await import('data:text/javascript;base64,'+Buffer.from(outputFiles[0].text).toString('base64'))
test('train dwells on its track and traffic stays on opposite sides of the median',()=>{
 const city=new Group(),transport=addChicagoTransport(city)
 const train=city.getObjectByName('elevated-train'),cars=city.getObjectsByProperty('name','expressway-traffic')
 transport.update(1000);const xs=cars.map(c=>c.position.x);assert.equal(train.position.x,-72)
 transport.update(3000);assert.equal(train.position.x,-72)
 assert.ok(cars[0].position.x<xs[0] && cars[1].position.x>xs[1])
 assert.ok(cars[0].position.z < -76 && cars[1].position.z > -76)
 transport.update(25000);assert.equal(train.position.x,72)
 transport.update(49000);assert.equal(train.position.x,-72)
 transport.dispose();assert.equal(city.children.length,0)
})
