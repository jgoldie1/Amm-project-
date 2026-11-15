import assert from 'node:assert/strict'
import {validatePortableCreatorAsset,canImportCreatorAsset,exportPortableSave,importPortableSave} from '../src/runtime/StreetVersePortableCreatorAsset.ts'
const a={schema:'streetverse.creator.v1',assetId:'jacket-001',creatorId:'creator-001',title:'Jacket',category:'clothing',license:'original',sourceWorld:'streetverse',contentSha256:'a'.repeat(64),assetPath:'/assets/mods/jacket.json',version:'1.0.0',approved:true}
assert.equal(validatePortableCreatorAsset(a).valid,true)
assert.equal(canImportCreatorAsset(a,new Set(['streetverse']),true),true)
assert.equal(canImportCreatorAsset(a,new Set(['streetverse']),false),false)
assert.equal(canImportCreatorAsset({...a,assetPath:'https://evil.example/a.js'},new Set(['streetverse']),true),false)
assert.equal(canImportCreatorAsset(a,new Set(['otherworld']),true),false)
const save={schema:'streetverse.save.v1',playerId:'player-001',career:'delivery',level:3,unlockedCosmeticIds:['jacket-001'],missionReceiptIds:['job-001'],world:'streetverse'}
assert.deepEqual(importPortableSave(exportPortableSave(save),'player-001'),save)
assert.throws(()=>importPortableSave(exportPortableSave(save),'player-002'),/identity/)
console.log('Portable creator assets and cross-engine save contract PASS')
