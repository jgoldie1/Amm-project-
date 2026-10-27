import {test} from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const src=fs.readFileSync(new URL('../src/runtime/StubbsMotionFusionCore.ts',import.meta.url),'utf8')
test('Motion Fusion remains disabled and isolated by default',()=>{
 assert.match(src,/enabled:false,cameraOptIn:false/)
 assert.match(src,/allowCameraMove:false,allowCameraInteract:false/)
 assert.match(src,/reason:'camera_not_authorized'/)
 assert.match(src,/reason:'camera_confirmation_required'/)
 assert.match(src,/reason:'tracking_lost'/)
 assert.match(src,/reason:'invalid_sample'/)
 assert.match(src,/export function releasePlayerControls/)
 assert.doesNotMatch(src,/getUserMedia\s*\(/)
 assert.doesNotMatch(src,/\bfetch\s*\(/)
 assert.doesNotMatch(src,/localStorage|sessionStorage/)
})
test('input contract excludes purchases and combat authority',()=>{
 assert.match(src,/type MotionAction='move'\|'look'\|'interact'\|'emote'\|'pause'/)
 assert.doesNotMatch(src,/type MotionAction=[^\n]*(pay|purchase|reward|hit)/)
})
