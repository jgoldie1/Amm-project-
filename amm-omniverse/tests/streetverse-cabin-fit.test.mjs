import assert from 'node:assert/strict'
import {checkSixSeatCabinFit,DEFAULT_SEATED_AVATAR} from '../src/runtime/StreetVerseCabinFitRuntime.ts'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'

const anchors=[
 {x:-.43,y:.77,z:.48},{x:-.43,y:.77,z:-.48},
 {x:-1.30,y:.79,z:.47},{x:-1.30,y:.79,z:0},
 {x:-1.30,y:.79,z:-.47},{x:-2.12,y:.81,z:0}
]
const occupied=[]
for (const anchor of anchors){
 const fit=checkSixSeatCabinFit(anchor,DEFAULT_SEATED_AVATAR,occupied)
 assert.equal(fit.fits,true,'all six default-seated avatars should fit: '+fit.reason)
 occupied.push({anchor,size:fit.size})
}
assert.equal(occupied.length,6)
assert.equal(checkSixSeatCabinFit(anchors[1],DEFAULT_SEATED_AVATAR,occupied).fits,false,'occupied seat must not overlap')
assert.equal(checkSixSeatCabinFit(anchors[0],{shoulderWidthM:.88,seatedHeightM:.98,seatedDepthM:.57}).fits,false,'over-wide avatar cannot clip body through door')
assert.equal(checkSixSeatCabinFit(anchors[0],{shoulderWidthM:.42,seatedHeightM:1.65,seatedDepthM:.57}).fits,false,'too-tall seated avatar cannot clip roof')
assert.equal(checkSixSeatCabinFit(anchors[0],{shoulderWidthM:NaN,seatedHeightM:.98,seatedDepthM:.57}).fits,false,'nonfinite avatar measurements rejected')
const scaled=checkSixSeatCabinFit(anchors[0],{shoulderWidthM:.42,seatedHeightM:1.09,seatedDepthM:.57})
assert.equal(scaled.fits,true,'minor oversize can be adjusted within an 8% limit')
assert.ok(scaled.scale>=.92&&scaled.scale<1)
const director=readFileSync(new URL('../src/runtime/StreetVerseCabinCameraDirector.ts',import.meta.url),'utf8')
assert.ok(director.includes('checkSixSeatCabinFit(pose,body'),'cabins validate occupant measurements before seating')
assert.ok(director.includes('if(!fit.fits)return null'),'failed fit must not allocate the seat')
assert.ok(director.indexOf('if(!fit.fits)return null')<director.indexOf('const seatId=boardTransport(manifest,id,candidate.id)'),'fit check must happen before manifest mutation')
console.log('StreetVerse six-seat vehicle cabin fit geometry and oversize contracts PASS')
