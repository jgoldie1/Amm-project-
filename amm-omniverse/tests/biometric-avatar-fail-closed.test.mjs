import test from 'node:test'
import assert from 'node:assert/strict'
import {createBiometricAvatarConsent,canProcessAvatarBiometrics,requestPrivacySafeAvatarCapture,completeEphemeralAvatarVideoProcessing} from '../src/runtime/BiometricAvatarPrivacyRuntime.ts'
const make=()=>createBiometricAvatarConsent({purpose:'avatar-mesh-fit',views:['front-photo'],adultOrGuardianAuthorized:true})
test('consent creation never grants a release',()=>assert.equal(make().granted,false))
test('forged grant remains blocked',()=>assert.equal(canProcessAvatarBiometrics({...make(),granted:true}).ok,false))
test('capture rejects purpose and view escalation',()=>{
 const consent={...make(),granted:true}
 for(const request of [{purpose:'avatar-texture-wrap',views:['front-photo']},{purpose:'avatar-mesh-fit',views:['camera-live']},{purpose:'avatar-mesh-fit',views:[]}]){
  const result=requestPrivacySafeAvatarCapture({...request,consent})
  assert.equal(result.ok,false);assert.match(result.reason,/scope/)
 }
})
test('matching scope still cannot authorize capture',()=>assert.equal(requestPrivacySafeAvatarCapture({purpose:'avatar-mesh-fit',views:['front-photo'],consent:{...make(),granted:true}}).ok,false))
test('cleanup reports pending rather than verified destruction',()=>{
 const events=[];const previous=globalThis.window
 globalThis.window={dispatchEvent:event=>events.push(event)}
 try{completeEphemeralAvatarVideoProcessing();assert.equal(events.some(e=>e.type==='tryamm:avatar-video-ephemeral-complete'),false);assert.equal(events.find(e=>e.type==='tryamm:avatar-video-cleanup-pending').detail.deletionVerified,false)}
 finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous}
})
