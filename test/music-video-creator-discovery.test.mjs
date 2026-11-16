import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {DISCOVERY_PLAYLIST_KEY,MUSIC_VIDEO_GENRES,MUSIC_DISCOVERY_CRITERIA,searchApprovedVideos,listArtistChannels,sanitizeSavedVideoIds,readLocalWatchlist,saveLocalWatchlist} from '../amm-omniverse/src/lib/music/musicDiscoveryFeatures.mjs'
const approved=[{id:'v1',title:'Midnight Song',artist:'Original Singer',genre:'R&B / Soul',description:'Chicago original',rightsVerified:true,streamManifestUrl:'https://example.com/a.mp4',captionsUrl:'https://example.com/a.vtt'},{id:'v2',title:'Sunrise',artist:'Gospel Singer',genre:'Gospel',description:'Community music',rightsVerified:true,streamManifestUrl:'https://example.com/b.mp4',captionsUrl:'https://example.com/b.vtt'}]
test('only approved original videos are searchable',()=>{
 const bad={...approved[0],id:'unsafe',rightsVerified:false}
 assert.equal(searchApprovedVideos([...approved,bad],{query:'midnight'}).length,1)
 assert.deepEqual(searchApprovedVideos(approved,{genre:'Gospel'}).map(v=>v.id),['v2'])
 assert.deepEqual(searchApprovedVideos(approved,{query:'not found'}),[])
 assert.deepEqual(listArtistChannels(approved),['Gospel Singer','Original Singer'])
})
test('local watchlist removes revoked videos and duplicate identifiers',()=>{
 assert.deepEqual(sanitizeSavedVideoIds(['v1','v1','missing','v2'],approved),['v1','v2'])
 const map=new Map()
 const storage={setItem:(k,v)=>map.set(k,v),getItem:k=>map.get(k)||null}
 assert.deepEqual(saveLocalWatchlist(storage,['v1','v1','invalid'],approved),['v1'])
 assert.equal(map.has(DISCOVERY_PLAYLIST_KEY),true)
 assert.deepEqual(readLocalWatchlist(storage,approved),['v1'])
 assert.deepEqual(readLocalWatchlist(storage,approved.slice(1)),[])
 storage.setItem(DISCOVERY_PLAYLIST_KEY,'{invalid')
 assert.deepEqual(readLocalWatchlist(storage,approved),[])
})
test('music discovery has no public fake views, paid rankings or public unlicensed demo videos',()=>{
 assert.ok(MUSIC_VIDEO_GENRES.includes('R&B / Soul'))
 assert.match(MUSIC_DISCOVERY_CRITERIA.ranking,/sponsored videos never buy/)
 const ui=fs.readFileSync(new URL('../amm-omniverse/src/components/MusicVideoDiscovery.tsx',import.meta.url),'utf8')
 for(const phrase of ['Search approved music videos','Approved artist channel filter','MY LOCAL WATCHLIST','searchApprovedVideos','listArtistChannels','saveLocalWatchlist'])assert.ok(ui.includes(phrase),phrase)
 assert.doesNotMatch(ui,/createPaymentIntent|uploadVideo\(|incrementViewCount|publishNow\(/)
})
