import {test} from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {build} from 'esbuild'
const out=await build({entryPoints:[new URL('../src/runtime/JarvisDeluxeRuntime.ts',import.meta.url).pathname],bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'})
const runtime=await import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'))
const assistant=fs.readFileSync(new URL('../src/components/HoloGPTAssistant.tsx',import.meta.url),'utf8')
test('JARVIS DELUXE inherits existing identity, self-model and HoloGPT',()=>{
 const state=runtime.createJarvisDeluxeState()
 assert.equal(state.identity,'JARVIS')
 assert.equal(state.edition,'DELUXE')
 assert.equal(state.reasoningProvider,'HoloGPT')
 assert.equal(state.selfModel,'ADVANCED_SELF_MODEL')
 assert.equal(state.consciousnessVerified,false)
 assert.ok(runtime.JARVIS_DELUXE_CAPABILITIES.length>=5)
})
test('LiveKit and HoloGPT status reporting does not imply working voice',()=>{
 assert.equal(runtime.normalizeJarvisStatus('livekit',true,{configured:false}),'offline')
 assert.equal(runtime.normalizeJarvisStatus('livekit',true,{configured:true}),'online')
 assert.equal(runtime.normalizeJarvisStatus('ai',true,{ok:false,degraded:true}),'degraded')
 assert.equal(runtime.normalizeJarvisStatus('ai',false,{ok:true}),'offline')
 assert.equal(runtime.createJarvisDeluxeState().livekitTwoDeviceVerified,false)
})
test('JARVIS delegates external actions to original human authority kernel',()=>{
 const request={id:'pay-1',actor:'JARVIS',action:'send-payment',risk:'FINANCIAL',ownerApproved:false,permissionGranted:true,evidenceRefs:[]}
 assert.equal(runtime.jarvisDeluxeAuthorize(request).allowed,false)
 assert.equal(runtime.jarvisDeluxeAuthorize({...request,ownerApproved:true}).allowed,true)
})
test('Mycelium conditions included as fictional context, never consciousness evidence',()=>{
 const state=runtime.createJarvisDeluxeState()
 state.world='streetverse';state.activeCharacterId='bj-stubbs'
 state.conditions['bj-stubbs']={condition:'recovering',health:80,needsRescue:false}
 const context=runtime.jarvisDeluxeContext(state)
 assert.equal(context.fictionalConditions[0].characterId,'bj-stubbs')
 assert.equal(context.consciousnessVerified,false)
 assert.equal(context.livekitTwoDeviceVerified,false)
})
test('Existing HoloGPT UI is upgraded, not replaced with duplicate chatbot',()=>{
 assert.match(assistant,/installJarvisDeluxeRuntime\(\)/)
 assert.match(assistant,/jarvisDeluxeContext\(jarvis\)/)
 assert.match(assistant,/JARVIS DELUXE/)
 assert.match(assistant,/LIVEKIT:/)
 assert.match(assistant,/\/api\/ai\/answer/)
})
