import fs from 'node:fs'

const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('BJ MESHY V6 LIVE SWAP CONTRACT FAIL: '+msg)}

for(const token of [
  "id:'streetverse-bj-stubbs-meshy-v6'",
  "filename:'SV_HERO_BJ_STUBBS_V6.glb'",
  "url:'/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V6.glb'",
  "productionFilename:'SV_HERO_BJ_STUBBS_V12.glb'",
  "productionUrl:'/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V12.glb'",
  "legacyProductionFilename:'SV_HERO_BJ_STUBBS_V7.glb'",
  "legacyProductionUrl:'/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V7.glb'",
    "authority:'tryamm-owned-native-glb-v12'",
  "method:'HEAD'",
  "normalizeStreetVerseHumanHeight(object,BJ_MESHY_V6_ASSET.targetHeightMeters)",
  "new THREE.AnimationMixer(object)",
  "jaw.?open",
  "eye.?blink.?left",
  "eye.?blink.?right",
  "tryamm:bj-meshy-v6-ready",
  "proceduralFallbackSuppressed:true",
  "autonomicLife:true",
  "conversationFocus:true",
  "microGesture:true",
  "tryamm:bj-life-state",
  "lookLeft:gaze<0",
  "lookRight:gaze>0",
  "breathing:THREE.MathUtils.clamp",
  "source:'bj-production-v12-life-layer'",
  "ownedV12:!published?.url",
  "referenceMatchedPreview:Boolean(published?.url)",
])must(runtime.includes(token),'runtime missing '+token)

for(const token of [
  "loadStreetVerseMeshyBJHero()",
  "nativeHeroFallback!.visible=false",
  "nativeLayer.add(handle.object)",
  "nativeHero=handle.object",
  "assetId:BJ_MESHY_V6_ASSET.id",
  "source:'streetverse-mobile-meshy-bj-v6'",
  "bjMeshyHero?.tick(now",
  "focusYaw:heroConversationFocusYaw",
  "breathing:heroAffectBreathing",
  "posture:heroAffectPosture",
  "seated:Boolean(activeCar)",
  "autonomicLifeV7:true",
  "liveMicLipSync:true",
  "bjMeshyHero?.dispose()",
  "bjMeshyV6Priority:true",
  "bjMeshyV6Active:Boolean(bjMeshyHero)",
])must(world.includes(token),'mobile hero swap missing '+token)

must(world.indexOf("nativeHeroFallback!.visible=false")>world.indexOf("if(!handle)return"),'fallback must hide only after Meshy asset is actually loaded')
must(world.includes("bjPhotoMatch?.dispose();bjPhotoMatch=null"),'temporary photo shell must be retired after Meshy activation')
must(world.includes("bjHeadRuntime?.dispose();bjHeadRuntime=null"),'temporary custom head runtime must retire after Meshy activation')
must(runtime.includes("const availability=new Map<string,Promise<boolean>>()"),'BJ asset availability must be cached per URL so a missing fallback cannot poison a newly published rig')
must(runtime.includes("return availability.get(url)!"),'BJ runtime must resolve availability from the requested URL cache entry')
must(runtime.includes("availability.clear()"),'BJ availability reset must clear every cached URL result')
must(!runtime.includes("availabilityPromise"),'BJ runtime must not use one global availability promise for every asset URL')
must(runtime.includes("nodeHasAnimationTracks"),'BJ life layer must detect animation-driven bones before adding micro motion')
must(runtime.includes("lifeDriven"),'BJ life layer must protect partial rigs from cumulative head/spine drift')
must(runtime.includes("certifiedLikeness:verifiedPhotoMatch"),'BJ V6 must keep certified likeness behind verified authorization')
must(!runtime.includes("certifiedLikeness:true"),'BJ V6 must never hard-code a certified likeness claim')
must(world.includes("visualContinuity:'current-era-reference-locked'"),'BJ current-era visual continuity lock must survive the life-layer upgrade')

console.log('BJ V6/V7/V12 LIVE SWAP CONTRACT PASS: owned V12 preferred -> V7/V6 compatibility preserved -> external Meshy may override when truly published')

console.log('BJ LIFE LAYER V12: gaze + breathing + speech microgestures + posture + seated state are wired without weakening the native fallback')
