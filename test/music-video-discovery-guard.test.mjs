import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {PUBLIC_MUSIC_VIDEO_CATALOG,VIDEO_RIGHTS_REQUIREMENTS,createMusicVideoSubmissionDraft,isMusicVideoPublishable,listApprovedMusicVideos,MUSIC_VIDEO_DISCOVERY_POLICY} from '../amm-omniverse/src/lib/music/musicVideoDiscoveryPolicy.mjs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const fullApproval=()=>({schema:1,id:'original-video',title:'Original song',artist:'Original artist',genre:'R&B',status:'approved',publiclyPlayable:true,rightsVerified:true,streamManifestUrl:'https://example.com/approved.mp4',captionsUrl:'https://example.com/approved.vtt',allowedFrom:1,allowedUntil:9000000000000,territories:['US'],rightsChecks:Object.fromEntries(VIDEO_RIGHTS_REQUIREMENTS.map(k=>[k,true]))})
test('catalog starts empty, no fake views or user impersonation',()=>{
 assert.equal(PUBLIC_MUSIC_VIDEO_CATALOG.length,0)
 assert.deepEqual(listApprovedMusicVideos(),[])
 assert.match(MUSIC_VIDEO_DISCOVERY_POLICY.status,/not yet verified/)
})
test('draft video has no public playback, distribution or monetization permissions',()=>{
 const d=createMusicVideoSubmissionDraft({title:'New Release',artist:'Independent Singer'})
 assert.equal(d.status,'draft')
 assert.equal(d.publiclyPlayable,false)
 assert.equal(d.externalDistributionAuthorized,false)
 assert.equal(d.monetizationAuthorized,false)
 assert.equal(isMusicVideoPublishable(d),false)
 assert.equal(createMusicVideoSubmissionDraft({title:'',artist:'A'}),null)
})
test('all rights and territorial/caption approvals required for any video playback',()=>{
 const valid=fullApproval()
 assert.equal(isMusicVideoPublishable(valid,100,'US'),true)
 assert.equal(isMusicVideoPublishable(valid,100,'GB'),false)
 for(const key of VIDEO_RIGHTS_REQUIREMENTS){
  const value={...valid,rightsChecks:{...valid.rightsChecks,[key]:false}}
  assert.equal(isMusicVideoPublishable(value,100,'US'),false,key)
 }
 assert.equal(isMusicVideoPublishable({...valid,streamManifestUrl:'javascript:alert(1)'},100,'US'),false)
 assert.equal(isMusicVideoPublishable({...valid,captionsUrl:null},100,'US'),false)
 assert.equal(isMusicVideoPublishable({...valid,allowedUntil:100},100,'US'),false)
})
test('music video discovery UI is reachable and cannot publish or upload',()=>{
 const studio=read('amm-omniverse/src/components/Aniyah64TrackStudio.tsx')
 const ui=read('amm-omniverse/src/components/MusicVideoDiscovery.tsx')
 assert.match(studio,/mode==='videos'/)
 assert.match(studio,/MusicVideoDiscovery/)
 assert.match(ui,/EXPORT REVIEW DRAFT — NOT PUBLISH/)
 assert.match(ui,/No rights-cleared music videos are live/)
 assert.match(ui,/<video controls/)
 assert.doesNotMatch(ui,/fetch\(|createPaymentIntent|putObject|uploadFile/)
})
