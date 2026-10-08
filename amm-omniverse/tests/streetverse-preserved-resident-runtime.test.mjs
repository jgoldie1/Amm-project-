import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyCharacterRuntime.ts',import.meta.url),'utf8')
const slots=fs.readFileSync(new URL('../src/data/streetVerseMeshyCharacterSlots.ts',import.meta.url),'utf8')
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')

test('four real stored Supabase GLBs remain preferred for Circle Park mobile',()=>{
  for(const slot of ['sv-black-man-adult-01','sv-black-woman-adult-01','sv-black-man-youngadult-01','sv-black-woman-youngadult-01']){
    assert.ok(slots.includes("'"+slot+"':"),'missing durable override '+slot)
    assert.ok(mobile.includes("'"+slot+"'"),'missing mobile placement '+slot)
  }
  assert.match(runtime,/const sourceUrl=publishedReady\?published!\.url:\(staticMeshyReady\?staticMeshyUrl:nativeUrl\)/)
  assert.match(runtime,/const nativeFallback=!publishedReady&&!staticMeshyReady/)
})

test('download separate walk and run GLBs concurrently, retain clip ordering and failure isolation',()=>{
  assert.ok(runtime.includes('const companionClips=options.deferCompanionAnimations?[]:(await Promise.all('))
  assert.ok(runtime.includes('companionSources as Array<[string|null|undefined,string]>'))
  assert.ok(runtime.includes('const cloned=clip.clone();cloned.name=name;return cloned'))
  assert.ok(runtime.includes('catch{return [] as THREE.AnimationClip[]}'))
  assert.ok(runtime.includes(')).flat()'))
  assert.ok(runtime.includes('mixer?.update(dt)'))
  assert.ok(runtime.includes('if(activeAction&&activeAction!==next)activeAction.crossFadeTo(next,.16,false)'))
})

test('existing native resident rendering fallback is still intact',()=>{
  assert.ok(runtime.includes('const sourceUrl=publishedReady?published!.url:(staticMeshyReady?staticMeshyUrl:nativeUrl)'))
  assert.ok(runtime.includes('upgradePending:nativeFallback'))
  assert.ok(runtime.includes('tryamm:meshy-character-fallback'))
  assert.ok(runtime.includes('resetStreetVerseMeshyAvailabilityCache()'))
})

test('iPhone shows preserved GLB before fetching 25 MB of walk/run companions',()=>{
  assert.ok(runtime.includes('STREETVERSE_MESHY_DURABLE_OVERRIDES[slot.id]'),'durable models must bypass unreliable cross-origin HEAD')
  assert.ok(mobile.includes('loadStreetVerseMeshyCharacter(slotId,{deferCompanionAnimations:true})'))
  assert.ok(runtime.includes("if(state.running)requestMotionCompanion('run')"))
  assert.ok(runtime.includes("else if(state.moving)requestMotionCompanion('walk')"))
  assert.ok(runtime.includes("window.dispatchEvent(new CustomEvent('tryamm:circle-park-motion-ready'"))
  assert.ok(runtime.includes('disposed=true'),'async motion disposal guard missing')
})

test('deferred GLB walk/run clips retain a mixer even when the static model has no animation',()=>{
  assert.ok(runtime.includes('options.deferCompanionAnimations&&companionSources.length>0'),
    'deferred companions need an animation mixer before asynchronous clips arrive')
  assert.ok(runtime.includes('clips.push(...imported)'),
    'motion clip must join the live clip collection')
  assert.ok(runtime.includes('animationMap[motion]=imported[0];active=\'\''),
    'new motion clip must invalidate the prior action choice')
  assert.ok(runtime.includes('mixer.clipAction(clip)'),
    'downloaded clip must be playable on the live resident skeleton')
})
