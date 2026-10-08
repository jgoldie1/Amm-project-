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
  assert.ok(runtime.includes('const companionClips=(await Promise.all('))
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
