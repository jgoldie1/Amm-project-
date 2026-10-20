import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
const moduleSource=fs.readFileSync(new URL('../src/runtime/BJPortraitBackdropMask.ts',import.meta.url),'utf8')
const output=ts.transpileModule(moduleSource,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}})
assert.equal(output.diagnostics?.length||0,0,'Backdrop utility must compile')
const imported=await import('data:text/javascript;base64,'+Buffer.from(output.outputText).toString('base64'))
const erase=imported.suppressBJPortraitBackdrop
const width=32,height=32,rgba=new Uint8ClampedArray(width*height*4)
for(let i=0;i<width*height;i++)rgba.set([205,211,218,255],i*4)
const paint=(x,y,color)=>rgba.set(color,(y*width+x)*4)
for(let y=10;y<=21;y++)for(let x=10;x<=21;x++)paint(x,y,[115,69,49,255]) // real face colored core
for(let y=18;y<=25;y++)for(let x=13;x<=18;x++)paint(x,y,[151,146,141,255]) // gray beard
for(let y=0;y<=7;y++)paint(6,y,[22,20,19,255]) // dark loc against the photo border
const removed=erase(rgba,width,height)
assert.ok(removed>0&&removed<width*height,'Remove connected pale backdrop but not portrait')
assert.equal(rgba[(0*width+0)*4+3],0,'Bright exterior should be transparent')
assert.equal(rgba[(14*width+14)*4+3],255,'Brown skin must not be erased')
assert.equal(rgba[(23*width+15)*4+3],255,'Gray beard must not be erased')
assert.equal(rgba[(4*width+6)*4+3],255,'Dark locs at top should remain')
assert.equal(erase(new Uint8ClampedArray(0),width,height),0,'Malformed image data should be ignored')
const photo=fs.readFileSync(new URL('../src/runtime/StreetVerseBJPhotoMatchRuntime.ts',import.meta.url),'utf8')
assert.ok(photo.includes('suppressBJPortraitBackdrop(d,256,256)'),'Real BJ photo layer must call border remover before rendering')
console.log('BJ PORTRAIT BACKDROP MASK PASS: attached sky border removed, gray beard and dark locs retained, no network dependency')
