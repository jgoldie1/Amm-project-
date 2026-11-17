import assert from 'node:assert/strict'
import {test} from 'node:test'
import fs from 'node:fs'
import {build} from 'esbuild'
import * as THREE from 'three'
import {STREETVERSE_TRANSIT_STOPS,STREETVERSE_TRANSIT_RECOMMENDED_ROUTE,STREETVERSE_TRANSIT_CONTRACT,planStreetVerseTransit,smokeTestTransit} from '../src/runtime/StreetVerseTransitDirector.mjs'
async function importBundled(file){
 const buildResult=await build({entryPoints:[new URL(file,import.meta.url).pathname],bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'})
 return import('data:text/javascript;base64,'+Buffer.from(buildResult.outputFiles[0].text).toString('base64'))
}
test('CTA L and intercity catalog maintains preview truth labels and safe ticket rules',()=>{
 assert.equal(STREETVERSE_TRANSIT_STOPS.length,10)
 assert.equal(new Set(STREETVERSE_TRANSIT_STOPS.map(x=>x.id)).size,10)
 assert.equal(planStreetVerseTransit('circle-park','west-side-el').routeType,'chicago-el-preview')
 const detroit=planStreetVerseTransit('taylor-uic','detroit')
 assert.equal(detroit.routeType,'global-transport-preview')
 assert.equal(detroit.playableTransfer,false)
 assert.equal(detroit.priceMinor,0)
 for(const [key,value] of Object.entries(STREETVERSE_TRANSIT_CONTRACT))if(key!=='simulatedReceiptsOnly')assert.equal(value,false,key)
})
test('One-push route validates 7 simulation legs without claiming actual board and ride',()=>{
 const report=smokeTestTransit()
 assert.equal(report.legs.length,STREETVERSE_TRANSIT_RECOMMENDED_ROUTE.length-1)
 assert.equal(report.allPlansValid,true)
 assert.equal(report.actualBoardingVerified,false)
})
test('Reusable original Chicago L meshes and shared train plane bus seat manifests exist',()=>{
 const scene=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
 const west=fs.readFileSync(new URL('../src/runtime/StreetVerseWestSideVisibleWorldRuntime.ts',import.meta.url),'utf8')
 const seats=fs.readFileSync(new URL('../src/runtime/StreetVersePassengerTransportRuntime.ts',import.meta.url),'utf8')
 const bridge=fs.readFileSync(new URL('../src/components/StreetVerseGeoSpawnBridge.tsx',import.meta.url),'utf8')
 for(const s of ['cityTransitTrain','mobile-native-train','nativeTrain.position.copy(train.position)'])assert.ok(scene.includes(s),s)
 assert.match(west,/addElevatedRail\(/)
 for(const kind of ["'train'","'bus'","'plane'","'boat'"])assert.ok(seats.includes(kind),kind)
 assert.match(bridge,/StreetVerseTransitQADock/)
})
test('Procedural hand planner does not misreport unrigged placeholder as IK',async()=>{
 const {inspectStreetVerseInteractionRig,previewProceduralHandTarget}=await importBundled('../src/runtime/StreetVerseProceduralHandBridge.ts')
 const placeholder=new THREE.Group()
 const inspected=inspectStreetVerseInteractionRig(placeholder)
 assert.equal(inspected.valid,false)
 assert.equal(inspected.mode,'missing-skeleton')
 const p=previewProceduralHandTarget(placeholder,'hold-rail','right',new THREE.Vector3(0,1,0))
 assert.equal(p.ok,false);assert.equal(p.ikApplied,false);assert.equal(p.productionCertified,false)
 const scene=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
 assert.match(scene,/inspectStreetVerseInteractionRig\(nativeHero\)/)
 assert.match(scene,/proceduralIKCertified:false/)
})
test('Native wrapper detector cannot manufacture permission, verified streaming or hologram hardware',async()=>{
 const {inspectTryammCrossPlatformRuntime:inspect}=await importBundled('../src/runtime/TryammCrossPlatformRuntime.ts')
 assert.equal(inspect({}).shell,'browser')
 assert.equal(inspect({displayModeStandalone:true}).shell,'pwa')
 assert.equal(inspect({cordova:{platformId:'android'}}).shell,'cordova-android')
 assert.equal(inspect({capacitor:{isNativePlatform:()=>true,getPlatform:()=> 'ios'}}).shell,'capacitor-ios')
 assert.equal(inspect({hasMediaRecorder:true,hasMediaDevices:false}).screenCaptureRequestPossible,false)
 for(const input of [{},{cordova:{platformId:'ios'}},{capacitor:{isNativePlatform:()=>true,getPlatform:()=> 'android'}}]){
  const r=inspect(input);assert.equal(r.requiresPermissionForCapture,true);assert.equal(r.nativeStreamingVerified,false);assert.equal(r.hologramHardwareVerified,false)
 }
})
test('LiveKit status rejects configuration-only public-ready and includes agent verification',()=>{
 const status=fs.readFileSync(new URL('../api/live/status.js',import.meta.url),'utf8')
 assert.match(status,/TRYAMM_LIVE_AGENT_WORKER_VERIFIED/)
 assert.match(status,/hostViewer:verified/)
 assert.match(status,/const readyForPublic=configured&&Object.values\(proof\).every\(Boolean\)/)
 assert.doesNotMatch(status,/readyForPublic:configured/)
})
