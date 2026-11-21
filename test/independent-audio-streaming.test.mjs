import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {PUBLIC_APPROVED_AUDIO_CATALOG,AUDIO_RELEASE_REQUIREMENTS,createAudioReviewDraft,isAudioStreamApproved,approvedAudioTracks} from '../amm-omniverse/src/lib/music/approvedAudioStreaming.mjs'
const file=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const valid=()=>({schema:1,id:'a',title:'Original song',artist:'Independent artist',album:'Demo album',genre:'Gospel',status:'approved',publiclyPlayable:true,rightsVerified:true,allowedFrom:1,allowedUntil:9000000000000,territories:['US'],streamUrl:'https://example.org/approved.mp3',rightsChecks:Object.fromEntries(AUDIO_RELEASE_REQUIREMENTS.map(x=>[x,true]))})
test('approved audio public catalog starts empty and drafts never authorize streaming',()=>{
 assert.equal(PUBLIC_APPROVED_AUDIO_CATALOG.length,0)
 assert.deepEqual(approvedAudioTracks(),[])
 const draft=createAudioReviewDraft({title:'Song one',artist:'Singer'})
 assert.equal(draft.publiclyPlayable,false)
 assert.equal(draft.monetizationAuthorized,false)
 assert.equal(isAudioStreamApproved(draft),false)
 assert.equal(createAudioReviewDraft({title:'',artist:'Singer'}),null)
})
test('all rights, territory and term are required for audio streaming',()=>{
 const item=valid()
 assert.equal(isAudioStreamApproved(item,100,'US'),true)
 assert.equal(isAudioStreamApproved(item,100,'UK'),false)
 assert.equal(isAudioStreamApproved({...item,allowedUntil:100},100,'US'),false)
 for(const k of AUDIO_RELEASE_REQUIREMENTS)assert.equal(isAudioStreamApproved({...item,rightsChecks:{...item.rightsChecks,[k]:false}},100,'US'),false,k)
 assert.equal(isAudioStreamApproved({...item,streamUrl:'javascript:bad'},100,'US'),false)
 assert.deepEqual(approvedAudioTracks([item,{...item,id:'2',artist:'Second artist',genre:'R&B / Soul'}],{now:100,query:'Original song',genre:'Gospel'}).map(x=>x.id),['a'])
})
test('new listen tab and original streaming player are wired in Aniyah Studio',()=>{
 const component=file('amm-omniverse/src/components/IndependentMusicListening.tsx')
 const studio=file('amm-omniverse/src/components/Aniyah64TrackStudio.tsx')
 assert.match(studio,/mode==='listen'/)
 assert.match(studio,/IndependentMusicListening/)
 assert.match(component,/Search approved audio tracks/)
 assert.match(component,/<audio controls/)
 assert.match(component,/EXPORT TRACK REVIEW — NO PUBLISH/)
 assert.doesNotMatch(component,/fetch\(|publishNow\(|createPaymentIntent|uploadFile\(/)
})
